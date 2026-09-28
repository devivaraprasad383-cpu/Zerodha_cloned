
# ---- Build stage ---------------------------------------------------------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Baked in at build time (Create React App inlines REACT_APP_* at build,
# not at container start) — override with --build-arg for a different
# backend URL.
ARG REACT_APP_API_URL=http://localhost:3002/api
ARG REACT_APP_SOCKET_URL=http://localhost:3002
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL
RUN npm run build

# ---- Serve stage -----------------------------------------------------------
FROM nginx:1.27-alpine AS serve
COPY --from=build /app/build /usr/share/nginx/html
# SPA fallback: any unknown path serves index.html so react-router's client
# side routes (e.g. a hard refresh on /holdings) don't 404 at the server.
RUN printf 'server {\n\
  listen 3000;\n\
  root /usr/share/nginx/html;\n\
  location / {\n\
    try_files $uri /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
