#!/bin/bash

echo "Nimda Contest Platform - Spring Boot Backend 시작"
echo "================================================"

# MySQL 데이터베이스 확인
echo "MySQL 데이터베이스 연결 확인 중..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nimda_con CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ MySQL 데이터베이스 준비 완료"
else
    echo "❌ MySQL 연결 실패. MySQL이 실행 중인지 확인하세요."
    echo "   MySQL 설정:"
    echo "   - 호스트: localhost:3306"
    echo "   - 데이터베이스: nimda_con"
    echo "   - 사용자: root"
    echo "   - 비밀번호: password (application.yml에서 변경 가능)"
    exit 1
fi

# Maven 빌드 및 실행
echo ""
echo "Spring Boot 애플리케이션 시작 중..."
mvn spring-boot:run
