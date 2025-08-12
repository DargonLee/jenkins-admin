import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import jenkinsService, {
	type JenkinsJob,
	type JenkinsServerInfo,
	type BuildParams,
	type JenkinsBuild,
	type BuildStatus,
	type ConsoleOutput,
} from "@/api/services/jenkinsService";

// 扩展的任务接口，包含更多UI需要的信息
export interface EnhancedJenkinsJob extends JenkinsJob {
	isRunning?: boolean;
	lastBuildDuration?: string;
	healthScore?: number;
	description?: string;
}

// 构建队列项接口
export interface BuildQueueItem {
	jobName: string;
	status: "running" | "queued";
	progress: number;
	startTime: string;
	estimatedDuration?: number;
}

// 构建历史项接口
export interface BuildHistoryItem {
	jobName: string;
	buildNumber: number;
	status: "success" | "failed" | "unstable" | "aborted";
	duration: string;
	timestamp: string;
	url?: string;
}

// 系统统计接口
export interface SystemStats {
	totalJobs: number;
	activeBuilds: number;
	successRate: number;
	averageBuildTime: string;
	queueLength: number;
	executors: {
		total: number;
		busy: number;
	};
}

// Pipeline阶段接口
export interface PipelineStage {
	id: string;
	name: string;
	status: "success" | "failed" | "running" | "pending" | "skipped" | "aborted";
	startTime?: string;
	duration?: number;
	estimatedDuration?: number;
	logs?: string[];
	error?: string;
}

// Pipeline流程接口
export interface PipelineFlow {
	jobName: string;
	buildNumber: number;
	stages: PipelineStage[];
	totalDuration: number;
	status: "success" | "failed" | "running" | "aborted";
	startTime: string;
	endTime?: string;
}

// 告警配置接口
export interface AlertConfig {
	enabled: boolean;
	buildFailureAlert: boolean;
	longRunningBuildAlert: boolean;
	resourceThresholdAlert: boolean;
	successRateAlert: boolean;
	wechatWebhook?: string;
	emailNotification?: string[];
	alertThresholds: {
		buildTimeThreshold: number; // 分钟
		successRateThreshold: number; // 百分比
		resourceUsageThreshold: number; // 百分比
	};
}

// 告警记录接口
export interface AlertRecord {
	id: string;
	type: "build_failure" | "long_running" | "resource_threshold" | "success_rate";
	severity: "low" | "medium" | "high" | "critical";
	title: string;
	message: string;
	jobName?: string;
	buildNumber?: number;
	timestamp: string;
	acknowledged: boolean;
	channels: ("wechat" | "email")[];
}

