import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getRoomSocket } from "@/lib/roomSocketRef";
import type { Event } from "@/types/event";

type Store = {
	events: Event[];
	setEvents: (events: Event[] | ((prev: Event[]) => Event[])) => void;
	addEvent: (event: Omit<Event, "id">) => Promise<void>;
	updateEvent: (id: number, patch: Partial<Event>) => Promise<void>;

	roomId: string | null;
	setRoomId: (roomId: string | null) => void;

	isRoomCreator: boolean | null;
	setIsRoomCreator: (value: boolean | null) => void;

	showWeekend: boolean;
	visibleDays: number[];
	setShowWeekend: (value: boolean) => void;
	setVisibleDays: (days: number[]) => void;
	loadEvents: (roomId?: string | null) => Promise<void>;
};

const parseEventDates = (events: Event[]): Event[] =>
	events.map((ev) => ({
		...ev,
		start: ev.start instanceof Date ? ev.start : new Date(ev.start),
		end: ev.end instanceof Date ? ev.end : new Date(ev.end),
	}));

const isExternalClickUpVacation = (event?: Event) =>
	event?.project === "ClickUp: Отпуска";

const normalizeDayIndex = (dayIndex: number) =>
	dayIndex === 0 ? 6 : dayIndex - 1;

const allDays = [1, 2, 3, 4, 5, 6, 0].map(normalizeDayIndex);

