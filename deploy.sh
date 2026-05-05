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
    # 1단계: nginx.conf 마커 확인
    if grep -q "\[ACTIVE_BACKEND_MARKER: green\]" "$NGINX_CONF" 2>/dev/null; then
        echo "green"
        return 0
    fi
    
    # 2단계: 마커 미발견 시 실행 중인 컨테이너 확인 (Fallback)
    if docker ps --format "table {{.Names}}" | grep -q "nimda-backend-green"; then
        if docker exec nimda-backend-green curl -s -f http://localhost:8080/api/health > /dev/null 2>&1; then
            echo "green"
            return 0
        fi
    fi
    
    # 기본값: blue
    echo "blue"
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
    local max_attempts=60  # 최대 60초 (기존 30초 → 60초로 연장, Spring Boot 구동 시간 고려)
    local attempt=0

    log "헬스체크 시작: $container (최대 ${max_attempts}초)"

    while [ $attempt -lt $max_attempts ]; do
        # curl로 헬스체크 엔드포인트 확인
        if docker exec "$container" curl -s -f http://localhost:8080/api/health > /dev/null 2>&1; then
            success "$container 정상 작동 확인 (${attempt}초 소요)"
            return 0
        fi
        
        attempt=$((attempt + 1))
        
        # 진행상황 로그 (10초마다)
        if [ $((attempt % 10)) -eq 0 ]; then
            log "  대기 중... ($attempt/${max_attempts}초)"
        fi
        
        sleep 1
    done

    error "$container 헬스체크 실패 (${max_attempts}초 초과) - 배포 롤백"
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
    
    # 백업 생성
    cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%s)"
    
    # 1. 마커 업데이트 (있으면)
    if grep -q "\[ACTIVE_BACKEND_MARKER:" "$NGINX_CONF"; then
        sed -i "s/\[ACTIVE_BACKEND_MARKER: [a-z]*\]/[ACTIVE_BACKEND_MARKER: ${new_active}]/" "$NGINX_CONF"
    fi
    
    # 2. upstream backend_server 업데이트 (주요 변경)
    sed -i "/# 활성 업스트림/,/}/s/server backend-[a-z]*:8080;/server ${new_upstream};/" "$NGINX_CONF"
    
    # 3. 변경 확인
    if grep -q "server ${new_upstream}" "$NGINX_CONF"; then
        success "Nginx 설정 업데이트 완료"
    else
        error "Nginx 설정 업데이트 실패 - 설정 파일 검증 오류"
    fi
}

# ============================================================
# Nginx Reload
# ============================================================

reload_nginx() {
    log "Nginx 설정 적용..."
    
    # 1. 문법 검사
    if ! docker exec nimda-nginx nginx -t 2>&1 | grep -q "successful"; then
        error "Nginx 설정 문법 오류 - 복구 중..."
        # 이전 백업으로 복구
        local backup=$(ls -t "${NGINX_CONF}.bak."* 2>/dev/null | head -1)
        if [ -f "$backup" ]; then
            cp "$backup" "$NGINX_CONF"
            log "  백업으로 복구됨: $(basename $backup)"
        fi
        error "Nginx 설정 적용 실패"
    fi
    
    # 2. Graceful reload
    docker exec nimda-nginx nginx -s reload
    sleep 2
    
    # 3. Nginx 상태 확인
    if docker exec nimda-nginx curl -s http://localhost/api/health > /dev/null 2>&1 || \
       docker exec nimda-nginx curl -s http://localhost:80 > /dev/null 2>&1; then
        success "Nginx 설정 적용 완료"
    else
        log "⚠️  Nginx reload 완료 (상태 확인은 생략)"
    fi
}

# ============================================================
# 이미지 정리 함수 (선택적)
# ============================================================

cleanup_old_images() {
    log "불필요한 이미지 정리..."
    
    # 1. 사용 중인 이미지 ID 확인
    local active_image=$(docker ps -f "name=nimda-backend-blue\|nimda-backend-green" --format "{{.Image}}")
    
    # 2. xtkww971/nimda-backend의 모든 이미지를 나열 (최신순)
    local all_images=$(docker images --filter "reference=xtkww971/nimda-backend" --format "{{.ID}}|{{.CreatedAt}}" | sort -t'|' -k2 -r)
    
    # 3. 현재 사용 중인 이미지를 제외하고, 최신 3개만 보관
    # (더 이전 이미지는 삭제)
    local count=0
    local deleted_count=0
    
    echo "$all_images" | while IFS='|' read -r image_id created_at; do
        # 이미지 ID가 짧은 형태로 변환
        short_id=$(echo "$image_id" | cut -c1-12)
        
        # 현재 사용 중인 이미지는 스킵
        if echo "$active_image" | grep -q "$image_id\|$short_id"; then
            log "  ✓ 현재 사용 중: $short_id"
            return
        fi
        
        # 최신 2개는 보관 (빠른 롤백 용도)
        if [ $count -lt 2 ]; then
            log "  ✓ 보관됨: $short_id (created: ${created_at})"
        else
            # 그 이상은 삭제
            if docker rmi "$image_id" 2>/dev/null; then
                log "  ✗ 삭제됨: $short_id"
                deleted_count=$((deleted_count + 1))
            fi
        fi
        count=$((count + 1))
    done
    
    success "이미지 정리 완료 (삭제: $deleted_count개)"
}

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
    docker compose -f "$DOCKER_COMPOSE_FILE" pull "backend-$standby" || error "이미지 다운로드 실패"
    
    success "이미지 다운로드 완료: $BACKEND_IMAGE_TAG"

    # Step 2: 대기 서비스 시작
    log ""
    log "[Step 2/5] $standby 서비스 시작 (새 이미지)..."
    
    docker compose -f "$DOCKER_COMPOSE_FILE" up -d "backend-$standby" || error "컨테이너 시작 실패"
    
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
    log "[Step 5/5] 이전 버전 이미지 정리 (최신 3개 보관)..."
    
    # 선택적 이미지 정리 (최신 2~3개 이미지는 보관)
    cleanup_old_images
    
    success "정리 완료"

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
    docker compose -f "$DOCKER_COMPOSE_FILE" up -d "backend-$standby" || error "서비스 재시작 실패"
    health_check "$standby"

    # Nginx 설정 변경
    log "[Step 2/3] 트래픽 전환..."
    update_nginx_config "$standby"
    reload_nginx

    # 정리
    log "[Step 3/3] 이전 버전 이미지 정리..."
    cleanup_old_images

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
