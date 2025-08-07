import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { AlertCircle, CheckCircle, Circle, Clock, Flag } from "lucide-react";

interface TodoItem {
	id: string;
	title: string;
	description?: string;
	priority: "low" | "medium" | "high";
	status: "pending" | "in-progress" | "completed";
	createdAt: string;
}

export default function Analysis() {
	const todos: TodoItem[] = [
		{
			id: "1",
			title: "Jenkins-REST-API 打包 Demo 验证",
			description: "通过Jenkins REST API实现远程构建触发和状态监控，验证API调用的稳定性和响应时间",
			priority: "medium",
			status: "completed",
			createdAt: "2025-08-10",
		},
		{
			id: "2",
			title: "远端自动打包 GitHub 仓库为 xcframework",
			description: "集成GitHub Webhooks，实现代码推送后自动触发Jenkins构建iOS xcframework，支持多架构打包",
			priority: "high",
			status: "completed",
			createdAt: "2025-08-15",
		},
		{
			id: "3",
			title: "优化Jenkins构建流水线",
			description: "通过并行构建、缓存优化和资源配置调整，将iOS项目构建时间从25分钟缩短至12分钟",
			priority: "high",
			status: "in-progress",
			createdAt: "2025-08-20",
		},
		{
			id: "4",
			title: "添加构建通知功能与企业微信进行集成",
			description: "集成企业微信机器人API，实现构建状态实时推送，支持@指定人员和构建结果详情展示",
			priority: "medium",
			status: "pending",
			createdAt: "2025-08-20",
		},
		{
			id: "5",
			title: "完善错误日志分析",
			description: "基于正则表达式和关键词匹配，自动识别iOS构建常见错误类型，提供智能修复建议和文档链接",
			priority: "medium",
			status: "pending",
			createdAt: "2025-08-20",
		},
		{
			id: "6",
			title: "集成代码质量检查SwiftLint",
			description: "在构建流程中集成SwiftLint静态代码分析，建立代码规范门禁，不符合规范的代码将阻止构建",
			priority: "low",
			status: "pending",
			createdAt: "2025-08-20",
		},
		{
			id: "7",
			title: "支持直接提交 IPA 到 TestFlight 和 Appstore",
			description: "集成App Store Connect API，实现构建成功后自动上传IPA到TestFlight，支持元数据同步和版本管理",
			priority: "high",
			status: "pending",
			createdAt: "2025-08-30",
		},
		{
			id: "8",
			title: "可以添加数据库管理版本紧急回退",
			description: "集成App Store Connect API，实现构建成功后自动上传IPA到TestFlight，支持元数据同步和版本管理",
			priority: "high",
			status: "pending",
			createdAt: "2025-08-30",
		},
		{
			id: "9",
			title: "可以定制化打包，添加配置项",
			description: "集成App Store Connect API，实现构建成功后自动上传IPA到TestFlight，支持元数据同步和版本管理",
			priority: "high",
			status: "pending",
			createdAt: "2025-09-10",
		},
		{
			id: "10",
			title: "记录打包记录，保证每次构建的一致性",
			description: "集成App Store Connect API，实现构建成功后自动上传IPA到TestFlight，支持元数据同步和版本管理",
			priority: "high",
			status: "pending",
			createdAt: "2025-09-10",
		},
	];

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "destructive";
			case "medium":
				return "secondary";
			case "low":
				return "outline";
			default:
				return "secondary";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			case "in-progress":
				return <Clock className="w-4 h-4 text-blue-500" />;
			case "pending":
				return <Circle className="w-4 h-4 text-gray-400" />;
			default:
				return <Circle className="w-4 h-4 text-gray-400" />;
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "completed":
				return "default";
			case "in-progress":
				return "secondary";
			case "pending":
				return "outline";
			default:
				return "outline";
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AlertCircle className="w-5 h-5" />
					功能待办事项
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{todos.map((todo) => (
						<div key={todo.id} className="flex items-start gap-3 p-3 border rounded-lg">
							<div className="mt-0.5">{getStatusIcon(todo.status)}</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<h4
										className={`font-medium ${todo.status === "completed" ? "line-through text-muted-foreground" : ""}`}
									>
										{todo.title}
									</h4>
									<Badge variant={getPriorityColor(todo.priority)} className="text-xs">
										<Flag className="w-3 h-3 mr-1" />
										{todo.priority === "high" ? "高" : todo.priority === "medium" ? "中" : "低"}
									</Badge>
									<Badge variant={getStatusBadgeVariant(todo.status)} className="text-xs">
										{todo.status === "completed" ? "已完成" : todo.status === "in-progress" ? "进行中" : "待处理"}
									</Badge>
								</div>

								{todo.description && (
									<p className={`text-sm text-muted-foreground ${todo.status === "completed" ? "line-through" : ""}`}>
										{todo.description}
									</p>
								)}

								<p className="text-xs text-muted-foreground mt-1">创建于 {todo.createdAt}</p>
							</div>
						</div>
					))}
				</div>

				<div className="mt-4 pt-4 border-t">
					<div className="flex justify-between text-sm text-muted-foreground">
						<span>总计: {todos.length} 项</span>
						<span>已完成: {todos.filter((t) => t.status === "completed").length} 项</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
