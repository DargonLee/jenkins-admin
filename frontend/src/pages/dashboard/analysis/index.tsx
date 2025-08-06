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
			id: "0",
			title: "Jenkins-REST-API 打包验证",
			description: "改进构建速度和稳定性，减少构建时间",
			priority: "high",
			status: "completed",
			createdAt: "2024-01-15",
		},
		{
			id: "1",
			title: "优化Jenkins构建流水线",
			description: "改进构建速度和稳定性，减少构建时间",
			priority: "high",
			status: "in-progress",
			createdAt: "2024-01-15",
		},
		{
			id: "2",
			title: "添加构建通知功能与企业微信进行集成",
			description: "集成邮件和Slack通知，及时通知构建结果",
			priority: "medium",
			status: "pending",
			createdAt: "2024-01-16",
		},
		{
			id: "3",
			title: "完善错误日志分析",
			description: "自动分析构建失败原因并提供解决建议",
			priority: "medium",
			status: "pending",
			createdAt: "2024-01-17",
		},
		{
			id: "4",
			title: "集成代码质量检查SwiftLint",
			description: "添加SonarQube集成，自动进行代码质量分析",
			priority: "low",
			status: "completed",
			createdAt: "2024-01-14",
		},
		{
			id: "5",
			title: "支持直接提交 IPA 到 TestFlight 和 Appstore",
			description: "支持feature分支自动构建和部署到测试环境",
			priority: "high",
			status: "pending",
			createdAt: "2024-01-18",
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
