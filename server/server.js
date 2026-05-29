import http from "node:http";
import dotenv from "dotenv";
import express from "express";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();
const app = express();
const PORT = process.env.SOCKET_PORT ?? 5001;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log("Socket connected:", socket.id);

	socket.on("join-room", (roomId) => {
		if (typeof roomId !== "string" || !roomId.trim()) return;
		socket.join(roomId);
		console.log(`Socket ${socket.id} joined room ${roomId}`);
	});

	socket.on("leave-room", (roomId) => {
		if (typeof roomId !== "string" || !roomId.trim()) return;
		socket.leave(roomId);
		console.log(`Socket ${socket.id} left room ${roomId}`);
	});

	socket.on("event-created", ({ roomId, event }) => {
		if (typeof roomId !== "string" || !roomId.trim() || !event) return;
		socket.to(roomId).emit("event-created", event);
	});

	socket.on("event-updated", ({ roomId, event }) => {
		if (typeof roomId !== "string" || !roomId.trim() || !event) return;
		socket.to(roomId).emit("event-updated", event);
	});

	socket.on("event-deleted", ({ roomId, eventId }) => {
		if (typeof roomId !== "string" || !roomId.trim() || !eventId) return;
		socket.to(roomId).emit("event-deleted", eventId);
	});

	socket.on("users-changed", (roomId) => {
		if (typeof roomId !== "string" || !roomId.trim()) return;
		socket.to(roomId).emit("users-changed");
	});

	socket.on("projects-changed", (roomId) => {
		if (typeof roomId !== "string" || !roomId.trim()) return;
		socket.to(roomId).emit("projects-changed");
	});

	socket.on("room-cleared", (roomId) => {
		if (typeof roomId !== "string" || !roomId.trim()) return;
		socket.to(roomId).emit("room-cleared");
	});

	socket.on("disconnect", () => {
		console.log("Socket disconnected:", socket.id);
	});
});

server.listen(PORT, () => {
	console.log(`Proxy + Socket.IO server running on ${PORT}`);
});

