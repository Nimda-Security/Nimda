# Stage 1: Build (기존과 동일)
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Create the final runtime image
FROM eclipse-temurin:17-jre

USER root

# [핵심 수정] 무거운 컴파일러 설치 제거 및 시간대 설정만 유지
# tzdata 설치 없이 바로 심볼릭 링크 설정 시도 (기본 이미지에 포함된 경우 대비)
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo Asia/Seoul > /etc/timezone

WORKDIR /app

# 빌드 스테이지에서 생성된 jar 복사
COPY --from=build /app/target/*.jar app.jar

EXPOSE 80
ENTRYPOINT ["java", "-jar", "app.jar"]