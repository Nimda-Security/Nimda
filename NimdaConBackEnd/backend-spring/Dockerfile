# Stage 1: Build the application using Maven
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
# Copy pom.xml and source code (현재 디렉토리에서 복사)
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Create the final runtime image
FROM eclipse-temurin:17-jre 

# Install C++ compiler and build tools
USER root
RUN apt-get update && apt-get install -y g++ build-essential

WORKDIR /app 

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 80
ENTRYPOINT ["java", "-jar", "app.jar"]
