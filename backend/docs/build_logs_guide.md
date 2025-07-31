# Jenkins 构建日志获取指南

本文档介绍如何通过 FastAPI 接口和直接调用 JenkinsService 来获取 Jenkins 构建任务的控制台输出。

## 功能概述

我们提供了两种方式来获取构建日志：

1. **API 接口方式** - 通过 HTTP 请求获取构建日志
2. **直接调用方式** - 直接使用 JenkinsService 类获取构建日志

## API 接口

### 1. 触发构建并获取构建信息

```http
POST /jenkins/build/{job_name}/with-logs
```

**参数：**
- `job_name`: Jenkins 任务名称
- `parameters`: 构建参数（可选）
- `wait_for_start`: 是否等待构建开始（默认 true）
- `timeout`: 等待超时时间（默认 60 秒）

**示例：**
```bash
curl -X POST "http://localhost:8000/jenkins/build/Test_iOS_Package/with-logs?wait_for_start=true&timeout=60"
```

**响应：**
```json
{
  "status": "success",
  "message": "任务 'Test_iOS_Package' 构建已触发",
  "data": {
    "job_name": "Test_iOS_Package",
    "queue_id": 4,
    "build_number": 5,
    "status": "started",
    "building": true,
    "estimated_duration": 30000
  },
  "timestamp": 1640995200.0
}
```

### 2. 获取构建状态

```http
GET /jenkins/build/{job_name}/{build_number}/status
```

**示例：**
```bash
curl "http://localhost:8000/jenkins/build/Test_iOS_Package/5/status"
```

**响应：**
```json
{
  "status": "success",
  "data": {
    "job_name": "Test_iOS_Package",
    "build_number": 5,
    "building": false,
    "result": "SUCCESS",
    "duration": 45000,
    "timestamp": 1640995200,
    "url": "http://localhost:8080/job/Test_iOS_Package/5/",
    "estimated_duration": 30000
  },
  "timestamp": 1640995200.0
}
```

### 3. 获取构建控制台输出

```http
GET /jenkins/build/{job_name}/{build_number}/console
```

**参数：**
- `start`: 从指定位置开始获取日志（默认 0）

**示例：**
```bash
# 获取完整日志
curl "http://localhost:8000/jenkins/build/Test_iOS_Package/5/console"

# 获取从第 1000 个字符开始的日志（增量获取）
curl "http://localhost:8000/jenkins/build/Test_iOS_Package/5/console?start=1000"
```

**响应：**
```json
{
  "status": "success",
  "data": {
    "job_name": "Test_iOS_Package",
    "build_number": 5,
    "console_output": "Started by user admin\nBuilding in workspace /var/jenkins_home/workspace/Test_iOS_Package\n...",
    "output_length": 2048,
    "start_position": 0
  },
  "timestamp": 1640995200.0
}
```

## 直接调用方式

### 1. 基本用法

```python
from app.services.jenkins_service import JenkinsService

# 初始化服务
jenkins = JenkinsService()

# 获取构建日志
console_output = jenkins.get_build_console_output("Test_iOS_Package", 5)
print(console_output)
```

### 2. 增量获取日志

```python
# 从指定位置开始获取日志
console_output = jenkins.get_build_console_output("Test_iOS_Package", 5, start=1000)
```

### 3. 监控构建过程

```python
import time

# 触发构建
queue_id = jenkins.build_job("Test_iOS_Package")

# 等待构建开始
build_number = jenkins.wait_for_build_start("Test_iOS_Package", queue_id)

# 监控构建过程
offset = 0
while jenkins.is_build_running("Test_iOS_Package", build_number):
    # 获取增量日志
    logs = jenkins.get_build_console_output("Test_iOS_Package", build_number, start=offset)
    if logs:
        print(logs)
        offset += len(logs)
    
    time.sleep(3)

# 获取最终完整日志
final_logs = jenkins.get_build_console_output("Test_iOS_Package", build_number)
```

## 测试脚本

### 1. API 测试脚本

运行 `test_build_logs_api.py` 来测试 API 接口：

```bash
python test_build_logs_api.py
```

这个脚本会：
- 触发一个新的构建
- 监控构建过程
- 实时获取构建日志
- 显示最终构建结果

### 2. 直接调用测试脚本

运行 `test_jenkins_logs_direct.py` 来测试直接调用：

```bash
python test_jenkins_logs_direct.py
```

这个脚本会：
- 触发构建并获取日志
- 获取现有构建的日志
- 显示日志统计信息

## 使用场景

### 1. 实时监控构建

```python
def monitor_build_realtime(job_name, build_number):
    """实时监控构建过程"""
    jenkins = JenkinsService()
    offset = 0
    
    while jenkins.is_build_running(job_name, build_number):
        logs = jenkins.get_build_console_output(job_name, build_number, start=offset)
        if logs:
            print(logs, end='', flush=True)
            offset += len(logs)
        time.sleep(2)
```

### 2. 构建完成回调

```python
def build_with_callback(job_name, callback_url):
    """触发构建并在完成后发送回调"""
    jenkins = JenkinsService()
    
    # 触发构建
    queue_id = jenkins.build_job(job_name)
    build_number = jenkins.wait_for_build_start(job_name, queue_id)
    
    # 等待构建完成
    while jenkins.is_build_running(job_name, build_number):
        time.sleep(5)
    
    # 获取构建结果和日志
    build_info = jenkins.get_build_info(job_name, build_number)
    logs = jenkins.get_build_console_output(job_name, build_number)
    
    # 发送回调
    callback_data = {
        "job_name": job_name,
        "build_number": build_number,
        "result": build_info.get("result"),
        "duration": build_info.get("duration"),
        "logs": logs
    }
    
    # 发送 HTTP 回调请求
    requests.post(callback_url, json=callback_data)
```

### 3. 日志分析

```python
def analyze_build_logs(job_name, build_number):
    """分析构建日志"""
    jenkins = JenkinsService()
    logs = jenkins.get_build_console_output(job_name, build_number)
    
    # 分析日志内容
    lines = logs.splitlines()
    error_lines = [line for line in lines if "ERROR" in line.upper()]
    warning_lines = [line for line in lines if "WARNING" in line.upper()]
    
    return {
        "total_lines": len(lines),
        "error_count": len(error_lines),
        "warning_count": len(warning_lines),
        "errors": error_lines,
        "warnings": warning_lines
    }
```

## 注意事项

1. **权限要求**：确保 Jenkins 用户有读取构建日志的权限
2. **网络延迟**：大量日志获取可能需要较长时间
3. **内存使用**：完整日志可能很大，注意内存使用
4. **增量获取**：对于长时间构建，建议使用增量获取方式
5. **错误处理**：始终处理可能的异常情况

## 故障排除

### 常见问题

1. **401 Unauthorized**
   - 检查 Jenkins 用户名和密码配置
   - 确认用户有读取权限

2. **404 Not Found**
   - 确认任务名称正确
   - 确认构建号存在

3. **500 Server Error**
   - 检查 Jenkins 服务状态
   - 查看 Jenkins 服务器日志

### 调试技巧

1. 使用 `debug_jenkins.py` 测试基本连接
2. 检查 `.env` 配置文件
3. 查看 FastAPI 应用日志
4. 使用 Jenkins Web 界面验证任务状态 