# FastAPI 后端接口开发规范

## 📋 概述

本文档基于`jenkinsService.ts`中定义的所有接口，为FastAPI后端开发提供完整的接口规范。所有前端调用都通过这些接口与Jenkins服务器通信。

---

## 🔧 接口清单 (32个)

### 1. **基础信息接口 (3个)**

#### `GET /jenkins/info`
```python
@app.get("/jenkins/info")
async def get_server_info():
    """获取Jenkins服务器基本信息"""
    # 调用Jenkins API: GET {jenkins_url}/api/json
    return {
        "status": "success",
        "data": {
            "version": "2.401.3",
            "mode": "NORMAL",
            "nodeDescription": "Jenkins主节点",
            "nodeName": "",
            "numExecutors": 2,
            "useCrumbs": True,
            "useSecurity": True,
            "views": [{"name": "All", "url": "..."}]
        }
    }
```

#### `GET /jenkins/systemInfo`
```python
@app.get("/jenkins/systemInfo")
async def get_system_info():
    """获取系统详细信息"""
    # 调用Jenkins API: GET {jenkins_url}/systemInfo
    return {
        "status": "success",
        "data": {
            "systemProperties": {"java.version": "11.0.19", ...},
            "environmentVariables": {"PATH": "/usr/bin", ...}
        }
    }
```

#### `GET /jenkins/pluginManager/plugins`
```python
@app.get("/jenkins/pluginManager/plugins")
async def get_plugins():
    """获取插件信息"""
    # 调用Jenkins API: GET {jenkins_url}/pluginManager/api/json?depth=1
    return {
        "status": "success",
        "data": {
            "plugins": [
                {
                    "shortName": "git",
                    "longName": "Git plugin",
                    "version": "4.8.3",
                    "enabled": True,
                    "active": True,
                    "hasUpdate": False
                }
            ]
        }
    }
```

---

### 2. **任务管理接口 (8个)**

#### `GET /jenkins/jobs`
```python
@app.get("/jenkins/jobs")
async def get_jobs(depth: int = 1):
    """获取所有任务列表"""
    # 调用Jenkins API: GET {jenkins_url}/api/json?tree=jobs[name,url,color,lastBuild[number,timestamp,result,duration]]
```

#### `GET /jenkins/job/{jobName}`
```python
@app.get("/jenkins/job/{job_name}")
async def get_job_info(job_name: str):
    """获取特定任务信息"""
    # 调用Jenkins API: GET {jenkins_url}/job/{job_name}/api/json
```

#### `GET /jenkins/job/{jobName}/api/json?tree=property[parameterDefinitions[...]]`
```python
@app.get("/jenkins/job/{job_name}/parameters")
async def get_job_parameters(job_name: str):
    """获取任务参数定义"""
    # 调用Jenkins API获取参数定义
    return {
        "status": "success",
        "data": {
            "parameterDefinitions": [
                {
                    "name": "BRANCH_NAME",
                    "type": "ChoiceParameterDefinition",
                    "description": "选择分支",
                    "choices": ["main", "develop", "feature/xxx"],
                    "defaultParameterValue": {"value": "main"}
                }
            ]
        }
    }
```

#### `GET /jenkins/job/{jobName}/api/json?tree=builds[...]`
```python
@app.get("/jenkins/job/{job_name}/builds")
async def get_job_builds(job_name: str, limit: int = 10):
    """获取任务构建历史"""
    # 调用Jenkins API获取构建历史
```

#### `POST /jenkins/createItem`
```python
@app.post("/jenkins/createItem")
async def create_job(name: str, config_xml: str):
    """创建新任务"""
    # 调用Jenkins API: POST {jenkins_url}/createItem?name={name}
    # Content-Type: application/xml
```

#### `POST /jenkins/job/{jobName}/doDelete`
```python
@app.post("/jenkins/job/{job_name}/delete")
async def delete_job(job_name: str):
    """删除任务"""
    # 调用Jenkins API: POST {jenkins_url}/job/{job_name}/doDelete
```

#### `POST /jenkins/job/{jobName}/enable`
```python
@app.post("/jenkins/job/{job_name}/enable")
async def enable_job(job_name: str):
    """启用任务"""
    # 调用Jenkins API: POST {jenkins_url}/job/{job_name}/enable
```

