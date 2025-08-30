@echo off
REM راه‌اندازی میکروسرویس jobTitles روی پورت 3002
json-server --watch jobTitles-db.json --port 3002
pause