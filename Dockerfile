# 멀티 아키텍처 지원을 위한 베이스 이미지
FROM eclipse-temurin:17-jre

WORKDIR /app 

# JAR 파일 복사
COPY NimdaConBackEnd/backend-spring/target/*.jar app.jar

# 포트 노출
EXPOSE 3001

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
