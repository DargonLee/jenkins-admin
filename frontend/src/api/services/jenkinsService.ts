import apiClient from "../apiClient";

// API 响应基础接口
export interface ApiResponse<T = any> {
	status: "success" | "error";
	data?: T;
	message?: string;
	error?: string;
	timestamp?: number;
	count?: number;
	suggestion?: string;
}

// Jenkins 任务信息接口
export interface JenkinsJob {
	_class: string;
	name: string;
	url: string;
	color: string;
	fullname: string;
	buildable?: boolean;
	lastBuild?: {
		number: number;
		url: string;
		timestamp: number;
		result: string;
		duration: number;
	};
	healthReport?: Array<{
		description: string;
		iconClassName: string;
		iconUrl: string;
		score: number;
	}>;
}

// Jenkins 构建信息接口
export interface JenkinsBuild {
	id?: string;
	number: number;
	url: string;
	result: string;
	timestamp: number;
	duration: number;
	building: boolean;
	description?: string;
	displayName: string;
	fullDisplayName: string;
	estimatedDuration?: number;
	changeSet?: {
		items: Array<{
			commitId: string;
			msg: string;
			author: {
				fullName: string;
			};
			timestamp: number;
		}>;
	};
}

// Jenkins 服务器信息接口
export interface JenkinsServerInfo {
	_class: string;
	assignedLabels: Array<{
		name: string;
	}>;
	mode: string;
	nodeDescription: string;
	nodeName: string;
	numExecutors: number;
	description: string | null;
	jobs: Array<{
		_class: string;
		name: string;
		url: string;
		color: string;
	}>;
	overallLoad: object;
	primaryView: {
		_class: string;
		name: string;
		url: string;
	};
	quietDownReason: string | null;
	quietingDown: boolean;
	slaveAgentPort: number;
	unlabeledLoad: {
		_class: string;
	};
	url: string;
	useCrumbs: boolean;
	useSecurity: boolean;
	views: Array<{
		_class: string;
		name: string;
		url: string;
	}>;
	version?: string;
}

// 构建参数接口
export interface BuildParams {
	[key: string]: string | number | boolean;
}

// 构建状态接口
export interface BuildStatus {
	job_name: string;
	build_number: number;
	building: boolean;
	result: string;
	duration: number;
	timestamp: number;
	url: string;
	estimated_duration: number;
}

// 构建触发响应接口
export interface BuildTriggerResponse {
	job_name: string;
	queue_id: number;
	parameters: {
		parameters: BuildParams;
	};
	build_number?: number;
	status?: "queued" | "started";
	building?: boolean;
	estimated_duration?: number;
}

// 控制台输出接口
export interface ConsoleOutput {
	job_name: string;
	build_number: number;
	console_output: string;
	output_length: number;
}

// Pipeline阶段接口
export interface PipelineStageInfo {
	id: string;
	name: string;
	status: "SUCCESS" | "FAILED" | "IN_PROGRESS" | "NOT_EXECUTED" | "ABORTED" | "UNSTABLE";
	startTimeMillis?: number;
	durationMillis?: number;
	pauseDurationMillis?: number;
	stageFlowNodes?: Array<{
		id: string;
		name: string;
		status: string;
		startTimeMillis: number;
		durationMillis: number;
		log?: string;
	}>;
}

// Pipeline运行信息接口
export interface PipelineRunInfo {
	id: string;
	name: string;
	status: "SUCCESS" | "FAILED" | "IN_PROGRESS" | "NOT_EXECUTED" | "ABORTED";
	startTimeMillis: number;
	endTimeMillis?: number;
	durationMillis: number;
	estimatedDurationMillis?: number;
	stages: PipelineStageInfo[];
}

// 构建队列项接口
export interface QueueItem {
	id: number;
	task: {
		name: string;
		url: string;
		color: string;
	};
	stuck: boolean;
	blocked: boolean;
	buildable: boolean;
	pending: boolean;
	inQueueSince: number;
	params?: string;
	why?: string;
	buildableStartMilliseconds?: number;
}

// 构建队列响应接口
export interface BuildQueueResponse {
	items: QueueItem[];
}

// Jenkins节点信息接口
export interface JenkinsNode {
	displayName: string;
	description: string;
	numExecutors: number;
	mode: string;
	offline: boolean;
	temporarilyOffline: boolean;
	offlineCause?: {
		description: string;
	};
	oneOffExecutors: Array<any>;
	monitorData: {
		"hudson.node_monitors.SwapSpaceMonitor"?: {
			availableSwapSpace: number;
			totalSwapSpace: number;
		};
		"hudson.node_monitors.TemporarySpaceMonitor"?: {
			size: number;
		};
		"hudson.node_monitors.DiskSpaceMonitor"?: {
			size: number;
		};
		"hudson.node_monitors.ArchitectureMonitor"?: string;
		"hudson.node_monitors.ResponseTimeMonitor"?: {
			average: number;
		};
		"hudson.node_monitors.ClockMonitor"?: {
			diff: number;
		};
	};
}

