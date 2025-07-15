FROM node:18-alpine AS build

WORKDIR /app

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock* ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 生产阶段 - 使用 Nginx 提供静态文件
FROM nginx:alpine AS production

# 复制构建好的文件到 Nginx 目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"] 