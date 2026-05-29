import { useEffect, useState } from "react";
import type { AddEventDialogProps } from "@/types/addEventDialog";
import type { EventFormValues, Priority } from "@/types/event";

const getNextMonday = () => {
	const today = new Date();
	const currentDay = today.getDay();
	const daysUntilNextWeek = currentDay === 0 ? 1 : 8 - currentDay;
	const nextMonday = new Date(today);
	nextMonday.setDate(today.getDate() + daysUntilNextWeek);
	nextMonday.setHours(0, 0, 0, 0);
	return nextMonday;
};

export const useAddEventForm = (
	initialValues?: AddEventDialogProps["initialValues"],
	onSubmit?: (values: EventFormValues) => Promise<void> | void,
) => {
	const [error, setError] = useState("");
	const defaultDate = getNextMonday();
	const [event, setEvent] = useState({
		title: "",
		user: "",
		project: "",
		startDate: defaultDate,
		startTime: "11:00:00",
		endDate: defaultDate,
		endTime: "19:00:00",
		priority: "normal" as Priority,
	});

	useEffect(() => {
		if (initialValues) {
			setEvent({
				title: initialValues.title || "",
				user: initialValues.user || "",
				project: initialValues.project || "",
				startDate: new Date(initialValues.start),
				startTime: new Date(initialValues.start)
					.toTimeString()
					.split(" ")[0]
					.slice(0, 8),
				endDate: new Date(initialValues.end),
				endTime: new Date(initialValues.end)
					.toTimeString()
					.split(" ")[0]
					.slice(0, 8),
				priority: initialValues.priority || "normal",
			});
		}
	}, [initialValues]);

	const resetForm = () => {
		const nextMonday = getNextMonday();
		setEvent({
			title: "",
			user: "",
			project: "",
			startDate: nextMonday,
			startTime: "11:00:00",
			endDate: nextMonday,
			endTime: "19:00:00",
			priority: "normal",
		});
		setError("");
	};

	const handleSave = async () => {
		const {
			title,
			user,
			project,
			startDate,
			startTime,
			endDate,
			endTime,
			priority,
		} = event;

		if (!title || !startDate) {
			setError("Oops! Please fill in all required fields");
			return;
		}

		if (!user || user.trim() === "") {
			setError("Пожалуйста, выберите пользователя");
			return;
		}

		const parseTime = (value: string): [number, number, number] => {
			const parts = value.split(":").map((p) => Number(p));
			const h = parts[0] ?? 0;
			const m = parts[1] ?? 0;
			const s = parts[2] ?? 0;
			return [h, m, s];
		};

		const WORK_START = 11;
		const WORK_END = 19;

		const [startH, startM, startS] = parseTime(startTime);
		const [endH, endM, endS] = parseTime(endTime);

		const start = new Date(startDate);
		start.setHours(startH, startM, startS, 0);
		const end = new Date(endDate);
		end.setHours(endH, endM, endS, 0);

		const clampToWorkWindow = (d: Date) => {
			const clamped = new Date(d);
			const hours = clamped.getHours() + clamped.getMinutes() / 60;
			if (hours < WORK_START) {
				clamped.setHours(WORK_START, 0, 0, 0);
			} else if (hours > WORK_END) {
				clamped.setHours(WORK_END, 0, 0, 0);
			}
			return clamped;
		};

		let clampedStart = clampToWorkWindow(start);
		let clampedEnd = clampToWorkWindow(end);

		if (clampedEnd <= clampedStart) {
			const thirtyMinutesMs = 30 * 60 * 1000;
			clampedEnd = new Date(clampedStart.getTime() + thirtyMinutesMs);
			if (clampedEnd.getHours() + clampedEnd.getMinutes() / 60 > WORK_END) {
				clampedEnd.setHours(WORK_END, 0, 0, 0);
				if (clampedEnd <= clampedStart) {
					clampedStart = new Date(clampedEnd.getTime() - thirtyMinutesMs);
					clampedStart = clampToWorkWindow(clampedStart);
				}
			}
		}

		setError("");

		try {
			await onSubmit?.({
				title,
				user,
				project,
				start: clampedStart,
				end: clampedEnd,
				priority,
			});

			resetForm();
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Ошибка при сохранении";

			let displayMessage = errorMessage;
			if (errorMessage === "User is required") {
				displayMessage = "Пожалуйста, выберите пользователя";
			} else if (errorMessage === "User cannot be empty") {
				displayMessage = "Пользователь не может быть пустым";
			}
			setError(displayMessage);
		}
	};

	return { event, setEvent, error, resetForm, handleSave };
};
