#!/bin/bash

# NimdaCon 개발 환경 스크립트 (Docker 기반)

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

case "$1" in
    "backend")
        log_info "🚀 백엔드 서버 시작 중 (Docker)..."
        docker-compose up -d
        log_success "✅ 백엔드 서버 시작됨"
        log_info "🌐 API 서버: http://localhost:3001"
        log_info "🗄️  데이터베이스: localhost:3307"
        ;;
        
    "frontend")
        log_info "🎨 프론트엔드 서버 시작 중..."
        # nvm 로드
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        cd NimdaConFrontEnd
        npm run dev
        ;;
        
    "full")
        log_info "🚀 전체 개발 환경 시작 중..."
        
        # 백엔드 시작
        log_info "1️⃣ 백엔드 서버 시작 중..."
        docker-compose up -d
        
        # 백엔드 준비 대기
        log_info "⏳ 백엔드 서버 준비 대기 중..."
        sleep 10
        
        # 백엔드 상태 확인
        if curl -s http://localhost:3001/api > /dev/null; then
            log_success "✅ 백엔드 서버 준비 완료"
        else
            log_warning "⚠️ 백엔드 서버가 아직 준비되지 않았습니다. 잠시 후 다시 시도하세요."
        fi
        
        # 프론트엔드 시작
        log_info "2️⃣ 프론트엔드 서버 시작 중..."
        # nvm 로드
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        cd NimdaConFrontEnd
        npm run dev
        ;;
        
    "stop")
        log_info "🛑 개발 환경 중지 중..."
        docker-compose down
        log_success "✅ 개발 환경이 중지되었습니다."
        ;;
        
    "status")
        log_info "📊 서비스 상태 확인 중..."
        echo ""
        echo "Docker 컨테이너 상태:"
        docker-compose ps
        echo ""
        echo "백엔드 API 상태:"
        if curl -s http://localhost:3001/api > /dev/null; then
            log_success "✅ 백엔드 API 정상 동작 중"
        else
            log_error "❌ 백엔드 API 응답 없음"
        fi
        ;;
        
    *)
        echo "🚀 NimdaCon 개발 환경 스크립트 (Docker 기반)"
        echo ""
        echo "사용법: ./dev.sh [명령어]"
        echo ""
        echo "명령어:"
        echo "  backend  - 백엔드 서버만 시작 (Docker)"
        echo "  frontend - 프론트엔드 서버만 시작"
        echo "  full     - 전체 개발 환경 시작 (백엔드 + 프론트엔드)"
        echo "  stop     - 모든 서비스 중지"
        echo "  status   - 서비스 상태 확인"
        echo ""
        echo "💡 프론트엔드 개발자 권장 사용법:"
        echo "  ./dev.sh full  # 한 번에 모든 서비스 시작"
        echo ""
        echo "🔧 개별 서비스 시작:"
        echo "  ./dev.sh backend   # 터미널 1"
        echo "  ./dev.sh frontend  # 터미널 2"
        ;;
esac