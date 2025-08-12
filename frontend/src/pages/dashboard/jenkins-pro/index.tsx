
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { ScrollArea } from "@/ui/scroll-area";
import { Separator } from "@/ui/separator";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import {
	LayoutDashboard,
	Settings,
	Play,
	Clock,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Server,
	Activity,
	Zap,
	Eye,
	RefreshCw,
	Search,
	MoreHorizontal,
	Loader2,
	AlertCircle,
	Smartphone,
	Store
} from "lucide-react";
import { useJenkinsPro } from "./hooks/use-jenkins-pro";
import { StatsCard, RecentActivity, QuickActions, BuildTrends } from "./components/dashboard-widgets";
import { BuildQueue, BuildHistory, RealTimeBuildMonitor } from "./components/build-monitor";

export default function JenkinsPro() {
	const [activeTab, setActiveTab] = useState("dashboard");
	const {
		systemStats,
		filteredJobs,
		buildQueue,
		buildHistory,
		loading,
		error,
		searchQuery,
		statusFilter,
		setSearchQuery,
		setStatusFilter,
		triggerBuild,
		refreshAll,
		clearError
	} = useJenkinsPro();

	// 错误自动清除
	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				clearError();
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [error, clearError]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
			{/* Header */}
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-16 items-center justify-between px-6">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
								<Zap className="w-4 h-4 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold">Jenkins Pro</h1>
								<p className="text-xs text-muted-foreground">企业级CI/CD管理平台</p>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={refreshAll}
							disabled={loading.serverInfo || loading.jobs}
						>
							{loading.serverInfo || loading.jobs ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<RefreshCw className="w-4 h-4 mr-2" />
							)}
							刷新
						</Button>
						<Button variant="outline" size="sm">
							<Settings className="w-4 h-4 mr-2" />
							设置
						</Button>
					</div>
				</div>
			</header>

			{/* Main Layout */}
			<div className="container mx-auto px-6 py-6">
				{/* Error Alert */}
				{error && (
					<Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
						<CardContent className="flex items-center gap-3 p-4">
							<AlertCircle className="h-4 w-4 text-red-600" />
							<p className="text-sm text-red-800 dark:text-red-200">{error}</p>
						</CardContent>
					</Card>
				)}

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					{/* Navigation Tabs */}
					<TabsList className="grid w-full grid-cols-4 mb-6">
						<TabsTrigger value="dashboard" className="flex items-center gap-2">
							<LayoutDashboard className="w-4 h-4" />
							概览仪表板
						</TabsTrigger>
						<TabsTrigger value="jobs" className="flex items-center gap-2">
							<Settings className="w-4 h-4" />
							任务管理
						</TabsTrigger>
						<TabsTrigger value="builds" className="flex items-center gap-2">
							<Activity className="w-4 h-4" />
							构建监控
						</TabsTrigger>
						<TabsTrigger value="system" className="flex items-center gap-2">
							<Server className="w-4 h-4" />
							系统信息
						</TabsTrigger>
					</TabsList>

					{/* Dashboard Tab */}
					<TabsContent value="dashboard" className="space-y-6">
						<DashboardView systemStats={systemStats} />
					</TabsContent>

					{/* Jobs Tab */}
					<TabsContent value="jobs" className="space-y-6">
						<JobsView
							jobs={filteredJobs}
							searchQuery={searchQuery}
							statusFilter={statusFilter}
							onSearchChange={setSearchQuery}
							onStatusFilterChange={setStatusFilter}
							onTriggerBuild={triggerBuild}
							loading={loading}
						/>
					</TabsContent>

					{/* Builds Tab */}
					<TabsContent value="builds" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<BuildQueue buildQueue={buildQueue} loading={loading.buildQueue} />
							<RealTimeBuildMonitor activeBuilds={buildQueue.filter(b => b.status === "running")} />
						</div>
						<BuildHistory buildHistory={buildHistory} loading={loading.buildHistory} />
					</TabsContent>

					{/* System Tab */}
					<TabsContent value="system" className="space-y-6">
						<SystemView />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

// Dashboard View Component
function DashboardView({ systemStats }: { systemStats: any }) {
	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatsCard
					title="总任务数"
					value={systemStats.totalJobs.toString()}
					change="+2"
					changeType="positive"
					icon={<Settings className="w-4 h-4" />}
				/>
				<StatsCard
					title="活跃构建"
					value={systemStats.activeBuilds.toString()}
					change="0"
					changeType="neutral"
					icon={<Play className="w-4 h-4" />}
				/>
				<StatsCard
					title="成功率"
					value={`${systemStats.successRate}%`}
					change="+1.2%"
					changeType="positive"
					icon={<CheckCircle className="w-4 h-4" />}
				/>
				<StatsCard
					title="平均构建时间"
					value={systemStats.averageBuildTime}
					change="-0.3分钟"
					changeType="positive"
					icon={<Clock className="w-4 h-4" />}
				/>
			</div>

			{/* Recent Activity and Quick Actions */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<RecentActivity />
				</div>
				<div>
					<QuickActions />
				</div>
			</div>

			{/* Build Trends */}
			<BuildTrends />
		</div>
	);
}

