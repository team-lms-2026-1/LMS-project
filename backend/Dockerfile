# syntax=docker/dockerfile:1

# -------- Build stage --------
FROM gradle:8.8-jdk17 AS builder
WORKDIR /app

# Gradle 캐시를 최대한 활용하기 위해 먼저 설정/의존성만 복사
COPY build.gradle settings.gradle gradlew /app/
COPY gradle /app/gradle
RUN ./gradlew --no-daemon dependencies

# 소스 복사 후 빌드
COPY . /app
RUN ./gradlew --no-daemon clean bootJar

# -------- Run stage --------
FROM eclipse-temurin:17-jre
WORKDIR /app

# 빌드 산출물 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 런타임 설정 (Fly/EC2 공용)
ENV JAVA_OPTS=""
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
