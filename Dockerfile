# Stage 1: Build the Vite Single Page Application
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight, secure Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Support Google Cloud Run dynamic PORT env (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Replace port placeholder and start Nginx
CMD ["/bin/sh", "-c", "sed -i 's/LISTEN_PORT/'\"$PORT\"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]