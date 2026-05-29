import { useCallback, useEffect, useState } from "react";
import type { Event } from "@/types/event";

const GAP = 20;

export const useEventLayout = (events: Event[]) => {
	const [heights, setHeights] = useState<Record<number, number>>({});
	const [positions, setPositions] = useState<Record<number, number>>({});

	const calculatePositions = useCallback(
		(currentHeights: Record<number, number>) => {
			const priorityOrder = ["urgent", "high", "normal"];
			const sorted = [...events].sort((a, b) => {
				const aIndex = priorityOrder.indexOf(a.priority || "normal");
				const bIndex = priorityOrder.indexOf(b.priority || "normal");
				if (aIndex !== bIndex) return aIndex - bIndex;
				return a.start.getTime() - b.start.getTime();
			});

			const newPositions: Record<number, number> = {};
			let y = 0;
			sorted.forEach((ev) => {
				newPositions[ev.id] = y;
				y += (currentHeights[ev.id] ?? 80) + GAP;
			});

			setPositions(newPositions);
		},
		[events],
	);

	const handleHeightChange = (id: number, height: number) => {
		setHeights((prev) => {
			if (prev[id] === height) return prev;
			const newHeights = { ...prev, [id]: height };
			calculatePositions(newHeights);
			return newHeights;
		});
	};

	useEffect(() => {
		calculatePositions(heights);
	}, [heights, calculatePositions]);

	const getEventY = (eventId: number) => positions[eventId] ?? 0;

	return { heights, positions, handleHeightChange, getEventY };
};
