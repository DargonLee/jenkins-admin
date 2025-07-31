# Jenkins Admin

一个现代化的 Jenkins 管理系统，包含前端界面和后端 API，提供直观的 Jenkins 任务管理和实时构建监控功能。

## 🚀 项目概述

Jenkins Admin 是一个完整的 Jenkins 管理解决方案，由以下部分组成：

- **前端**: 基于 React 19、TypeScript 和 Vite 构建的现代化 Web 界面
- **后端**: 基于 FastAPI 的 RESTful API 服务，提供 Jenkins 集成功能

## ✨ 主要特性

### 🎯 核心功能
- **服务器信息管理** - 获取和显示 Jenkins 服务器详细信息
- **任务列表管理** - 浏览和选择 Jenkins 任务
- **构建触发** - 支持参数化构建触发
- **实时构建监控** - 自动获取构建号并实时显示构建状态和日志
- **构建状态查看** - 详细的构建状态和结果展示
- **控制台日志** - 完整的构建日志查看和实时更新

## 📁 项目结构

```
jenkins-admin/
├── frontend/                    # 前端应用
│   ├── src/
│   │   ├── pages/dashboard/jenkins/  # Jenkins 管理页面
│   │   ├── api/                      # API 客户端和服务
│   │   ├── components/               # 可复用组件
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # 后端 API 服务
│   ├── app/
│   │   ├── api/endpoints/       # API 端点
│   │   ├── core/                # 核心配置
│   │   ├── services/            # 业务服务
│   │   └── main.py              # 应用入口
│   ├── requirements.txt
│   └── run.py
└── README.md                    # 项目文档
```

## 🛠️ 快速开始

### 🐳 Docker 部署 Jenkins

#### 使用 Docker Compose 部署（推荐）

##### 步骤 1：创建项目目录
```bash
mkdir jenkins-docker
cd jenkins-docker
```
**作用**：创建一个专门的目录来管理 Jenkins 相关文件

##### 步骤 2：创建 docker-compose.yml 文件
```yaml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    restart: unless-stopped
    ports:
      - "8080:8080"      # Jenkins Web UI
      - "50000:50000"    # Jenkins 代理端口
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock  # 可选：Docker-in-Docker
    environment:
      - JAVA_OPTS=-Xmx2048m -Xms1024m  # JVM 内存设置
    networks:
      - jenkins-network

volumes:
  jenkins_home:
    driver: local

networks:
  jenkins-network:
    driver: bridge
```

**配置说明**：
- `version: '3.8'`：Docker Compose 文件格式版本
- `services`：定义要运行的服务
- `volumes`：定义数据卷，用于数据持久化
- `networks`：创建专用网络，便于服务间通信
- `environment`：设置环境变量，这里配置了 JVM 内存

##### 步骤 3：启动服务
```bash
# 启动服务（后台运行）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs jenkins

# 实时查看日志
docker-compose logs -f jenkins
```

**作用**：
- `up -d`：启动所有定义的服务并在后台运行
- `ps`：显示服务运行状态
- `logs`：查看指定服务的日志

##### 步骤 4：获取初始密码
```bash
docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**作用**：通过 Docker Compose 进入 Jenkins 容器获取初始密码

#### 3. 访问 Jenkins Web 界面
打开浏览器访问：http://localhost:8080

- 输入初始管理员密码
- 选择"安装推荐的插件"或"选择插件来安装"
- 创建管理员账户
- 完成 Jenkins 配置

#### 4. 配置 Jenkins 用户和 API Token
1. 登录 Jenkins 后，点击右上角用户名
2. 选择"Configure"（配置）
3. 在"API Token"部分，点击"Add new Token"
4. 生成并保存 API Token（用于后端连接）

#### 5. 验证 Jenkins 连接
```bash
# 测试 Jenkins API 连接
curl -u your-username:your-api-token http://localhost:8080/api/json
```

### 后端设置

#### 1. 环境准备
```bash
cd backend

# 确保已安装 Python 3.9+
python3 --version

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

#### 2. 配置 Jenkins 连接
```bash
# 复制配置模板
cp .env.example .env

# 编辑 .env 文件，设置你的 Jenkins 信息
# JENKINS_URL=http://your-jenkins-server:8080
# JENKINS_USERNAME=your-username
# JENKINS_PASSWORD=your-password
```

