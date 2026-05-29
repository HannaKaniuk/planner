export type Priority = "normal" | "high" | "urgent";

export type Event = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  user?: string;
  project?: string;
  priority?: Priority;
};

export type EventFormValues = Omit<Event, "id"> & { priority: Priority };

export type Option = { value: string; label: string };

export type EventsProps = {
  users: Option[];
  projects: Option[];
  weekOffset: number;
  rowHeights: number[];
  userColors: Record<string, string>;
  setRowHeights: React.Dispatch<React.SetStateAction<number[]>>;
};

type EventCardBase = {
  event: Event;
  updateEvent: (id: number, patch: Partial<Event>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  containerWidth: number;
  workDayHours: number;
  projects?: Option[];
  users?: Option[];
  userColor?: string;
};

export type EventCardProps = EventCardBase & {
  positionY: number;
  positionX?: number;
  onHeightChange: (id: number, height: number) => void;
};

export type EventCardWithPosition = EventCardBase & {
  event: Event;
  visibleDays: number[];
  workDayStartHour: number;
  positionY: number;
  positionX?: number;
  onHeightChange?: (id: number, height: number) => void;
};
