import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Badge } from "@/ui/badge";
import { 
	Play, 
	X, 
	RotateCcw, 
	Settings, 
	Info,
	AlertCircle,
	CheckCircle
} from "lucide-react";
import { BuildParameter, ParameterizedBuildConfig } from "../hooks/use-jenkins-pro";

// 参数化构建对话框组件
export function ParameterizedBuildDialog({ 
	config, 
	parameterValues, 
	loading, 
	onUpdateValue, 
	onReset, 
	onTriggerBuild, 
	onClose 
}: {
	config: ParameterizedBuildConfig | null;
	parameterValues: Record<string, string | boolean>;
	loading: boolean;
	onUpdateValue: (paramName: string, value: string | boolean) => void;
	onReset: () => void;
	onTriggerBuild: () => void;
	onClose: () => void;
}) {
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

	if (!config) {
		return null;
	}

	// 验证参数
	const validateParameters = () => {
		const errors: Record<string, string> = {};
		
		config.parameters.forEach(param => {
			const value = parameterValues[param.name];
			
			if (param.required && (!value || value === "")) {
				errors[param.name] = "此参数为必填项";
			}
			
			if (param.type === "string" && param.name === "VERSION_NUMBER" && value) {
				const versionRegex = /^\d+\.\d+\.\d+$/;
				if (!versionRegex.test(String(value))) {
					errors[param.name] = "版本号格式应为 x.y.z";
				}
			}
		});
		
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// 处理构建触发
	const handleTriggerBuild = () => {
		if (validateParameters()) {
			onTriggerBuild();
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Settings className="w-5 h-5" />
								参数化构建
							</CardTitle>
							<CardDescription>
								配置构建参数: {config.jobName}
							</CardDescription>
						</div>
						<Button variant="ghost" size="sm" onClick={onClose}>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</CardHeader>
				
				<CardContent className="space-y-6 overflow-y-auto max-h-[60vh]">
					{/* 参数列表 */}
					<div className="space-y-4">
						{config.parameters.map((param) => (
							<ParameterInput
								key={param.name}
								parameter={param}
								value={parameterValues[param.name]}
								error={validationErrors[param.name]}
								onChange={(value) => onUpdateValue(param.name, value)}
							/>
						))}
					</div>
					
					<Separator />
					
					{/* 操作按钮 */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={onReset}>
								<RotateCcw className="w-4 h-4 mr-2" />
								重置
							</Button>
							<div className="text-sm text-muted-foreground">
								{Object.keys(validationErrors).length > 0 && (
									<span className="text-red-600 flex items-center gap-1">
										<AlertCircle className="w-3 h-3" />
										请修正参数错误
									</span>
								)}
							</div>
						</div>
						
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={onClose}>
								取消
							</Button>
							<Button 
								onClick={handleTriggerBuild}
								disabled={loading || Object.keys(validationErrors).length > 0}
							>
								{loading ? (
									<>
										<div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
										构建中...
									</>
								) : (
									<>
										<Play className="w-4 h-4 mr-2" />
										开始构建
									</>
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// 参数输入组件
function ParameterInput({ 
	parameter, 
	value, 
	error, 
	onChange 
}: {
	parameter: BuildParameter;
	value: string | boolean;
	error?: string;
	onChange: (value: string | boolean) => void;
}) {
	const renderInput = () => {
		switch (parameter.type) {
			case "string":
				return (
					<Input
						value={String(value || "")}
						onChange={(e) => onChange(e.target.value)}
						placeholder={parameter.defaultValue ? String(parameter.defaultValue) : ""}
						className={error ? "border-red-500" : ""}
					/>
				);
				
			case "choice":
				return (
					<Select value={String(value || "")} onValueChange={onChange}>
						<SelectTrigger className={error ? "border-red-500" : ""}>
							<SelectValue placeholder="请选择..." />
						</SelectTrigger>
						<SelectContent>
							{parameter.choices?.map((choice) => (
								<SelectItem key={choice} value={choice}>
									{choice}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
				
			case "boolean":
				return (
					<div className="flex items-center space-x-2">
						<Switch
							checked={Boolean(value)}
							onCheckedChange={onChange}
						/>
						<span className="text-sm text-muted-foreground">
							{Boolean(value) ? "是" : "否"}
						</span>
					</div>
				);
				
			case "password":
				return (
					<Input
						type="password"
						value={String(value || "")}
						onChange={(e) => onChange(e.target.value)}
						placeholder="请输入密码..."
						className={error ? "border-red-500" : ""}
					/>
				);
				
			case "text":
				return (
					<Textarea
						value={String(value || "")}
						onChange={(e) => onChange(e.target.value)}
						placeholder={parameter.description || "请输入内容..."}
						rows={3}
						className={error ? "border-red-500" : ""}
					/>
				);
				
			default:
				return (
					<Input
						value={String(value || "")}
						onChange={(e) => onChange(e.target.value)}
						className={error ? "border-red-500" : ""}
					/>
				);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Label htmlFor={parameter.name} className="text-sm font-medium">
					{parameter.name}
				</Label>
				{parameter.required && (
					<Badge variant="destructive" className="text-xs">
						必填
					</Badge>
				)}
				{parameter.type !== "string" && (
					<Badge variant="outline" className="text-xs">
						{parameter.type}
					</Badge>
				)}
			</div>
			
			{parameter.description && (
				<div className="flex items-start gap-2 text-xs text-muted-foreground">
					<Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
					<span>{parameter.description}</span>
				</div>
			)}
			
			{renderInput()}
			
			{error && (
				<div className="flex items-center gap-1 text-xs text-red-600">
					<AlertCircle className="w-3 h-3" />
					<span>{error}</span>
				</div>
			)}
			
			{!error && parameter.defaultValue !== undefined && (
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<CheckCircle className="w-3 h-3" />
					<span>默认值: {String(parameter.defaultValue)}</span>
				</div>
			)}
		</div>
	);
}
