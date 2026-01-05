@echo off
REM Heroku Deployment Script for Supreme Blue ERP Backend (Windows)
REM Run this script to deploy your app to Heroku

echo.
echo ============================================
echo Supreme Blue ERP - Heroku Deployment
echo ============================================
echo.

REM Check if Heroku CLI is installed
where heroku >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Heroku CLI is not installed
    echo Please install it from: https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)

echo [OK] Heroku CLI found
echo.

REM Check if logged in to Heroku
heroku auth:whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo Please login to Heroku...
    heroku login
)

echo [OK] Logged in to Heroku
echo.

REM Ask for app name
set /p APP_NAME="Enter your Heroku app name (or press Enter to create new): "

if "%APP_NAME%"=="" (
    echo Creating new Heroku app...
    for /f "tokens=*" %%i in ('heroku create --json ^| findstr "name"') do set APP_INFO=%%i
    echo [OK] App created
) else (
    heroku apps:info -a %APP_NAME% >nul 2>nul
    if %errorlevel% equ 0 (
        echo [OK] Using existing app: %APP_NAME%
    ) else (
        echo Creating app: %APP_NAME%...
        heroku create %APP_NAME%
        echo [OK] Created app: %APP_NAME%
    )
)

echo.

REM Add PostgreSQL addon
set /p ADD_PG="Add Heroku Postgres? (y/n, default: n): "
if /i "%ADD_PG%"=="y" (
    echo Adding Heroku Postgres...
    heroku addons:create heroku-postgresql:essential-0 -a %APP_NAME%
    echo [OK] PostgreSQL added
) else (
    echo Skipping Postgres addon (set DATABASE_URL manually)
)

echo.
echo Setting environment variables...

REM Set environment variables
heroku config:set NODE_ENV="production" -a %APP_NAME%
heroku config:set JWT_SECRET="supreme-blue-jwt-secret-change-this-$(date /t)-$(time /t)" -a %APP_NAME%
heroku config:set JWT_REFRESH_SECRET="supreme-blue-refresh-secret-change-this-$(date /t)-$(time /t)" -a %APP_NAME%
heroku config:set JWT_EXPIRES_IN="15m" -a %APP_NAME%
heroku config:set JWT_REFRESH_EXPIRES_IN="7d" -a %APP_NAME%
heroku config:set TZ="Asia/Colombo" -a %APP_NAME%

echo [OK] Environment variables set
echo.

REM Ask for frontend URL
set /p FRONTEND_URL="Enter your frontend URL (optional): "
if not "%FRONTEND_URL%"=="" (
    heroku config:set FRONTEND_URL="%FRONTEND_URL%" -a %APP_NAME%
    echo [OK] Frontend URL set
)

echo.

REM Ask for custom database URL
if not "%ADD_PG%"=="y" (
    set /p DATABASE_URL="Enter your DATABASE_URL (Neon DB): "
    set /p DIRECT_URL="Enter your DIRECT_URL: "
    
    if not "%DATABASE_URL%"=="" (
        heroku config:set DATABASE_URL="%DATABASE_URL%" -a %APP_NAME%
        echo [OK] DATABASE_URL set
    )
    
    if not "%DIRECT_URL%"=="" (
        heroku config:set DIRECT_URL="%DIRECT_URL%" -a %APP_NAME%
        echo [OK] DIRECT_URL set
    )
)

echo.

REM Initialize git if needed
if not exist .git (
    echo Initializing git repository...
    git init
    echo [OK] Git initialized
)

REM Add Heroku remote
echo Adding Heroku remote...
heroku git:remote -a %APP_NAME% 2>nul || echo Remote already exists

REM Deploy
echo.
echo Preparing deployment...
git add .
git commit -m "Deploy to Heroku" 2>nul || echo No changes to commit

echo.
echo Deploying to Heroku...
git push heroku main 2>nul || git push heroku master

echo.
echo ============================================
echo Deployment Complete!
echo ============================================
echo.
echo App URL: https://%APP_NAME%.herokuapp.com
echo API URL: https://%APP_NAME%.herokuapp.com/api
echo Dashboard: https://dashboard.heroku.com/apps/%APP_NAME%
echo.
echo View logs with: heroku logs --tail -a %APP_NAME%
echo Open app with: heroku open -a %APP_NAME%
echo.
echo Happy coding!
echo.
pause
