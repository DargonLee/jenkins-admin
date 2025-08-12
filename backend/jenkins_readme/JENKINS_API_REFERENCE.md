# Jenkins API 接口参考文档

## 📋 概述

本文档详细说明了Jenkins Pro平台与Jenkins服务器通信所需的所有API接口。这些接口覆盖了Jenkins的核心功能，包括任务管理、构建控制、Pipeline可视化、节点管理等。

---

## 🔧 API分类

### 1. **基础信息API**

#### `GET /jenkins/info`
获取Jenkins服务器基本信息
```typescript
interface JenkinsServerInfo {
  version: string;
  mode: string;
  nodeDescription: string;
  nodeName: string;
  numExecutors: number;
  useCrumbs: boolean;
  useSecurity: boolean;
  views: Array<{ name: string; url: string }>;
}
```

#### `GET /jenkins/systemInfo`
获取系统详细信息
```typescript
interface SystemInfo {
  systemProperties: Record<string, string>;
  environmentVariables: Record<string, string>;
}
```

#### `GET /jenkins/pluginManager/plugins`
获取插件信息
```typescript
interface PluginInfo {
  shortName: string;
  longName: string;
  version: string;
  enabled: boolean;
  active: boolean;
  hasUpdate: boolean;
}
```

---

### 2. **任务管理API**

#### `GET /jenkins/jobs`
获取所有任务列表
- **参数**: `depth` - 数据深度 (默认: 1)
- **返回**: `JenkinsJob[]`

#### `GET /jenkins/job/{jobName}`
获取特定任务信息
- **参数**: `jobName` - 任务名称
- **返回**: `JenkinsJob`

#### `GET /jenkins/job/{jobName}/api/json?tree=property[parameterDefinitions[...]]`
获取任务参数定义
```typescript
interface JobParameterDefinition {
  name: string;
  type: string;
  description?: string;
  defaultParameterValue?: { value: string | boolean };
  choices?: string[];
}
```

#### `GET /jenkins/job/{jobName}/api/json?tree=builds[...]`
获取任务构建历史
- **参数**: `limit` - 限制返回数量
- **返回**: 构建历史列表

#### `POST /jenkins/createItem`
创建新任务
- **参数**: `name` - 任务名称
- **Body**: XML配置文件
- **Content-Type**: `application/xml`

#### `POST /jenkins/job/{jobName}/doDelete`
删除任务

#### `POST /jenkins/job/{jobName}/enable`
启用任务

#### `POST /jenkins/job/{jobName}/disable`
禁用任务

---

### 3. **构建控制API**

#### `POST /jenkins/build/{jobName}`
触发构建
```typescript
interface BuildParams {
  [key: string]: string;
}
```

#### `GET /jenkins/build/{jobName}/{buildNumber}`
获取构建详情
```typescript
interface JenkinsBuild {
  number: number;
  url: string;
  result: string;
  timestamp: number;
  duration: number;
  building: boolean;
  description?: string;
  changeSet?: any;
  culprits?: any[];
}
```

#### `GET /jenkins/build/{jobName}/{buildNumber}/console`
获取构建控制台输出

#### `GET /jenkins/build/{jobName}/{buildNumber}/status`
获取构建状态

#### `POST /jenkins/build/{jobName}/{buildNumber}/stop`
停止构建

#### `GET /jenkins/queue`
获取构建队列
```typescript
interface QueueItem {
  id: number;
  task: { name: string; url: string; color: string };
  stuck: boolean;
  blocked: boolean;
  buildable: boolean;
  pending: boolean;
  inQueueSince: number;
  params?: string;
  why?: string;
}
```

---

### 4. **Pipeline API**

#### `GET /jenkins/job/{jobName}/{buildNumber}/wfapi/describe`
获取Pipeline运行信息
```typescript
interface PipelineRunInfo {
  id: string;
  name: string;
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS" | "NOT_EXECUTED" | "ABORTED";
  startTimeMillis: number;
  endTimeMillis?: number;
  durationMillis: number;
  estimatedDurationMillis?: number;
  stages: PipelineStageInfo[];
}
```

