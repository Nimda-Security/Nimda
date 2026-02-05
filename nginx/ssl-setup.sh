#!/bin/bash

# Let's Encrypt SSL 인증서 발급 스크립트
# 사용법: ./ssl-setup.sh

DOMAIN="api.nimda.kr"
EMAIL="nimda0410@gmail.com"  # SSL인증서를 발급받을 이메일 주소

echo "=== Let's Encrypt SSL 인증서 발급 시작 ==="
echo "도메인: $DOMAIN"
echo "이메일: $EMAIL"
echo ""

# certbot 컨테이너 실행하여 인증서 발급
# docker-compose로 생성한 볼륨을 사용하기 위해 nginx 컨테이너의 볼륨을 공유
docker run -it --rm \
  --volumes-from nimda-nginx \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN

if [ $? -eq 0 ]; then
  echo ""
  echo "=== 인증서 발급 성공! ==="
  echo ""
  echo "다음 단계:"
  echo "1. nginx/nginx.conf 파일에서 SSL 설정 주석을 해제하세요"
  echo "2. HTTP 리다이렉트 주석을 해제하세요"
  echo "3. docker-compose restart nginx 명령으로 nginx를 재시작하세요"
else
  echo ""
  echo "=== 인증서 발급 실패 ==="
  echo "에러 메시지를 확인하고 다시 시도하세요"
fi
