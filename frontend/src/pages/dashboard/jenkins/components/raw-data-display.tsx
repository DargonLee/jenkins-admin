import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Server, Settings, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface RawDataDisplayProps {
	serverInfoRaw: string;
	jobsRaw: string;
}

export default function RawDataDisplay({ serverInfoRaw, jobsRaw }: RawDataDisplayProps) {
	const [serverInfoExpanded, setServerInfoExpanded] = useState(false);
	const [jobsExpanded, setJobsExpanded] = useState(false);
	const [copiedServer, setCopiedServer] = useState(false);
	const [copiedJobs, setCopiedJobs] = useState(false);

	// 复制到剪贴板
	const copyToClipboard = async (text: string, type: "server" | "jobs") => {
		try {
			await navigator.clipboard.writeText(text);
			if (type === "server") {
				setCopiedServer(true);
				setTimeout(() => setCopiedServer(false), 2000);
			} else {
				setCopiedJobs(true);
				setTimeout(() => setCopiedJobs(false), 2000);
			}
			toast.success("已复制到剪贴板");
		} catch (error) {
			toast.error("复制失败");
		}
	};

	// 获取数据统计信息
	const getDataStats = (data: string) => {
		if (!data) return { lines: 0, chars: 0, size: "0 B" };

		const lines = data.split("\n").length;
		const chars = data.length;
		const bytes = new Blob([data]).size;

		let size = "";
		if (bytes < 1024) {
			size = `${bytes} B`;
		} else if (bytes < 1024 * 1024) {
			size = `${(bytes / 1024).toFixed(1)} KB`;
		} else {
			size = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
		}

		return { lines, chars, size };
	};

	return (
		<>
			{/* 服务器信息显示 */}
			{serverInfoRaw && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Server className="w-5 h-5" />
								<div>
									<CardTitle>Jenkins 服务器信息</CardTitle>
									<CardDescription>
										服务器返回的原始 JSON 数据 ({getDataStats(serverInfoRaw).size}, {getDataStats(serverInfoRaw).lines}{" "}
										行)
									</CardDescription>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" onClick={() => copyToClipboard(serverInfoRaw, "server")}>
									{copiedServer ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
								</Button>
								<Button variant="outline" size="sm" onClick={() => setServerInfoExpanded(!serverInfoExpanded)}>
									{serverInfoExpanded ? (
										<>
											<ChevronUp className="w-4 h-4 mr-1" />
											收起
										</>
									) : (
										<>
											<ChevronDown className="w-4 h-4 mr-1" />
											展开
										</>
									)}
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Textarea
							value={serverInfoRaw}
							readOnly
							className={`font-mono text-xs transition-all duration-300 ${serverInfoExpanded ? "min-h-96" : "h-32"}`}
							placeholder="服务器信息将在这里显示..."
						/>
					</CardContent>
				</Card>
			)}

			{/* 任务列表信息显示 */}
			{jobsRaw && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Settings className="w-5 h-5" />
								<div>
									<CardTitle>Jenkins 任务列表</CardTitle>
									<CardDescription>
										任务列表返回的原始 JSON 数据 ({getDataStats(jobsRaw).size}, {getDataStats(jobsRaw).lines} 行)
									</CardDescription>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" onClick={() => copyToClipboard(jobsRaw, "jobs")}>
									{copiedJobs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
								</Button>
								<Button variant="outline" size="sm" onClick={() => setJobsExpanded(!jobsExpanded)}>
									{jobsExpanded ? (
										<>
											<ChevronUp className="w-4 h-4 mr-1" />
											收起
										</>
									) : (
										<>
											<ChevronDown className="w-4 h-4 mr-1" />
											展开
										</>
									)}
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Textarea
							value={jobsRaw}
							readOnly
							className={`font-mono text-xs transition-all duration-300 ${jobsExpanded ? "min-h-96" : "h-32"}`}
							placeholder="任务列表信息将在这里显示..."
						/>
					</CardContent>
				</Card>
			)}
		</>
	);
}
