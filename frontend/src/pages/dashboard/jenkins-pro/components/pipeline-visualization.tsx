import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { Progress } from "@/ui/progress";
import {
	CheckCircle,
	XCircle,
	Clock,
	AlertTriangle,
	Loader2,
	Eye,
	ChevronRight,
	GitBranch,
	Timer,
	Activity
} from "lucide-react";
import { PipelineFlow, PipelineStage } from "../hooks/use-jenkins-pro";

// Pipeline阶段状态配置
const stageStatusConfig = {
	success: { 
		color: "bg-green-500", 
		textColor: "text-green-700",
		bgColor: "bg-green-50",
		borderColor: "border-green-200",
		icon: <CheckCircle className="w-4 h-4" />,
		badge: "default" as const
	},
	failed: { 
		color: "bg-red-500", 
		textColor: "text-red-700",
		bgColor: "bg-red-50",
		borderColor: "border-red-200",
		icon: <XCircle className="w-4 h-4" />,
		badge: "destructive" as const
	},
	running: { 
		color: "bg-blue-500 animate-pulse", 
		textColor: "text-blue-700",
		bgColor: "bg-blue-50",
		borderColor: "border-blue-200",
		icon: <Loader2 className="w-4 h-4 animate-spin" />,
		badge: "default" as const
	},
	pending: { 
		color: "bg-gray-300", 
		textColor: "text-gray-600",
		bgColor: "bg-gray-50",
		borderColor: "border-gray-200",
		icon: <Clock className="w-4 h-4" />,
		badge: "secondary" as const
	},
	skipped: { 
		color: "bg-yellow-400", 
		textColor: "text-yellow-700",
		bgColor: "bg-yellow-50",
		borderColor: "border-yellow-200",
		icon: <AlertTriangle className="w-4 h-4" />,
		badge: "secondary" as const
	},
	aborted: { 
		color: "bg-gray-500", 
		textColor: "text-gray-700",
		bgColor: "bg-gray-50",
		borderColor: "border-gray-200",
		icon: <XCircle className="w-4 h-4" />,
		badge: "outline" as const
	}
};

// Pipeline可视化主组件
export function PipelineVisualization({ 
	pipelineFlow, 
	loading, 
	onStageClick 
}: {
	pipelineFlow: PipelineFlow | null;
	loading: boolean;
	onStageClick?: (stage: PipelineStage) => void;
}) {
	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<GitBranch className="w-5 h-5" />
						Pipeline 流程
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-32">
						<Loader2 className="w-8 h-8 animate-spin" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!pipelineFlow) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<GitBranch className="w-5 h-5" />
						Pipeline 流程
					</CardTitle>
					<CardDescription>选择一个构建来查看Pipeline流程</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8 text-muted-foreground">
						<GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p>暂无Pipeline数据</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const overallConfig = stageStatusConfig[pipelineFlow.status];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<GitBranch className="w-5 h-5" />
							Pipeline 流程
						</CardTitle>
						<CardDescription>
							{pipelineFlow.jobName} #{pipelineFlow.buildNumber}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={overallConfig.badge}>
							{pipelineFlow.status.toUpperCase()}
						</Badge>
						<Button variant="outline" size="sm">
							<Eye className="w-4 h-4 mr-2" />
							查看日志
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{/* Pipeline 时间信息 */}
				<div className="mb-6 p-4 bg-muted/50 rounded-lg">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground">开始时间</p>
							<p className="font-medium">{new Date(pipelineFlow.startTime).toLocaleString('zh-CN')}</p>
						</div>
						<div>
							<p className="text-muted-foreground">总耗时</p>
							<p className="font-medium">
								{pipelineFlow.totalDuration > 0 
									? `${Math.round(pipelineFlow.totalDuration / 60000 * 10) / 10}分钟`
									: '进行中'
								}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground">阶段数</p>
							<p className="font-medium">{pipelineFlow.stages.length}</p>
						</div>
						<div>
							<p className="text-muted-foreground">完成阶段</p>
							<p className="font-medium">
								{pipelineFlow.stages.filter(s => s.status === 'success').length} / {pipelineFlow.stages.length}
							</p>
						</div>
					</div>
				</div>

				{/* Pipeline 阶段流程图 */}
				<div className="space-y-4">
					<h4 className="font-medium flex items-center gap-2">
						<Activity className="w-4 h-4" />
						执行阶段
					</h4>
					
					{/* 水平流程图 */}
					<div className="flex items-center gap-2 overflow-x-auto pb-4">
						{pipelineFlow.stages.map((stage, index) => (
							<div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
								<PipelineStageCard 
									stage={stage} 
									onClick={() => onStageClick?.(stage)}
								/>
								{index < pipelineFlow.stages.length - 1 && (
									<ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
								)}
							</div>
						))}
					</div>

					{/* 详细阶段列表 */}
					<div className="space-y-3">
						<h4 className="font-medium">阶段详情</h4>
						<ScrollArea className="h-64">
							<div className="space-y-2">
								{pipelineFlow.stages.map((stage) => (
									<PipelineStageDetail 
										key={stage.id} 
										stage={stage}
										onClick={() => onStageClick?.(stage)}
									/>
								))}
							</div>
						</ScrollArea>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Pipeline阶段卡片组件