#### `GET /jenkins/job/{jobName}/{buildNumber}/wfapi/log`
获取Pipeline日志

#### `GET /jenkins/job/{jobName}/{buildNumber}/execution/node/{nodeId}/wfapi/log`
获取特定阶段日志

---

### 5. **节点管理API**

#### `GET /jenkins/computer`
获取所有节点信息
```typescript
interface JenkinsNode {
  displayName: string;
  description: string;
  numExecutors: number;
  mode: string;
  offline: boolean;
  temporarilyOffline: boolean;
  offlineCause?: { description: string };
  monitorData: {
    "hudson.node_monitors.SwapSpaceMonitor"?: {
      availableSwapSpace: number;
      totalSwapSpace: number;
    };
    "hudson.node_monitors.DiskSpaceMonitor"?: {
      size: number;
    };
    "hudson.node_monitors.ResponseTimeMonitor"?: {
      average: number;
    };
  };
}
```

#### `GET /jenkins/computer/{nodeName}`
获取特定节点信息

#### `POST /jenkins/computer/{nodeName}/toggleOffline`
切换节点在线/离线状态
- **Body**: `{ offlineMessage?: string }`

#### `POST /jenkins/computer/{nodeName}/doDelete`
删除节点

---

### 6. **用户管理API**

#### `GET /jenkins/me`
获取当前用户信息
```typescript
interface CurrentUser {
  id: string;
  fullName: string;
  description: string;
}
```

#### `GET /jenkins/people`
获取所有用户列表
```typescript
interface UsersResponse {
  users: Array<{
    user: {
      id: string;
      fullName: string;
    };
  }>;
}
```

#### `GET /jenkins/user/{username}`
获取特定用户信息

---

## 🚀 使用示例

### 触发参数化构建
```typescript
const buildParams = {
  BRANCH_NAME: "develop",
  BUILD_TYPE: "release",
  VERSION_NUMBER: "1.2.0",
  SKIP_TESTS: "false"
};

const response = await jenkinsService.triggerBuild("my-app", buildParams);
```

### 获取Pipeline状态
```typescript
const pipelineInfo = await jenkinsService.getPipelineRun("my-app", 123);
console.log("Pipeline状态:", pipelineInfo.data.status);
console.log("执行阶段:", pipelineInfo.data.stages);
```

### 管理构建队列
```typescript
const queue = await jenkinsService.getBuildQueue();
const queuedBuilds = queue.data.items.filter(item => item.pending);
```

### 节点监控
```typescript
const nodes = await jenkinsService.getNodes();
const offlineNodes = nodes.data.computer.filter(node => node.offline);
```

---

## 🔒 认证和权限

### API认证
- 支持Jenkins API Token认证
- 支持用户名/密码认证
- 支持CSRF保护

### 权限要求
- **读取权限**: 查看任务、构建信息
- **构建权限**: 触发构建、停止构建
- **配置权限**: 创建/删除任务、修改配置
- **管理权限**: 节点管理、用户管理

---

## 📈 性能优化

### 数据获取策略
- 使用`depth`参数控制数据深度
- 分页获取大量数据
- 缓存频繁访问的数据

### 实时更新
- 轮询获取构建状态
- WebSocket连接（如果支持）
- 增量数据更新

---

## 🛠️ 错误处理

### 常见错误码
- `401`: 认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 错误处理策略
```typescript
try {
  const response = await jenkinsService.getJobs();
  if (response.status === "error") {
    console.error("API错误:", response.message);
  }
} catch (error) {
  console.error("网络错误:", error);
}
```

---

## 🔮 扩展接口

### 未来可能需要的接口
- **视图管理**: 创建、删除、修改视图
- **构建触发器**: 配置自动触发规则
- **通知配置**: 邮件、Slack等通知设置
- **安全配置**: 用户权限、角色管理
- **备份恢复**: 配置备份和恢复
- **监控指标**: 详细的性能监控数据

这些接口为Jenkins Pro提供了完整的Jenkins管理能力，支持企业级的CI/CD工作流程！🚀