export const useStore = create<Store>()(
	persist(
		(set) => ({
			events: [],
			setEvents: (value) =>
				set((state) => {
					const newEvents =
						typeof value === "function" ? value(state.events) : value;
					return { events: parseEventDates(newEvents) };
				}),
			addEvent: async (event) => {
				const tempId = Date.now();
				const newEventWithTempId: Event = { ...event, id: tempId };
				set((state) => ({ events: [...state.events, newEventWithTempId] }));

				try {
					const stateSnapshot = useStore.getState();
					const roomIdSnapshot = stateSnapshot.roomId;
					const response = await fetch("/api/events", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							...event,
							roomId:
								roomIdSnapshot && roomIdSnapshot.trim() !== ""
									? roomIdSnapshot
									: undefined,
							start:
								event.start instanceof Date
									? event.start.toISOString()
									: event.start,
							end:
								event.end instanceof Date ? event.end.toISOString() : event.end,
						}),
					});

					if (response.ok) {
						const createdEvent: Event = await response.json();
						set((state) => ({
							events: state.events.map((ev) =>
								ev.id === tempId
									? {
											...createdEvent,
											start: new Date(createdEvent.start),
											end: new Date(createdEvent.end),
										}
									: ev,
							),
						}));

						const socket = getRoomSocket();
						if (roomIdSnapshot && roomIdSnapshot.trim() !== "" && socket) {
							socket.emit("event-created", {
								roomId: roomIdSnapshot,
								event: createdEvent,
							});
						}
					} else {
						let errorMessage = "Failed to create event";
						try {
							const errorText = await response.text();
							try {
								const errorData = JSON.parse(errorText) as { error?: string };
								errorMessage = errorData.error || errorMessage;
							} catch {
								errorMessage = errorText || errorMessage;
							}
						} catch {
							// ignore secondary errors while reading the body
						}
						console.error("Failed to create event:", errorMessage);
						set((state) => ({
							events: state.events.filter((ev) => ev.id !== tempId),
						}));
						toast.error(errorMessage || "Не удалось создать событие");
						return;
					}
				} catch (error) {
					console.error("Error adding event:", error);
					set((state) => ({
						events: state.events.filter((ev) => ev.id !== tempId),
					}));
					const errorMessage =
						error instanceof Error
							? error.message
							: "Ошибка при создании события";
					toast.error(errorMessage);
				}
			},
			loadEvents: async (roomId) => {
				try {
					const url = roomId?.trim()
						? `/api/events?roomId=${encodeURIComponent(roomId)}`
						: "/api/events";
					const res = await fetch(url, { credentials: "include" });
					if (!res.ok) return;
					const data = (await res.json()) as Event[];

					useStore.getState().setEvents(data);
				} catch (err) {
					console.error("loadEvents failed:", err);
				}
			},
			updateEvent: async (id, patch) => {
				let originalEvent: Event | undefined;
				set((state) => {
					originalEvent = state.events.find((ev) => ev.id === id);
					if (!originalEvent) {
						return state;
					}

					const [updatedEvent] = parseEventDates([
						{ ...originalEvent, ...patch },
					]);

					return {
						events: state.events.map((ev) =>
							ev.id === id ? updatedEvent : ev,
						),
					};
				});

				if (!originalEvent) {
					return;
				}

				if (isExternalClickUpVacation(originalEvent)) {
					return;
				}

				try {
					const response = await fetch(`/api/events/${id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							...patch,
							start:
								patch.start instanceof Date
									? patch.start.toISOString()
									: patch.start,
							end:
								patch.end instanceof Date ? patch.end.toISOString() : patch.end,
						}),
					});

					if (response.ok) {
						const updatedEvent: Event = await response.json();
						set((state) => {
							const existingEvent = state.events.find((ev) => ev.id === id);
							return {
								events: state.events.map((ev) =>
									ev.id === id
										? {
												...updatedEvent,
												start:
													patch.start !== undefined
														? new Date(updatedEvent.start)
														: existingEvent?.start ||
															new Date(updatedEvent.start),
												end:
													patch.end !== undefined
														? new Date(updatedEvent.end)
														: existingEvent?.end || new Date(updatedEvent.end),
											}
										: ev,
								),
							};
						});

						const stateSnapshot = useStore.getState();
						const roomIdSnapshot = stateSnapshot.roomId;
						const socket = getRoomSocket();
						if (roomIdSnapshot && roomIdSnapshot.trim() !== "" && socket) {
							socket.emit("event-updated", {
								roomId: roomIdSnapshot,
								event: updatedEvent,
							});
						}
					} else {
						let errorMessage = "Failed to update event";
						try {
							const errorText = await response.text();
							try {
								const errorData = JSON.parse(errorText) as { error?: string };
								errorMessage = errorData.error || errorMessage;
							} catch {
								errorMessage = errorText || errorMessage;
							}
						} catch {
							// ignore secondary errors while reading the body
						}
						console.error("Failed to update event:", errorMessage);

						if (originalEvent) {
							set((state) => ({
								events: state.events.map((ev) =>
									ev.id === id ? (originalEvent as Event) : ev,
								),
							}));
						}
						toast.error(errorMessage || "Не удалось обновить событие");
						return;
					}
				} catch (error) {
					console.error("Error updating event:", error);

					if (originalEvent) {
						set((state) => ({
							events: state.events.map((ev) =>
								ev.id === id ? (originalEvent as Event) : ev,
							),
						}));
					}
					const errorMessage =
						error instanceof Error
							? error.message
							: "Ошибка при обновлении события";
					toast.error(errorMessage);
				}
			},

			roomId: null,
			setRoomId: (roomId) =>
				set({
					roomId,
					isRoomCreator: null,
				}),

			isRoomCreator: null,
			setIsRoomCreator: (value) => set({ isRoomCreator: value }),

			showWeekend: true,
			visibleDays: allDays,
			setShowWeekend: (value) =>
				set(() => ({
					showWeekend: value,
					visibleDays: value ? allDays : allDays.slice(0, 5),
				})),
			setVisibleDays: (days) => set({ visibleDays: days }),
		}),
		{
			name: "global-calendar-store",
			partialize: (state) => ({
				showWeekend: state.showWeekend,
				visibleDays: state.visibleDays,
			}),
			storage: createJSONStorage(() => {
				if (typeof window === "undefined") return localStorage;
				try {
					const testKey = "__calendar_storage_test__";
					window.localStorage.setItem(testKey, "1");
					window.localStorage.removeItem(testKey);
					return window.localStorage;
				} catch {
					return {
						getItem: () => null,
						setItem: () => {},
						removeItem: () => {},
					};
				}
			}),
			version: 2,
			migrate: (persistedState, version) => {
				if (version < 2) {
					const persisted = (persistedState ?? {}) as Partial<Store>;
					return Promise.resolve({
						showWeekend: persisted.showWeekend,
						visibleDays: persisted.visibleDays,
					});
				}
				return Promise.resolve(persistedState);
			},
			merge: (persistedState, currentState) => {
				const persisted = (persistedState ?? {}) as Partial<Store>;
				return {
					...currentState,
					showWeekend: persisted.showWeekend ?? currentState.showWeekend,
					visibleDays: persisted.visibleDays ?? currentState.visibleDays,
				};
			},
		},
	),
);
