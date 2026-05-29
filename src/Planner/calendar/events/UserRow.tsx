import { MoveVertical } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { colorPalette } from "@/Planner/mockData";
import { useEvents } from "@/store/eventsStore";
import type { Event } from "@/types/event";
import type { UserRowProps } from "@/types/userRow";
import AddEventDialog from "../event-dialog/AddEventDialog";
import EventCard from "./EventCard";
import { useEventLayout } from "./useEventLayout";

type UserRowWithWidthProps = UserRowProps & {
	containerWidth: number;
	onResetHeight?: (index: number, newHeight: number) => void;
	selectedEvent: Event | null;
	setSelectedEvent: (event: Event | null) => void;
	setPasteTargetUser: (userValue: string) => void;
	activeUser: string | null;
	setActiveUser: (userValue: string) => void;
	onCopyEvent?: (event: Event) => void;
};

const MIN_ROW_HEIGHT = 160;
const PADDING = 40;

const UserRow: React.FC<UserRowWithWidthProps> = ({
	user,
	userIndex,
	rowHeights,
	currentWeekStart,
	currentWeekEnd,
	projects,
	visibleDays,
	containerWidth,
	onResetHeight,
	selectedEvent,
	setSelectedEvent,
	setPasteTargetUser,
	activeUser,
	setActiveUser,
	onCopyEvent,
	userColors,
}) => {
	const workDayStartHour = 11;
	const workDayEndHour = 19;
	const workDayHours = workDayEndHour - workDayStartHour;

	const userColor =
		userColors[user.value] ?? colorPalette[userIndex % colorPalette.length];

	const { events: allEvents, updateEvent } = useEvents();
	const deleteEvent = useDeleteEvent();

	const events = useMemo(
		() =>
			allEvents.filter(
				(ev) =>
					ev.user === user.value &&
					ev.end > currentWeekStart &&
					ev.start < currentWeekEnd,
			),
		[allEvents, user.value, currentWeekStart, currentWeekEnd],
	);

	const { handleHeightChange, getEventY, heights } = useEventLayout(events);

	const [editingEvent, setEditingEvent] = useState<Event | null>(null);
	const [isDialogOpen, setDialogOpen] = useState(false);
	const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
	const [isViewDialogOpen, setViewDialogOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	const handleEditClick = (event: Event) => {
		setEditingEvent(event);
		setDialogOpen(true);
		setViewDialogOpen(false);
	};

	const handleViewClick = (event: Event) => {
		setViewingEvent(event);
		setViewDialogOpen(true);
	};

	useEffect(() => {
		if (!events.length || isCollapsed) return;

		const usedHeight = events.reduce((max, ev) => {
			const y = getEventY(ev.id) ?? 0;
			const h = heights[ev.id] ?? 80;
			return Math.max(max, y + h);
		}, 0);

		const needed = Math.max(MIN_ROW_HEIGHT, usedHeight + PADDING);
		const current = rowHeights[userIndex];

		if (needed > current) onResetHeight?.(userIndex, needed);
	}, [
		events,
		heights,
		getEventY,
		rowHeights,
		userIndex,
		onResetHeight,
		isCollapsed,
	]);

	return (
		// biome-ignore lint/a11y/useSemanticElements: Complex container with multiple interactive children requires div
		<div
			style={{ height: rowHeights[userIndex] }}
			className={`mt-7 relative w-full overflow-y-hidden border-b ${
				activeUser === user.value
					? "border-indigo-600 dark:border-indigo-400 border-b-2"
					: "border-indigo-300 dark:border-indigo-100"
			}`}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				const target = e.target as HTMLElement | null;
				if (
					target &&
					(target.tagName === "INPUT" ||
						target.tagName === "TEXTAREA" ||
						target.isContentEditable)
				) {
					return;
				}

				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					setPasteTargetUser(user.value);
					setActiveUser(user.value);
				}
			}}
			onClick={() => {
				setPasteTargetUser(user.value);
				setActiveUser(user.value);
			}}
		>
			<Button
				onClick={() => {
					const isExpanded = rowHeights[userIndex] > MIN_ROW_HEIGHT;

					if (isExpanded) {
						setIsCollapsed(true);
						onResetHeight?.(userIndex, MIN_ROW_HEIGHT);
						return;
					}

					const usedHeight = events.reduce((max, ev) => {
						const y = getEventY(ev.id) ?? 0;
						const h = heights[ev.id] ?? 80;
						return Math.max(max, y + h);
					}, 0);
					const needed = Math.max(MIN_ROW_HEIGHT, usedHeight + PADDING);
					setIsCollapsed(false);
					onResetHeight?.(userIndex, needed);
				}}
				className="absolute right-2 p-0 top-0 z-40 w-8 h-8 border-indigo-400 dark:border-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 flex items-center justify-center"
			>
				<MoveVertical className="text-muted-foreground" />
			</Button>

			{events.map((event) => (
				<EventCard
					key={event.id}
					event={event}
					userColor={userColor}
					updateEvent={updateEvent}
					deleteEvent={async () => await deleteEvent(event.id)}
					containerWidth={containerWidth}
					workDayHours={workDayHours}
					projects={projects}
					users={[user]}
					visibleDays={visibleDays}
					workDayStartHour={workDayStartHour}
					positionY={getEventY(event.id)}
					onHeightChange={handleHeightChange}
					weekStartDate={currentWeekStart}
					selectedEvent={selectedEvent}
					onClick={() => {
						setSelectedEvent(event);
						const isMobile =
							typeof window !== "undefined" && window.innerWidth < 768;
						if (isMobile) {
							handleViewClick(event);
						}
					}}
					onEditClick={() => handleEditClick(event)}
					onCopyClick={() => onCopyEvent?.(event)}
				/>
			))}

			<AddEventDialog
				users={[user]}
				projects={projects}
				onAdd={async () => {}}
				onUpdate={async (id, patch) => {
					await updateEvent(id, patch);
				}}
				editableEvent={editingEvent}
				open={isDialogOpen}
				setOpen={setDialogOpen}
				showTriggerButton={false}
			/>

			<AddEventDialog
				users={[user]}
				projects={projects}
				editableEvent={viewingEvent}
				open={isViewDialogOpen}
				setOpen={setViewDialogOpen}
				showTriggerButton={false}
				readOnly={true}
				onEdit={() => {
					if (viewingEvent) {
						handleEditClick(viewingEvent);
					}
				}}
			/>
		</div>
	);
};

export default UserRow;
