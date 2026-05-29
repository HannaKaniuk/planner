import type { Socket } from "socket.io-client";

let socket: Socket | null = null;

export const setRoomSocket = (nextSocket: Socket | null) => {
	socket = nextSocket;
};

export const getRoomSocket = () => socket;
