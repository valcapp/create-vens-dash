cd ..
docker run \
--rm \
-p 3000:3000 \
-v "$PWD"/db:/app/db \
vens-dash:1.0