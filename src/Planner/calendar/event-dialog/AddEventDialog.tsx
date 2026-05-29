import type React from "react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { AddEventDialogProps } from "@/types/addEventDialog";
import type { EventFormValues } from "@/types/event";
import AddEventForm from "./AddEventForm";

const AddEventDialog: React.FC<AddEventDialogProps> = ({
	users,
	projects,
	onAdd,
	onUpdate,
	editableEvent,
	open: controlledOpen,
	setOpen: setControlledOpen,
	showTriggerButton = true,
	readOnly = false,
	onEdit,
}) => {
	const [open, setOpen] = useState(false);

	const isControlled =
		controlledOpen !== undefined && setControlledOpen !== undefined;
	const actualOpen = isControlled ? controlledOpen : open;
	const setActualOpen = isControlled ? setControlledOpen : setOpen;

	const handleSubmit = useCallback(
		async (values: EventFormValues) => {
			if (editableEvent && onUpdate) {
				await onUpdate(editableEvent.id, values);
			} else {
				await onAdd?.(values);
			}

			setActualOpen(false);
		},
		[onAdd, onUpdate, editableEvent, setActualOpen],
	);

	const title = readOnly
		? "View Task"
		: editableEvent
			? "Edit Task"
			: "Add Task";

	return (
		<Dialog open={actualOpen} onOpenChange={setActualOpen}>
			{showTriggerButton && !editableEvent && (
				<DialogTrigger asChild>
					<Button className="w-full h-10 sm:h-9 bg-indigo-400 text-white rounded-md hover:bg-indigo-500 touch-manipulation text-sm sm:text-sm font-medium">
						+ Add Task
					</Button>
				</DialogTrigger>
			)}

			<DialogContent className="cursor-pointer">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				<AddEventForm
					users={users}
					projects={projects}
					onSubmit={handleSubmit}
					initialValues={editableEvent || undefined}
					readOnly={readOnly}
					onEdit={onEdit}
				/>

				<DialogFooter />
			</DialogContent>
		</Dialog>
	);
};

export default AddEventDialog;
