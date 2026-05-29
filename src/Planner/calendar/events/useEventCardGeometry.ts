import { useMemo } from "react";
import type { Event } from "@/types/event";

type UseEventCardGeometryParams = {
	event: Event;
	containerWidth: number;
	workDayHours: number;
	visibleDays: number[];
	workDayStartHour: number;
	weekStartDate: Date;
	isMobile: boolean;
};

export const useEventCardGeometry = ({
	event,
	containerWidth,
	workDayHours,
	visibleDays,
	workDayStartHour,
	weekStartDate,
	isMobile,
}: UseEventCardGeometryParams) => {
	const safeVisibleDaysCount = Math.max(1, visibleDays.length);
	const dayWidth = containerWidth / safeVisibleDaysCount;

	const weekStartDateTime = useMemo(() => {
		const d = new Date(weekStartDate);
		d.setHours(workDayStartHour, 0, 0, 0);
		return d;
	}, [weekStartDate, workDayStartHour]);

	const weekEndDateTime = useMemo(() => {
		const d = new Date(weekStartDate);
		d.setDate(d.getDate() + safeVisibleDaysCount);
		d.setHours(workDayHours + workDayStartHour, 0, 0, 0);
		return d;
	}, [weekStartDate, safeVisibleDaysCount, workDayHours, workDayStartHour]);

	const isClickUpVacationEvent = event.project === "ClickUp: Отпуска";
	const maxDurationMs = safeVisibleDaysCount * workDayHours * 60 * 60 * 1000;

	const clampIntervalToWeek = (start: Date, end: Date) => {
		const clampedStart = new Date(
			Math.max(start.getTime(), weekStartDateTime.getTime()),
		);
		let clampedEnd = new Date(
			Math.min(end.getTime(), weekEndDateTime.getTime()),
		);

		if (clampedEnd.getTime() <= clampedStart.getTime()) {
			clampedEnd = new Date(clampedStart.getTime() + 15 * 60 * 1000);
		}

		const currentDuration = clampedEnd.getTime() - clampedStart.getTime();
		if (currentDuration > maxDurationMs) {
			clampedEnd = new Date(clampedStart.getTime() + maxDurationMs);
		}

		return { clampedStart, clampedEnd };
	};

	const clampIntervalToWeekForClickUp = (start: Date, end: Date) => {
		const clampedStart = new Date(
			Math.max(start.getTime(), weekStartDateTime.getTime()),
		);
		let clampedEnd = new Date(
			Math.min(end.getTime(), weekEndDateTime.getTime()),
		);

		if (clampedEnd.getTime() <= clampedStart.getTime()) {
			clampedEnd = new Date(clampedStart.getTime() + 15 * 60 * 1000);
		}

		return { clampedStart, clampedEnd };
	};

	const visibleDates: Date[] = useMemo(
		() =>
			visibleDays.map(
				(dayIndex) =>
					new Date(weekStartDate.getTime() + dayIndex * 24 * 3600 * 1000),
			),
		[visibleDays, weekStartDate],
	);

	const getDateOnly = (date: Date) =>
		new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

	const getDayIndex = (date: Date) => {
		let closestIndex = 0;
		let minDiff = Infinity;
		visibleDates.forEach((d, i) => {
			const diff = Math.abs(getDateOnly(d) - getDateOnly(date));
			if (diff < minDiff) {
				minDiff = diff;
				closestIndex = i;
			}
		});
		return closestIndex;
	};

	const { clampedStart, clampedEnd } = isClickUpVacationEvent
		? clampIntervalToWeekForClickUp(event.start, event.end)
		: clampIntervalToWeek(event.start, event.end);

	let durationHours = (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 3600);
	let calculatedX = 0;

	if (isClickUpVacationEvent) {
		const getWorkHourOffset = (date: Date) => {
			const hourOffset =
				date.getHours() + date.getMinutes() / 60 - workDayStartHour;
			if (hourOffset < 0) return 0;
			if (hourOffset > workDayHours) return workDayHours;
			return hourOffset;
		};
		const projectDateToTimelineHours = (date: Date) => {
			const dayIndex = getDayIndex(date);
			const hourOffset = getWorkHourOffset(date);
			return dayIndex * workDayHours + hourOffset;
		};

		const startTimelineHours = projectDateToTimelineHours(clampedStart);
		const endTimelineHours = projectDateToTimelineHours(clampedEnd);
		durationHours = Math.max(0.25, endTimelineHours - startTimelineHours);
		calculatedX = (startTimelineHours / workDayHours) * dayWidth;
	} else {
		const dayIndex = getDayIndex(clampedStart);
		const hourOffset =
			clampedStart.getHours() + clampedStart.getMinutes() / 60 - workDayStartHour;
		calculatedX =
			dayIndex * dayWidth + (hourOffset / workDayHours) * dayWidth;
	}

	const width = Math.max(20, (durationHours / workDayHours) * dayWidth);

	const clampPosition = (value: number, widthToUse = width) => {
		const maxX = Math.max(0, dayWidth * safeVisibleDaysCount - widthToUse);
		if (value < 0) return 0;
		if (value > maxX) return maxX;
		return value;
	};

	const getDateFromPosition = (targetX: number) => {
		const clamped = clampPosition(targetX, 1);
		const rawDay = dayWidth ? clamped / dayWidth : 0;
		const baseDayIndex = Math.min(
			Math.max(Math.floor(rawDay), 0),
			visibleDates.length - 1,
		);
		const dayDate = visibleDates[baseDayIndex];

		const fractionWithinDay = rawDay - baseDayIndex;
		const minutesOffset = fractionWithinDay * workDayHours * 60;
		const totalMinutes = workDayStartHour * 60 + minutesOffset;

		const result = new Date(dayDate);
		result.setHours(
			Math.floor(totalMinutes / 60),
			Math.round(totalMinutes % 60),
			0,
			0,
		);
		return result;
	};

	const x = isMobile ? calculatedX : calculatedX;

	return {
		width,
		x,
		calculatedX,
		dayWidth,
		clampIntervalToWeek,
		clampPosition,
		getDateFromPosition,
	};
};