export function useJenkinsPro() {
	// 基础状态
	const [serverInfo, setServerInfo] = useState<JenkinsServerInfo | null>(null);
	const [serverInfoRaw, setServerInfoRaw] = useState<string>("");
	const [jobs, setJobs] = useState<EnhancedJenkinsJob[]>([]);
	const [jobsRaw, setJobsRaw] = useState<string>("");
	const [selectedJob, setSelectedJob] = useState<string>("");
	const [buildParams, setBuildParams] = useState<BuildParams>({});
	const [buildNumber, setBuildNumber] = useState<number>(1);
	const [buildInfo, setBuildInfo] = useState<JenkinsBuild | null>(null);
	const [buildStatus, setBuildStatus] = useState<BuildStatus | null>(null);
	const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput | null>(null);
	const [loading, setLoading] = useState<Record<string, boolean>>({});
	const [error, setError] = useState<string | null>(null);
	const [isRealTimeBuilding, setIsRealTimeBuilding] = useState<boolean>(false);
	const [realTimeBuildNumber, setRealTimeBuildNumber] = useState<number | null>(null);

	// 扩展状态
	const [buildQueue, setBuildQueue] = useState<BuildQueueItem[]>([]);
	const [buildHistory, setBuildHistory] = useState<BuildHistoryItem[]>([]);
	const [systemStats, setSystemStats] = useState<SystemStats>({
		totalJobs: 0,
		activeBuilds: 0,
		successRate: 0,
		averageBuildTime: "0分钟",
		queueLength: 0,
		executors: { total: 0, busy: 0 }
	});

	// Pipeline可视化状态
	const [pipelineFlow, setPipelineFlow] = useState<PipelineFlow | null>(null);
	const [selectedPipeline, setSelectedPipeline] = useState<{jobName: string, buildNumber: number} | null>(null);

	// 告警和通知状态
	const [alertConfig, setAlertConfig] = useState<AlertConfig>({
		enabled: true,
		buildFailureAlert: true,
		longRunningBuildAlert: true,
		resourceThresholdAlert: true,
		successRateAlert: true,
		wechatWebhook: "",
		emailNotification: [],
		alertThresholds: {
			buildTimeThreshold: 30, // 30分钟
			successRateThreshold: 80, // 80%
			resourceUsageThreshold: 85 // 85%
		}
	});
	const [alertRecords, setAlertRecords] = useState<AlertRecord[]>([
		{
			id: "alert_1",
			type: "build_failure",
			severity: "high",
			title: "构建失败告警",
			message: "任务 'frontend-build' 的构建 #145 执行失败，请检查构建日志并及时处理。",
			jobName: "frontend-build",
			buildNumber: 145,
			timestamp: new Date(Date.now() - 300000).toISOString(),
			acknowledged: false,
			channels: ["wechat"]
		},
		{
			id: "alert_2",
			type: "long_running",
			severity: "medium",
			title: "构建超时告警",
			message: "任务 'backend-test' 的构建 #89 已运行 35 分钟，超过阈值 30 分钟。",
			jobName: "backend-test",
			buildNumber: 89,
			timestamp: new Date(Date.now() - 600000).toISOString(),
			acknowledged: true,
			channels: ["wechat"]
		}
	]);
	const [unreadAlerts, setUnreadAlerts] = useState<number>(1);

	// 搜索和过滤状态
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// 加载状态管理
	const setLoadingState = useCallback((key: string, isLoading: boolean) => {
		setLoading(prev => ({ ...prev, [key]: isLoading }));
	}, []);

	// 错误处理
	const handleError = useCallback((error: any, message: string) => {
		console.error(message, error);
		setError(message);
		toast.error(message);
	}, []);

	// 获取服务器信息
	const fetchServerInfo = useCallback(async () => {
		setLoadingState("serverInfo", true);
		setError(null);
		try {
			const response = await jenkinsService.getServerInfo();
			if (response.status === "success" && response.data) {
				setServerInfo(response.data);
				// 保存原始 JSON 数据用于显示
				setServerInfoRaw(JSON.stringify(response, null, 2));
				// 更新系统统计
				setSystemStats(prev => ({
					...prev,
					totalJobs: response.data?.jobs?.length || 0,
					executors: {
						total: response.data?.numExecutors || 0,
						busy: Math.floor((response.data?.numExecutors || 0) * 0.4) // 模拟忙碌执行器
					}
				}));
				toast.success("服务器信息获取成功");
			} else {
				handleError(response, response.message || "获取服务器信息失败");
				setServerInfoRaw(JSON.stringify(response, null, 2));
			}
		} catch (error: any) {
			handleError(error, "获取服务器信息失败");
			setServerInfoRaw(JSON.stringify({ error: error.message }, null, 2));
		} finally {
			setLoadingState("serverInfo", false);
		}
	}, [setLoadingState, handleError]);

	// 获取任务列表
	const fetchJobs = useCallback(async () => {
		setLoadingState("jobs", true);
		setError(null);
		try {
			const response = await jenkinsService.getJobs(2);
			if (response.status === "success" && response.data) {
				// 增强任务数据
				const enhancedJobs: EnhancedJenkinsJob[] = response.data.map(job => ({
					...job,
					isRunning: job.color?.includes("anime") || false,
					lastBuildDuration: job.lastBuild ? 
						`${Math.round((job.lastBuild.duration || 0) / 60000 * 10) / 10}分钟` : "未知",
					healthScore: job.healthReport?.[0]?.score || 0,
					description: `${job.name} 构建任务`
				}));

				setJobs(enhancedJobs);
				// 保存原始 JSON 数据用于显示
				setJobsRaw(JSON.stringify(response, null, 2));

				// 更新系统统计
				const activeBuilds = enhancedJobs.filter(job => job.isRunning).length;
				const successfulJobs = enhancedJobs.filter(job => 
					job.color === "blue" || job.color === "green"
				).length;
				const successRate = enhancedJobs.length > 0 ? 
					Math.round((successfulJobs / enhancedJobs.length) * 100 * 10) / 10 : 0;

				setSystemStats(prev => ({
					...prev,
					totalJobs: enhancedJobs.length,
					activeBuilds,
					successRate,
					averageBuildTime: "4.2分钟" // 可以从实际数据计算
				}));

				toast.success(`获取到 ${enhancedJobs.length} 个任务`);
			} else {
				handleError(response, response.message || "获取任务列表失败");
				setJobsRaw(JSON.stringify(response, null, 2));
			}
		} catch (error: any) {
			handleError(error, "获取任务列表失败");
			setJobsRaw(JSON.stringify({ error: error.message }, null, 2));
		} finally {
			setLoadingState("jobs", false);
		}
	}, [setLoadingState, handleError]);

	// 触发构建
	const triggerBuild = useCallback(async (jobName: string, parameters?: BuildParams) => {
		if (!jobName) {
			toast.error("请选择要构建的任务");
			return;
		}

		setLoadingState("build", true);
		try {
			const response = await jenkinsService.triggerBuild(jobName, parameters);
			if (response.status === "success") {
				toast.success(`任务 ${jobName} 构建已触发`);
				// 刷新任务列表和构建队列
				fetchJobs();
				fetchBuildQueue();
			} else {
				handleError(response, response.message || "触发构建失败");
			}
		} catch (error: any) {
			handleError(error, "触发构建失败");
		} finally {
			setLoadingState("build", false);
		}
	}, [setLoadingState, handleError, fetchJobs]);

	// 获取任务详情
	const fetchJobInfo = useCallback(async (jobName?: string) => {
		const targetJob = jobName || selectedJob;
		if (!targetJob) {
			toast.error("请先选择一个任务");
			return;
		}

		setLoadingState("jobInfo", true);
		try {
			const response = await jenkinsService.getJobInfo(targetJob, 2);
			if (response.status === "success" && response.data) {
				toast.success(`获取任务 "${targetJob}" 详情成功`);
				console.log("任务详情:", response.data);
				return response.data;
			} else {
				handleError(response, response.message || "获取任务详情失败");
			}
		} catch (error: any) {
			handleError(error, "获取任务详情失败");
		} finally {
			setLoadingState("jobInfo", false);
		}
	}, [selectedJob, setLoadingState, handleError]);

	// 获取构建详情
	const fetchBuildInfo = useCallback(async (jobName?: string, buildNum?: number) => {
		const targetJob = jobName || selectedJob;
		const targetBuildNumber = buildNum || buildNumber;

		if (!targetJob || !targetBuildNumber) {
			toast.error("请先选择任务和构建号");
			return;
		}

		setLoadingState("buildInfo", true);
		try {
			const response = await jenkinsService.getBuildInfo(targetJob, targetBuildNumber);
			if (response.status === "success" && response.data) {
				setBuildInfo(response.data);
				toast.success(`获取构建 #${targetBuildNumber} 详情成功`);
				return response.data;
			} else {
				handleError(response, response.message || "获取构建详情失败");
			}
		} catch (error: any) {
			handleError(error, "获取构建详情失败");
		} finally {
			setLoadingState("buildInfo", false);
		}
	}, [selectedJob, buildNumber, setLoadingState, handleError]);

	// 获取构建状态
	const fetchBuildStatus = useCallback(async (jobName?: string, buildNum?: number) => {
		const targetJob = jobName || selectedJob;
		const targetBuildNumber = buildNum || buildNumber;

		if (!targetJob || !targetBuildNumber) {
			toast.error("请先选择任务和构建号");
			return;
		}

		setLoadingState("buildStatus", true);
		try {
			const response = await jenkinsService.getBuildStatus(targetJob, targetBuildNumber);
			if (response.status === "success" && response.data) {
				setBuildStatus(response.data);
				return response.data;
			} else {
				handleError(response, response.message || "获取构建状态失败");
			}
		} catch (error: any) {
			handleError(error, "获取构建状态失败");
		} finally {
			setLoadingState("buildStatus", false);
		}
	}, [selectedJob, buildNumber, setLoadingState, handleError]);

	// 获取控制台输出
	const fetchConsoleOutput = useCallback(async (jobName?: string, buildNum?: number) => {
		const targetJob = jobName || selectedJob;
		const targetBuildNumber = buildNum || buildNumber;

		if (!targetJob || !targetBuildNumber) {
			toast.error("请先选择任务和构建号");
			return;
		}

		setLoadingState("console", true);
		try {
			const response = await jenkinsService.getBuildConsole(targetJob, targetBuildNumber);
			if (response.status === "success" && response.data) {
				setConsoleOutput(response.data);
				return response.data;
			} else {
				handleError(response, response.message || "获取控制台输出失败");
			}
		} catch (error: any) {
			handleError(error, "获取控制台输出失败");
		} finally {
			setLoadingState("console", false);
		}
	}, [selectedJob, buildNumber, setLoadingState, handleError]);

	// 获取Pipeline流程数据
	const fetchPipelineFlow = useCallback(async (jobName: string, buildNumber: number) => {
		setLoadingState("pipeline", true);
		try {
			// 模拟Pipeline数据 - 实际应该调用Jenkins Pipeline API
			const mockPipelineFlow: PipelineFlow = {
				jobName,
				buildNumber,
				status: "running",
				startTime: new Date().toISOString(),
				totalDuration: 0,
				stages: [
					{
						id: "checkout",
						name: "Checkout",
						status: "success",
						startTime: new Date(Date.now() - 300000).toISOString(),
						duration: 15000,
						logs: ["Checking out from Git repository..."]
					},
					{
						id: "build",
						name: "Build",
						status: "success",
						startTime: new Date(Date.now() - 285000).toISOString(),
						duration: 120000,
						logs: ["Building application...", "Compiling sources..."]
					},
					{
						id: "test",
						name: "Test",
						status: "running",
						startTime: new Date(Date.now() - 165000).toISOString(),
						estimatedDuration: 180000,
						logs: ["Running unit tests...", "Running integration tests..."]
					},
					{
						id: "package",
						name: "Package",
						status: "pending",
						logs: []
					},
					{
						id: "deploy",
						name: "Deploy",
						status: "pending",
						logs: []
					}
				]
			};

			setPipelineFlow(mockPipelineFlow);
			setSelectedPipeline({ jobName, buildNumber });
			toast.success(`获取Pipeline流程成功: ${jobName} #${buildNumber}`);
			return mockPipelineFlow;
		} catch (error: any) {
			handleError(error, "获取Pipeline流程失败");
		} finally {
			setLoadingState("pipeline", false);
		}
	}, [setLoadingState, handleError]);

	// 获取构建队列（模拟数据）
	const fetchBuildQueue = useCallback(async () => {
		setLoadingState("buildQueue", true);
		try {
			// 模拟构建队列数据
			const mockQueue: BuildQueueItem[] = [
				{
					jobName: "frontend-build",
					status: "running",
					progress: 65,
					startTime: "2分钟前",
					estimatedDuration: 180000
				},
				{
					jobName: "backend-test",
					status: "queued",
					progress: 0,
					startTime: "排队中"
				},
				{
					jobName: "deploy-staging",
					status: "queued",
					progress: 0,
					startTime: "排队中"
				}
			];
			setBuildQueue(mockQueue);
			
			// 更新队列长度统计
			setSystemStats(prev => ({
				...prev,
				queueLength: mockQueue.length
			}));
		} catch (error: any) {
			handleError(error, "获取构建队列失败");
		} finally {
			setLoadingState("buildQueue", false);
		}
	}, [setLoadingState, handleError]);

	// 获取构建历史（模拟数据）
	const fetchBuildHistory = useCallback(async () => {
		setLoadingState("buildHistory", true);
		try {
			// 模拟构建历史数据
			const mockHistory: BuildHistoryItem[] = [
				{
					jobName: "frontend-build",
					buildNumber: 145,
					status: "success",
					duration: "1.2分钟",
					timestamp: "5分钟前"
				},
				{
					jobName: "backend-deploy",
					buildNumber: 89,
					status: "success",
					duration: "3.1分钟",
					timestamp: "15分钟前"
				},
				{
					jobName: "test-automation",
					buildNumber: 234,
					status: "failed",
					duration: "2.8分钟",
					timestamp: "1小时前"
				},
				{
					jobName: "security-scan",
					buildNumber: 67,
					status: "unstable",
					duration: "8.5分钟",
					timestamp: "2小时前"
				},
				{
					jobName: "performance-test",
					buildNumber: 23,
					status: "success",
					duration: "12.3分钟",
					timestamp: "4小时前"
				}
			];
			setBuildHistory(mockHistory);
		} catch (error: any) {
			handleError(error, "获取构建历史失败");
		} finally {
			setLoadingState("buildHistory", false);
		}
	}, [setLoadingState, handleError]);

		// 发送企业微信告警
		const sendWechatAlert = useCallback(async (alert: Omit<AlertRecord, 'id' | 'timestamp' | 'acknowledged'>) => {
			if (!alertConfig.enabled || !alertConfig.wechatWebhook) {
				return;
			}

			try {
				// 构建企业微信消息格式
				const wechatMessage = {
					msgtype: "markdown",
					markdown: {
						content: `## 🚨 Jenkins 告警通知

**告警类型**: ${alert.type}
**严重程度**: ${alert.severity}
**告警标题**: ${alert.title}

**详细信息**:
${alert.message}

${alert.jobName ? `**任务名称**: ${alert.jobName}` : ''}
${alert.buildNumber ? `**构建号**: #${alert.buildNumber}` : ''}

**时间**: ${new Date().toLocaleString('zh-CN')}

---
> 请及时处理相关问题`
					}
				};

				// 发送到企业微信
				const response = await fetch(alertConfig.wechatWebhook, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(wechatMessage)
				});

				if (response.ok) {
					console.log('企业微信告警发送成功');
					toast.success('告警通知已发送到企业微信');
				} else {
					console.error('企业微信告警发送失败:', response.statusText);
					toast.error('企业微信告警发送失败');
				}
			} catch (error) {
				console.error('发送企业微信告警失败:', error);
				toast.error('发送企业微信告警失败');
			}
		}, [alertConfig]);

		// 创建告警记录
		const createAlert = useCallback(async (alertData: Omit<AlertRecord, 'id' | 'timestamp' | 'acknowledged'>) => {
			const newAlert: AlertRecord = {
				...alertData,
				id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				timestamp: new Date().toISOString(),
				acknowledged: false
			};

			// 添加到告警记录
			setAlertRecords(prev => [newAlert, ...prev]);
			setUnreadAlerts(prev => prev + 1);

			// 发送通知
			if (alertData.channels.includes('wechat')) {
				await sendWechatAlert(alertData);
			}

			return newAlert;
		}, [sendWechatAlert]);

		// 确认告警
		const acknowledgeAlert = useCallback((alertId: string) => {
			setAlertRecords(prev =>
				prev.map(alert =>
					alert.id === alertId
						? { ...alert, acknowledged: true }
						: alert
				)
			);
			setUnreadAlerts(prev => Math.max(0, prev - 1));
			toast.success('告警已确认');
		}, []);

		// 更新告警配置
		const updateAlertConfig = useCallback((newConfig: Partial<AlertConfig>) => {
			setAlertConfig(prev => ({ ...prev, ...newConfig }));
			toast.success('告警配置已更新');
		}, []);

	// 查找最新构建号
	const findLatestBuildNumber = useCallback(async (jobName: string) => {
		try {
			const response = await jenkinsService.getJobInfo(jobName, 2);
			if (response.status === "success" && response.data && response.data.lastBuild) {
				return response.data.lastBuild.number;
			}
		} catch (error) {
			console.error("获取最新构建号失败:", error);
		}
		return null;
	}, []);

	// 实时构建监控
	const startRealTimeMonitoring = useCallback(async (jobName: string, buildNum: number) => {
		setRealTimeBuildNumber(buildNum);
		setIsRealTimeBuilding(true);

		const pollInterval = setInterval(async () => {
			// 获取构建状态
			const status = await fetchBuildStatus(jobName, buildNum);

			// 获取控制台输出
			await fetchConsoleOutput(jobName, buildNum);

			// 如果构建完成，停止轮询
			if (status && !status.building) {
				clearInterval(pollInterval);
				setIsRealTimeBuilding(false);
				toast.success(`构建 #${buildNum} 已完成，状态: ${status.result}`);
				console.log("构建完成，停止实时监控");
			}
		}, 2000); // 每2秒轮询一次

		// 5分钟后自动停止轮询（防止无限轮询）
		setTimeout(() => {
			if (isRealTimeBuilding) {
				clearInterval(pollInterval);
				setIsRealTimeBuilding(false);
				toast.warning("实时监控已自动停止（超时5分钟）");
			}
		}, 5 * 60 * 1000);

		return pollInterval;
	}, [fetchBuildStatus, fetchConsoleOutput, isRealTimeBuilding]);

	// 触发实时构建
	const triggerRealTimeBuild = useCallback(async (jobName?: string, parameters?: BuildParams) => {
		const targetJob = jobName || selectedJob;
		if (!targetJob) {
			toast.error("请先选择一个任务");
			return;
		}

		setLoadingState("realTimeBuild", true);
		try {
			// 1. 先获取当前最新构建号作为基准
			const currentBuildNumber = await findLatestBuildNumber(targetJob);
			console.log("触发前最新构建号:", currentBuildNumber);

			// 2. 触发普通构建
			const response = await jenkinsService.triggerBuild(targetJob, parameters || buildParams);
			console.log("实时构建触发响应:", response);

			if (response.status === "success" && response.data) {
				const { job_name, queue_id } = response.data;
				toast.success(`任务 "${job_name}" 构建已触发，队列ID: ${queue_id}`);

				// 3. 轮询查找新的构建号
				let attempts = 0;
				const maxAttempts = 20; // 最多尝试20次（1分钟）

				const findNewBuildInterval = setInterval(async () => {
					attempts++;
					const latestBuildNumber = await findLatestBuildNumber(targetJob);

					console.log(`尝试 ${attempts}: 当前最新构建号 ${latestBuildNumber}, 基准构建号 ${currentBuildNumber}`);

					// 如果找到新的构建号，开始实时监控
					if (latestBuildNumber && latestBuildNumber > (currentBuildNumber || 0)) {
						clearInterval(findNewBuildInterval);
						setBuildNumber(latestBuildNumber);
						toast.success(`发现新构建 #${latestBuildNumber}，开始实时监控`);

						// 开始实时监控
						await startRealTimeMonitoring(job_name, latestBuildNumber);
						return;
					}

					// 超过最大尝试次数，停止查找
					if (attempts >= maxAttempts) {
						clearInterval(findNewBuildInterval);
						toast.warning("未能找到新的构建号，可能构建还在队列中等待");
						console.log("查找新构建号超时");
					}
				}, 3000); // 每3秒检查一次

			} else {
				handleError(response, response.message || "触发实时构建失败");
			}
		} catch (error: any) {
			handleError(error, "触发实时构建失败");
		} finally {
			setLoadingState("realTimeBuild", false);
		}
	}, [selectedJob, buildParams, setLoadingState, handleError, findLatestBuildNumber, startRealTimeMonitoring]);

	// 停止实时监控
	const stopRealTimeMonitoring = useCallback(() => {
		setIsRealTimeBuilding(false);
		setRealTimeBuildNumber(null);
		toast.info("已停止实时监控");
	}, []);

	// 过滤任务
	const filteredJobs = jobs.filter(job => {
		const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
							 job.fullname.toLowerCase().includes(searchQuery.toLowerCase());
		
		if (statusFilter === "all") return matchesSearch;
		
		const statusMap: Record<string, string[]> = {
			"success": ["blue", "green"],
			"failed": ["red"],
			"running": ["blue_anime", "red_anime", "yellow_anime"],
			"unstable": ["yellow"]
		};
		
		return matchesSearch && statusMap[statusFilter]?.includes(job.color);
	});

	// 初始化数据
	useEffect(() => {
		fetchServerInfo();
		fetchJobs();
		fetchBuildQueue();
		fetchBuildHistory();
	}, [fetchServerInfo, fetchJobs, fetchBuildQueue, fetchBuildHistory]);

	// 定期刷新数据
	useEffect(() => {
		const interval = setInterval(() => {
			fetchBuildQueue();
			fetchBuildHistory();
		}, 30000); // 每30秒刷新一次

		return () => clearInterval(interval);
	}, [fetchBuildQueue, fetchBuildHistory]);

	return {
		// 状态
		serverInfo,
		serverInfoRaw,
		jobs,
		jobsRaw,
		filteredJobs,
		selectedJob,
		buildParams,
		buildNumber,
		buildInfo,
		buildStatus,
		consoleOutput,
		buildQueue,
		buildHistory,
		systemStats,
		loading,
		error,
		searchQuery,
		statusFilter,
		isRealTimeBuilding,
		realTimeBuildNumber,

		// Pipeline 状态
		pipelineFlow,
		selectedPipeline,

		// 告警状态
		alertConfig,
		alertRecords,
		unreadAlerts,

		// 状态更新函数
		setSelectedJob,
		setBuildParams,
		setBuildNumber,
		setSearchQuery,
		setStatusFilter,

		// 操作函数
		fetchServerInfo,
		fetchJobs,
		fetchJobInfo,
		triggerBuild,
		fetchBuildInfo,
		fetchBuildStatus,
		fetchConsoleOutput,
		fetchBuildQueue,
		fetchBuildHistory,
		triggerRealTimeBuild,
		stopRealTimeMonitoring,

		// Pipeline 函数
		fetchPipelineFlow,

		// 告警函数
		createAlert,
		acknowledgeAlert,
		updateAlertConfig,
		sendWechatAlert,

		// 工具函数
		clearError: () => setError(null),
		refreshAll: () => {
			fetchServerInfo();
			fetchJobs();
			fetchBuildQueue();
			fetchBuildHistory();
		}
	};
}
