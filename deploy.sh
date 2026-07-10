#!/bin/bash
set -Eeuo pipefail

readonly ACTIVE_BACKEND_FILE="./nginx/conf.d/active-backend.inc"
readonly NGINX_CONTAINER="nimda-nginx"
readonly HEALTH_PATH="/api/cite/category"
readonly HEALTH_ATTEMPTS=24
readonly HEALTH_INTERVAL_SECONDS=5
readonly HEALTH_REQUEST_TIMEOUT_SECONDS=3
readonly DEPLOY_LOCK_FILE="${DEPLOY_LOCK_FILE:-/tmp/nimda-deploy.lock}"

if [ -z "${BACKEND_IMAGE_TAG:-}" ]; then
    echo "BACKEND_IMAGE_TAG must be set to an immutable image tag." >&2
    exit 1
fi
export BACKEND_IMAGE_TAG

for command_name in docker curl flock mktemp mv chmod; do
    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "Required command is unavailable: $command_name" >&2
        exit 1
    fi
done

exec 9>"$DEPLOY_LOCK_FILE"
if ! flock -n 9; then
    echo "Another NIMDA deployment is already running." >&2
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose is unavailable." >&2
    exit 1
fi

if [ ! -d "$(dirname "$ACTIVE_BACKEND_FILE")" ]; then
    echo "Nginx configuration directory is unavailable." >&2
    exit 1
fi

write_active_backend() {
    local color="$1"
    local temporary_file

    temporary_file=$(mktemp "${ACTIVE_BACKEND_FILE}.tmp.XXXXXX")
    printf 'server backend-%s:8080;\n' "$color" > "$temporary_file"
    chmod 644 "$temporary_file"
    mv -f "$temporary_file" "$ACTIVE_BACKEND_FILE"
}

if [ ! -f "$ACTIVE_BACKEND_FILE" ]; then
    write_active_backend "blue"
    echo "Created active backend configuration with blue as the initial target."
fi

IFS= read -r active_backend < "$ACTIVE_BACKEND_FILE"
case "$active_backend" in
    "server backend-blue:8080;")
        ACTIVE_COLOR="blue"
        TARGET_COLOR="green"
        TARGET_PORT=8082
        ;;
    "server backend-green:8080;")
        ACTIVE_COLOR="green"
        TARGET_COLOR="blue"
        TARGET_PORT=8081
        ;;
    *)
        echo "Active backend configuration is invalid: $active_backend" >&2
        exit 1
        ;;
esac


echo "Active service: $ACTIVE_COLOR; deployment target: $TARGET_COLOR"

docker compose pull "backend-$TARGET_COLOR"
docker compose up -d "backend-$TARGET_COLOR"

echo "Waiting for backend-$TARGET_COLOR to become healthy..."
target_is_healthy=false
for ((attempt = 1; attempt <= HEALTH_ATTEMPTS; attempt++)); do
    if status_code=$(curl \
        --fail \
        --silent \
        --show-error \
        --output /dev/null \
        --write-out "%{http_code}" \
        --max-time "$HEALTH_REQUEST_TIMEOUT_SECONDS" \
        "http://127.0.0.1:${TARGET_PORT}${HEALTH_PATH}") &&
        [[ "$status_code" =~ ^2[0-9][0-9]$ ]]; then
        target_is_healthy=true
        break
    fi

    if ((attempt < HEALTH_ATTEMPTS)); then
        sleep "$HEALTH_INTERVAL_SECONDS"
    fi
done

if [ "$target_is_healthy" != true ]; then
    echo "backend-$TARGET_COLOR did not return a successful health response before timeout; promotion aborted." >&2
    exit 1
fi

write_active_backend "$TARGET_COLOR"

if ! docker exec "$NGINX_CONTAINER" nginx -t; then
    write_active_backend "$ACTIVE_COLOR"
    echo "Nginx configuration validation failed; active backend was restored." >&2
    exit 1
fi

if ! docker exec "$NGINX_CONTAINER" nginx -s reload; then
    write_active_backend "$ACTIVE_COLOR"
    docker exec "$NGINX_CONTAINER" nginx -t >/dev/null
    docker exec "$NGINX_CONTAINER" nginx -s reload >/dev/null
    echo "Nginx reload failed; active backend was restored." >&2
    exit 1
fi

echo "Promoted backend-$TARGET_COLOR."
docker compose stop "backend-$ACTIVE_COLOR"
echo "Stopped backend-$ACTIVE_COLOR after successful promotion."