#!/bin/bash

# NimdaCon 개발 환경 스크립트

case "$1" in
    "db")
        echo "🗄️  데이터베이스 시작 중..."
        docker-compose up -d mariadb
        echo "✅ 데이터베이스 시작됨 (localhost:3307)"
        ;;
        
    "backend")
        # 기존 PID 파일 정리
        if [ -f backend.pid ]; then
            kill $(cat backend.pid) 2>/dev/null
            rm backend.pid
        fi
        
        cd NimdaConBackEnd/backend-spring
        ./mvnw spring-boot:run
        ;;
        
    "frontend")
        # 기존 PID 파일 정리
        if [ -f frontend.pid ]; then
            kill $(cat frontend.pid) 2>/dev/null
            rm frontend.pid
        fi
        
        cd NimdaConFrontEnd
        npm run dev
        ;;
        
    "stop")
        docker-compose down
        echo "데이터베이스 중지됨"
        ;;
        
    *)
        echo "사용법: ./dev.sh [명령어]"
        echo ""
        echo "명령어:"
        echo "  db       - 데이터베이스만 시작"
        echo "  backend  - 백엔드만 시작"
        echo "  frontend - 프론트엔드만 시작"
        echo "  stop     - 데이터베이스 중지"
        echo ""
        echo "개발 순서:"
        echo "  1. ./dev.sh db"
        echo "  2. 새 터미널에서 ./dev.sh backend"
        echo "  3. 새 터미널에서 ./dev.sh frontend"
        ;;
esac