# Optional production edge proxy for the API. Build/run manually if needed:
#   docker build -t skyrun-nginx docker/nginx
#   docker run -p 80:80 --network skyrun_skyrun-network skyrun-nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
