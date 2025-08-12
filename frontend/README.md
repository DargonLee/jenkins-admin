# Jenkins Admin Frontend

一个现代化的 Jenkins 管理前端界面，基于 React 19、TypeScript 和 Vite 构建，提供直观的 Jenkins 任务管理和实时构建监控功能。

## ✨ 主要特性

### 🚀 核心功能
- **服务器信息管理** - 获取和显示 Jenkins 服务器详细信息
- **任务列表管理** - 浏览和选择 Jenkins 任务
- **构建触发** - 支持参数化构建触发
- **实时构建监控** - 自动获取构建号并实时显示构建状态和日志
- **构建状态查看** - 详细的构建状态和结果展示
- **控制台日志** - 完整的构建日志查看和实时更新

## 📦 安装和运行

### 环境要求
- Node.js 20.x
- pnpm (推荐) 或 npm

### 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install
```

### 开发环境
```bash
# 启动开发服务器 (端口 3001)
pnpm dev
```

### 生产构建
```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 🏗️ 项目结构

```
src/
├── pages/dashboard/jenkins/          # Jenkins 管理页面
│   ├── index.tsx                     # 主页面组件
│   ├── hooks/
│   │   └── use-jenkins.ts           # Jenkins 业务逻辑 Hook
│   └── components/                   # 页面组件
│       ├── jenkins-header.tsx        # 页面头部
│       ├── raw-data-display.tsx      # 原始数据显示
│       ├── job-list.tsx             # 任务列表
│       ├── operation-panel.tsx       # 操作面板
│       ├── build-status-display.tsx  # 构建状态显示
│       ├── build-info-display.tsx    # 构建详情显示
│       └── console-output-display.tsx # 控制台输出显示
├── api/
│   ├── apiClient.ts                 # API 客户端配置
│   └── services/
│       └── jenkinsService.ts        # Jenkins API 服务
├── ui/                              # shadcn/ui 组件
└── ...                              # 其他项目文件
```

## 🔌 API 配置

### 后端服务
项目需要连接到 Jenkins API 后端服务。默认配置：

- **开发环境**: `http://localhost:8000`
- **API 前缀**: `/api`

### 代理配置
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


## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [Vite](https://vitejs.dev/) - 构建工具
- [Slash-Admin](https://github.com/d3george/slash-admin)
  https://docs-admin.slashspaces.com/docs/development/permission
---

**Jenkins Admin Frontend** - 让 Jenkins 管理变得简单而优雅 🚀
