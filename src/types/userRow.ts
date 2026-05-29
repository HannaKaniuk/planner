import type { Event } from "./event";

export type Option = { value: string; label: string };

export type UserRowProps = {
	user: Option;
	userIndex: number;
	events: Event[];
	rowHeights: number[];
	currentWeekStart: Date;
	currentWeekEnd: Date;

	userColors: Record<string, string>;
	projects: Option[];
	deleteEvent: (id: number) => Promise<void>;
	updateEvent: (id: number, patch: Partial<Event>) => void;

	visibleDays: number[];
};

export type UserProps = {
	user: Option & { avatar?: string };
	height: number;
	onResizeStart: () => void;
};
