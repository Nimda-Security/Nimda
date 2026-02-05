#!/bin/bash

# Let's Encrypt SSL 인증서 갱신 스크립트
# 사용법: ./ssl-renew.sh
# cron에 등록하여 자동 갱신: 0 3 * * * /path/to/ssl-renew.sh

echo "=== Let's Encrypt SSL 인증서 갱신 시작 ==="

# certbot 컨테이너 실행하여 인증서 갱신
docker run -it --rm \
  -v certbot-www:/var/www/certbot \
  -v certbot-conf:/etc/letsencrypt \
  certbot/certbot renew

if [ $? -eq 0 ]; then
  echo ""
  echo "=== 인증서 갱신 완료 ==="
  echo "nginx를 재시작하여 새 인증서를 적용합니다..."
  cd /path/to/project && docker-compose restart nginx
else
  echo ""
  echo "=== 인증서 갱신 실패 ==="
fi
