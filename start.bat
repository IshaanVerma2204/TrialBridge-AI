@echo off
echo Starting TrialBridge AI locally...

echo [1/3] Database setup...
:: docker-compose up -d db
:: We are using local SQLite instead so no Docker is needed!

echo [2/3] Running Database Migrations...
call apps\api\.venv\Scripts\activate
cd apps\api
alembic upgrade head
cd ..\..

echo [3/3] Starting Frontend and Backend Services...
echo (Press Ctrl+C to stop)
npm run dev
