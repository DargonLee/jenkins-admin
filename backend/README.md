# Jenkins Admin Backend - 快速开始

## 🚀 5分钟快速验证 Jenkins REST API 通信

###  项目结构
```bash
jenkins-admin-backend/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py               # 依赖注入，如获取 Jenkins 服务实例
│   │   └── endpoints/
│   │       ├── __init__.py
│   │       └── jenkins.py        # 存放所有 /jenkins/ 相关的端点
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py             # 存放 Settings 类
│   │   └── logging_config.py     # 存放 setup_logging 函数
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   └── jenkins_service.py    # 存放 JenkinsService 类
│   │
│   └── main.py                   # 创建并组装 FastAPI 应用实例
│
├── .env                        # 存放环境变量 (不提交到 Git)
├── .env.example                # 环境变量模板
├── .gitignore
└── requirements.txt            # 项目依赖
```

### 1. 环境准备
```bash
# 确保已安装 Python 3.9+
python3 --version

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置 Jenkins 连接
```bash
# 复制配置模板
cp .env.example .env

# 编辑 .env 文件，设置你的 Jenkins 信息
# JENKINS_URL=http://your-jenkins-server:8080
# JENKINS_USERNAME=your-username
# JENKINS_PASSWORD=your-password
```

### 3. 启动 Web 服务
```bash
# 启动服务器
python3 run.py
```

### 4. 验证功能
打开浏览器访问：

- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health
- **Jenkins 任务列表**: http://localhost:8000/jenkins/jobs

## 📋 常用 API 测试

### 获取 Jenkins 信息
```bash
curl http://localhost:8000/jenkins/info
```

### 获取所有任务
```bash
curl http://localhost:8000/jenkins/jobs
```

### 获取特定任务详情
```bash
curl http://localhost:8000/jenkins/job/your-job-name
```

### 触发任务构建
```bash
curl -X POST http://localhost:8000/jenkins/build/your-job-name
```

## 🔧 故障排除

### Jenkins 连接失败
1. 检查 Jenkins 服务器是否可访问
2. 确认用户名和密码/API Token 正确
3. 验证 Jenkins 启用了 REST API

### 端口被占用
```bash
# 使用不同端口启动
PORT=8001 python3 start.py
```

### 查看详细日志
```bash
# 设置调试模式
DEBUG=true LOG_LEVEL=DEBUG python3 start.py
```

## 🎯 项目特点

- ✅ **单文件应用** - 所有功能在 `simple_app.py` 中
- ✅ **零配置启动** - 只需设置 Jenkins 连接信息
- ✅ **自动 API 文档** - FastAPI 自动生成交互式文档
- ✅ **结构化日志** - 便于调试和监控
- ✅ **健康检查** - 实时监控 Jenkins 连接状态

这个简化版本专注于验证 Jenkins REST API 通信，是学习和原型开发的理想选择！