function PipelineStageCard({ 
	stage, 
	onClick 
}: {
	stage: PipelineStage;
	onClick?: () => void;
}) {
	const config = stageStatusConfig[stage.status];
	
	return (
		<div 
			className={`
				relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
				${config.bgColor} ${config.borderColor}
			`}
			onClick={onClick}
		>
			{/* 状态指示器 */}
			<div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${config.color}`}></div>
			
			<div className="text-center min-w-[80px]">
				<div className={`flex items-center justify-center mb-1 ${config.textColor}`}>
					{config.icon}
				</div>
				<p className="text-xs font-medium">{stage.name}</p>
				{stage.duration && (
					<p className="text-xs text-muted-foreground mt-1">
						{Math.round(stage.duration / 1000)}s
					</p>
				)}
			</div>
		</div>
	);
}

// Pipeline阶段详情组件
function PipelineStageDetail({ 
	stage, 
	onClick 
}: {
	stage: PipelineStage;
	onClick?: () => void;
}) {
	const config = stageStatusConfig[stage.status];
	
	return (
		<div 
			className={`
				p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm
				${config.bgColor} ${config.borderColor}
			`}
			onClick={onClick}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className={config.textColor}>
						{config.icon}
					</div>
					<div>
						<p className="font-medium">{stage.name}</p>
						<div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
							{stage.startTime && (
								<span className="flex items-center gap-1">
									<Timer className="w-3 h-3" />
									{new Date(stage.startTime).toLocaleTimeString('zh-CN')}
								</span>
							)}
							{stage.duration && (
								<span>耗时: {Math.round(stage.duration / 1000)}s</span>
							)}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={config.badge} className="text-xs">
						{stage.status.toUpperCase()}
					</Badge>
					{stage.status === 'running' && stage.estimatedDuration && (
						<div className="w-20">
							<Progress 
								value={(stage.duration || 0) / stage.estimatedDuration * 100} 
								className="h-1"
							/>
						</div>
					)}
				</div>
			</div>
			
			{/* 错误信息 */}
			{stage.error && (
				<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
					<p className="font-medium">错误信息:</p>
					<p>{stage.error}</p>
				</div>
			)}
			
			{/* 日志预览 */}
			{stage.logs && stage.logs.length > 0 && (
				<div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
					<p className="font-medium text-gray-700 mb-1">最新日志:</p>
					<div className="space-y-1 font-mono text-gray-600">
						{stage.logs.slice(-2).map((log, index) => (
							<p key={index}>{log}</p>
						))}
						{stage.logs.length > 2 && (
							<p className="text-muted-foreground">... 还有 {stage.logs.length - 2} 行日志</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
