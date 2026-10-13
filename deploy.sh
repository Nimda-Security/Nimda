#!/bin/bash

export CURRENT_VERSION=$(git rev-parse --short HEAD)

if [ ! -f "./nginx/conf.d/active-backend.inc" ]; then
    echo "server backend-blue:8080;" > ./nginx/conf.d/active-backend.inc
    echo "active-backend.inc 파일이 생성되었습니다. (초기 타겟: blue)"
fi

# 2. 현재 Nginx 뒷단에서 구동 중인 서비스가 'blue'인지 'green'인지 헬스체크로 알아냅니다.
if grep -q "backend-blue" "./nginx/conf.d/active-backend.inc"; then
    ACTIVE_COLOR="blue"
    TARGET_COLOR="green"
    TARGET_MGMT_PORT=9092
else
    ACTIVE_COLOR="green"
    TARGET_COLOR="blue"
    TARGET_MGMT_PORT=9091
fi

echo "현재 가동 중인 서비스: $ACTIVE_COLOR ➡️ 새로 배포할 타겟: $TARGET_COLOR"

# 4. 새로 배포할 색상의 최신 이미지를 도커허브에서 땡겨옵니다.
docker compose pull backend-$TARGET_COLOR

# 새로운 버전 컨테이너 실행
docker compose up -d backend-$TARGET_COLOR

echo "⏳ 새 버전($TARGET_COLOR) 부팅 및 헬스체크 대기 중..."

# 새 버전이 실제로 트래픽을 받을 수 있는 상태인지 확인한다.
#
# 이전 구현의 문제:
#   1) `[ "$status_code" -ne 000]` — `]` 앞 공백이 없어 런타임에 `[: missing ']'`
#      로 깨지고 조건이 항상 거짓이었다. 즉 early break 가 절대 발생하지 않아
#      매 배포마다 무조건 24회(120초)를 대기했다. (bash -n 으로는 잡히지 않는다)
#   2) `-ne 000` 은 500/502 도 "정상"으로 판정했다. curl 의 %{http_code} 는
#      연결 실패일 때만 000 이므로, 부팅은 됐지만 깨진 앱이 게이트를 통과했다.
#   3) 루프 뒤에 exit 도 set -e 도 없어, 헬스체크 결과와 무관하게 트래픽을
#      전환하고 구버전을 정지시켰다 → 신규가 계속 비정상이면 전면 장애.
#
# 수정: actuator readiness 프로브가 200 을 반환할 때만 통과시키고,
#       끝까지 실패하면 트래픽 전환 없이 즉시 중단한다(fail-closed).
HEALTH_URL="http://127.0.0.1:$TARGET_MGMT_PORT/actuator/health/readiness"
HEALTHY=0

for retry in $(seq 1 24)
do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$HEALTH_URL" || echo "000")
    if [ "$status_code" = "200" ]; then
        echo "✅ $TARGET_COLOR 서버가 readiness 통과했습니다. (${retry}번째 시도)"
        HEALTHY=1
        break
    fi
    echo "   ... 대기 중 (${retry}/24, status=$status_code)"
    sleep 5
done

if [ "$HEALTHY" -ne 1 ]; then
    echo "❌ $TARGET_COLOR 서버가 120초 안에 readiness 를 통과하지 못했습니다."
    echo "   트래픽을 전환하지 않고 중단합니다. 현재 서비스($ACTIVE_COLOR)는 그대로 유지됩니다."
    echo "   최근 로그:"
    docker compose logs --tail=50 backend-$TARGET_COLOR || true
    docker compose stop backend-$TARGET_COLOR || true
    exit 1
fi

# 정상 작동 시 구동되어야 할 서버를 .inc에 저장
echo "server backend-$TARGET_COLOR:8080;" > ./nginx/conf.d/active-backend.inc

# Nginx 프록시 서버 변경
docker exec nimda-nginx nginx -s reload
echo "🔄 Nginx 트래픽을 backend-$TARGET_COLOR 로 전환했습니다."
# 기존 서버 중단
docker compose stop backend-$ACTIVE_COLOR
echo "🧹 구버전 서버(backend-$ACTIVE_COLOR)를 안전하게 중단했습니다."