#### 3. 启动后端服务
```bash
# 启动服务器 (默认端口 8000)
python3 run.py
```

#### 4. 验证后端功能
打开浏览器访问：
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health
- **Jenkins 任务列表**: http://localhost:8000/jenkins/jobs

### 前端设置

#### 1. 环境要求
- Node.js 20.x
- pnpm (推荐) 或 npm

#### 2. 安装依赖
```bash
cd frontend

# 使用 pnpm (推荐)
pnpm install
```

#### 3. 启动开发服务器
```bash
# 启动开发服务器 (端口 3001)
pnpm dev
```

#### 4. 生产构建
```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 🔌 API 配置

### 后端 API 端点

#### 获取 Jenkins 信息
```bash
curl http://localhost:8000/jenkins/info
```

#### 获取所有任务
```bash
curl http://localhost:8000/jenkins/jobs
```

#### 获取特定任务详情
```bash
curl http://localhost:8000/jenkins/job/your-job-name
```

#### 触发任务构建
```bash
curl -X POST http://localhost:8000/jenkins/build/your-job-name
```

### 前端 API 配置

前端通过代理连接到后端服务：

- **开发环境**: `http://localhost:8000`
- **API 前缀**: `/api`

Vite 开发服务器配置了 API 代理：
```typescript
// vite.config.ts
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
}
```

## 🔧 故障排除

### Docker 相关问题

#### Jenkins 容器启动失败
```bash
# 检查服务状态
docker-compose ps

# 查看服务日志
docker-compose logs jenkins

# 重启服务
docker-compose restart jenkins

# 如果服务损坏，重新创建
docker-compose down
docker-compose up -d
```

#### 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep 8080

# 修改 docker-compose.yml 中的端口映射
# ports:
#   - "8081:8080"  # 使用 8081 端口

# 重新启动服务
docker-compose down
docker-compose up -d
```

#### 权限问题
```bash
# 修复 Jenkins 数据目录权限
docker-compose exec -u root jenkins chown -R jenkins:jenkins /var/jenkins_home

# 或者使用 root 用户运行容器（修改 docker-compose.yml）
# user: root
```

#### 常用 Docker Compose 命令
```bash
# 停止服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v

# 重新构建并启动服务
docker-compose up -d --build

# 查看服务资源使用情况
docker-compose top
```

### 后端问题

#### Jenkins 连接失败
1. 检查 Jenkins 服务器是否可访问
2. 确认用户名和密码/API Token 正确
3. 验证 Jenkins 启用了 REST API

#### 端口被占用
```bash
# 使用不同端口启动
PORT=8001 python3 run.py
```

#### 查看详细日志
```bash
# 设置调试模式
DEBUG=true LOG_LEVEL=DEBUG python3 run.py
```

### 前端问题

#### 开发服务器启动失败
1. 检查 Node.js 版本是否符合要求
2. 清除 node_modules 并重新安装依赖
3. 检查端口 3001 是否被占用

#### API 连接失败
1. 确保后端服务正在运行
2. 检查代理配置是否正确
3. 验证 Jenkins 服务配置

## 🎯 项目特点

### 后端特点
- ✅ **单文件应用** - 所有功能在 `simple_app.py` 中
- ✅ **零配置启动** - 只需设置 Jenkins 连接信息
- ✅ **自动 API 文档** - FastAPI 自动生成交互式文档
- ✅ **结构化日志** - 便于调试和监控
- ✅ **健康检查** - 实时监控 Jenkins 连接状态

### 前端特点
- ✅ **现代化技术栈** - React 19 + TypeScript + Vite
- ✅ **响应式设计** - 适配各种屏幕尺寸
- ✅ **实时更新** - 构建状态和日志实时同步
- ✅ **用户友好** - 直观的操作界面
- ✅ **类型安全** - 完整的 TypeScript 支持

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [Vite](https://vitejs.dev/) - 构建工具
- [FastAPI](https://fastapi.tiangolo.com/) - 后端框架
- [Slash-Admin](https://github.com/d3george/slash-admin) - UI 
- [Jenkin-API](https://python-jenkins.readthedocs.io/en/latest/api.html)

---

**Jenkins Admin** - 让 Jenkins 管理变得简单而优雅 🚀
