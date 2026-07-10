FROM maven:3.9.9-eclipse-temurin-17@sha256:f58d59b6273e785ac0a4477f6e9b5ba1d7731c75b906c0f7b34076f1851318cc AS build
WORKDIR /app

# Cache Maven dependencies independently from application sources.
COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy@sha256:475d8e96b4b2bfe08999e5e854755c773af1581acdf959a4545d88f0696a2339

USER root
ENV TZ=Asia/Seoul \
    FILE_UPLOAD_DIR=/app/uploads
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo Asia/Seoul > /etc/timezone && \
    groupadd --system nimda && \
    useradd --system --gid nimda --home-dir /app nimda && \
    mkdir -p /app/uploads && \
    chown -R nimda:nimda /app

WORKDIR /app
COPY --from=build --chown=nimda:nimda /app/target/*.jar app.jar

USER nimda
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
