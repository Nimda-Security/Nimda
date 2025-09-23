FROM eclipse-temurin:17-jre 
WORKDIR /app 
COPY target/*.jar app.jar
EXPOSE 3001
ENTRYPOINT ["java", "-jar", "app.jar"]