// 任务参数定义接口
export interface JobParameterDefinition {
	name: string;
	type: string;
	description?: string;
	defaultParameterValue?: {
		value: string | boolean;
	};
	choices?: string[];
}

// 任务配置信息接口
export interface JobConfigInfo {
	name: string;
	displayName: string;
	description: string;
	buildable: boolean;
	parameterDefinitions?: JobParameterDefinition[];
	scm?: {
		branches: Array<{
			name: string;
		}>;
		userRemoteConfigs: Array<{
			url: string;
		}>;
	};
}

// 系统信息接口
export interface SystemInfo {
	systemProperties: Record<string, string>;
	environmentVariables: Record<string, string>;
}

// 插件信息接口
export interface PluginInfo {
	shortName: string;
	longName: string;
	version: string;
	enabled: boolean;
	active: boolean;
	hasUpdate: boolean;
	url?: string;
}

// Jenkins API 端点枚举
export enum JenkinsApi {
	// 基础信息
	Info = "/jenkins/info",
	Jobs = "/jenkins/jobs",
	Queue = "/jenkins/queue",
	Nodes = "/jenkins/computer",
	SystemInfo = "/jenkins/systemInfo",
	Plugins = "/jenkins/pluginManager/plugins",

	// 任务相关
	JobInfo = "/jenkins/job/{jobName}",
	JobConfig = "/jenkins/job/{jobName}/config",
	JobParameters = "/jenkins/job/{jobName}/api/json?tree=property[parameterDefinitions[name,type,description,defaultParameterValue,choices]]",
	JobBuilds = "/jenkins/job/{jobName}/api/json?tree=builds[number,timestamp,result,duration,building]",
	JobLastBuild = "/jenkins/job/{jobName}/lastBuild/api/json",
	JobCreate = "/jenkins/createItem",
	JobDelete = "/jenkins/job/{jobName}/doDelete",
	JobEnable = "/jenkins/job/{jobName}/enable",
	JobDisable = "/jenkins/job/{jobName}/disable",

	// 构建相关
	Build = "/jenkins/build/{jobName}",
	BuildInfo = "/jenkins/build/{jobName}/{buildNumber}",
	BuildConsole = "/jenkins/build/{jobName}/{buildNumber}/console",
	BuildStatus = "/jenkins/build/{jobName}/{buildNumber}/status",
	BuildStop = "/jenkins/build/{jobName}/{buildNumber}/stop",
	BuildReplay = "/jenkins/build/{jobName}/{buildNumber}/replay",

	// Pipeline相关
	PipelineRun = "/jenkins/job/{jobName}/{buildNumber}/wfapi/describe",
	PipelineStages = "/jenkins/job/{jobName}/{buildNumber}/execution/node/{nodeId}/wfapi/log",
	PipelineLog = "/jenkins/job/{jobName}/{buildNumber}/wfapi/log",

	// 节点管理
	NodeInfo = "/jenkins/computer/{nodeName}",
	NodeOnline = "/jenkins/computer/{nodeName}/toggleOffline",
	NodeDelete = "/jenkins/computer/{nodeName}/doDelete",

	// 用户管理
	Users = "/jenkins/people",
	UserInfo = "/jenkins/user/{username}",
	CurrentUser = "/jenkins/me",

	// 视图管理
	Views = "/jenkins/api/json?tree=views[name,url]",
	ViewInfo = "/jenkins/view/{viewName}",
	ViewCreate = "/jenkins/createView",
	ViewDelete = "/jenkins/view/{viewName}/doDelete",
}

// 获取 Jenkins 服务器信息
const getServerInfo = () =>
	apiClient.get<ApiResponse<JenkinsServerInfo>>({
		url: JenkinsApi.Info,
	});

// 获取所有任务列表
const getJobs = (depth: number = 1) =>
	apiClient.get<ApiResponse<JenkinsJob[]>>({
		url: JenkinsApi.Jobs,
		params: { depth },
	});

// 获取指定任务信息
const getJobInfo = (jobName: string, depth: number = 1) =>
	apiClient.get<ApiResponse<JenkinsJob>>({
		url: JenkinsApi.JobInfo.replace("{jobName}", jobName),
		params: { depth },
	});

// 触发构建
const triggerBuild = (jobName: string, parameters?: BuildParams) =>
	apiClient.post<ApiResponse<BuildTriggerResponse>>({
		url: JenkinsApi.Build.replace("{jobName}", jobName),
		data: { parameters },
	});

// 获取构建详情
const getBuildInfo = (jobName: string, buildNumber: number) =>
	apiClient.get<ApiResponse<JenkinsBuild>>({
		url: JenkinsApi.BuildInfo.replace("{jobName}", jobName).replace("{buildNumber}", buildNumber.toString()),
	});

// 获取构建控制台输出
const getBuildConsole = (jobName: string, buildNumber: number) =>
	apiClient.get<ApiResponse<ConsoleOutput>>({
		url: JenkinsApi.BuildConsole.replace("{jobName}", jobName).replace("{buildNumber}", buildNumber.toString()),
	});

