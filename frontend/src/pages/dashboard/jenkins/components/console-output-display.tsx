import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { ScrollArea } from "@/ui/scroll-area";
import { Terminal } from "lucide-react";
import type { ConsoleOutput } from "@/api/services/jenkinsService";

interface ConsoleOutputDisplayProps {
	consoleOutput: ConsoleOutput;
}

export default function ConsoleOutputDisplay({ consoleOutput }: ConsoleOutputDisplayProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Terminal className="w-5 h-5" />
					控制台输出 - {consoleOutput.job_name} #{consoleOutput.build_number}
				</CardTitle>
				<CardDescription>输出长度: {consoleOutput.output_length} 字符</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-96">
					<pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
						{consoleOutput.console_output}
					</pre>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
