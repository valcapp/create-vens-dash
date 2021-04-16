echo off
cd ..
docker run ^
--rm ^
-p 3000:3000 ^
-v "$PWD"/dash-data:/app/dash-data ^
vens-dash:1.0
pause