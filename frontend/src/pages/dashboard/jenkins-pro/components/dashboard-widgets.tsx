import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { Separator } from "@/ui/separator";
import {
	Settings,
	Play,
	CheckCircle,
	Activity,
	TrendingUp,
	Users,
	Server,
	Zap,
	Eye,
	AlertTriangle,
	XCircle,
	ArrowUp,
	ArrowDown,
	Minus,
	Smartphone,
	Store
} from "lucide-react";

// 统计卡片组件
export function StatsCard({ 
	title, 
	value, 
	change, 
	changeType, 
	icon 
}: {
	title: string;
	value: string;
	change: string;
	changeType: "positive" | "negative" | "neutral";
	icon: React.ReactNode;
}) {
	const changeColor = changeType === "positive" ? "text-green-600" : 
					   changeType === "negative" ? "text-red-600" : "text-muted-foreground";
	
	const ChangeIcon = changeType === "positive" ? ArrowUp : 
					   changeType === "negative" ? ArrowDown : Minus;
	
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">{title}</p>
						<p className="text-3xl font-bold">{value}</p>
						{change !== "0" && (
							<div className={`flex items-center gap-1 text-xs ${changeColor}`}>
								<ChangeIcon className="w-3 h-3" />
								<span>{change}</span>
							</div>
						)}
					</div>
					<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
						{icon}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// 最近活动组件
export function RecentActivity({ activities }: {
	activities?: Array<{
		id: string;
		type: "build_success" | "build_failed" | "build_started" | "build_unstable";
		jobName: string;
		buildNumber?: number;
		timestamp: string;
		duration?: string;
	}>;
}) {
	const defaultActivities = [
		{
			id: "1",
			type: "build_success" as const,
			jobName: "frontend-build",
			buildNumber: 145,
			timestamp: "2分钟前",
			duration: "1.2分钟"
		},
		{
			id: "2",
			type: "build_started" as const,
			jobName: "backend-deploy",
			buildNumber: 89,
			timestamp: "5分钟前"
		},
		{
			id: "3",
			type: "build_failed" as const,
			jobName: "test-automation",
			buildNumber: 234,
			timestamp: "1小时前",
			duration: "2.8分钟"
		},
		{
			id: "4",
			type: "build_unstable" as const,
			jobName: "security-scan",
			buildNumber: 67,
			timestamp: "2小时前",
			duration: "8.5分钟"
		}
	];

	const activityList = activities || defaultActivities;

	const getActivityConfig = (type: string) => {
		switch (type) {
			case "build_success":
				return { 
					color: "bg-green-500", 
					icon: <CheckCircle className="w-4 h-4 text-green-500" />,
					text: "构建成功"
				};
			case "build_failed":
				return { 
					color: "bg-red-500", 
					icon: <XCircle className="w-4 h-4 text-red-500" />,
					text: "构建失败"
				};
			case "build_started":
				return { 
					color: "bg-blue-500", 
					icon: <Play className="w-4 h-4 text-blue-500" />,
					text: "开始构建"
				};
			case "build_unstable":
				return { 
					color: "bg-yellow-500", 
					icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
					text: "构建不稳定"
				};
			default:
				return { 
					color: "bg-gray-500", 
					icon: <Activity className="w-4 h-4 text-gray-500" />,
					text: "未知活动"
				};
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="w-5 h-5" />
					最近活动
				</CardTitle>
				<CardDescription>最新的构建活动和系统事件</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-80">
					<div className="space-y-4">
						{activityList.map((activity) => {
							const config = getActivityConfig(activity.type);
							return (
								<div key={activity.id} className="flex items-start gap-3">
									<div className={`w-2 h-2 ${config.color} rounded-full mt-2 flex-shrink-0`}></div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											{config.icon}
											<p className="text-sm font-medium">
												{activity.jobName}
												{activity.buildNumber && ` #${activity.buildNumber}`} {config.text}
											</p>
										</div>
										<div className="flex items-center gap-2 mt-1">
											<p className="text-xs text-muted-foreground">{activity.timestamp}</p>
											{activity.duration && (
												<>
													<span className="text-xs text-muted-foreground">•</span>
													<p className="text-xs text-muted-foreground">耗时 {activity.duration}</p>
												</>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

// 快捷操作组件
export function QuickActions({ onAction }: {
	onAction?: (action: string) => void;
}) {
	const actions = [
		{ id: "trigger-build", icon: <Play className="w-4 h-4" />, label: "触发构建", color: "default" },
		{ id: "create-job", icon: <Settings className="w-4 h-4" />, label: "创建任务", color: "outline" },
		{ id: "testflight-deploy", icon: <Smartphone className="w-4 h-4" />, label: "发布TestFlight", color: "outline", special: "ios" },
		{ id: "appstore-deploy", icon: <Store className="w-4 h-4" />, label: "发布App Store", color: "outline", special: "ios" },
		{ id: "manage-users", icon: <Users className="w-4 h-4" />, label: "用户管理", color: "outline" },
		{ id: "manage-nodes", icon: <Server className="w-4 h-4" />, label: "节点管理", color: "outline" },
		{ id: "view-logs", icon: <Eye className="w-4 h-4" />, label: "查看日志", color: "outline" },
		{ id: "build-reports", icon: <TrendingUp className="w-4 h-4" />, label: "构建报告", color: "outline" }
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Zap className="w-5 h-5" />
					快捷操作
				</CardTitle>
				<CardDescription>常用的快捷操作和工具</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{actions.map((action, index) => (
					<div key={action.id}>
						<Button
							className={`w-full justify-start ${
								action.special === "ios"
									? action.id === "testflight-deploy"
										? "text-blue-600 border-blue-200 hover:bg-blue-50"
										: "text-purple-600 border-purple-200 hover:bg-purple-50"
									: ""
							}`}
							variant={action.color as any}
							onClick={() => onAction?.(action.id)}
						>
							{action.icon}
							<span className="ml-2">{action.label}</span>
							{action.special === "ios" && (
								<span className="ml-auto text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full">
									iOS
								</span>
							)}
						</Button>
						{index === 4 && <Separator className="my-3" />}
					</div>
				))}
			</CardContent>
		</Card>
	);
}

// 构建趋势组件
export function BuildTrends({ data }: {
	data?: {
		period: string;
		totalBuilds: number;
		successRate: number;
		averageDuration: string;
		trends: Array<{
			date: string;
			builds: number;
			success: number;
			failed: number;
		}>;
	};
}) {
	const defaultData = {
		period: "过去7天",
		totalBuilds: 156,
		successRate: 94.2,
		averageDuration: "4.2分钟",
		trends: [
			{ date: "01-09", builds: 23, success: 22, failed: 1 },
			{ date: "01-10", builds: 18, success: 17, failed: 1 },
			{ date: "01-11", builds: 25, success: 24, failed: 1 },
			{ date: "01-12", builds: 20, success: 18, failed: 2 },
			{ date: "01-13", builds: 22, success: 21, failed: 1 },
			{ date: "01-14", builds: 24, success: 23, failed: 1 },
			{ date: "01-15", builds: 24, success: 22, failed: 2 }
		]
	};

	const trendData = data || defaultData;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="w-5 h-5" />
					构建趋势
				</CardTitle>
				<CardDescription>{trendData.period}的构建统计和趋势分析</CardDescription>
			</CardHeader>
			<CardContent>
				{/* 统计摘要 */}
				<div className="grid grid-cols-3 gap-4 mb-6">
					<div className="text-center">
						<p className="text-2xl font-bold">{trendData.totalBuilds}</p>
						<p className="text-sm text-muted-foreground">总构建数</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-green-600">{trendData.successRate}%</p>
						<p className="text-sm text-muted-foreground">成功率</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold">{trendData.averageDuration}</p>
						<p className="text-sm text-muted-foreground">平均时长</p>
					</div>
				</div>

				{/* 简化的趋势图表 */}
				<div className="space-y-3">
					<p className="text-sm font-medium">每日构建统计</p>
					{trendData.trends.map((day) => (
						<div key={day.date} className="flex items-center gap-3">
							<span className="text-xs text-muted-foreground w-12">{day.date}</span>
							<div className="flex-1">
								<div className="flex items-center gap-1 h-6">
									<div 
										className="bg-green-500 h-4 rounded-sm"
										style={{ width: `${(day.success / Math.max(...trendData.trends.map(t => t.builds))) * 100}%` }}
									></div>
									<div 
										className="bg-red-500 h-4 rounded-sm"
										style={{ width: `${(day.failed / Math.max(...trendData.trends.map(t => t.builds))) * 100}%` }}
									></div>
								</div>
							</div>
							<div className="text-xs text-muted-foreground w-16 text-right">
								{day.success}/{day.builds}
							</div>
						</div>
					))}
				</div>

				{/* 图例 */}
				<div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-green-500 rounded-sm"></div>
						<span className="text-xs text-muted-foreground">成功</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-red-500 rounded-sm"></div>
						<span className="text-xs text-muted-foreground">失败</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
