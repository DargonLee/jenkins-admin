import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Label } from "@/ui/label";
import { Eye, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import type { JenkinsBuild } from "@/api/services/jenkinsService";

interface BuildInfoDisplayProps {
	buildInfo: JenkinsBuild;
}

export default function BuildInfoDisplay({ buildInfo }: BuildInfoDisplayProps) {
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
					<Eye className="w-5 h-5" />
					构建详情 - {buildInfo.displayName}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						<div>
							<Label className="text-sm font-medium">构建号</Label>
							<p className="text-sm text-muted-foreground">#{buildInfo.number}</p>
						</div>
						<div>
							<Label className="text-sm font-medium">结果</Label>
							<div className="flex items-center gap-2 mt-1">
								{getResultIcon(buildInfo.result)}
								<Badge variant={getResultBadgeVariant(buildInfo.result)}>{buildInfo.result}</Badge>
							</div>
						</div>
						<div>
							<Label className="text-sm font-medium">持续时间</Label>
							<p className="text-sm text-muted-foreground">{Math.round(buildInfo.duration / 1000)}秒</p>
						</div>
					</div>

					{buildInfo.description && (
						<div>
							<Label className="text-sm font-medium">描述</Label>
							<p className="text-sm text-muted-foreground">{buildInfo.description}</p>
						</div>
					)}

					<div>
						<Label className="text-sm font-medium">构建URL</Label>
						<p className="text-sm text-muted-foreground break-all">{buildInfo.url}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
