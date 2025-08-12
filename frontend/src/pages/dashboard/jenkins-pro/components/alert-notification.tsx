import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { Separator } from "@/ui/separator";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { 
	Bell, 
	BellRing, 
	CheckCircle, 
	XCircle, 
	AlertTriangle,
	Clock,
	Settings,
	MessageSquare,
	Mail,
	Trash2
} from "lucide-react";
import { AlertRecord, AlertConfig } from "../hooks/use-jenkins-pro";

// 告警严重程度配置
const severityConfig = {
	low: { 
		color: "bg-blue-500", 
		textColor: "text-blue-700",
		bgColor: "bg-blue-50",
		borderColor: "border-blue-200",
		badge: "default" as const,
		icon: <Bell className="w-4 h-4" />
	},
	medium: { 
		color: "bg-yellow-500", 
		textColor: "text-yellow-700",
		bgColor: "bg-yellow-50",
		borderColor: "border-yellow-200",
		badge: "secondary" as const,
		icon: <AlertTriangle className="w-4 h-4" />
	},
	high: { 
		color: "bg-orange-500", 
		textColor: "text-orange-700",
		bgColor: "bg-orange-50",
		borderColor: "border-orange-200",
		badge: "destructive" as const,
		icon: <XCircle className="w-4 h-4" />
	},
	critical: { 
		color: "bg-red-500", 
		textColor: "text-red-700",
		bgColor: "bg-red-50",
		borderColor: "border-red-200",
		badge: "destructive" as const,
		icon: <XCircle className="w-4 h-4" />
	}
};

// 告警类型配置
const alertTypeConfig = {
	build_failure: { label: "构建失败", icon: <XCircle className="w-4 h-4" /> },
	long_running: { label: "构建超时", icon: <Clock className="w-4 h-4" /> },
	resource_threshold: { label: "资源告警", icon: <AlertTriangle className="w-4 h-4" /> },
	success_rate: { label: "成功率告警", icon: <AlertTriangle className="w-4 h-4" /> }
};

