@echo off
REM راه‌اندازی میکروسرویس positions روی پورت 3001
json-server --watch positions-db.json --port 3001
pause