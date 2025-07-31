import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Separator } from "@/ui/separator";
import { Play, Terminal, Clock, Settings, Eye, Zap, Square } from "lucide-react";
import type { BuildParams } from "@/api/services/jenkinsService";

interface OperationPanelProps {
	selectedJob: string;
	buildParams: BuildParams;
	buildNumber: number;
	loading: Record<string, boolean>;
	isRealTimeBuilding: boolean;
	realTimeBuildNumber: number | null;
	onJobChange: (job: string) => void;
	onBuildParamsChange: (params: BuildParams) => void;
	onBuildNumberChange: (number: number) => void;
	onGetJobInfo: () => void;
	onTriggerBuild: () => void;

	onGetBuildInfo: () => void;
	onGetBuildStatus: () => void;
	onGetConsoleOutput: () => void;
	onTriggerRealTimeBuild: () => void;
	onStopRealTimeMonitoring: () => void;
}

export default function OperationPanel({
	selectedJob,
	buildParams,
	buildNumber,
	loading,
	isRealTimeBuilding,
	realTimeBuildNumber,
	onJobChange,
	onBuildParamsChange,
	onBuildNumberChange,
	onGetJobInfo,
	onTriggerBuild,

	onGetBuildInfo,
	onGetBuildStatus,
	onGetConsoleOutput,
	onTriggerRealTimeBuild,
	onStopRealTimeMonitoring,
}: OperationPanelProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>操作面板</CardTitle>
				<CardDescription>对选中的任务执行操作</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Label>选中的任务</Label>
					<Input
						value={selectedJob}
						onChange={(e) => onJobChange(e.target.value)}
						placeholder="输入任务名称或从左侧选择"
					/>
				</div>

				<div>
					<Label>构建参数 (JSON格式)</Label>
					<Textarea
						placeholder='{"branch": "main", "environment": "dev"}'
						value={JSON.stringify(buildParams, null, 2)}
						onChange={(e) => {
							try {
								onBuildParamsChange(JSON.parse(e.target.value || "{}"));
							} catch {
								// 忽略JSON解析错误
							}
						}}
						rows={3}
					/>
				</div>

				<div>
					<Label>构建号</Label>
					<Input
						type="number"
						value={buildNumber}
						onChange={(e) => onBuildNumberChange(Number(e.target.value))}
						placeholder="输入构建号"
					/>
				</div>

				<Separator />

				{/* 实时构建状态显示 */}
				{isRealTimeBuilding && realTimeBuildNumber && (
					<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
								<span className="text-sm font-medium text-blue-700">
									实时监控中 - 构建 #{realTimeBuildNumber}
								</span>
							</div>
							<Button
								onClick={onStopRealTimeMonitoring}
								variant="outline"
								size="sm"
								className="text-blue-600 border-blue-300 hover:bg-blue-100"
							>
								<Square className="w-3 h-3 mr-1" />
								停止监控
							</Button>
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-2">
					<Button onClick={onGetJobInfo} disabled={loading.jobInfo} variant="outline" size="sm">
						<Settings className="w-4 h-4 mr-2" />
						{loading.jobInfo ? "获取中..." : "任务详情"}
					</Button>

					<Button onClick={onTriggerBuild} disabled={loading.build} size="sm">
						<Play className="w-4 h-4 mr-2" />
						{loading.build ? "触发中..." : "触发构建"}
					</Button>



					<Button 
						onClick={onTriggerRealTimeBuild} 
						disabled={loading.realTimeBuild || isRealTimeBuilding} 
						className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
						size="sm"
					>
						<Zap className="w-4 h-4 mr-2" />
						{loading.realTimeBuild ? "启动中..." : isRealTimeBuilding ? "监控中..." : "实时构建"}
					</Button>

					<Button onClick={onGetBuildInfo} disabled={loading.buildInfo} variant="outline" size="sm">
						<Eye className="w-4 h-4 mr-2" />
						{loading.buildInfo ? "获取中..." : "构建详情"}
					</Button>

					<Button onClick={onGetBuildStatus} disabled={loading.buildStatus} variant="outline" size="sm">
						<Clock className="w-4 h-4 mr-2" />
						{loading.buildStatus ? "获取中..." : "构建状态"}
					</Button>

					<Button onClick={onGetConsoleOutput} disabled={loading.console} variant="outline" size="sm">
						<Terminal className="w-4 h-4 mr-2" />
						{loading.console ? "获取中..." : "控制台输出"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
