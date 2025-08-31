# 后端服务错误排查指南

## 🚨 添加 Home & About 模块后常见错误

### 1. 端口占用错误
```bash
Error: listen EADDRINUSE: address already in use :::8000
```

**解决方案:**
```bash
# 方法1: 杀死占用进程
lsof -ti:8000 | xargs kill -9

# 方法2: 使用不同端口
export PORT=8001
npm start
```

### 2. TypeScript 编译错误
```bash
error TS2307: Cannot find module './modules/home/home.routes'
```

**解决方案:**
```bash
# 检查 TypeScript 编译
npx tsc --noEmit

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 清理编译缓存
rm -rf dist
npm run build
```

### 3. 模块导入错误
```bash
Cannot resolve module './modules/home/home.routes'
```

**解决方案:**
检查文件是否存在：
```bash
ls -la src/modules/home/
ls -la src/modules/about/
```

如果文件缺失，重新创建对应模块。

### 4. 配置文件错误
```bash
Error: Configuration file not found
```

**解决方案:**
检查配置文件：
```bash
ls -la src/config/*.json
```

确保以下文件存在：
- `about_me.json`
- `social_links.json`
- `tech_stack.json`

### 5. 依赖循环引用
```bash
ReferenceError: Cannot access before initialization
```

**解决方案:**
检查是否有循环导入：
- HomeService → NoteService
- AboutService → NoteService
- 确保没有反向引用

### 6. JSON 格式错误
```bash
SyntaxError: Unexpected token in JSON
```

**解决方案:**
验证 JSON 文件格式：
```bash
# 检查每个配置文件
node -e "console.log(JSON.parse(require('fs').readFileSync('src/config/about_me.json', 'utf8')))"
node -e "console.log(JSON.parse(require('fs').readFileSync('src/config/social_links.json', 'utf8')))"
# ... 其他文件
```

## 🔧 系统性排查步骤

### 步骤 1: 检查服务状态
```bash
# 检查端口占用
netstat -tulpn | grep :8000

# 检查进程
ps aux | grep node
```

### 步骤 2: 验证文件结构
```bash
# 检查模块完整性
find src/modules -name "*.ts" | sort

# 期望输出:
# src/modules/about/about.controller.ts
# src/modules/about/about.dto.ts
# src/modules/about/about.routes.ts
# src/modules/about/about.service.ts
# src/modules/config/config.controller.ts
# src/modules/config/config.dto.ts
# src/modules/config/config.routes.ts
# src/modules/config/config.service.ts
# src/modules/home/home.controller.ts
# src/modules/home/home.dto.ts
# src/modules/home/home.routes.ts
# src/modules/home/home.service.ts
# src/modules/note/note.controller.ts
# src/modules/note/note.dto.ts
# src/modules/note/note.routes.ts
# src/modules/note/note.service.ts
# src/modules/note/note.utils.ts
```

### 步骤 3: 验证编译
```bash
# TypeScript 编译检查
npx tsc --noEmit

# 构建检查
npm run build

# 如果编译失败，查看具体错误
```

### 步骤 4: 启动调试
```bash
# 开发模式启动 (显示详细错误)
npm run dev

# 或者调试模式
DEBUG=* npm start
```

## 🛠️ 具体修复命令

### 完全重置 (核选项)
```bash
# 1. 停止所有相关进程
pkill -f "node.*8000"

# 2. 清理依赖和缓存
rm -rf node_modules package-lock.json dist
npm cache clean --force

# 3. 重新安装
npm install

# 4. 重新编译
npm run build

# 5. 启动服务
npm start
```

### 增量修复
```bash
# 仅重新编译
npm run build

# 仅重启服务
npm run dev
```

## 📋 检查清单

- [ ] 端口 8000 未被占用
- [ ] 所有模块文件存在且完整
- [ ] 配置 JSON 文件格式正确
- [ ] TypeScript 编译无错误
- [ ] 依赖包完整安装
- [ ] 没有循环引用
- [ ] 路由导入正确

## 🆘 获取帮助

如果仍然有问题，请提供具体的错误信息：

1. **完整的错误堆栈**
2. **启动命令**
3. **Node.js 版本**: `node --version`
4. **NPM 版本**: `npm --version`
5. **操作系统**: `uname -a`

## 📞 常用调试命令

```bash
# 检查服务健康状态
curl http://localhost:8000/health

# 检查 API 端点
curl http://localhost:8000/api/home/profile
curl http://localhost:8000/api/about/info

# 检查日志
tail -f logs/app.log  # 如果有日志文件

# 检查进程
ps aux | grep "node.*8000"
```

遇到问题时，请按照这个顺序逐步排查，通常能快速定位和解决问题。
