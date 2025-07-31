import { useEffect } from "react";
import { useJenkins } from "./hooks/use-jenkins";
import JenkinsHeader from "./components/jenkins-header";
import RawDataDisplay from "./components/raw-data-display";
import JobList from "./components/job-list";
import OperationPanel from "./components/operation-panel";
import BuildStatusDisplay from "./components/build-status-display";
import BuildInfoDisplay from "./components/build-info-display";
import ConsoleOutputDisplay from "./components/console-output-display";

export default function Jenkins() {
	const {
		// 状态
		serverInfoRaw,
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
	} = useJenkins();

	// 页面加载时获取基础信息
	useEffect(() => {
		handleGetServerInfo();
		handleGetJobs();
	}, []);

	return (
		<div className="p-6 space-y-6">
			{/* 页面头部 */}
			<JenkinsHeader onGetServerInfo={handleGetServerInfo} onGetJobs={handleGetJobs} loading={loading} />

			{/* 原始数据显示 */}
			<RawDataDisplay serverInfoRaw={serverInfoRaw} jobsRaw={jobsRaw} />

			{/* 主要操作区域 */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* 任务列表 */}
				<JobList jobsRaw={jobsRaw} selectedJob={selectedJob} onJobSelect={setSelectedJob} />

				{/* 操作面板 */}
				<OperationPanel
					selectedJob={selectedJob}
					buildParams={buildParams}
					buildNumber={buildNumber}
					loading={loading}
					isRealTimeBuilding={isRealTimeBuilding}
					realTimeBuildNumber={realTimeBuildNumber}
					onJobChange={setSelectedJob}
					onBuildParamsChange={setBuildParams}
					onBuildNumberChange={setBuildNumber}
					onGetJobInfo={handleGetJobInfo}
					onTriggerBuild={handleTriggerBuild}

					onGetBuildInfo={handleGetBuildInfo}
					onGetBuildStatus={handleGetBuildStatus}
					onGetConsoleOutput={handleGetConsoleOutput}
					onTriggerRealTimeBuild={handleTriggerRealTimeBuild}
					onStopRealTimeMonitoring={handleStopRealTimeMonitoring}
				/>
			</div>

			{/* 构建状态显示 */}
			{buildStatus && <BuildStatusDisplay buildStatus={buildStatus} />}

			{/* 构建详情显示 */}
			{buildInfo && <BuildInfoDisplay buildInfo={buildInfo} />}

			{/* 控制台输出显示 */}
			{consoleOutput && <ConsoleOutputDisplay consoleOutput={consoleOutput} />}
		</div>
	);
}
