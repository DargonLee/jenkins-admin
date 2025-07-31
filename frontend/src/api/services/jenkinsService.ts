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

// Jenkins API 端点枚举
export enum JenkinsApi {
	// 基础信息
	Info = "/jenkins/info",
	Jobs = "/jenkins/jobs",

	// 任务相关
	JobInfo = "/jenkins/job/{jobName}",

	// 构建相关
	Build = "/jenkins/build/{jobName}",
	BuildInfo = "/jenkins/build/{jobName}/{buildNumber}",
	BuildConsole = "/jenkins/build/{jobName}/{buildNumber}/console",
	BuildStatus = "/jenkins/build/{jobName}/{buildNumber}/status",
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

export default {
	getServerInfo,
	getJobs,
	getJobInfo,
	triggerBuild,
	getBuildInfo,
	getBuildConsole,
	getBuildStatus,
};