// 获取构建状态
const getBuildStatus = (jobName: string, buildNumber: number) =>
	apiClient.get<ApiResponse<BuildStatus>>({
		url: JenkinsApi.BuildStatus.replace("{jobName}", jobName).replace("{buildNumber}", buildNumber.toString()),
	});

// ==================== 新增API函数 ====================

// 获取构建队列
const getBuildQueue = () =>
	apiClient.get<ApiResponse<BuildQueueResponse>>({
		url: JenkinsApi.Queue,
	});

// 获取任务参数定义
const getJobParameters = (jobName: string) =>
	apiClient.get<ApiResponse<JobConfigInfo>>({
		url: JenkinsApi.JobParameters.replace("{jobName}", jobName),
	});

// 获取任务构建历史
const getJobBuilds = (jobName: string, limit: number = 10) =>
	apiClient.get<ApiResponse<{ builds: JenkinsBuild[] }>>({
		url: JenkinsApi.JobBuilds.replace("{jobName}", jobName),
		params: { limit },
	});

// 获取Pipeline运行信息
const getPipelineRun = (jobName: string, buildNumber: number) =>
	apiClient.get<ApiResponse<PipelineRunInfo>>({
		url: JenkinsApi.PipelineRun.replace("{jobName}", jobName).replace("{buildNumber}", buildNumber.toString()),
	});

// 获取Pipeline日志
const getPipelineLog = (jobName: string, buildNumber: number) =>
	apiClient.get<ApiResponse<{ text: string }>>({
		url: JenkinsApi.PipelineLog.replace("{jobName}", jobName).replace("{buildNumber}", buildNumber.toString()),
	});

// 停止构建
const stopBuild = (jobName: string, buildNumber: number) =>
	apiClient.post<ApiResponse<{ message: string }>>({
		url: JenkinsApi.BuildStop.replace("{jobName}", jobName).replace("{buildNumber}", buildNumber.toString()),
	});

// 获取所有节点信息
const getNodes = () =>
	apiClient.get<ApiResponse<{ computer: JenkinsNode[] }>>({
		url: JenkinsApi.Nodes,
	});

// 获取特定节点信息
const getNodeInfo = (nodeName: string) =>
	apiClient.get<ApiResponse<JenkinsNode>>({
		url: JenkinsApi.NodeInfo.replace("{nodeName}", nodeName),
	});

// 切换节点在线/离线状态
const toggleNodeOffline = (nodeName: string, offlineMessage?: string) =>
	apiClient.post<ApiResponse<{ message: string }>>({
		url: JenkinsApi.NodeOnline.replace("{nodeName}", nodeName),
		data: { offlineMessage },
	});

// 获取系统信息
const getSystemInfo = () =>
	apiClient.get<ApiResponse<SystemInfo>>({
		url: JenkinsApi.SystemInfo,
	});

// 获取插件信息
const getPlugins = () =>
	apiClient.get<ApiResponse<{ plugins: PluginInfo[] }>>({
		url: JenkinsApi.Plugins,
	});

// 创建任务
const createJob = (jobName: string, configXml: string) =>
	apiClient.post<ApiResponse<{ message: string }>>({
		url: JenkinsApi.JobCreate,
		params: { name: jobName },
		data: configXml,
		headers: { 'Content-Type': 'application/xml' },
	});

// 删除任务
const deleteJob = (jobName: string) =>
	apiClient.post<ApiResponse<{ message: string }>>({
		url: JenkinsApi.JobDelete.replace("{jobName}", jobName),
	});

// 启用任务
const enableJob = (jobName: string) =>
	apiClient.post<ApiResponse<{ message: string }>>({
		url: JenkinsApi.JobEnable.replace("{jobName}", jobName),
	});

// 禁用任务
const disableJob = (jobName: string) =>
	apiClient.post<ApiResponse<{ message: string }>>({
		url: JenkinsApi.JobDisable.replace("{jobName}", jobName),
	});

// 获取当前用户信息
const getCurrentUser = () =>
	apiClient.get<ApiResponse<{ id: string; fullName: string; description: string }>>({
		url: JenkinsApi.CurrentUser,
	});

// 获取所有用户
const getUsers = () =>
	apiClient.get<ApiResponse<{ users: Array<{ user: { id: string; fullName: string } }> }>>({
		url: JenkinsApi.Users,
	});

export default {
	// 原有API
	getServerInfo,
	getJobs,
	getJobInfo,
	triggerBuild,
	getBuildInfo,
	getBuildConsole,
	getBuildStatus,

	// 新增API - 构建和队列管理
	getBuildQueue,
	getJobBuilds,
	stopBuild,

	// 新增API - Pipeline相关
	getPipelineRun,
	getPipelineLog,

	// 新增API - 任务管理
	getJobParameters,
	createJob,
	deleteJob,
	enableJob,
	disableJob,

	// 新增API - 节点管理
	getNodes,
	getNodeInfo,
	toggleNodeOffline,

	// 新增API - 系统信息
	getSystemInfo,
	getPlugins,

	// 新增API - 用户管理
	getCurrentUser,
	getUsers,
};
