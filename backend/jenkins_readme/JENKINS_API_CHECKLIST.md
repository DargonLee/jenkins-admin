# Jenkins API 开发检查清单

## 📋 接口总览

基于`jenkinsService.ts`，需要实现**32个API接口**，分为6大类：

---

## 🔧 接口清单

### 1. **基础信息 (3个)**
```
✅ GET  /jenkins/info                    - 服务器信息
✅ GET  /jenkins/systemInfo              - 系统信息  
✅ GET  /jenkins/pluginManager/plugins   - 插件信息
```

### 2. **任务管理 (8个)**
```
✅ GET  /jenkins/jobs                    - 任务列表
✅ GET  /jenkins/job/{jobName}           - 任务详情
✅ GET  /jenkins/job/{jobName}/parameters - 任务参数定义
✅ GET  /jenkins/job/{jobName}/builds    - 任务构建历史
✅ POST /jenkins/createItem              - 创建任务
✅ POST /jenkins/job/{jobName}/doDelete  - 删除任务
✅ POST /jenkins/job/{jobName}/enable    - 启用任务
✅ POST /jenkins/job/{jobName}/disable   - 禁用任务
```

### 3. **构建控制 (7个)**
```
✅ POST /jenkins/build/{jobName}                    - 触发构建
✅ GET  /jenkins/build/{jobName}/{buildNumber}      - 构建详情
✅ GET  /jenkins/build/{jobName}/{buildNumber}/console - 构建日志
✅ GET  /jenkins/build/{jobName}/{buildNumber}/status  - 构建状态
✅ POST /jenkins/build/{jobName}/{buildNumber}/stop    - 停止构建
✅ GET  /jenkins/queue                              - 构建队列
```

### 4. **Pipeline (2个)**
```
✅ GET /jenkins/job/{jobName}/{buildNumber}/wfapi/describe - Pipeline信息
✅ GET /jenkins/job/{jobName}/{buildNumber}/wfapi/log      - Pipeline日志
```

### 5. **节点管理 (3个)**
```
✅ GET  /jenkins/computer                        - 所有节点
✅ GET  /jenkins/computer/{nodeName}             - 节点详情
✅ POST /jenkins/computer/{nodeName}/toggleOffline - 节点状态切换
```

### 6. **用户管理 (2个)**
```
✅ GET /jenkins/me     - 当前用户
✅ GET /jenkins/people - 所有用户
```

---

## 🎯 核心Jenkins API映射

### 前端调用 → Jenkins API
```
getServerInfo()     → GET  {jenkins}/api/json
getJobs()          → GET  {jenkins}/api/json?tree=jobs[...]
getJobInfo()       → GET  {jenkins}/job/{name}/api/json
triggerBuild()     → POST {jenkins}/job/{name}/build
getBuildInfo()     → GET  {jenkins}/job/{name}/{num}/api/json
getBuildConsole()  → GET  {jenkins}/job/{name}/{num}/consoleText
getBuildQueue()    → GET  {jenkins}/queue/api/json
getPipelineRun()   → GET  {jenkins}/job/{name}/{num}/wfapi/describe
getNodes()         → GET  {jenkins}/computer/api/json
getSystemInfo()    → GET  {jenkins}/systemInfo
```

---

## 📊 数据结构参考

### 服务器信息
```json
{
  "version": "2.401.3",
  "mode": "NORMAL", 
  "numExecutors": 2,
  "useSecurity": true,
  "views": [{"name": "All", "url": "..."}]
}
```

### 任务信息
```json
{
  "name": "my-job",
  "url": "http://jenkins/job/my-job/",
  "color": "blue",
  "buildable": true,
  "lastBuild": {
    "number": 123,
    "url": "...",
    "timestamp": 1640995200000
  }
}
```

### 构建信息
```json
{
  "number": 123,
  "url": "...",
  "result": "SUCCESS",
  "timestamp": 1640995200000,
  "duration": 120000,
  "building": false,
  "description": "Build #123"
}
```

### Pipeline信息
```json
{
  "id": "123",
  "name": "my-job",
  "status": "SUCCESS",
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
```

### 参数定义
```json
{
  "parameterDefinitions": [
    {
      "name": "BRANCH_NAME",
      "type": "ChoiceParameterDefinition",
      "description": "选择分支",
      "choices": ["main", "develop"],
      "defaultParameterValue": {"value": "main"}
    }
  ]
}
```

