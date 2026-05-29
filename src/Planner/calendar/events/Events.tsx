import type React from "react";
import { useEffect, useState } from "react";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { useCalendarView } from "@/store/CalendarViewStore";
import { useEvents } from "@/store/eventsStore";
import type { Event, EventsProps } from "@/types/event";
import UserRow from "./UserRow";
import { useEventsLogic } from "./useEventsLogic";

const Events: React.FC<EventsProps> = ({
	users,
	projects,
	weekOffset,
	rowHeights,
	userColors,
	setRowHeights,
}) => {
	const { events, updateEvent, addEvent } = useEvents();
	const { visibleDays } = useCalendarView();
	const deleteEvent = useDeleteEvent();

	const { containerRef, containerWidth, currentWeekStart, currentWeekEnd } =
		useEventsLogic({ weekOffset });
	const [activeUser, setActiveUser] = useState<string | null>(null);

	const handleToggleHeight = (index: number, newHeight: number) =>
		setRowHeights((prev) => prev.map((h, i) => (i === index ? newHeight : h)));

	const [clipboardEvent, setClipboardEvent] = useState<Event | null>(null);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [pasteTargetUser, setPasteTargetUser] = useState<string | null>(null);

	const handleCopyEvent = (event: Event) => {
		const { id: _, ...rest } = event;
		setClipboardEvent(rest as Event);
		setSelectedEvent(event);
	};

	useEffect(() => {
		const handleKeyDown = async (e: KeyboardEvent) => {
			const active = document.activeElement as HTMLElement | null;
			if (
				active &&
				(active.tagName === "INPUT" ||
					active.tagName === "TEXTAREA" ||
					active.isContentEditable)
			) {
				return;
			}

			const isCopy = (e.ctrlKey || e.metaKey) && e.code === "KeyC";
			const isCut = (e.ctrlKey || e.metaKey) && e.code === "KeyX";
			const isPaste = (e.ctrlKey || e.metaKey) && e.code === "KeyV";

			if (isCopy) {
				if (selectedEvent) {
					const { id: _, ...rest } = selectedEvent;
					setClipboardEvent(rest as Event);
				}
			} else if (isCut) {
				if (selectedEvent) {
					const { id: _, ...rest } = selectedEvent;
					setClipboardEvent(rest as Event);
					await deleteEvent(selectedEvent.id);
					setSelectedEvent(null);
				}
			} else if (isPaste) {
				if (clipboardEvent && pasteTargetUser) {
					const originalStartDay = (clipboardEvent.start.getDay() + 6) % 7;
					const duration =
						clipboardEvent.end.getTime() - clipboardEvent.start.getTime();

					const newStart = new Date(currentWeekStart);
					newStart.setDate(newStart.getDate() + originalStartDay);
					newStart.setHours(
						clipboardEvent.start.getHours(),
						clipboardEvent.start.getMinutes(),
						clipboardEvent.start.getSeconds(),
						clipboardEvent.start.getMilliseconds(),
					);

					const newEnd = new Date(newStart.getTime() + duration);

					await addEvent({
						...clipboardEvent,
						start: newStart,
						end: newEnd,
						user: pasteTargetUser,
					});
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		clipboardEvent,
		selectedEvent,
		pasteTargetUser,
		addEvent,
		deleteEvent,
		currentWeekStart,
	]);

	return (
		<div ref={containerRef} className="relative w-full h-full">
			{users.map((user, userIndex) => {
				const userEvents = events.filter(
					(ev) =>
						ev.user === user.value &&
						ev.end > currentWeekStart &&
						ev.start < currentWeekEnd,
				);

				return (
					<UserRow
						key={user.value}
						user={user}
						userIndex={userIndex}
						events={userEvents}
						rowHeights={rowHeights}
						currentWeekStart={currentWeekStart}
						currentWeekEnd={currentWeekEnd}
						userColors={userColors}
						projects={projects}
						updateEvent={updateEvent}
						deleteEvent={deleteEvent}
						visibleDays={visibleDays}
						containerWidth={containerWidth}
						onResetHeight={handleToggleHeight}
						selectedEvent={selectedEvent}
						setSelectedEvent={setSelectedEvent}
						setPasteTargetUser={setPasteTargetUser}
						activeUser={activeUser}
						setActiveUser={setActiveUser}
						onCopyEvent={handleCopyEvent}
					/>
				);
			})}
		</div>
	);
};

export default Events;
