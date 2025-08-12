import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { Progress } from "@/ui/progress";
import {
	Clock,
	Activity,
	Play,
	Pause,
	Square,
	Eye,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Loader2,
	Smartphone,
	Store
} from "lucide-react";

// 构建队列组件
export function BuildQueue({ buildQueue, loading }: {
	buildQueue: any[];
	loading: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="w-5 h-5" />
					构建队列
				</CardTitle>
				<CardDescription>当前排队和正在执行的构建任务</CardDescription>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="flex items-center justify-center h-32">
						<Loader2 className="w-6 h-6 animate-spin" />
					</div>
				) : buildQueue.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Clock className="w-8 h-8 mx-auto mb-2" />
						<p>当前没有排队的构建任务</p>
					</div>
				) : (
					<div className="space-y-3">
						{buildQueue.map((item, index) => (
							<BuildQueueItem
								key={index}
								jobName={item.jobName}
								status={item.status}
								progress={item.progress}
								startTime={item.startTime}
								estimatedDuration={item.estimatedDuration}
							/>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// 构建队列项组件
export function BuildQueueItem({ 
	jobName, 
	status, 
	progress, 
	startTime, 
	estimatedDuration 
}: {
	jobName: string;
	status: "running" | "queued";
	progress: number;
	startTime: string;
	estimatedDuration?: number;
}) {
	return (
		<div className="flex items-center justify-between p-4 border rounded-lg bg-card">
			<div className="flex items-center gap-3">
				<div className={`w-3 h-3 rounded-full ${
					status === "running" ? "bg-blue-500 animate-pulse" : "bg-gray-400"
				}`}></div>
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<p className="font-medium text-sm">{jobName}</p>
						{status === "running" && (
							<Badge variant="default" className="text-xs">
								运行中
							</Badge>
						)}
					</div>
					<p className="text-xs text-muted-foreground">{startTime}</p>
					{estimatedDuration && status === "running" && (
						<p className="text-xs text-muted-foreground">
							预计还需 {Math.round(estimatedDuration / 60000)} 分钟
						</p>
					)}
				</div>
			</div>
			<div className="flex items-center gap-3">
				{status === "running" && (
					<div className="flex items-center gap-2">
						<div className="w-24">
							<Progress value={progress} className="h-2" />
						</div>
						<span className="text-xs text-muted-foreground w-8">{progress}%</span>
					</div>
				)}
				<div className="flex gap-1">
					{status === "running" && (
						<>
							<Button variant="ghost" size="sm">
								<Pause className="w-3 h-3" />
							</Button>
							<Button variant="ghost" size="sm">
								<Square className="w-3 h-3" />
							</Button>
						</>
					)}
					<Button variant="ghost" size="sm">
						<Eye className="w-3 h-3" />
					</Button>
				</div>
			</div>
		</div>
	);
}

// 构建历史组件
export function BuildHistory({ buildHistory, loading }: {
	buildHistory: any[];
	loading: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="w-5 h-5" />
					最近构建
				</CardTitle>
				<CardDescription>最近完成的构建历史</CardDescription>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="flex items-center justify-center h-32">
						<Loader2 className="w-6 h-6 animate-spin" />
					</div>
				) : (
					<ScrollArea className="h-96">
						<div className="space-y-3">
							{buildHistory.map((item, index) => (
								<BuildHistoryItem
									key={index}
									jobName={item.jobName}
									buildNumber={item.buildNumber}
									status={item.status}
									duration={item.duration}
									timestamp={item.timestamp}
									url={item.url}
								/>
							))}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}

// 构建历史项组件
export function BuildHistoryItem({
	jobName,
	buildNumber,
	status,
	duration,
	timestamp
}: {
	jobName: string;
	buildNumber: number;
	status: "success" | "failed" | "unstable" | "aborted";
	duration: string;
	timestamp: string;
	url?: string;
}) {
	const statusConfig = {
		success: { 
			color: "bg-green-500", 
			badge: "default" as const, 
			icon: <CheckCircle className="w-4 h-4 text-green-500" /> 
		},
		failed: { 
			color: "bg-red-500", 
			badge: "destructive" as const, 
			icon: <XCircle className="w-4 h-4 text-red-500" /> 
		},
		unstable: { 
			color: "bg-yellow-500", 
			badge: "secondary" as const, 
			icon: <AlertTriangle className="w-4 h-4 text-yellow-500" /> 
		},
		aborted: { 
			color: "bg-gray-500", 
			badge: "outline" as const, 
			icon: <Square className="w-4 h-4 text-gray-500" /> 
		}
	};

	const config = statusConfig[status];

	// 判断是否为iOS项目
	const isIOSProject = (jobName: string): boolean => {
		const iosKeywords = ['ios', 'iphone', 'ipad', 'mobile', 'app', 'swift', 'xcode'];
		const lowerJobName = jobName.toLowerCase();
		return iosKeywords.some(keyword => lowerJobName.includes(keyword));
	};

	const showIOSActions = isIOSProject(jobName) && status === "success";

	return (
		<div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className={`w-3 h-3 rounded-full ${config.color}`}></div>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<p className="font-medium text-sm">{jobName} #{buildNumber}</p>
							{config.icon}
						</div>
						<p className="text-xs text-muted-foreground">{timestamp}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<div className="text-right">
						<p className="text-xs text-muted-foreground">{duration}</p>
						<Badge variant={config.badge} className="text-xs">
							{status.toUpperCase()}
						</Badge>
					</div>
					<div className="flex gap-1">
						<Button variant="ghost" size="sm">
							<Eye className="w-3 h-3" />
						</Button>
						<Button variant="ghost" size="sm">
							<Play className="w-3 h-3" />
						</Button>
					</div>
				</div>
			</div>

			{/* iOS 发布按钮 */}
			{showIOSActions && (
				<div className="mt-3 pt-3 border-t flex gap-2">
					<Button
						size="sm"
						variant="outline"
						className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
						onClick={() => {
							// TODO: 实现 TestFlight 发布逻辑
							console.log(`发布 ${jobName} #${buildNumber} 到 TestFlight`);
						}}
					>
						<Smartphone className="w-3 h-3 mr-1" />
						发布到 TestFlight
					</Button>
					<Button
						size="sm"
						variant="outline"
						className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
						onClick={() => {
							// TODO: 实现 App Store 发布逻辑
							console.log(`发布 ${jobName} #${buildNumber} 到 App Store`);
						}}
					>
						<Store className="w-3 h-3 mr-1" />
						发布到 App Store
					</Button>
				</div>
			)}
		</div>
	);
}

// 实时构建监控组件
export function RealTimeBuildMonitor({ activeBuilds }: {
	activeBuilds: any[];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="w-5 h-5" />
					实时监控
					{activeBuilds.length > 0 && (
						<Badge variant="default" className="ml-2">
							{activeBuilds.length} 个活跃
						</Badge>
					)}
				</CardTitle>
				<CardDescription>正在运行的构建任务实时状态</CardDescription>
			</CardHeader>
			<CardContent>
				{activeBuilds.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Activity className="w-8 h-8 mx-auto mb-2" />
						<p>当前没有正在运行的构建任务</p>
					</div>
				) : (
					<div className="space-y-4">
						{activeBuilds.map((build, index) => (
							<div key={index} className="p-4 border rounded-lg">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
										<span className="font-medium">{build.jobName} #{build.buildNumber}</span>
									</div>
									<Badge variant="default">运行中</Badge>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>进度</span>
										<span>{build.progress}%</span>
									</div>
									<Progress value={build.progress} className="h-2" />
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>已运行: {build.elapsed}</span>
										<span>预计剩余: {build.remaining}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
