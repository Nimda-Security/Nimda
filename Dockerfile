# 멀티 아키텍처 지원을 위한 베이스 이미지
# JDK를 사용하여 javac 컴파일러 포함
# FROM 베이스 이미지 지정 - JDK 17 버전 사용 
# Java 실행 환경 (JRE) + 개발 도구 (JDK), javac 컴파일러 
FROM eclipse-temurin:17-jdk

# C++ 컴파일러 및 빌드 도구 설치
RUN apt-get update && apt-get install -y \
    g++ \ 
    gcc \ 
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app 

# JAR 파일 복사
COPY NimdaConBackEnd/backend-spring/target/*.jar app.jar

# 포트 노출
EXPOSE 3001

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
