#!/bin/bash

export CURRENT_VERSION=$(git rev-parse --short HEAD)

if [ ! -f "./nginx/conf.d/active-backend.inc" ]; then
    echo "server backend-blue:8080;" > ./nginx/conf.d/active-backend.inc
    echo "active-backend.inc 파일이 생성되었습니다. (초기 타겟: blue)"
fi

# 2. 현재 Nginx 뒷단에서 구동 중인 서비스가 'blue'인지 'green'인지 헬스체크로 알아냅니다.
ACTIVE_COLOR=$(curl -s http://localhost/api/actuator/health | grep -q "backend-blue" && echo "blue" || echo "green")

# 새로운 버전이 누구힌지 확인
if [ "$ACTIVE_COLOR" == "blue" ]; then
    TARGET_COLOR="green"
    TARGET_PORT=8082
else
    TARGET_COLOR="blue"
    TARGET_PORT=8081
fi

# 4. 새로 배포할 색상의 최신 이미지를 도커허브에서 땡겨옵니다.
docker compose pull backend-$TARGET_COLOR

# 새로운 버전 컨테이너 실행
docker compose up -d backend-$TARGET_COLOR

# 새 버전 정상 작동 확인
for retry in {1..24}
do
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TARGET_PORT/api/actuator/health)
    if [ "$status_code" -eq 200 ]; then
        break
    fi
    sleep 5
done

# 정상 작동 시 구동되어야 할 서버를 .inc에 저장
echo "server backend-$TARGET_COLOR:8080;" > ./nginx/conf.d/active-backend.inc

# Nginx 프록시 서버 변경
docker exec nimda-nginx nginx -s reload
# 기존 서버 중단
docker compose stop backend-$ACTIVE_COLOR