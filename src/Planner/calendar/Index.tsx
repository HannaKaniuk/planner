"use client";
import { BrushCleaning, Eye, EyeOff, Search, Users, X } from "lucide-react";
import { useRouter } from "next/router";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { useProjectsStore } from "@/store/projectsStore";
import { useStore } from "@/store/store";
import { useUsersStore } from "@/store/usersStore";
import type { Event, EventFormValues } from "@/types/event";
import { createShortShareLink, loadSharedState } from "@/utils/shareLink";
import { colorPalette } from "../mockData";
import AddEventDialog from "./event-dialog/AddEventDialog";
import Events from "./events/Events";
import GridCalendar from "./grid/Index";

const CalendarIndex: React.FC = () => {
	const router = useRouter();
	const {
		addEvent,
		setEvents,
		events,
		showWeekend,
		setShowWeekend,
		roomId,
		setRoomId,
		isRoomCreator,
		setIsRoomCreator,
	} = useStore();
	const users = useUsersStore((state) => state.users);
	const projects = useProjectsStore((state) => state.projects);
	const [weekOffset, setWeekOffset] = useState(0);
	const [rowHeights, setRowHeights] = useState<number[]>(
		Array(Math.max(users.length, 1)).fill(160),
	);
	const prevUsersOrderRef = useRef<string[]>(users.map((user) => user.value));
	const [mounted, setMounted] = useState(false);
	const [isResetOpen, setIsResetOpen] = useState(false);
	const [isCopyOpen, setIsCopyOpen] = useState(false);
	const [userFilterQuery, setUserFilterQuery] = useState("");

	useRoomSocket();

	const generateRoomId = () => {
		if (
			typeof crypto !== "undefined" &&
			typeof (crypto as Crypto).randomUUID === "function"
		) {
			return (crypto as Crypto).randomUUID().slice(0, 8);
		}

		return Math.random().toString(36).slice(2, 10);
	};

	const userColors = useMemo(() => {
		const colors: Record<string, string> = {};
		users.forEach((user, index) => {
			colors[user.value] = colorPalette[index % colorPalette.length];
		});
		return colors;
	}, [users]);

	const userIndexMap = useMemo(
		() =>
			users.reduce<Record<string, number>>((acc, user, index) => {
				acc[user.value] = index;
				return acc;
			}, {}),
		[users],
	);

	useEffect(() => {
		setRowHeights((prev) => {
			if (!users.length) return [];

			const prevOrder = prevUsersOrderRef.current;

			const next = users.map((user) => {
				const prevIndex = prevOrder.indexOf(user.value);
				if (prevIndex >= 0 && prev[prevIndex] !== undefined) {
					return prev[prevIndex];
				}
				return 160;
			});

			if (
				next.length === prev.length &&
				next.every((height, index) => height === prev[index])
			) {
				return prev;
			}

			return next;
		});

		prevUsersOrderRef.current = users.map((user) => user.value);
	}, [users]);

	const normalizedFilter = userFilterQuery.trim().toLowerCase();

	const filteredUsers = useMemo(() => {
		if (!normalizedFilter) return users;

		return users.filter((user) => {
			const combined = `${user.label} ${user.value}`.toLowerCase();
			return combined.includes(normalizedFilter);
		});
	}, [normalizedFilter, users]);

	const filteredRowHeights = useMemo(
		() =>
			filteredUsers.map((user) => {
				const originalIndex = userIndexMap[user.value];
				return rowHeights[originalIndex] ?? 160;
			}),
		[filteredUsers, rowHeights, userIndexMap],
	);

	const setFilteredRowHeights = useCallback<
		React.Dispatch<React.SetStateAction<number[]>>
	>(
		(updater) => {
			setRowHeights((prev) => {
				const prevForFiltered = filteredUsers.map((user) => {
					const originalIndex = userIndexMap[user.value];
					return prev[originalIndex] ?? 160;
				});

				const nextForFiltered =
					typeof updater === "function" ? updater(prevForFiltered) : updater;

				if (nextForFiltered.length !== filteredUsers.length) {
					return prev;
				}

				const next = [...prev];

				filteredUsers.forEach((user, index) => {
					const originalIndex = userIndexMap[user.value];
					next[originalIndex] = nextForFiltered[index];
				});

				return next;
			});
		},
		[filteredUsers, userIndexMap],
	);

	const addEventUsers = filteredUsers.length ? filteredUsers : users;

	useEffect(() => {
		setMounted(true);

		const sharedState = loadSharedState<{
			events?: EventFormValues[];
			showWeekend?: boolean;
			users?: { value: string; label: string }[];
		}>();

		if (sharedState) {
			if (sharedState.users && sharedState.users.length > 0) {
				useUsersStore.getState().setUsers(sharedState.users);
			}
			if (sharedState.events && sharedState.events.length > 0) {
				const eventsWithId: Event[] = sharedState.events.map((e, index) => ({
					...e,
					id: Date.now() + index,
				}));
				setEvents(eventsWithId);
			}
			if (sharedState.showWeekend !== undefined) {
				setShowWeekend(sharedState.showWeekend);
			}

			const currentUrl = new URL(window.location.href);
			if (currentUrl.searchParams.has("share")) {
				currentUrl.searchParams.delete("share");
				window.history.replaceState(
					null,
					"",
					`${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
				);
			}

			return;
		}

		if (roomId?.trim()) {
			void (async () => {
				try {
					const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, {
						credentials: "include",
					});
					if (res.ok) {
						const data = (await res.json()) as { isCreator?: boolean };
						setIsRoomCreator(
							typeof data.isCreator === "boolean" ? data.isCreator : null,
						);
					} else {
						setIsRoomCreator(null);
					}
				} catch {
					setIsRoomCreator(null);
				}
			})();
		} else {
			setIsRoomCreator(null);
		}

		void (async () => {
			useUsersStore.getState().setUsers([]);
			setEvents([]);

			await Promise.all([
				useUsersStore.getState().loadUsers(roomId),
				useProjectsStore.getState().loadProjects(roomId),
				useStore.getState().loadEvents(roomId),
			]);
		})();
	}, [setEvents, setShowWeekend, roomId, setIsRoomCreator]);

	const handleAddEvent = async (newEvent: {
		title: string;
		user?: string;
		project?: string;
		start: Date;
		end: Date;
	}) => {
		await addEvent(newEvent);
	};

	const handleConfirmReset = async () => {
		if (!roomId || !roomId.trim()) {
			setIsResetOpen(false);
			return;
		}

		try {
			const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!res.ok && res.status !== 204) {
				throw new Error("Failed to clear room");
			}

			setEvents([]);

			const socketWrapper = (window as unknown as { __roomSocket?: unknown })
				?.__roomSocket;

			// best-effort emit through global ref if present (actual socket emit happens via roomSocketRef)
			try {
				const { getRoomSocket } = await import("@/lib/roomSocketRef");
				const socket = getRoomSocket();
				if (roomId?.trim() && socket) {
					socket.emit("room-cleared", roomId);
				}
			} catch {
				void socketWrapper;
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsResetOpen(false);
		}
	};

	const handleCopyShareLink = async () => {
		const stateToShare = { events, showWeekend, users };

		try {
			const link = await createShortShareLink(stateToShare);
			if (!link) throw new Error("Ошибка генерации ссылки");

			if (typeof navigator !== "undefined" && navigator.clipboard)
				await navigator.clipboard.writeText(link);

			toast.success("Ссылка скопирована!", {
				description: "Теперь вы можете поделиться вашим планом",
				duration: 3000,
			});
		} catch (err) {
			console.error(err);
			toast.error("Не удалось создать ссылку", {
				description: "Попробуйте ещё раз чуть позже.",
			});
		}
	};

	const handleCopyRoomLink = async () => {
		if (typeof window === "undefined") return;

		let targetRoomId = roomId;

		const isNewRoom =
			!targetRoomId ||
			(typeof targetRoomId === "string" && !targetRoomId.trim());

		if (isNewRoom) {
			targetRoomId = generateRoomId();
			setRoomId(targetRoomId);
		}

		const roomPath = `/room/${targetRoomId}`;

		try {
			const url = new URL(window.location.origin);
			url.pathname = roomPath;

			if (typeof navigator !== "undefined" && navigator.clipboard) {
				await navigator.clipboard.writeText(url.toString());
			}

			const isAlreadyOnRoomPage =
				router.pathname === "/room/[id]" && router.query.id === targetRoomId;
			if (!isAlreadyOnRoomPage) {
				await router.replace(roomPath);
			}

			if (isNewRoom) {
				toast.success("Создана новая комната", {
					description: "Ссылка на комнату скопирована в буфер обмена",
					duration: 3000,
				});
			} else {
				toast.success("Ссылка на комнату скопирована!", {
					description: "Отправь её тем, кто должен видеть эту комнату",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error(error);
			toast.error("Не удалось скопировать ссылку на комнату");
		}
	};

	const handleLeaveRoom = async () => {
		if (!roomId) return;

		setRoomId(null);
		await router.push("/");

		toast.success("Ты вышла из комнаты", {
			description: "Теперь видишь свои личные задачи этой сессии",
			duration: 3000,
		});
	};

	const handleConfirmCopy = async () => {
		await handleCopyShareLink();
		setIsCopyOpen(false);
	};

	if (!mounted) return null;

	return (
		<div className="relative w-full h-full text-sm overflow-hidden flex flex-col ">
			<div className="flex-shrink-0  sm:p-4   border-border ">
				<div className="flex justify-end gap-1.5 sm:gap-2">
					<div className="flex gap-1.5 sm:gap-2">
						{roomId && (
							<Button
								size="icon"
								className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
								onClick={handleLeaveRoom}
								title="Выйти из комнаты"
							>
								<X className="h-4 w-4 sm:h-5 sm:w-5" />
							</Button>
						)}
						<Button
							size="icon"
							className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
							onClick={handleCopyRoomLink}
							title="Создать или скопировать ссылку на комнату"
						>
							<Users className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>

						<Button
							size="icon"
							className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
							onClick={() => setShowWeekend(!showWeekend)}
						>
							{showWeekend ? (
								<Eye className="h-4 w-4 sm:h-5 sm:w-5" />
							) : (
								<EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
							)}
						</Button>
					</div>
					{roomId && isRoomCreator && (
						<Button
							size="icon"
							className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
							onClick={() => setIsResetOpen(true)}
							title="Очистить комнату (только создатель)"
						>
							<BrushCleaning className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>
					)}
				</div>

				<Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Удалить все задачи в комнате?</DialogTitle>
							<DialogDescription>
								Это действие удалит все задачи этой комнаты для всех участников.
								Люди и проекты останутся без изменений.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsResetOpen(false)}
								aria-label="Отменить очистку"
							>
								Отмена
							</Button>
							<Button
								className="hover:bg-red-600 hover:text-white"
								onClick={handleConfirmReset}
								aria-label="Подтвердить очистку"
							>
								Да, удалить все задачи
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog open={isCopyOpen} onOpenChange={setIsCopyOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Скопировать ссылку?</DialogTitle>
							<DialogDescription>
								Клянусь, никому не отправлю. Пока не попросят.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsCopyOpen(false)}
								aria-label="Отменить копирование"
							>
								Я ещё подумаю
							</Button>
							<Button
								onClick={handleConfirmCopy}
								aria-label="Подтвердить копирование"
							>
								Да, копируй
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<div className="flex flex-col gap-2 sm:gap-3 w-full">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-0 mt-2 pb-4 sm:pb-8">
						<div className="w-full sm:max-w-sm">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
								<Input
									id="user-filter-input"
									aria-label="Фильтр по людям"
									placeholder="Начни вводить имя"
									value={userFilterQuery}
									onChange={(e) => setUserFilterQuery(e.target.value)}
									className="pl-9 pr-9 h-10 sm:h-9 rounded-md text-base sm:text-sm"
								/>
								{userFilterQuery && (
									<button
										type="button"
										aria-label="Очистить фильтр пользователей"
										className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 touch-manipulation p-1"
										onClick={() => setUserFilterQuery("")}
									>
										<X className="h-4 w-4" />
									</button>
								)}
							</div>
						</div>

						<div className="w-full sm:w-auto sm:ml-auto">
							<AddEventDialog
								users={addEventUsers}
								projects={projects}
								onAdd={handleAddEvent}
							/>
						</div>
					</div>
					{!filteredUsers.length && (
						<p className="text-sm text-slate-500">
							Никого не нашли. Попробуйте изменить запрос или очистите фильтр.
						</p>
					)}
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 sm:p-4 pt-0 sm:pt-0">
				<GridCalendar
					weekOffset={weekOffset}
					onWeekChange={setWeekOffset}
					rowHeights={filteredRowHeights}
					setRowHeights={setFilteredRowHeights}
					users={filteredUsers}
				>
					<Events
						users={filteredUsers}
						projects={projects}
						weekOffset={weekOffset}
						rowHeights={filteredRowHeights}
						userColors={userColors}
						setRowHeights={setFilteredRowHeights}
					/>
				</GridCalendar>
			</div>
		</div>
	);
};

export default CalendarIndex;
