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
    TARGET_PORT=8082
else
    ACTIVE_COLOR="green"
    TARGET_COLOR="blue"
    TARGET_PORT=8081
fi

echo "현재 가동 중인 서비스: $ACTIVE_COLOR ➡️ 새로 배포할 타겟: $TARGET_COLOR"

# 4. 새로 배포할 색상의 최신 이미지를 도커허브에서 땡겨옵니다.
docker compose pull backend-$TARGET_COLOR

# 새로운 버전 컨테이너 실행
docker compose up -d backend-$TARGET_COLOR

echo "⏳ 새 버전($TARGET_COLOR) 부팅 및 헬스체크 대기 중..."
# 새 버전 정상 작동 확인
for retry in {1..24}
do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$TARGET_PORT/error)
    if [ "$status_code" -ne 000]; then
        echo "✅ $TARGET_COLOR 서버가 정상 응답합니다. (Status: $status_code)"
        break
    fi
    sleep 5
done

# 정상 작동 시 구동되어야 할 서버를 .inc에 저장
echo "server backend-$TARGET_COLOR:8080;" > ./nginx/conf.d/active-backend.inc

# Nginx 프록시 서버 변경
docker exec nimda-nginx nginx -s reload
echo "🔄 Nginx 트래픽을 backend-$TARGET_COLOR 로 전환했습니다."
# 기존 서버 중단
docker compose stop backend-$ACTIVE_COLOR
echo "🧹 구버전 서버(backend-$ACTIVE_COLOR)를 안전하게 중단했습니다."