import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/types/event";

export const PriorityBadge: React.FC<{
	priority: Priority;
}> = ({ priority }) => {
	return (
		<Badge
			variant="secondary"
			className={`h-5 min-w-5 px-2 py-3 text-xs flex items-center gap-1 flex-shrink-0 backdrop-blur-sm border ${
				priority === "urgent"
					? "bg-red-500/60 text-white border-red-400/50"
					: priority === "high"
						? "bg-amber-500/60 text-white border-amber-400/50"
						: "bg-green-500/60 text-white border-green-400/50"
			}`}
		>
			{priority === "urgent" && <AlertCircleIcon className="w-3 h-3" />}
			{priority === "high" && <BadgeCheckIcon className="w-3 h-3" />}
			{priority === "normal" && <CheckIcon className="w-3 h-3" />}
			{priority.toUpperCase()}
		</Badge>
	);
};
