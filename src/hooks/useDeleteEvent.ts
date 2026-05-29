import { toast } from "sonner";
import { getRoomSocket } from "@/lib/roomSocketRef";
import { useStore } from "@/store/store";
import type { Event } from "@/types/event";

const getErrorMessage = async (response: Response, fallback: string) => {
	try {
		const data = (await response.json()) as { error?: string };
		return data.error || fallback;
	} catch {
		try {
			const text = await response.text();
			return text || fallback;
		} catch {
			return fallback;
		}
	}
};

export const useDeleteEvent = () => {
	const setEvents = useStore((state) => state.setEvents);

	const restoreEvent = (event?: Event) => {
		if (!event) return;
		setEvents((prev) => [...prev, event]);
	};

	const deleteEvent = async (id: number) => {
		let eventToDelete: Event | undefined;

		setEvents((prev) => {
			eventToDelete = prev.find((ev) => ev.id === id);
			return prev.filter((ev) => ev.id !== id);
		});

		try {
			const response = await fetch(`/api/events/${id}`, {
				method: "DELETE",
			});

			if (!response.ok && response.status !== 404) {
				restoreEvent(eventToDelete);
				const errorMessage = await getErrorMessage(
					response,
					"Не удалось удалить событие",
				);
				toast.error(errorMessage);
				return;
			}

			const { roomId } = useStore.getState();
			const socket = getRoomSocket();
			if (roomId?.trim() && socket) {
				socket.emit("event-deleted", {
					roomId,
					eventId: id,
				});
			}
		} catch (error) {
			restoreEvent(eventToDelete);
			const errorMessage =
				error instanceof Error ? error.message : "Ошибка при удалении события";
			toast.error(errorMessage);
		}
	};

	return deleteEvent;
};
