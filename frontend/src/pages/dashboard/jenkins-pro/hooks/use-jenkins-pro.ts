import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import jenkinsService, {
	type JenkinsJob,
	type JenkinsServerInfo,
	type BuildParams,
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

export function useJenkinsPro() {
	// 基础状态
	const [serverInfo, setServerInfo] = useState<JenkinsServerInfo | null>(null);
	const [jobs, setJobs] = useState<EnhancedJenkinsJob[]>([]);
	const [selectedJob, setSelectedJob] = useState<string>("");
	const [loading, setLoading] = useState<Record<string, boolean>>({});
	const [error, setError] = useState<string | null>(null);

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
			}
		} catch (error: any) {
			handleError(error, "获取服务器信息失败");
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
			}
		} catch (error: any) {
			handleError(error, "获取任务列表失败");
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
		jobs,
		filteredJobs,
		selectedJob,
		buildQueue,
		buildHistory,
		systemStats,
		loading,
		error,
		searchQuery,
		statusFilter,

		// 状态更新函数
		setSelectedJob,
		setSearchQuery,
		setStatusFilter,

		// 操作函数
		fetchServerInfo,
		fetchJobs,
		triggerBuild,
		fetchBuildQueue,
		fetchBuildHistory,

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
