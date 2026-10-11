FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
# 假定已 npm install（开发环境）；如希望纯离线构建可改为 `npm ci`
RUN npm install --no-audit --no-fund

COPY . .

ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}

RUN npm run build

# ---- 运行阶段 ----
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]