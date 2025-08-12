# Jenkins Pro 功能测试指南

## 🧪 测试新增功能

### 1. Pipeline可视化测试

#### 测试步骤：
1. 访问Jenkins Pro页面
2. 点击"Pipeline"标签页
3. 在输入框中输入任务名称，如：`frontend-build`
4. 输入构建号，如：`145`
5. 点击"查看Pipeline"按钮

#### 预期结果：
- 显示Pipeline流程图，包含5个阶段：Checkout → Build → Test → Package → Deploy
- 前两个阶段显示为成功状态（绿色）
- 第三个阶段显示为运行中状态（蓝色，带动画）
- 后两个阶段显示为等待状态（灰色）
- 可以点击每个阶段查看详细信息

### 2. 告警中心测试

#### 测试步骤：
1. 访问Jenkins Pro页面
2. 点击"告警中心"标签页（注意红色数字徽章显示未读告警数）
3. 查看告警列表
4. 点击"确认"按钮确认告警
5. 进入告警配置部分

#### 预期结果：
- 显示2条模拟告警记录
- 一条构建失败告警（未确认）
- 一条构建超时告警（已确认）
- 告警中心标签页显示未读数量徽章
- 可以确认告警，确认后徽章数量减少

### 3. 企业微信告警配置测试

#### 测试步骤：
1. 在告警中心页面，滚动到"告警配置"部分
2. 查看各种告警开关
3. 在企业微信Webhook URL输入框中输入测试地址
4. 调整告警阈值
5. 保存配置

#### 预期结果：
- 所有告警类型开关可以正常切换
- Webhook URL输入框可以正常输入
- 阈值可以调整
- 配置保存后显示成功提示

### 4. iOS发布功能测试

#### 测试步骤：
1. 访问"任务管理"标签页
2. 查看任务卡片，特别是包含iOS关键词的任务
3. 查看构建成功的iOS任务是否显示发布按钮
4. 点击TestFlight和App Store按钮

#### 预期结果：
- iOS项目任务卡片显示额外的发布按钮行
- TestFlight按钮为蓝色主题
- App Store按钮为紫色主题
- 点击按钮在控制台输出相应日志

### 5. 整体UI测试

#### 测试步骤：
1. 检查所有标签页是否正常显示
2. 检查响应式布局在不同屏幕尺寸下的表现
3. 检查所有按钮和交互元素
4. 检查加载状态和错误处理

#### 预期结果：
- 6个标签页都能正常切换
- 移动端和桌面端都有良好的显示效果
- 所有交互元素响应正常
- 加载状态有适当的指示器

## 🔧 开发者测试

### 模拟企业微信告警
```javascript
// 在浏览器控制台中执行
const testAlert = {
  type: "build_failure",
  severity: "high",
  title: "测试告警",
  message: "这是一个测试告警消息",
  jobName: "test-job",
  buildNumber: 123,
  channels: ["wechat"]
};

// 如果有createAlert函数的话
// createAlert(testAlert);
```

### 模拟Pipeline数据
```javascript
// 检查Pipeline数据结构
console.log("Pipeline Flow:", pipelineFlow);
console.log("Pipeline Stages:", pipelineFlow?.stages);
```

### 检查告警配置
```javascript
// 检查告警配置
console.log("Alert Config:", alertConfig);
console.log("Alert Records:", alertRecords);
console.log("Unread Alerts:", unreadAlerts);
```

## 🐛 常见问题排查

### 1. Pipeline不显示
- 检查输入的任务名称是否正确
- 检查网络请求是否正常
- 查看浏览器控制台是否有错误

### 2. 告警徽章不更新
- 检查unreadAlerts状态是否正确
- 确认告警确认功能是否正常工作

### 3. 企业微信通知不发送
- 检查Webhook URL是否正确
- 确认网络可以访问企业微信API
- 查看浏览器网络面板的请求状态

### 4. iOS发布按钮不显示
- 检查任务名称是否包含iOS关键词
- 确认任务状态是否为成功
- 检查isIOSProject函数逻辑

## 📊 性能测试

### 1. 大量告警记录
- 添加100+条告警记录测试滚动性能
- 测试告警确认的响应速度

### 2. 复杂Pipeline
- 测试包含10+阶段的Pipeline显示
- 测试长时间运行的Pipeline更新

### 3. 实时更新
- 测试多个标签页同时打开的性能
- 测试长时间运行时的内存使用

## ✅ 验收标准

### 功能完整性
- [ ] Pipeline可视化正常显示
- [ ] 告警中心功能完整
- [ ] 企业微信配置可用
- [ ] iOS发布按钮正确显示
- [ ] 所有交互功能正常

### 用户体验
- [ ] 界面美观，符合设计规范
- [ ] 响应式布局适配良好
- [ ] 加载状态清晰
- [ ] 错误提示友好

### 技术质量
- [ ] TypeScript编译无错误
- [ ] 代码结构清晰
- [ ] 组件复用性好
- [ ] 性能表现良好

## 🚀 部署验证

### 1. 构建测试
```bash
cd frontend
npm run build
```

### 2. 开发服务器测试
```bash
cd frontend
npm run dev
```

### 3. 生产环境测试
- 部署到测试环境
- 验证所有功能正常
- 检查企业微信通知是否能正常发送
