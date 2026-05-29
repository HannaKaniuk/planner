import http from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = http.createServer((req, res) => {
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	});

	const io = new SocketIOServer(server, {
		cors: { origin: "*" },
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

		socket.on("disconnect", () => {
			console.log("Socket disconnected:", socket.id);
		});
	});

	server.listen(port, () => {
		console.log(`> Ready on http://localhost:${port}`);
	});
});
