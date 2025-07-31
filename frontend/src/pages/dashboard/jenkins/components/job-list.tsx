import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { ScrollArea } from "@/ui/scroll-area";

interface JobListProps {
	jobsRaw: string;
	selectedJob: string;
	onJobSelect: (jobName: string) => void;
}

export default function JobList({ jobsRaw, selectedJob, onJobSelect }: JobListProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>任务列表</CardTitle>
				<CardDescription>选择要操作的 Jenkins 任务</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-64">
					<div className="space-y-2">
						{(() => {
							try {
								if (!jobsRaw) return <div className="text-center text-muted-foreground py-4">暂无任务数据</div>;

								const parsedData = JSON.parse(jobsRaw);
								const jobsData = parsedData?.data || [];

								if (jobsData.length === 0) {
									return <div className="text-center text-muted-foreground py-4">暂无任务</div>;
								}

								return jobsData.map((job: any) => (
									<div
										key={job.fullname}
										className={`p-3 border rounded-lg cursor-pointer transition-colors ${
											selectedJob === job.fullname ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
										}`}
										onClick={() => onJobSelect(job.fullname)}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div
													className={`w-3 h-3 rounded-full ${
														job.color === "blue"
															? "bg-blue-500"
															: job.color === "red"
																? "bg-red-500"
																: job.color === "yellow"
																	? "bg-yellow-500"
																	: "bg-gray-500"
													}`}
												/>
												<span className="font-medium">{job.fullname}</span>
											</div>
										</div>
									</div>
								));
							} catch (error) {
								return <div className="text-center text-muted-foreground py-4">解析任务数据失败</div>;
							}
						})()}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