---

## 🔧 FastAPI快速实现模板

### 基础路由结构
```python
from fastapi import APIRouter, HTTPException
from services.jenkins_client import jenkins_client

router = APIRouter(prefix="/jenkins", tags=["jenkins"])

@router.get("/info")
async def get_server_info():
    try:
        data = jenkins_client.get("/api/json")
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/jobs")  
async def get_jobs():
    try:
        data = jenkins_client.get("/api/json?tree=jobs[name,url,color,lastBuild[number,timestamp,result,duration]]")
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/build/{job_name}")
async def trigger_build(job_name: str, build_params: dict = None):
    try:
        if build_params:
            # 参数化构建
            endpoint = f"/job/{job_name}/buildWithParameters"
            data = jenkins_client.post(endpoint, data=build_params)
        else:
            # 普通构建
            endpoint = f"/job/{job_name}/build"
            data = jenkins_client.post(endpoint)
        
        return {"status": "success", "data": {"job_name": job_name, "message": "构建已触发"}}
    except Exception as e:
        return {"status": "error", "message": str(e)}
```

---

## 🚀 开发优先级建议

### 第一阶段 (核心功能)
1. ✅ 服务器信息 (`/jenkins/info`)
2. ✅ 任务列表 (`/jenkins/jobs`) 
3. ✅ 触发构建 (`/jenkins/build/{jobName}`)
4. ✅ 构建状态 (`/jenkins/build/{jobName}/{buildNumber}/status`)
5. ✅ 构建日志 (`/jenkins/build/{jobName}/{buildNumber}/console`)

### 第二阶段 (管理功能)
6. ✅ 构建队列 (`/jenkins/queue`)
7. ✅ 任务参数 (`/jenkins/job/{jobName}/parameters`)
8. ✅ 构建历史 (`/jenkins/job/{jobName}/builds`)
9. ✅ 停止构建 (`/jenkins/build/{jobName}/{buildNumber}/stop`)

### 第三阶段 (高级功能)
10. ✅ Pipeline信息 (`/jenkins/job/{jobName}/{buildNumber}/wfapi/describe`)
11. ✅ 节点管理 (`/jenkins/computer`)
12. ✅ 系统信息 (`/jenkins/systemInfo`)

### 第四阶段 (完善功能)
13. ✅ 任务管理 (创建/删除/启用/禁用)
14. ✅ 用户管理 (`/jenkins/me`, `/jenkins/people`)
15. ✅ 插件信息 (`/jenkins/pluginManager/plugins`)

---

## 🔒 认证配置

### Jenkins API Token
```python
# config.py
JENKINS_URL = "http://your-jenkins-server:8080"
JENKINS_USERNAME = "your-username"  
JENKINS_TOKEN = "your-api-token"

# 在Jenkins中生成API Token:
# 用户设置 → 配置 → API Token → 添加新Token
```

### 请求认证
```python
import requests
from requests.auth import HTTPBasicAuth

auth = HTTPBasicAuth(JENKINS_USERNAME, JENKINS_TOKEN)
response = requests.get(f"{JENKINS_URL}/api/json", auth=auth)
```

---

## ✅ 测试检查

### API测试
```bash
# 测试服务器连接
curl -u username:token http://jenkins:8080/api/json

# 测试任务列表
curl -u username:token http://jenkins:8080/api/json?tree=jobs[name,color]

# 测试触发构建
curl -X POST -u username:token http://jenkins:8080/job/my-job/build
```

### 前端集成测试
```typescript
// 测试API连接
const response = await jenkinsService.getServerInfo();
console.log("Jenkins版本:", response.data.version);

// 测试构建触发
const buildResult = await jenkinsService.triggerBuild("my-job");
console.log("构建状态:", buildResult.status);
```

---

## 📋 完成检查清单

- [ ] 32个API接口全部实现
- [ ] 统一的错误处理
- [ ] Jenkins认证配置
- [ ] CORS跨域支持  
- [ ] API文档生成
- [ ] 单元测试覆盖
- [ ] 前端集成测试
- [ ] 生产环境部署

**目标**: 实现与Jenkins Pro前端的完美对接！🎯
