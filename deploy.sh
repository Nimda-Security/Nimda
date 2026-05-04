#!/bin/bash

# Nimda Zero-Downtime Deployment Script (Blue-Green Pattern)
# 기존 서버를 내리지 않고 무중단 배포 수행

set -e

DOCKER_IMAGE="xtkww971/nimda-backend:latest"
COMPOSE_FILE="docker-compose.yml"
NGINX_CONF="nginx/nginx.conf"
NGINX_TEMPLATE="nginx/nginx.conf.template"
LOG_FILE="deployment.log"
STATE_FILE=".deployment_state"

# ============================================================
# 로그 및 유틸 함수
# ============================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1" | tee -a "$LOG_FILE"
}

# 활성 서비스 저장/조회
get_active_service() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        echo "blue"
    fi
}

save_active_service() {
    echo "$1" > "$STATE_FILE"
}

get_standby_service() {
    if [ "$1" = "blue" ]; then
        echo "green"
    else
        echo "blue"
    fi
}

# ============================================================
# 헬스체크 함수
# ============================================================

health_check() {
    local service=$1
    local container="nimda-backend-${service}"
    local max_attempts=30
    local attempt=0

    log "헬스체크 시작: $container"

    while [ $attempt -lt $max_attempts ]; do
        if docker exec "$container" curl -s -f http://localhost:8080/api/health > /dev/null 2>&1; then
            success "$container 정상 작동 확인"
            return 0
        fi
        attempt=$((attempt + 1))
        if [ $((attempt % 5)) -eq 0 ]; then
            log "  대기 중... ($attempt/$max_attempts초)"
        fi
        sleep 1
    done

    error "$container 헬스체크 실패 (${max_attempts}초 초과)"
}

# ============================================================
# 배포 함수
# ============================================================

deploy_backend() {
    local active=$(get_active_service)
    local standby=$(get_standby_service "$active")

    log "=================================================="
    log "🚀 Nimda 무중단 배포 시작"
    log "   현재 활성: $active | 배포 대상: $standby"
    log "=================================================="

    # Step 1: 최신 이미지 다운로드
    log ""
    log "[Step 1/4] 최신 이미지 다운로드..."
    docker pull "$DOCKER_IMAGE" || error "이미지 다운로드 실패"

    # Step 2: 대기 서비스 업데이트 (기존 active는 여전히 실행 중)
    log ""
    log "[Step 2/4] $standby 서비스에 새 이미지 배포..."
    docker-compose -f "$COMPOSE_FILE" up -d "backend-$standby" || error "컨테이너 업데이트 실패"

    # Step 3: 헬스체크 (새로운 서비스가 정상 작동할 때까지 대기)
    log ""
    log "[Step 3/4] 새 서비스 헬스체크..."
    health_check "$standby"

    # Step 4: 트래픽 전환 (nginx 설정 재생성)
    log ""
    log "[Step 4/4] 트래픽 전환 ($active → $standby)..."
    
    # Nginx 설정 파일 재생성
    export ACTIVE_SERVICE=$standby
    envsubst < "$NGINX_TEMPLATE" > "$NGINX_CONF" || error "Nginx 설정 생성 실패"
    
    # Nginx 재시작
    docker-compose -f "$COMPOSE_FILE" restart nginx || error "Nginx 재시작 실패"
    sleep 2

    # 최종 확인
    health_check "$standby"

    # 상태 저장
    save_active_service "$standby"

    log ""
    log "=================================================="
    success "무중단 배포 완료!"
    log "   활성 서비스: $standby (새 버전)"
    log "   대기 서비스: $active (이전 버전)"
    log "   기존 사용자는 영향 없음 ✓"
    log "=================================================="
}

# ============================================================
# 롤백 함수
# ============================================================

rollback() {
    local active=$(get_active_service)
    local standby=$(get_standby_service "$active")

    log ""
    log "=================================================="
    log "⏮️  롤백 시작: $active → $standby"
    log "=================================================="

    # Step 1: 대기 서비스 재시작 (이미지 유지)
    log "[Step 1/2] $standby 서비스 재시작..."
    docker-compose -f "$COMPOSE_FILE" up -d "backend-$standby" || error "서비스 재시작 실패"
    health_check "$standby"

    # Step 2: 트래픽 전환
    log "[Step 2/2] 트래픽 전환..."
    export ACTIVE_SERVICE=$standby
    envsubst < "$NGINX_TEMPLATE" > "$NGINX_CONF"
    docker-compose -f "$COMPOSE_FILE" restart nginx
    sleep 2

    # 상태 저장
    save_active_service "$standby"

    log ""
    success "롤백 완료!"
    log "   활성 서비스: $standby"
    log "=================================================="
}

# ============================================================
# 상태 조회 함수
# ============================================================

status() {
    local active=$(get_active_service)
    local standby=$(get_standby_service "$active")

    echo ""
    echo "📊 Nimda 배포 상태"
    echo "=================================================="
    echo "  활성 서비스  : $active"
    echo "  대기 서비스  : $standby"
    echo ""
    echo "📦 실행 중인 컨테이너:"
    docker ps --filter "name=nimda-backend" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
    echo ""
}

# ============================================================
# 메인
# ============================================================

main() {
    case "${1:-help}" in
        deploy)
            deploy_backend
            ;;
        rollback)
            rollback
            ;;
        status)
            status
            ;;
        *)
            cat << 'EOF'

🚀 Nimda 무중단 배포 스크립트

사용법:
  ./deploy.sh deploy    - 무중단 배포 (기존 서버 유지)
  ./deploy.sh rollback  - 이전 버전으로 롤백
  ./deploy.sh status    - 배포 상태 조회

특징:
  ✓ Blue-Green 배포 패턴
  ✓ 기존 서버 다운 없음
  ✓ 배포 중 트래픽 손실 없음
  ✓ 빠른 롤백 가능

예시:
  ./deploy.sh deploy    # 최신 이미지로 무중단 배포
  ./deploy.sh status    # 현재 상태 확인
  ./deploy.sh rollback  # 배포 실패 시 즉시 롤백

EOF
            exit 1
            ;;
    esac
}

main "$@"
