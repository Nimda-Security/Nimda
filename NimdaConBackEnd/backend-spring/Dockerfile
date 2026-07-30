# Stage 1: Build
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Create the final runtime image
FROM eclipse-temurin:17-jre

# 시간대 설정 (tzdata 설치 없이 기본 이미지 포함 zoneinfo 사용)
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo Asia/Seoul > /etc/timezone

WORKDIR /app

# 빌드 스테이지에서 생성된 jar 복사
COPY --from=build /app/target/*.jar app.jar

# [보안] 비루트 사용자로 실행한다.
# 컨테이너 탈출/RCE 시 root 권한을 그대로 넘겨주지 않기 위함.
RUN groupadd --system --gid 10001 app && \
    useradd --system --uid 10001 --gid app --no-create-home app && \
    chown -R app:app /app
USER app:app

# 애플리케이션은 SERVER_PORT(기본 8080)에서 listen 한다.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
