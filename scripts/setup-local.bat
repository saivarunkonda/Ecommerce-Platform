@echo off
REM E-commerce Platform Local Development Setup Script for Windows

echo =========================================
echo E-commerce Platform Local Setup
echo =========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker Desktop.
    exit /b 1
)

REM Install dependencies for all services
echo Installing dependencies...
cd services\user-service
call npm install
cd ..\product-service
call npm install
cd ..\order-service
call npm install
cd ..\api-gateway
call npm install
cd ..\notification-service
call npm install
cd ..\..

REM Start infrastructure services
echo.
echo Starting infrastructure services (PostgreSQL, Redis, RabbitMQ)...
docker-compose up -d

REM Wait for databases to be ready
echo.
echo Waiting for databases to be ready...
timeout /t 15 /nobreak >nul

echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo To start the services, run: npm run dev
echo.
echo Service URLs:
echo   - API Gateway: http://localhost:8080
echo   - User Service: http://localhost:8081
echo   - Product Service: http://localhost:8082
echo   - Order Service: http://localhost:8083
echo   - Notification Service: http://localhost:8084
echo.
echo Monitoring:
echo   - Grafana: http://localhost:3000
echo   - Prometheus: http://localhost:9090
echo   - Jaeger: http://localhost:16686
echo.
echo RabbitMQ Management: http://localhost:15672 (admin/password)
echo.