#### `POST /jenkins/job/{jobName}/disable`
```python
@app.post("/jenkins/job/{job_name}/disable")
async def disable_job(job_name: str):
    """禁用任务"""
    # 调用Jenkins API: POST {jenkins_url}/job/{job_name}/disable
```

---

### 3. **构建控制接口 (7个)**

#### `POST /jenkins/build/{jobName}`
```python
@app.post("/jenkins/build/{job_name}")
async def trigger_build(job_name: str, build_params: dict = None):
    """触发构建"""
    # 调用Jenkins API: POST {jenkins_url}/job/{job_name}/build
    # 或 POST {jenkins_url}/job/{job_name}/buildWithParameters
    return {
        "status": "success",
        "data": {
            "job_name": job_name,
            "queue_id": 123,
            "message": "构建已加入队列"
        }
    }
```

#### `GET /jenkins/build/{jobName}/{buildNumber}`
```python
@app.get("/jenkins/build/{job_name}/{build_number}")
async def get_build_info(job_name: str, build_number: int):
    """获取构建详情"""
    # 调用Jenkins API: GET {jenkins_url}/job/{job_name}/{build_number}/api/json
```

#### `GET /jenkins/build/{jobName}/{buildNumber}/console`
```python
@app.get("/jenkins/build/{job_name}/{build_number}/console")
async def get_build_console(job_name: str, build_number: int):
    """获取构建控制台输出"""
    # 调用Jenkins API: GET {jenkins_url}/job/{job_name}/{build_number}/consoleText
```

#### `GET /jenkins/build/{jobName}/{buildNumber}/status`
```python
@app.get("/jenkins/build/{job_name}/{build_number}/status")
async def get_build_status(job_name: str, build_number: int):
    """获取构建状态"""
    # 调用Jenkins API获取构建状态
```

#### `POST /jenkins/build/{jobName}/{buildNumber}/stop`
```python
@app.post("/jenkins/build/{job_name}/{build_number}/stop")
async def stop_build(job_name: str, build_number: int):
    """停止构建"""
    # 调用Jenkins API: POST {jenkins_url}/job/{job_name}/{build_number}/stop
```

#### `GET /jenkins/queue`
```python
@app.get("/jenkins/queue")
async def get_build_queue():
    """获取构建队列"""
    # 调用Jenkins API: GET {jenkins_url}/queue/api/json
    return {
        "status": "success",
        "data": {
            "items": [
                {
                    "id": 123,
                    "task": {"name": "my-job", "url": "...", "color": "blue"},
                    "stuck": False,
                    "blocked": False,
                    "buildable": True,
                    "pending": True,
                    "inQueueSince": 1640995200000,
                    "why": "Waiting for next available executor"
                }
            ]
        }
    }
```

---

### 4. **Pipeline接口 (2个)**

#### `GET /jenkins/job/{jobName}/{buildNumber}/wfapi/describe`
```python
@app.get("/jenkins/job/{job_name}/{build_number}/pipeline")
async def get_pipeline_run(job_name: str, build_number: int):
    """获取Pipeline运行信息"""
    # 调用Jenkins Pipeline API
    return {
        "status": "success",
        "data": {
            "id": "123",
            "name": job_name,
            "status": "IN_PROGRESS",
            "startTimeMillis": 1640995200000,
            "durationMillis": 120000,
            "stages": [
                {
                    "id": "checkout",
                    "name": "Checkout",
                    "status": "SUCCESS",
                    "startTimeMillis": 1640995200000,
                    "durationMillis": 15000
                }
            ]
        }
    }
```

#### `GET /jenkins/job/{jobName}/{buildNumber}/wfapi/log`
```python
@app.get("/jenkins/job/{job_name}/{build_number}/pipeline/log")
async def get_pipeline_log(job_name: str, build_number: int):
    """获取Pipeline日志"""
    # 调用Jenkins Pipeline API获取日志
```

---

### 5. **节点管理接口 (3个)**

#### `GET /jenkins/computer`
```python
@app.get("/jenkins/computer")
async def get_nodes():
    """获取所有节点信息"""
    # 调用Jenkins API: GET {jenkins_url}/computer/api/json
    return {
        "status": "success",
        "data": {
            "computer": [
                {
                    "displayName": "master",
                    "description": "Jenkins主节点",
                    "numExecutors": 2,
                    "mode": "NORMAL",
                    "offline": False,
                    "temporarilyOffline": False,
                    "monitorData": {
                        "hudson.node_monitors.SwapSpaceMonitor": {
                            "availableSwapSpace": 1073741824,
                            "totalSwapSpace": 2147483648
                        }
                    }
                }
            ]
        }
    }
```

