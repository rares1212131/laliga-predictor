
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Package the application (skip tests to speed up build)
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar


COPY src/main/resources/data/2526ALL.csv /app/data/2526ALL.csv

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]