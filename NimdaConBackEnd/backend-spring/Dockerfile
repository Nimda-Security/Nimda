# Stage 1: Build the application using Maven
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
# Copy pom.xml and source code (현재 디렉토리에서 복사)
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Create the final runtime image
FROM eclipse-temurin:17-jre 

# 시간대 설정 및 비대화형 모드 설정
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul

WORKDIR /app

# 필수 패키지 설치 (비대화형 모드)
USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    g++ \
    build-essential \
    tzdata \
    curl && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    # 캐시 정리 (이미지 용량 감소)
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/* /tmp/* /var/tmp/*

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
