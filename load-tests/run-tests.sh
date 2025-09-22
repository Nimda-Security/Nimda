#!/bin/bash

# NimdaCon 부하 테스트 실행 스크립트
# 사용법: ./run-tests.sh [test-type]
# test-type: login, judge, full, all

set -e  # 에러 발생 시 스크립트 중단

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

# K6 설치 확인
check_k6() {
    if ! command -v k6 &> /dev/null; then
        log_error "K6가 설치되지 않았습니다."
        log_info "macOS에서 설치: brew install k6"
        log_info "Linux에서 설치: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    log_success "K6가 설치되어 있습니다: $(k6 version)"
}

# 서버 상태 확인
check_server() {
    log_info "서버 상태 확인 중..."
    if curl -s http://localhost:3001/api > /dev/null; then
        log_success "서버가 실행 중입니다."
    else
        log_error "서버가 실행되지 않았습니다. 먼저 서버를 시작하세요."
        log_info "서버 시작: cd NimdaConBackEnd/backend-spring && ./mvnw spring-boot:run"
        exit 1
    fi
}

# 결과 디렉토리 생성
prepare_results() {
    mkdir -p results
    log_info "결과 디렉토리 준비 완료: results/"
}

# 로그인 테스트 실행
run_login_test() {
    log_info "🔐 로그인 부하 테스트 시작..."
    k6 run \
        --out json=results/login-test-$(date +%Y%m%d_%H%M%S).json \
        scripts/auth/login-test.js
    log_success "로그인 테스트 완료!"
}

# 채점 테스트 실행
run_judge_test() {
    log_info "⚖️ 채점 시스템 부하 테스트 시작..."
    k6 run \
        --out json=results/judge-test-$(date +%Y%m%d_%H%M%S).json \
        scripts/judge/submit-test.js
    log_success "채점 테스트 완료!"
}

# 통합 시나리오 테스트 실행
run_full_test() {
    log_info "🎯 통합 시나리오 부하 테스트 시작..."
    k6 run \
        --out json=results/full-scenario-$(date +%Y%m%d_%H%M%S).json \
        scripts/full-scenario.js
    log_success "통합 테스트 완료!"
}

# 모든 테스트 실행
run_all_tests() {
    log_info "🚀 모든 부하 테스트 실행..."
    
    log_info "1/3: 로그인 테스트"
    run_login_test
    sleep 10  # 테스트 간 간격
    
    log_info "2/3: 채점 테스트"
    run_judge_test
    sleep 10
    
    log_info "3/3: 통합 시나리오 테스트"
    run_full_test
    
    log_success "모든 테스트 완료!"
}

# 테스트 결과 요약
show_results() {
    log_info "📊 최근 테스트 결과:"
    ls -la results/ | tail -5
}

# 도움말 표시
show_help() {
    echo "🚀 NimdaCon 부하 테스트 실행 스크립트"
    echo ""
    echo "사용법:"
    echo "  ./run-tests.sh [옵션]"
    echo ""
    echo "옵션:"
    echo "  login    - 로그인 API 부하 테스트"
    echo "  judge    - 채점 시스템 부하 테스트"
    echo "  full     - 통합 시나리오 부하 테스트"
    echo "  all      - 모든 테스트 실행 (기본값)"
    echo "  help     - 이 도움말 표시"
    echo ""
    echo "예시:"
    echo "  ./run-tests.sh login"
    echo "  ./run-tests.sh all"
}

# 메인 로직
main() {
    cd "$(dirname "$0")"  # 스크립트 디렉토리로 이동
    
    log_info "🎯 NimdaCon 부하 테스트 시작"
    
    # 사전 검사
    check_k6
    check_server
    prepare_results
    
    # 테스트 타입에 따른 실행
    case "${1:-all}" in
        "login")
            run_login_test
            ;;
        "judge")
            run_judge_test
            ;;
        "full")
            run_full_test
            ;;
        "all")
            run_all_tests
            ;;
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        *)
            log_error "알 수 없는 옵션: $1"
            show_help
            exit 1
            ;;
    esac
    
    # 결과 표시
    show_results
    
    log_success "🎉 부하 테스트 완료!"
}

# 스크립트 실행
main "$@"
