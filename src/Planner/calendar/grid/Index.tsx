import { addDays, addWeeks, getDate, startOfISOWeek } from "date-fns";
import type React from "react";
import { useEffect, useRef } from "react";
import { days } from "@/Planner/mockData";
import { useCalendarView } from "@/store/CalendarViewStore";
import { Day } from "./Day";
import { CalendarHeader } from "./Header";
import { User } from "./User";

type GridCalendarProps = {
	weekOffset: number;
	onWeekChange: (offset: number) => void;
	children?: React.ReactNode;
	users: { value: string; label: string; avatar?: string }[];
	rowHeights: number[];
	setRowHeights: React.Dispatch<React.SetStateAction<number[]>>;
};

const GridCalendar: React.FC<GridCalendarProps> = ({
	weekOffset,
	onWeekChange,
	children,
	users,
	rowHeights,
	setRowHeights,
}) => {
	const startOfWeekDate = addWeeks(startOfISOWeek(new Date()), weekOffset);
	const dates = Array.from({ length: 7 }, (_, i) =>
		addDays(startOfWeekDate, i),
	);
	const { visibleDays } = useCalendarView();
	const resizingRow = useRef<number | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);

	const handleMouseDown = (i: number) => {
		resizingRow.current = i;
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMove = (e: MouseEvent) => {
		const rowIndex = resizingRow.current;
		if (rowIndex === null) return;
		setRowHeights((prev) => {
			const newHeights = [...prev];
			newHeights[rowIndex] = Math.max(
				30,
				newHeights[rowIndex] + e.movementY,
			);
			return newHeights;
		});
	};

	const handleMouseUp = () => {
		resizingRow.current = null;
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	};

	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		const header = headerRef.current;
		if (!scrollContainer || !header) return;

		const handleScroll = () => {
			header.scrollLeft = scrollContainer.scrollLeft;
		};

		scrollContainer.addEventListener("scroll", handleScroll);
		return () => scrollContainer.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="relative">
			<CalendarHeader
				weekOffset={weekOffset}
				onWeekChange={onWeekChange}
				dates={dates}
			/>

			<div
				ref={headerRef}
				className="sticky top-0 left-0 right-0 flex z-50  backdrop-blur-sm py-1 sm:py-0 -mx-2 sm:mx-0 px-2 sm:px-0 overflow-x-hidden"
			>
				<div className="w-24 sm:w-40 flex-shrink-0"></div>
				<div className="flex-1 flex min-w-[600px] sm:min-w-0">
					{visibleDays.map((dayIndex) => {
						const day = days[dayIndex];
						const date = dates[dayIndex];
						return (
							<div
								key={day.name}
								className="flex-1 text-center font-medium text-zinc-300 text-xs sm:text-sm"
							>
								<span className="hidden sm:inline">{day.label} </span>
								<span className="sm:hidden">{day.label.substring(0, 2)}</span>
								<span className="ml-1 text-muted-foreground">
									{getDate(date)}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			<div
				ref={scrollContainerRef}
				className="relative flex overflow-x-auto overflow-y-hidden -mx-2 sm:mx-0 px-2 sm:px-0"
			>
				<div className="flex flex-col w-24 sm:w-40 border-r border-border z-40 flex-shrink-0 sticky -left-[10px]">
					{users.map((user, i) => (
						<User
							key={user.value}
							user={user}
							height={rowHeights[i]}
							onResizeStart={() => handleMouseDown(i)}
						/>
					))}
				</div>

				<Day dates={dates}>{children}</Day>
			</div>
		</div>
	);
};

export default GridCalendar;