// Jobs View Component
function JobsView({
	jobs,
	searchQuery,
	statusFilter,
	onSearchChange,
	onStatusFilterChange,
	onTriggerBuild,
	loading
}: {
	jobs: any[];
	searchQuery: string;
	statusFilter: string;
	onSearchChange: (query: string) => void;
	onStatusFilterChange: (filter: string) => void;
	onTriggerBuild: (jobName: string) => void;
	loading: Record<string, boolean>;
}) {
	return (
		<div className="space-y-6">
			{/* Search and Filter Bar */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							type="text"
							placeholder="搜索任务..."
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-10 w-64"
						/>
					</div>
					<Select value={statusFilter} onValueChange={onStatusFilterChange}>
						<SelectTrigger className="w-32">
							<SelectValue placeholder="状态筛选" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">全部</SelectItem>
							<SelectItem value="success">成功</SelectItem>
							<SelectItem value="failed">失败</SelectItem>
							<SelectItem value="running">运行中</SelectItem>
							<SelectItem value="unstable">不稳定</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Button>
					<Play className="w-4 h-4 mr-2" />
					新建任务
				</Button>
			</div>

			{/* Jobs Grid */}
			{loading.jobs ? (
				<div className="flex items-center justify-center h-64">
					<Loader2 className="w-8 h-8 animate-spin" />
				</div>
			) : jobs.length === 0 ? (
				<div className="text-center py-12">
					<Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
					<p className="text-muted-foreground">没有找到匹配的任务</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{jobs.map((job) => (
						<JobCard
							key={job.fullname}
							name={job.name}
							status={getJobStatus(job.color)}
							lastBuild={job.lastBuild ? "刚刚" : "未构建"}
							duration={job.lastBuildDuration || "未知"}
							description={job.description || `${job.name} 构建任务`}
							onTriggerBuild={() => onTriggerBuild(job.fullname)}
							loading={loading.build}
							isIOSProject={isIOSProject(job.name)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// 辅助函数：将Jenkins颜色状态转换为我们的状态
function getJobStatus(color: string): "success" | "failed" | "running" | "unstable" {
	if (color?.includes("blue") || color?.includes("green")) return "success";
	if (color?.includes("red")) return "failed";
	if (color?.includes("anime")) return "running";
	if (color?.includes("yellow")) return "unstable";
	return "success";
}

// 辅助函数：判断是否为iOS项目
function isIOSProject(jobName: string): boolean {
	const iosKeywords = ['ios', 'iphone', 'ipad', 'mobile', 'app', 'swift', 'xcode'];
	const lowerJobName = jobName.toLowerCase();
	return iosKeywords.some(keyword => lowerJobName.includes(keyword));
}



// System View Component
function SystemView() {
	return (
		<div className="space-y-6">
			{/* System Status */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Server className="w-5 h-5" />
							服务器状态
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm">Jenkins版本</span>
							<Badge variant="outline">2.414.1</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">运行时间</span>
							<span className="text-sm text-muted-foreground">15天 8小时</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">执行器</span>
							<span className="text-sm text-muted-foreground">8个 (3个忙碌)</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">队列长度</span>
							<span className="text-sm text-muted-foreground">2个任务</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Activity className="w-5 h-5" />
							系统资源
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm">CPU使用率</span>
								<span className="text-sm text-muted-foreground">45%</span>
							</div>
							<div className="w-full bg-secondary rounded-full h-2">
								<div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
							</div>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm">内存使用率</span>
								<span className="text-sm text-muted-foreground">68%</span>
							</div>
							<div className="w-full bg-secondary rounded-full h-2">
								<div className="bg-green-500 h-2 rounded-full" style={{ width: "68%" }}></div>
							</div>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm">磁盘使用率</span>
								<span className="text-sm text-muted-foreground">32%</span>
							</div>
							<div className="w-full bg-secondary rounded-full h-2">
								<div className="bg-yellow-500 h-2 rounded-full" style={{ width: "32%" }}></div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* iOS 发布配置 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Smartphone className="w-5 h-5" />
						iOS 发布配置
					</CardTitle>
					<CardDescription>TestFlight 和 App Store 发布设置</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-3">
							<h4 className="font-medium flex items-center gap-2">
								<Smartphone className="w-4 h-4 text-blue-500" />
								TestFlight 配置
							</h4>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span>API Key 状态</span>
									<Badge variant="default" className="bg-green-100 text-green-800">已配置</Badge>
								</div>
								<div className="flex justify-between">
									<span>团队 ID</span>
									<span className="text-muted-foreground">ABC123DEF4</span>
								</div>
								<div className="flex justify-between">
									<span>自动发布</span>
									<Badge variant="outline">已启用</Badge>
								</div>
							</div>
						</div>
						<div className="space-y-3">
							<h4 className="font-medium flex items-center gap-2">
								<Store className="w-4 h-4 text-purple-500" />
								App Store 配置
							</h4>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span>证书状态</span>
									<Badge variant="default" className="bg-green-100 text-green-800">有效</Badge>
								</div>
								<div className="flex justify-between">
									<span>Bundle ID</span>
									<span className="text-muted-foreground">com.company.app</span>
								</div>
								<div className="flex justify-between">
									<span>审核模式</span>
									<Badge variant="secondary">手动提交</Badge>
								</div>
							</div>
						</div>
					</div>
					<Separator />
					<div className="flex gap-2">
						<Button variant="outline" size="sm">
							<Settings className="w-4 h-4 mr-2" />
							配置设置
						</Button>
						<Button variant="outline" size="sm">
							<Eye className="w-4 h-4 mr-2" />
							查看证书
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* System Logs */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Eye className="w-5 h-5" />
						系统日志
					</CardTitle>
					<CardDescription>最近的系统事件和日志</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-64">
						<div className="space-y-2 text-sm font-mono">
							<div className="flex items-start gap-3">
								<span className="text-muted-foreground text-xs">2024-01-15 14:30:25</span>
								<span className="text-green-600">[INFO]</span>
								<span>Build #145 for job 'frontend-build' completed successfully</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-muted-foreground text-xs">2024-01-15 14:28:10</span>
								<span className="text-blue-600">[INFO]</span>
								<span>Started build #145 for job 'frontend-build'</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-muted-foreground text-xs">2024-01-15 14:25:45</span>
								<span className="text-red-600">[ERROR]</span>
								<span>Build #234 for job 'test-automation' failed with exit code 1</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-muted-foreground text-xs">2024-01-15 14:20:30</span>
								<span className="text-yellow-600">[WARN]</span>
								<span>High memory usage detected: 85%</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-muted-foreground text-xs">2024-01-15 14:15:15</span>
								<span className="text-green-600">[INFO]</span>
								<span>User 'admin' logged in from 192.168.1.100</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-muted-foreground text-xs">2024-01-15 14:12:30</span>
								<span className="text-blue-600">[INFO]</span>
								<span>iOS app 'MyApp' #142 published to TestFlight successfully</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-muted-foreground text-xs">2024-01-15 14:10:15</span>
								<span className="text-purple-600">[INFO]</span>
								<span>iOS app 'MyApp' #141 submitted to App Store for review</span>
							</div>
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}

// Helper Components

function JobCard({ name, status, lastBuild, duration, description, onTriggerBuild, loading, isIOSProject }: {
	name: string;
	status: "success" | "failed" | "running" | "unstable";
	lastBuild: string;
	duration: string;
	description: string;
	onTriggerBuild?: () => void;
	loading?: boolean;
	isIOSProject?: boolean;
}) {
	const statusConfig = {
		success: { color: "bg-green-500", icon: <CheckCircle className="w-4 h-4" />, badge: "default" },
		failed: { color: "bg-red-500", icon: <XCircle className="w-4 h-4" />, badge: "destructive" },
		running: { color: "bg-blue-500", icon: <Play className="w-4 h-4" />, badge: "default" },
		unstable: { color: "bg-yellow-500", icon: <AlertTriangle className="w-4 h-4" />, badge: "secondary" }
	};

	const config = statusConfig[status];

	return (
		<Card className="hover:shadow-md transition-shadow cursor-pointer">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className={`w-3 h-3 rounded-full ${config.color}`}></div>
						<CardTitle className="text-base">{name}</CardTitle>
					</div>
					<Button variant="ghost" size="sm">
						<MoreHorizontal className="w-4 h-4" />
					</Button>
				</div>
				<CardDescription className="text-sm">{description}</CardDescription>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						{config.icon}
						<Badge variant={config.badge as any} className="text-xs">
							{status.toUpperCase()}
						</Badge>
					</div>
					<div className="text-muted-foreground">
						{duration}
					</div>
				</div>
				<div className="mt-2 text-xs text-muted-foreground">
					最后构建: {lastBuild}
				</div>
				<div className="mt-3 space-y-2">
					{/* 主要操作按钮 */}
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							className="flex-1"
							onClick={onTriggerBuild}
							disabled={loading || status === "running"}
						>
							{loading ? (
								<Loader2 className="w-3 h-3 mr-1 animate-spin" />
							) : (
								<Play className="w-3 h-3 mr-1" />
							)}
							{status === "running" ? "运行中" : "构建"}
						</Button>
						<Button size="sm" variant="outline" className="flex-1">
							<Eye className="w-3 h-3 mr-1" />
							查看
						</Button>
					</div>

					{/* iOS 发布按钮 */}
					{isIOSProject && status === "success" && (
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
								onClick={() => {
									// TODO: 实现 TestFlight 发布逻辑
									console.log("发布到 TestFlight");
								}}
							>
								<Smartphone className="w-3 h-3 mr-1" />
								TestFlight
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
								onClick={() => {
									// TODO: 实现 App Store 发布逻辑
									console.log("发布到 App Store");
								}}
							>
								<Store className="w-3 h-3 mr-1" />
								App Store
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}


