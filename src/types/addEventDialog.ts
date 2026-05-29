import type { Event, EventFormValues } from "./event";

export type AddEventDialogProps = {
	users: { value: string; label: string }[];
	projects: { value: string; label: string }[];
	onAdd?: (values: EventFormValues) => Promise<void>;
	onUpdate?: (id: number, patch: Partial<Event>) => Promise<void>;
	editableEvent?: Event | null;
	open?: boolean;
	setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	showTriggerButton?: React.ReactNode;
	onSubmit?: (values: EventFormValues) => void;
	initialValues?: Event;
	readOnly?: boolean;
	onEdit?: () => void;
};
