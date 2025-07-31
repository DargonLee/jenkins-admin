import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Label } from "@/ui/label";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { BuildStatus } from "@/api/services/jenkinsService";

interface BuildStatusDisplayProps {
	buildStatus: BuildStatus;
}

export default function BuildStatusDisplay({ buildStatus }: BuildStatusDisplayProps) {
	// 获取构建结果状态颜色
	const getResultBadgeVariant = (result: string) => {
		switch (result?.toUpperCase()) {
			case "SUCCESS":
				return "default";
			case "FAILURE":
				return "destructive";
			case "UNSTABLE":
				return "secondary";
			case "ABORTED":
				return "outline";
			default:
				return "secondary";
		}
	};

	// 获取构建结果图标
	const getResultIcon = (result: string) => {
		switch (result?.toUpperCase()) {
			case "SUCCESS":
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			case "FAILURE":
				return <XCircle className="w-4 h-4 text-red-500" />;
			case "UNSTABLE":
				return <AlertCircle className="w-4 h-4 text-yellow-500" />;
			default:
				return <Clock className="w-4 h-4 text-gray-500" />;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="w-5 h-5" />
					构建状态 - {buildStatus.job_name} #{buildStatus.build_number}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<Label className="text-sm font-medium">状态</Label>
						<div className="flex items-center gap-2 mt-1">
							{getResultIcon(buildStatus.result)}
							<Badge variant={getResultBadgeVariant(buildStatus.result)}>{buildStatus.result}</Badge>
						</div>
					</div>
					<div>
						<Label className="text-sm font-medium">构建中</Label>
						<Badge variant={buildStatus.building ? "default" : "secondary"}>{buildStatus.building ? "是" : "否"}</Badge>
					</div>
					<div>
						<Label className="text-sm font-medium">持续时间</Label>
						<p className="text-sm text-muted-foreground">{Math.round(buildStatus.duration / 1000)}秒</p>
					</div>
					<div>
						<Label className="text-sm font-medium">预计时长</Label>
						<p className="text-sm text-muted-foreground">{Math.round(buildStatus.estimated_duration / 1000)}秒</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
