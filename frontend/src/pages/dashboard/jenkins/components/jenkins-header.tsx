import { Button } from "@/ui/button";
import { Server, Settings } from "lucide-react";

interface JenkinsHeaderProps {
	onGetServerInfo: () => void;
	onGetJobs: () => void;
	loading: Record<string, boolean>;
}

export default function JenkinsHeader({ onGetServerInfo, onGetJobs, loading }: JenkinsHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="text-3xl font-bold">Jenkins 管理</h1>
				<p className="text-muted-foreground">管理和监控 Jenkins 构建任务</p>
			</div>
			<div className="flex gap-2">
				<Button onClick={onGetServerInfo} disabled={loading.serverInfo} variant="outline">
					<Server className="w-4 h-4 mr-2" />
					{loading.serverInfo ? "获取中..." : "服务器信息"}
				</Button>
				<Button onClick={onGetJobs} disabled={loading.jobs} variant="outline">
					<Settings className="w-4 h-4 mr-2" />
					{loading.jobs ? "获取中..." : "获取任务列表"}
				</Button>
			</div>
		</div>
	);
}
