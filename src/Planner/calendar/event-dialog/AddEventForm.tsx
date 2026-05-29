import type React from "react";
import { DateTimePicker } from "@/components/date-time-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AddEventDialogProps } from "@/types/addEventDialog";
import type { Priority } from "@/types/event";
import { useAddEventForm } from "./useAddEventForm";

const AddEventForm: React.FC<AddEventDialogProps> = ({
	users,
	projects,
	onSubmit,
	initialValues,
	readOnly = false,
	onEdit,
}) => {
	const { event, setEvent, error, resetForm, handleSave } = useAddEventForm(
		initialValues,
		onSubmit,
	);

	return (
		<div className="space-y-3 mt-2 w-full">
			<Input
				type="text"
				value={event.title}
				onChange={(e) =>
					setEvent((prev) => ({ ...prev, title: e.target.value }))
				}
				placeholder="Task title"
				disabled={readOnly}
				readOnly={readOnly}
				className="w-full px-2 py-2 sm:py-1 rounded-md text-base sm:text-sm h-10 sm:h-8 disabled:opacity-100 disabled:cursor-default bg-slate-900/70 border border-white/20 shadow-none transition-none focus-visible:ring-0 focus-visible:border-white/20 focus-visible:bg-slate-900/70 backdrop-blur-none"
			/>

			<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
				<select
					value={event.user}
					onChange={(e) =>
						setEvent((prev) => ({ ...prev, user: e.target.value }))
					}
					disabled={readOnly}
					aria-label="Assignee"
					title="Assignee"
					className="h-10 sm:h-8 w-full rounded-md bg-slate-900/70 border border-white/20 px-2 text-base sm:text-sm text-white"
				>
					<option value="">Assignee</option>
					{users.map((u) => (
						<option key={u.value} value={u.value}>
							{u.label}
						</option>
					))}
				</select>

				<select
					value={event.project}
					onChange={(e) =>
						setEvent((prev) => ({ ...prev, project: e.target.value }))
					}
					disabled={readOnly}
					aria-label="Project"
					title="Project"
					className="h-10 sm:h-8 w-full rounded-md bg-slate-900/70 border border-white/20 px-2 text-base sm:text-sm text-white"
				>
					<option value="">Project</option>
					{projects.map((p) => (
						<option key={p.value} value={p.value}>
							{p.label}
						</option>
					))}
				</select>

				<select
					value={event.priority}
					onChange={(e) =>
						setEvent((prev) => ({
							...prev,
							priority: e.target.value as Priority,
						}))
					}
					disabled={readOnly}
					aria-label="Priority"
					title="Priority"
					className="h-10 sm:h-8 w-full rounded-md bg-slate-900/70 border border-white/20 px-2 text-base sm:text-sm text-white"
				>
					<option value="normal">Normal</option>
					<option value="high">High</option>
					<option value="urgent">Urgent</option>
				</select>
			</div>

			<div className="flex w-full space-x-2 text-sm">
				<DateTimePicker
					label="Start"
					date={event.startDate}
					setDate={(d) =>
						setEvent((prev) => ({ ...prev, startDate: d, endDate: d }))
					}
					time={event.startTime}
					setTime={(t) => setEvent((prev) => ({ ...prev, startTime: t }))}
					disabled={readOnly}
				/>
			</div>

			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}

			{readOnly ? (
				onEdit && (
					<div className="mt-4 flex justify-end">
						<Button
							onClick={onEdit}
							className="w-full sm:w-auto bg-indigo-400 hover:bg-indigo-500 text-white rounded-md h-10 sm:h-9 touch-manipulation text-sm font-medium"
						>
							Edit
						</Button>
					</div>
				)
			) : (
				<div className="mt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2">
					<Button
						onClick={resetForm}
						className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 hover:text-gray-50 rounded-md h-10 sm:h-9 touch-manipulation text-sm font-medium"
					>
						Clean
					</Button>
					<Button
						onClick={handleSave}
						disabled={!event.title}
						className="w-full sm:w-auto bg-indigo-400 hover:bg-indigo-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed h-10 sm:h-9 touch-manipulation text-sm font-medium"
					>
						Save
					</Button>
				</div>
			)}
		</div>
	);
};

export default AddEventForm;
