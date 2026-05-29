import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { setRoomSocket } from "@/lib/roomSocketRef";
import { useProjectsStore } from "@/store/projectsStore";
import { useStore } from "@/store/store";
import { useUsersStore } from "@/store/usersStore";
import type { Event } from "@/types/event";

const getSocketUrl = (): string => {
	const env = process.env.NEXT_PUBLIC_SOCKET_URL;
	if (env) return env;

	if (typeof window === "undefined") return "";
	return window.location.origin;
};

export const useRoomSocket = () => {
	const roomId = useStore((state) => state.roomId);
	const setEvents = useStore((state) => state.setEvents);
	const loadUsers = useUsersStore((state) => state.loadUsers);
	const loadProjects = useProjectsStore((state) => state.loadProjects);
	const setEventsDirect = useStore((state) => state.setEvents);
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		if (!roomId || !roomId.trim()) {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			setRoomSocket(null);
			return;
		}

		const socketUrl = getSocketUrl();
		if (!socketUrl) return;

		const socket = io(socketUrl, {
			transports: ["websocket", "polling"],
		});
		socketRef.current = socket;
		setRoomSocket(socket);

		socket.emit("join-room", roomId);

		socket.on("event-created", (event: Event) => {
			setEvents((prev) => {
				const exists = prev.some((e) => e.id === event.id);
				if (exists) return prev;
				return [
					...prev,
					{
						...event,
						start: new Date(event.start),
						end: new Date(event.end),
					},
				];
			});
		});

		socket.on("event-updated", (event: Event) => {
			setEvents((prev) =>
				prev.map((e) =>
					e.id === event.id
						? {
								...event,
								start: new Date(event.start),
								end: new Date(event.end),
							}
						: e,
				),
			);
		});

		socket.on("event-deleted", (eventId: number) => {
			setEvents((prev) => prev.filter((e) => e.id !== eventId));
		});

		socket.on("users-changed", () => {
			if (roomId) loadUsers(roomId);
		});

		socket.on("projects-changed", () => {
			if (roomId) loadProjects(roomId);
		});

		socket.on("room-cleared", () => {
			if (!roomId) return;
			setEventsDirect([]);
		});

		return () => {
			socket.emit("leave-room", roomId);
			socket.disconnect();
			socketRef.current = null;
			setRoomSocket(null);
		};
	}, [roomId, setEvents, loadUsers, loadProjects, setEventsDirect]);

	return {
		getSocket: () => socketRef.current,
	};
};
