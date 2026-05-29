"use client";

import { addDays, format, startOfWeek } from "date-fns";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type DateTimePickerProps = {
	label: string;
	date: Date | undefined;
	setDate: (d: Date) => void;
	time: string;
	setTime: (t: string) => void;
	disabled?: boolean;
};

const getNextWeek = () => {
	const today = new Date();
	const currentDay = today.getDay();
	const daysUntilNextWeek = currentDay === 0 ? 1 : 8 - currentDay;
	const nextMonday = new Date(today);
	nextMonday.setDate(today.getDate() + daysUntilNextWeek);
	nextMonday.setHours(0, 0, 0, 0);
	return nextMonday;
};

const getWeekStart = (d?: Date) =>
	startOfWeek(d ?? new Date(), { weekStartsOn: 1 });

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
	label,
	date,
	setDate,
	time,
	setTime,
	disabled = false,
}) => {
	const [open, setOpen] = React.useState(false);
	const [weekStart, setWeekStart] = React.useState<Date>(
		date ? getWeekStart(date) : getWeekStart(getNextWeek()),
	);

	React.useEffect(() => {
		setWeekStart(getWeekStart(date ?? getNextWeek()));
	}, [date]);

	React.useEffect(() => {
		if (open) setWeekStart(getWeekStart(date ?? getNextWeek()));
	}, [open, date]);

	const handleQuickSelect = (value: string) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		let selectedDate: Date;

		switch (value) {
			case "today":
				selectedDate = new Date(today);
				break;
			case "tomorrow":
				selectedDate = addDays(today, 1);
				break;
			case "next-week":
				selectedDate = getNextWeek();
				break;
			default:
				return;
		}

		setDate(selectedDate);
		setWeekStart(getWeekStart(selectedDate));
	};

	const handlePrevWeek = () => setWeekStart((prev) => addDays(prev, -7));
	const handleNextWeek = () => setWeekStart((prev) => addDays(prev, 7));
	const today = React.useMemo(() => {
		const t = new Date();
		t.setHours(0, 0, 0, 0);
		return t;
	}, []);
	const weekDays = React.useMemo(() => {
		return Array.from({ length: 7 }).map((_, idx) => {
			const d = addDays(weekStart, idx);
			return {
				date: d,
				label: format(d, "EEE"),
				shortLabel: format(d, "EEE"),
				dayNum: format(d, "d"),
				isWeekend: [0, 6].includes(d.getDay()),
				isToday: d.toDateString() === today.toDateString(),
			};
		});
	}, [weekStart, today]);

	return (
		<div className="flex flex-col gap-2 w-full">
			<Label className="px-1">{label}</Label>
			<div className="flex gap-2">
				<Popover
					open={open && !disabled}
					onOpenChange={(open) => !disabled && setOpen(open)}
				>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							disabled={disabled}
							className="w-full justify-between font-normal rounded disabled:opacity-100 disabled:cursor-default"
						>
							{date ? date.toLocaleDateString() : "Select date"}
							<ChevronDownIcon className="w-4 h-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-auto p-0 overflow-hidden sm:w-auto"
						align="start"
						side="bottom"
						collisionPadding={16}
						avoidCollisions={true}
					>
						<div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
							<div className="flex items-center justify-between gap-2">
								<Button
									size="icon"
									variant="outline"
									className="h-7 w-7 sm:h-6 sm:w-6 hover:bg-white/20 rounded-full touch-manipulation"
									onClick={handlePrevWeek}
									aria-label="Previous week"
								>
									<ChevronLeftIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								</Button>
								<div className="text-xs sm:text-sm font-medium tabular-nums px-1 text-center text-white">
									<span className="hidden sm:inline">
										{format(weekStart, "MMM d")} –{" "}
										{format(addDays(weekStart, 6), "MMM d")}
									</span>
									<span className="sm:hidden">
										{format(weekStart, "MMM d")} –{" "}
										{format(addDays(weekStart, 6), "d")}
									</span>
								</div>
								<Button
									size="icon"
									variant="outline"
									className="h-7 w-7 sm:h-6 sm:w-6 hover:bg-white/20 rounded-full touch-manipulation"
									onClick={handleNextWeek}
									aria-label="Next week"
								>
									<ChevronRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								</Button>
							</div>

							<div className="grid grid-cols-7 gap-1 sm:gap-1.5">
								{weekDays.map((d) => {
									const isSelected =
										!!date && date.toDateString() === d.date.toDateString();
									const base =
										"h-12 sm:h-16 w-8 sm:w-10 flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs transition-colors touch-manipulation";
									const state = isSelected
										? "bg-indigo-500/80 backdrop-blur-md text-white border-indigo-400/50 hover:bg-indigo-400/80"
										: "bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20";
									const weekend =
										d.isWeekend && !isSelected ? "text-white/50" : "";
									const todayRing =
										d.isToday && !isSelected ? "ring-1 ring-indigo-400" : "";
									return (
										<button
											key={d.date.toISOString()}
											type="button"
											className={`${base} ${state} ${weekend} ${todayRing}`}
											onClick={() => {
												setDate(d.date);
												setOpen(false);
											}}
											aria-label={format(d.date, "EEEE, MMMM d, yyyy")}
											title={format(d.date, "EEE, MMM d")}
										>
											<span className="opacity-70 text-[9px] sm:text-xs">
												{d.shortLabel}
											</span>
											<span className="text-xs sm:text-sm font-semibold leading-none">
												{d.dayNum}
											</span>
											{d.isToday && !isSelected && (
												<span
													className="mt-0.5 inline-block h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-indigo-300"
													aria-hidden="true"
												/>
											)}
										</button>
									);
								})}
							</div>

							<Select onValueChange={handleQuickSelect}>
								<SelectTrigger className="w-full h-8 sm:h-8 text-xs sm:text-sm touch-manipulation">
									<SelectValue placeholder="Quick select" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="today">Today</SelectItem>
									<SelectItem value="tomorrow">Tomorrow</SelectItem>
									<SelectItem value="next-week">Next week (Mon-Fri)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</PopoverContent>
				</Popover>

				<Input
					type="time"
					value={time}
					onChange={(e) => setTime(e.target.value)}
					step="1"
					disabled={disabled}
					readOnly={disabled}
					className="bg-background rounded appearance-none [&::-webkit-calendar-picker-indicator]:hidden disabled:opacity-100 disabled:cursor-default"
				/>
			</div>
		</div>
	);
};
