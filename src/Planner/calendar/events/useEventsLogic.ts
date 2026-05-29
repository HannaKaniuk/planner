import { addWeeks, endOfWeek, startOfWeek } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useEvents } from "@/store/eventsStore";

export const useEventsLogic = ({ weekOffset }: { weekOffset: number }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = useState(
		typeof window !== "undefined" ? window.innerWidth : 0,
	);

	const { events, updateEvent } = useEvents();

	const currentWeekStart = addWeeks(
		startOfWeek(new Date(), { weekStartsOn: 1 }),
		weekOffset,
	);
	const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

	useEffect(() => {
		if (!containerRef.current) return;
		const el = containerRef.current;

		const resizeObserver = new ResizeObserver(() => {
			const width = el.offsetWidth;
			setContainerWidth((prev) => (prev !== width ? width : prev));
		});

		resizeObserver.observe(el);
		return () => resizeObserver.disconnect();
	}, []);

	return {
		containerRef,
		containerWidth,
		currentWeekStart,
		currentWeekEnd,
		events,
		updateEvent,
	};
};
