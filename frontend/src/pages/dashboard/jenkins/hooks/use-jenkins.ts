import { useState } from "react";
import { toast } from "sonner";
import jenkinsService, {
	type JenkinsJob,
	type JenkinsServerInfo,
	type BuildParams,
	type JenkinsBuild,
	type BuildStatus,
	type ConsoleOutput,
} from "@/api/services/jenkinsService";

export function useJenkins() {
	// 状态管理
	const [serverInfo, setServerInfo] = useState<JenkinsServerInfo | null>(null);
	const [serverInfoRaw, setServerInfoRaw] = useState<string>("");
	const [jobs, setJobs] = useState<JenkinsJob[]>([]);
	const [jobsRaw, setJobsRaw] = useState<string>("");
	const [selectedJob, setSelectedJob] = useState<string>("");
	const [buildParams, setBuildParams] = useState<BuildParams>({});
	const [buildNumber, setBuildNumber] = useState<number>(1);
	const [buildInfo, setBuildInfo] = useState<JenkinsBuild | null>(null);
	const [buildStatus, setBuildStatus] = useState<BuildStatus | null>(null);
	const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput | null>(null);
	const [loading, setLoading] = useState<Record<string, boolean>>({});
	const [isRealTimeBuilding, setIsRealTimeBuilding] = useState<boolean>(false);
	const [realTimeBuildNumber, setRealTimeBuildNumber] = useState<number | null>(null);

	// 设置加载状态
	const setLoadingState = (key: string, value: boolean) => {
		setLoading((prev) => ({ ...prev, [key]: value }));
	};

	// 获取服务器信息
	const handleGetServerInfo = async () => {
		console.log("获取服务器信息");
		setLoadingState("serverInfo", true);
		try {
			const response = await jenkinsService.getServerInfo();
			console.log("服务器信息:", response);

			if (response.status === "success" && response.data) {
				setServerInfo(response.data);
				// 保存原始 JSON 数据用于显示
				setServerInfoRaw(JSON.stringify(response, null, 2));
				toast.success("获取服务器信息成功");
			} else {
				toast.error(response.message || "获取服务器信息失败");
				setServerInfoRaw(JSON.stringify(response, null, 2));
			}
		} catch (error: any) {
			console.error("获取服务器信息失败:", error);
			setServerInfoRaw(JSON.stringify({ error: error.message }, null, 2));
		} finally {
			setLoadingState("jobs", false);
		}
	};

	// 获取任务列表
	const handleGetJobs = async () => {
		console.log("获取任务列表");
		setLoadingState("jobs", true);
		try {
			const response = await jenkinsService.getJobs(2);
			console.log("任务列表:", response);
			if (response.status === "success" && response.data) {
				setJobs(response.data);
				// 保存原始 JSON 数据用于显示
				setJobsRaw(JSON.stringify(response, null, 2));
				toast.success(`获取到 ${response.count || response.data.length} 个任务`);
			} else {
				toast.error(response.message || "获取任务列表失败");
				setJobsRaw(JSON.stringify(response, null, 2));
			}
		} catch (error: any) {
			console.error("获取任务列表失败:", error);
			setJobsRaw(JSON.stringify({ error: error.message }, null, 2));
		} finally {
			setLoadingState("serverInfo", false);
		}
	};

	// 获取任务详情
	const handleGetJobInfo = async () => {
		if (!selectedJob) {
			toast.error("请先选择一个任务");
			return;
		}

		setLoadingState("jobInfo", true);
		try {
			const response = await jenkinsService.getJobInfo(selectedJob, 2);
			if (response.status === "success" && response.data) {
				toast.success(`获取任务 "${selectedJob}" 详情成功`);
				console.log("任务详情:", response.data);
			} else {
				toast.error(response.message || "获取任务详情失败");
			}
		} catch (error) {
			toast.error("获取任务详情失败");
			console.error("获取任务详情失败:", error);
		} finally {
			setLoadingState("jobInfo", false);
		}
	};

	// 触发构建
	const handleTriggerBuild = async () => {
		if (!selectedJob) {
			toast.error("请先选择一个任务");
			return;
		}

		setLoadingState("build", true);
		try {
			const response = await jenkinsService.triggerBuild(selectedJob, buildParams);
			console.log("构建触发完整响应:", response);
			if (response.status === "success" && response.data) {
				const { job_name, queue_id, parameters } = response.data;
				toast.success(`任务 "${job_name}" 构建已触发，队列ID: ${queue_id}`);

				// 显示构建参数信息（如果有的话）
				if (parameters?.parameters && Object.keys(parameters.parameters).length > 0) {
					console.log("构建参数:", parameters.parameters);
				}

				console.log("构建触发响应:", {
					任务名称: job_name,
					队列ID: queue_id,
					构建参数: parameters?.parameters || {}
				});
			} else {
				toast.error(response.message || "触发构建失败");
			}
		} catch (error: any) {
			toast.error("触发构建失败");
			console.error("触发构建失败:", error);
		} finally {
			setLoadingState("build", false);
		}
	};



	// 获取构建详情
	const handleGetBuildInfo = async () => {
		if (!selectedJob || !buildNumber) {
			toast.error("请先选择任务和构建号");
			return;
		}

		setLoadingState("buildInfo", true);
		try {
			const response = await jenkinsService.getBuildInfo(selectedJob, buildNumber);
			if (response.status === "success" && response.data) {
				setBuildInfo(response.data);
				toast.success(`获取构建 #${buildNumber} 详情成功`);
			} else {
				toast.error(response.message || "获取构建详情失败");
			}
		} catch (error) {
			toast.error("获取构建详情失败");
			console.error("获取构建详情失败:", error);
		} finally {
			setLoadingState("buildInfo", false);
		}
	};

	// 获取构建状态
	const handleGetBuildStatus = async () => {
		if (!selectedJob || !buildNumber) {
			toast.error("请先选择任务和构建号");
			return;
		}

		setLoadingState("buildStatus", true);
		try {
			const response = await jenkinsService.getBuildStatus(selectedJob, buildNumber);
			if (response.status === "success" && response.data) {
				setBuildStatus(response.data);
				toast.success(`获取构建 #${buildNumber} 状态成功`);
			} else {
				toast.error(response.message || "获取构建状态失败");
			}
		} catch (error) {
			toast.error("获取构建状态失败");
			console.error("获取构建状态失败:", error);
		} finally {
			setLoadingState("buildStatus", false);
		}
	};

	// 获取控制台输出
	const handleGetConsoleOutput = async () => {
		if (!selectedJob || !buildNumber) {
			toast.error("请先选择任务和构建号");
			return;
		}

		setLoadingState("console", true);
		try {
			const response = await jenkinsService.getBuildConsole(selectedJob, buildNumber);
			if (response.status === "success" && response.data) {
				setConsoleOutput(response.data);
				toast.success(`获取构建 #${buildNumber} 控制台输出成功`);
			} else {
				toast.error(response.message || "获取控制台输出失败");
			}
		} catch (error) {
			toast.error("获取控制台输出失败");
			console.error("获取控制台输出失败:", error);
		} finally {
			setLoadingState("console", false);
		}
	};

	// 查找最新构建号（通过任务信息）
	const findLatestBuildNumber = async (jobName: string) => {
		try {
			const response = await jenkinsService.getJobInfo(jobName, 2);
			if (response.status === "success" && response.data && response.data.lastBuild) {
				return response.data.lastBuild.number;
			}
		} catch (error) {
			console.error("获取最新构建号失败:", error);
		}
		return null;
	};

	// 实时获取控制台输出（内部方法）
	const getRealTimeConsoleOutput = async (jobName: string, buildNum: number) => {
		try {
			const response = await jenkinsService.getBuildConsole(jobName, buildNum);
			if (response.status === "success" && response.data) {
				setConsoleOutput(response.data);
				return response.data;
			}
		} catch (error) {
			console.error("获取实时控制台输出失败:", error);
		}
		return null;
	};

	// 检查构建状态（内部方法）
	const checkBuildStatus = async (jobName: string, buildNum: number) => {
		try {
			const response = await jenkinsService.getBuildStatus(jobName, buildNum);
			if (response.status === "success" && response.data) {
				setBuildStatus(response.data);
				return response.data;
			}
		} catch (error) {
			console.error("检查构建状态失败:", error);
		}
		return null;
	};

	// 实时构建监控
	const startRealTimeMonitoring = async (jobName: string, buildNum: number) => {
		setRealTimeBuildNumber(buildNum);
		setIsRealTimeBuilding(true);

		const pollInterval = setInterval(async () => {
			// 获取构建状态
			const status = await checkBuildStatus(jobName, buildNum);

			// 获取控制台输出
			await getRealTimeConsoleOutput(jobName, buildNum);

			// 如果构建完成，停止轮询
			if (status && !status.building) {
				clearInterval(pollInterval);
				setIsRealTimeBuilding(false);
				toast.success(`构建 #${buildNum} 已完成，状态: ${status.result}`);
				console.log("构建完成，停止实时监控");
			}
		}, 1000); // 每1秒轮询一次

		// 5分钟后自动停止轮询（防止无限轮询）
		setTimeout(() => {
			if (isRealTimeBuilding) {
				clearInterval(pollInterval);
				setIsRealTimeBuilding(false);
				toast.warning("实时监控已自动停止（超时5分钟）");
			}
		}, 5 * 60 * 1000);

		return pollInterval;
	};

	// 触发实时构建
	const handleTriggerRealTimeBuild = async () => {
		if (!selectedJob) {
			toast.error("请先选择一个任务");
			return;
		}

		setLoadingState("realTimeBuild", true);
		try {
			// 1. 先获取当前最新构建号作为基准
			const currentBuildNumber = await findLatestBuildNumber(selectedJob);
			console.log("触发前最新构建号:", currentBuildNumber);

			// 2. 触发普通构建
			const response = await jenkinsService.triggerBuild(selectedJob, buildParams);
			console.log("实时构建触发响应:", response);

			if (response.status === "success" && response.data) {
				const { job_name, queue_id } = response.data;
				toast.success(`任务 "${job_name}" 构建已触发，队列ID: ${queue_id}`);

				// 3. 轮询查找新的构建号
				let attempts = 0;
				const maxAttempts = 20; // 最多尝试20次（1分钟）

				const findNewBuildInterval = setInterval(async () => {
					attempts++;
					const latestBuildNumber = await findLatestBuildNumber(selectedJob);

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
				toast.error(response.message || "触发实时构建失败");
			}
		} catch (error: any) {
			toast.error("触发实时构建失败");
			console.error("触发实时构建失败:", error);
		} finally {
			setLoadingState("realTimeBuild", false);
		}
	};

	// 停止实时监控
	const handleStopRealTimeMonitoring = () => {
		setIsRealTimeBuilding(false);
		setRealTimeBuildNumber(null);
		toast.info("已停止实时监控");
	};

	return {
		// 状态
		serverInfo,
		serverInfoRaw,
		jobs,
		jobsRaw,
		selectedJob,
		buildParams,
		buildNumber,
		buildInfo,
		buildStatus,
		consoleOutput,
		loading,
		isRealTimeBuilding,
		realTimeBuildNumber,

		// 状态更新函数
		setSelectedJob,
		setBuildParams,
		setBuildNumber,

		// 操作函数
		handleGetServerInfo,
		handleGetJobs,
		handleGetJobInfo,
		handleTriggerBuild,
		handleGetBuildInfo,
		handleGetBuildStatus,
		handleGetConsoleOutput,
		handleTriggerRealTimeBuild,
		handleStopRealTimeMonitoring,
	};
}
