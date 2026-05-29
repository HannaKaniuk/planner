import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProps } from "@/types/userRow";

export const User: React.FC<UserProps> = ({ user, height, onResizeStart }) => (
	<div
		style={{ height }}
		className="relative flex items-center mt-7 px-1 sm:px-2 border-b border-border/50 select-none"
	>
		<div className="flex-shrink-0 mr-1 sm:mr-2">
			<Avatar className="shadow-lg ring-2 ring-border/20 h-7 w-7 sm:h-10 sm:w-10">
				{user.avatar ? (
					<AvatarImage src={user.avatar} alt={user.label} />
				) : (
					<AvatarFallback className="text-xs sm:text-sm">
						{user.label[0]}
					</AvatarFallback>
				)}
			</Avatar>
		</div>
		<span className="font-medium text-foreground text-xs sm:text-sm truncate">
			{user.label}
		</span>

		<button
			type="button"
			onMouseDown={onResizeStart}
			className="absolute bottom-0 h-[2px] w-[100vw] cursor-row-resize border-b border-border/50 hover:bg-primary/50 transition-colors hidden sm:block"
			aria-label="Resize row"
		/>

		<div id={`events-row-${user.value}`} />
	</div>
);