#### `GET /jenkins/computer/{nodeName}`
```python
@app.get("/jenkins/computer/{node_name}")
async def get_node_info(node_name: str):
    """获取特定节点信息"""
    # 调用Jenkins API: GET {jenkins_url}/computer/{node_name}/api/json
```

#### `POST /jenkins/computer/{nodeName}/toggleOffline`
```python
@app.post("/jenkins/computer/{node_name}/toggle-offline")
async def toggle_node_offline(node_name: str, offline_message: str = None):
    """切换节点在线/离线状态"""
    # 调用Jenkins API: POST {jenkins_url}/computer/{node_name}/toggleOffline
```

---

### 6. **用户管理接口 (2个)**

#### `GET /jenkins/me`
```python
@app.get("/jenkins/me")
async def get_current_user():
    """获取当前用户信息"""
    # 调用Jenkins API: GET {jenkins_url}/me/api/json
```

#### `GET /jenkins/people`
```python
@app.get("/jenkins/people")
async def get_users():
    """获取所有用户列表"""
    # 调用Jenkins API: GET {jenkins_url}/people/api/json
```

---

## 🔧 FastAPI实现建议

### 1. **项目结构**
```
fastapi_jenkins/
├── main.py                 # FastAPI应用入口
├── routers/
│   ├── __init__.py
│   ├── jenkins_basic.py    # 基础信息接口
│   ├── jenkins_jobs.py     # 任务管理接口
│   ├── jenkins_builds.py   # 构建控制接口
│   ├── jenkins_pipeline.py # Pipeline接口
│   ├── jenkins_nodes.py    # 节点管理接口
│   └── jenkins_users.py    # 用户管理接口
├── services/
│   └── jenkins_client.py   # Jenkins客户端封装
├── models/
│   └── jenkins_models.py   # 数据模型定义
└── config.py              # 配置文件
```

### 2. **Jenkins客户端封装**
```python
# services/jenkins_client.py
import requests
from typing import Optional, Dict, Any

class JenkinsClient:
    def __init__(self, base_url: str, username: str, token: str):
        self.base_url = base_url.rstrip('/')
        self.auth = (username, token)
        self.session = requests.Session()
        self.session.auth = self.auth
    
    def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[Any, Any]:
        """GET请求封装"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    def post(self, endpoint: str, data: Optional[Dict] = None, 
             headers: Optional[Dict] = None) -> Dict[Any, Any]:
        """POST请求封装"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.post(url, json=data, headers=headers)
        response.raise_for_status()
        return response.json() if response.content else {"message": "Success"}
```

### 3. **统一响应格式**
```python
# models/jenkins_models.py
from pydantic import BaseModel
from typing import Optional, Any, Generic, TypeVar

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    status: str  # "success" | "error"
    data: Optional[T] = None
    message: Optional[str] = None
    code: Optional[int] = None
```

### 4. **配置管理**
```python
# config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    jenkins_url: str
    jenkins_username: str
    jenkins_token: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### 5. **错误处理中间件**
```python
# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

app = FastAPI(title="Jenkins Pro API", version="1.0.0")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logging.error(f"Global exception: {exc}")
    return {
        "status": "error",
        "message": str(exc),
        "code": 500
    }
```

---

## 📋 开发检查清单

### ✅ **必须实现的接口 (32个)**
- [ ] 3个基础信息接口
- [ ] 8个任务管理接口  
- [ ] 7个构建控制接口
- [ ] 2个Pipeline接口
- [ ] 3个节点管理接口
- [ ] 2个用户管理接口

### ✅ **技术要求**
- [ ] 统一的API响应格式
- [ ] 完整的错误处理
- [ ] Jenkins认证支持
- [ ] CORS跨域支持
- [ ] 请求日志记录
- [ ] API文档生成

### ✅ **测试要求**
- [ ] 单元测试覆盖
- [ ] 集成测试
- [ ] API文档测试
- [ ] 错误场景测试

这份规范为你提供了完整的FastAPI后端开发指南，确保与Jenkins Pro前端的完美对接！🚀
