#!/bin/bash

# Nimda Zero-Downtime Deployment Script (Blue-Green Pattern)
# 고유 이미지 태그 및 완전한 Blue-Green 배포 구현

set -e

DOCKER_COMPOSE_FILE="docker-compose.yml"
NGINX_CONF="nginx/nginx.conf"
LOG_FILE="deployment.log"

# 기본값 (CI에서 전달하지 않으면 latest 사용)
BACKEND_IMAGE_TAG="${BACKEND_IMAGE_TAG:-xtkww971/nimda-backend:latest}"

# ============================================================
# 로그 함수
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

# ============================================================
# 현재 활성 서비스 확인
# ============================================================

get_active_service() {
    # nginx.conf에서 [ACTIVE_BACKEND_MARKER: XXX] 추출
    if grep -q "\[ACTIVE_BACKEND_MARKER: green\]" "$NGINX_CONF"; then
        echo "green"
    else
        echo "blue"
    fi
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
# Nginx 설정 업데이트
# ============================================================

update_nginx_config() {
    local new_active=$1
    local new_upstream
    
    if [ "$new_active" = "blue" ]; then
        new_upstream="backend-blue:8080"
    else
        new_upstream="backend-green:8080"
    fi

    log "Nginx 설정 업데이트: 활성 → $new_active"
    
    # 1. 마커 업데이트
    sed -i "s/\[ACTIVE_BACKEND_MARKER: [a-z]*\]/[ACTIVE_BACKEND_MARKER: ${new_active}]/" "$NGINX_CONF"
    
    # 2. upstream backend_server 업데이트
    sed -i "/# 활성 업스트림/,/}/s/server backend-[a-z]*:8080;/server ${new_upstream};/" "$NGINX_CONF"
    
    success "Nginx 설정 업데이트 완료"
}

# ============================================================
# Nginx Reload
# ============================================================

reload_nginx() {
    log "Nginx 설정 적용..."
    
    # 문법 검사
    if ! docker exec nimda-nginx nginx -t 2>&1 | grep -q "successful"; then
        error "Nginx 설정 문법 오류"
    fi
    
    # 설정 재적용 (graceful reload)
    docker exec nimda-nginx nginx -s reload
    sleep 2
    
    success "Nginx 설정 적용 완료"
}

# ============================================================
# 배포 함수
# ============================================================

deploy_backend() {
    local active=$(get_active_service)
    local standby=$(get_standby_service "$active")

    log "=========================================="
    log "🚀 Nimda 무중단 배포 시작"
    log "   이미지: $BACKEND_IMAGE_TAG"
    log "   현재 활성: $active | 배포 대상: $standby"
    log "=========================================="

    # Step 1: 이미지 다운로드
    log ""
    log "[Step 1/5] 최신 이미지 다운로드..."
    
    # docker-compose pull로 특정 서비스의 새 이미지 가져오기
    export BACKEND_IMAGE_TAG
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull "backend-$standby" || error "이미지 다운로드 실패"
    
    success "이미지 다운로드 완료: $BACKEND_IMAGE_TAG"

    # Step 2: 대기 서비스 시작
    log ""
    log "[Step 2/5] $standby 서비스 시작 (새 이미지)..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d "backend-$standby" || error "컨테이너 시작 실패"
    
    success "$standby 서비스 시작 완료"

    # Step 3: 헬스체크
    log ""
    log "[Step 3/5] 헬스체크..."
    health_check "$standby"

    # Step 4: Nginx 설정 업데이트 및 Reload
    log ""
    log "[Step 4/5] 트래픽 전환 ($active → $standby)..."
    
    update_nginx_config "$standby"
    reload_nginx

    # Step 5: 정리
    log ""
    log "[Step 5/5] 불필요한 이미지 정리..."
    
    # 사용하지 않는 이미지 정리
    docker image prune -af
    
    success "이미지 정리 완료"

    log ""
    log "=========================================="
    success "무중단 배포 완료!"
    log "   활성 서비스: $standby (새 버전)"
    log "   대기 서비스: $active (이전 버전)"
    log "=========================================="
}

# ============================================================
# 롤백 함수
# ============================================================

rollback() {
    local active=$(get_active_service)
    local standby=$(get_standby_service "$active")

    log ""
    log "=========================================="
    log "⏮️  배포 롤백 시작"
    log "   활성: $active → $standby"
    log "=========================================="

    # 대기 서비스 재시작 (이미지 유지)
    log "[Step 1/3] $standby 서비스 재시작..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d "backend-$standby" || error "서비스 재시작 실패"
    health_check "$standby"

    # Nginx 설정 변경
    log "[Step 2/3] 트래픽 전환..."
    update_nginx_config "$standby"
    reload_nginx

    # 정리
    log "[Step 3/3] 불필요한 이미지 정리..."
    docker image prune -af

    log ""
    success "롤백 완료!"
    log "   활성 서비스: $standby"
    log "=========================================="
}

# ============================================================
# 상태 조회
# ============================================================

status() {
    local active=$(get_active_service)
    local standby=$(get_standby_service "$active")

    echo ""
    echo "📊 Nimda 배포 상태"
    echo "=========================================="
    echo "  활성 서비스  : $active"
    echo "  대기 서비스  : $standby"
    echo ""
    echo "📦 실행 중인 컨테이너:"
    docker ps --filter "name=nimda-backend" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
    echo ""
    echo "🐳 로컬 이미지 목록:"
    docker images | grep "xtkww971/nimda-backend" | head -5
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

🚀 Nimda 무중단 배포 스크립트 (Blue-Green Pattern)

사용법:
  ./deploy.sh deploy    - 무중단 배포
  ./deploy.sh rollback  - 롤백
  ./deploy.sh status    - 상태 조회

환경변수:
  BACKEND_IMAGE_TAG     - 배포할 이미지 (기본값: xtkww971/nimda-backend:latest)

예시:
  # 기본 배포 (latest 사용)
  ./deploy.sh deploy

  # 특정 이미지 버전으로 배포
  BACKEND_IMAGE_TAG=xtkww971/nimda-backend:abc12345 ./deploy.sh deploy

특징:
  ✓ 고유 태그 지원 (commit hash)
  ✓ Blue-Green 배포 패턴
  ✓ 기존 서버 다운 없음
  ✓ 배포 중 트래픽 손실 없음
  ✓ 빠른 롤백 가능
  ✓ 자동 헬스체크
  ✓ Nginx graceful reload

EOF
            exit 1
            ;;
    esac
}

main "$@"
