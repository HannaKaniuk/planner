import { Copy, Pencil, Trash } from "lucide-react";
import type { FC, RefObject } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Event, Priority } from "@/types/event";
import { PriorityBadge } from "./PriorityBadge";

type ProjectOption = { value: string; label: string };

type PointerState = {
	x: number;
	y: number;
	time: number;
};

type PointerRef = { current: PointerState | null };
type BoolRef = { current: boolean };
type NumberRef = { current: number | null };

type EventCardBodyProps = {
	event: Event;
	projects: ProjectOption[];
	positionY: number;
	isMobile: boolean;
	isDragging: boolean;
	isResizing: boolean;
	onClick?: () => void;
	onEditClick?: () => void;
	onCopyClick?: () => void;
	deleteEvent: (id: number) => Promise<void>;
	prevPositionYRef: NumberRef;
	setAnimatedPositionY: (y: number) => void;
	updateEvent: (id: number, patch: Partial<Event>) => Promise<void>;
	containerRef: RefObject<HTMLDivElement | null>;
	touchStartRef: PointerRef;
	mouseDownRef: PointerRef;
	clickHandledRef: BoolRef;
	wasDraggingRef: BoolRef;
};

export const EventCardBody: FC<EventCardBodyProps> = ({
	event,
	projects,
	positionY,
	isMobile,
	isDragging,
	isResizing,
	onClick,
	onEditClick,
	onCopyClick,
	deleteEvent,
	prevPositionYRef,
	setAnimatedPositionY,
	updateEvent,
	containerRef,
	touchStartRef,
	mouseDownRef,
	clickHandledRef,
	wasDraggingRef,
}) => {
	return (
		// biome-ignore lint/a11y/useSemanticElements: Complex container with multiple interactive children requires div
		// biome-ignore lint/a11y/useKeyWithClickEvents: Card is not focusable to avoid nested interactive; keyboard users use action buttons
		<div
			ref={containerRef}
			role="group"
			aria-label={event.title}
			onTouchStart={(e) => {
				if (isMobile) {
					const touch = e.touches[0];
					touchStartRef.current = {
						x: touch.clientX,
						y: touch.clientY,
						time: Date.now(),
					};
				}
			}}
			onTouchEnd={(e) => {
				if (isMobile && touchStartRef.current) {
					const touch = e.changedTouches[0];
					const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
					const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
					const deltaTime = Date.now() - touchStartRef.current.time;
					const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

					if (distance < 10 && deltaTime < 300) {
						e.stopPropagation();
						onClick?.();
					}

					touchStartRef.current = null;
				}
			}}
			onMouseDown={(e) => {
				if (!isMobile) {
					clickHandledRef.current = false;

					mouseDownRef.current = {
						x: e.clientX,
						y: e.clientY,
						time: Date.now(),
					};
				}
			}}
			onMouseUp={(e) => {
				if (!isMobile && mouseDownRef.current && !clickHandledRef.current) {
					const deltaX = Math.abs(e.clientX - mouseDownRef.current.x);
					const deltaY = Math.abs(e.clientY - mouseDownRef.current.y);
					const deltaTime = Date.now() - mouseDownRef.current.time;
					const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

					if (
						distance < 5 &&
						deltaTime < 300 &&
						!wasDraggingRef.current &&
						!isResizing
					) {
						e.stopPropagation();
						clickHandledRef.current = true;
						onClick?.();
					}
					mouseDownRef.current = null;
				}
			}}
			onClick={(e) => {
				if (isMobile) {
					e.stopPropagation();
					if (!wasDraggingRef.current && !isDragging && !isResizing) {
						onClick?.();
					}
				}
			}}
		>
			<div className="flex justify-between items-center w-full gap-2 min-w-0">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="truncate flex-1 text-left min-w-0 text-white font-medium">
								{event.title}
							</span>
						</TooltipTrigger>
						<TooltipContent>
							<p>{event.title}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<div className="flex gap-1 sm:gap-1 flex-shrink-0">
					<button
						type="button"
						aria-label="Копировать"
						title="Копировать"
						className="hover:scale-110 touch-manipulation p-0.5 sm:p-0 text-white/80 hover:text-white"
						onClick={(e) => {
							e.stopPropagation();
							onCopyClick?.();
						}}
					>
						<Copy className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
					</button>
					<button
						type="button"
						aria-label="Редактировать"
						title="Редактировать"
						className="hover:scale-110 touch-manipulation p-0.5 sm:p-0 text-white/80 hover:text-white"
						onClick={(e) => {
							e.stopPropagation();
							onEditClick?.();
						}}
					>
						<Pencil className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
					</button>
					<button
						type="button"
						aria-label="Удалить"
						title="Удалить"
						className="hover:scale-110 touch-manipulation p-0.5 sm:p-0 text-white/80 hover:text-white"
						onClick={async (e) => {
							e.stopPropagation();
							await deleteEvent(event.id);
						}}
					>
						<Trash className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
					</button>
				</div>
			</div>

			<div className="flex items-center gap-1 mt-1 flex-wrap min-w-0">
				{event.priority && (
					<div className="flex-shrink-0">
						<PriorityBadge priority={event.priority} />
					</div>
				)}
				{event.project && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="px-1.5 py-0.5 text-[9px] sm:text-[10px] rounded bg-white/20 backdrop-blur-sm text-white border border-white/30 truncate max-w-[60px] sm:max-w-[80px] flex-shrink-0">
									{projects.find((p) => p.value === event.project)?.label ||
										event.project}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{projects.find((p) => p.value === event.project)?.label ||
										event.project}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>

			<div className="flex flex-wrap gap-1 pt-1.5 min-w-0">
				{(["normal", "high", "urgent"] as Priority[]).map((priority) => (
					<button
						key={priority}
						type="button"
						className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] rounded touch-manipulation flex-shrink-0 backdrop-blur-sm border ${
							event.priority === priority
								? "bg-indigo-500/60 text-white border-indigo-400/50 hover:bg-indigo-500/80"
								: "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
						}`}
						onClick={(e) => {
							e.stopPropagation();
							prevPositionYRef.current = positionY;
							setAnimatedPositionY(positionY);
							updateEvent(event.id, { priority });
						}}
					>
						{priority.charAt(0).toUpperCase()}
					</button>
				))}
			</div>
		</div>
	);
};