// 告警中心组件
export function AlertCenter({ 
	alertRecords, 
	unreadAlerts, 
	onAcknowledge, 
	onClearAll 
}: {
	alertRecords: AlertRecord[];
	unreadAlerts: number;
	onAcknowledge: (alertId: string) => void;
	onClearAll: () => void;
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<BellRing className="w-5 h-5" />
							告警中心
							{unreadAlerts > 0 && (
								<Badge variant="destructive" className="ml-2">
									{unreadAlerts}
								</Badge>
							)}
						</CardTitle>
						<CardDescription>系统告警和通知记录</CardDescription>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={onClearAll}>
							<Trash2 className="w-4 h-4 mr-2" />
							清空已读
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{alertRecords.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p>暂无告警记录</p>
					</div>
				) : (
					<ScrollArea className="h-96">
						<div className="space-y-3">
							{alertRecords.map((alert) => (
								<AlertItem 
									key={alert.id} 
									alert={alert}
									onAcknowledge={() => onAcknowledge(alert.id)}
								/>
							))}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}

// 告警项组件
function AlertItem({ 
	alert, 
	onAcknowledge 
}: {
	alert: AlertRecord;
	onAcknowledge: () => void;
}) {
	const severityConf = severityConfig[alert.severity];
	const typeConf = alertTypeConfig[alert.type];
	
	return (
		<div 
			className={`
				p-4 rounded-lg border transition-all
				${alert.acknowledged ? 'opacity-60' : ''}
				${severityConf.bgColor} ${severityConf.borderColor}
			`}
		>
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-3 flex-1">
					<div className={severityConf.textColor}>
						{severityConf.icon}
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-1">
							<p className="font-medium">{alert.title}</p>
							<Badge variant={severityConf.badge} className="text-xs">
								{alert.severity.toUpperCase()}
							</Badge>
							<div className="flex items-center gap-1 text-xs text-muted-foreground">
								{typeConf.icon}
								<span>{typeConf.label}</span>
							</div>
						</div>
						<p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
						
						{/* 任务信息 */}
						{(alert.jobName || alert.buildNumber) && (
							<div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
								{alert.jobName && <span>任务: {alert.jobName}</span>}
								{alert.buildNumber && <span>构建: #{alert.buildNumber}</span>}
							</div>
						)}
						
						{/* 通知渠道 */}
						<div className="flex items-center gap-2 mb-2">
							{alert.channels.map((channel) => (
								<Badge key={channel} variant="outline" className="text-xs">
									{channel === 'wechat' ? (
										<>
											<MessageSquare className="w-3 h-3 mr-1" />
											企业微信
										</>
									) : (
										<>
											<Mail className="w-3 h-3 mr-1" />
											邮件
										</>
									)}
								</Badge>
							))}
						</div>
						
						<p className="text-xs text-muted-foreground">
							{new Date(alert.timestamp).toLocaleString('zh-CN')}
						</p>
					</div>
				</div>
				
				<div className="flex items-center gap-2">
					{alert.acknowledged ? (
						<div className="flex items-center gap-1 text-green-600 text-xs">
							<CheckCircle className="w-3 h-3" />
							已确认
						</div>
					) : (
						<Button variant="outline" size="sm" onClick={onAcknowledge}>
							<CheckCircle className="w-3 h-3 mr-1" />
							确认
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

// 告警配置组件
export function AlertConfiguration({ 
	alertConfig, 
	onUpdateConfig 
}: {
	alertConfig: AlertConfig;
	onUpdateConfig: (config: Partial<AlertConfig>) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="w-5 h-5" />
					告警配置
				</CardTitle>
				<CardDescription>配置告警规则和通知方式</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 总开关 */}
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium">启用告警</p>
						<p className="text-sm text-muted-foreground">开启或关闭所有告警功能</p>
					</div>
					<Switch 
						checked={alertConfig.enabled}
						onCheckedChange={(enabled) => onUpdateConfig({ enabled })}
					/>
				</div>
				
				<Separator />
				
				{/* 告警类型配置 */}
				<div className="space-y-4">
					<h4 className="font-medium">告警类型</h4>
					
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<XCircle className="w-4 h-4 text-red-500" />
								<div>
									<p className="text-sm font-medium">构建失败告警</p>
									<p className="text-xs text-muted-foreground">构建失败时发送告警</p>
								</div>
							</div>
							<Switch 
								checked={alertConfig.buildFailureAlert}
								onCheckedChange={(buildFailureAlert) => onUpdateConfig({ buildFailureAlert })}
								disabled={!alertConfig.enabled}
							/>
						</div>
						
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Clock className="w-4 h-4 text-yellow-500" />
								<div>
									<p className="text-sm font-medium">构建超时告警</p>
									<p className="text-xs text-muted-foreground">构建时间超过阈值时发送告警</p>
								</div>
							</div>
							<Switch 
								checked={alertConfig.longRunningBuildAlert}
								onCheckedChange={(longRunningBuildAlert) => onUpdateConfig({ longRunningBuildAlert })}
								disabled={!alertConfig.enabled}
							/>
						</div>
						
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<AlertTriangle className="w-4 h-4 text-orange-500" />
								<div>
									<p className="text-sm font-medium">资源告警</p>
									<p className="text-xs text-muted-foreground">系统资源使用率过高时发送告警</p>
								</div>
							</div>
							<Switch 
								checked={alertConfig.resourceThresholdAlert}
								onCheckedChange={(resourceThresholdAlert) => onUpdateConfig({ resourceThresholdAlert })}
								disabled={!alertConfig.enabled}
							/>
						</div>
						
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<AlertTriangle className="w-4 h-4 text-blue-500" />
								<div>
									<p className="text-sm font-medium">成功率告警</p>
									<p className="text-xs text-muted-foreground">构建成功率低于阈值时发送告警</p>
								</div>
							</div>
							<Switch 
								checked={alertConfig.successRateAlert}
								onCheckedChange={(successRateAlert) => onUpdateConfig({ successRateAlert })}
								disabled={!alertConfig.enabled}
							/>
						</div>
					</div>
				</div>
				
				<Separator />
				
				{/* 通知配置 */}
				<div className="space-y-4">
					<h4 className="font-medium">通知配置</h4>
					
					<div className="space-y-3">
						<div>
							<label className="text-sm font-medium flex items-center gap-2 mb-2">
								<MessageSquare className="w-4 h-4" />
								企业微信 Webhook URL
							</label>
							<Input
								placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
								value={alertConfig.wechatWebhook || ''}
								onChange={(e) => onUpdateConfig({ wechatWebhook: e.target.value })}
								disabled={!alertConfig.enabled}
							/>
							<p className="text-xs text-muted-foreground mt-1">
								在企业微信群中添加机器人，获取Webhook地址
							</p>
						</div>
					</div>
				</div>
				
				<Separator />
				
				{/* 告警阈值配置 */}
				<div className="space-y-4">
					<h4 className="font-medium">告警阈值</h4>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="text-sm font-medium mb-2 block">构建超时阈值 (分钟)</label>
							<Input
								type="number"
								value={alertConfig.alertThresholds.buildTimeThreshold}
								onChange={(e) => onUpdateConfig({ 
									alertThresholds: { 
										...alertConfig.alertThresholds, 
										buildTimeThreshold: parseInt(e.target.value) || 30 
									}
								})}
								disabled={!alertConfig.enabled}
							/>
						</div>
						
						<div>
							<label className="text-sm font-medium mb-2 block">成功率阈值 (%)</label>
							<Input
								type="number"
								value={alertConfig.alertThresholds.successRateThreshold}
								onChange={(e) => onUpdateConfig({ 
									alertThresholds: { 
										...alertConfig.alertThresholds, 
										successRateThreshold: parseInt(e.target.value) || 80 
									}
								})}
								disabled={!alertConfig.enabled}
							/>
						</div>
						
						<div>
							<label className="text-sm font-medium mb-2 block">资源使用率阈值 (%)</label>
							<Input
								type="number"
								value={alertConfig.alertThresholds.resourceUsageThreshold}
								onChange={(e) => onUpdateConfig({ 
									alertThresholds: { 
										...alertConfig.alertThresholds, 
										resourceUsageThreshold: parseInt(e.target.value) || 85 
									}
								})}
								disabled={!alertConfig.enabled}
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
