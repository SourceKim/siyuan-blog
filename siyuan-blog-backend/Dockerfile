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

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app

# 复制 package.json 
COPY package.json yarn.lock* ./

# 只安装生产依赖
RUN yarn install --frozen-lockfile --production

# 复制构建好的应用
COPY --from=build /app/dist ./dist

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# 修改文件所有者
USER backend

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用
CMD ["node", "dist/index.js"] 