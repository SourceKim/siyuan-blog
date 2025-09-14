FROM node:18-alpine

WORKDIR /app

# 运行期环境变量（可在 docker run / compose 中覆盖）
ENV NODE_ENV=production
ENV PORT=8000
ENV SIYUAN_API_URL=http://localhost:6806
# ENV SIYUAN_TOKEN=            # 敏感信息请在运行时注入
# ENV BLOG_NOTEBOOK_ID=        # 可在运行时注入或使用默认配置
ENV CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
ENV LOG_LEVEL=info

# 仅安装运行时依赖
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production

# 复制预构建产物（dist 需已存在于构建上下文中）
COPY dist ./dist

# 创建非 root 用户并切换
RUN addgroup -g 1001 -S nodejs \
  && adduser -S backend -u 1001
USER backend

# 暴露端口（与 PORT 缺省一致）
EXPOSE 8000

# 健康检查（读取 PORT 环境变量）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const port=process.env.PORT||8000;http.get(`http://localhost:${port}/health`,res=>{process.exit(res.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

# 启动应用
CMD ["node", "dist/index.js"]