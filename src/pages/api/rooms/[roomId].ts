import type { NextApiRequest, NextApiResponse } from "next";
import { Event } from "@/entities/Event.entity";
import { Room } from "@/entities/Room.entity";
import { getORM } from "@/lib/database";
import { getOrCreateSessionId } from "@/lib/session";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { roomId } = req.query;

	if (!roomId || typeof roomId !== "string" || !roomId.trim()) {
		return res.status(400).json({ error: "Invalid room id" });
	}

	const orm = await getORM();
	const em = orm.em.fork();

	const sessionId = getOrCreateSessionId(req, res);

	if (req.method === "GET") {
		try {
			let room = await em.findOne(Room, { id: roomId });

			if (!room) {
				const RoomClass = orm.getMetadata().get("Room").class as typeof Room;
				room = em.create(RoomClass, {
					id: roomId,
					creatorSessionId: sessionId,
				});
				await em.persistAndFlush(room);
				return res.status(200).json({
					id: room.id,
					isCreator: true,
				});
			}

			return res.status(200).json({
				id: room.id,
				isCreator: room.creatorSessionId === sessionId,
			});
		} catch (error) {
			console.error("Error fetching room:", error);
			return res.status(500).json({ error: "Failed to fetch room" });
		}
	}

	if (req.method === "DELETE") {
		try {
			const room = await em.findOne(Room, { id: roomId });

			if (!room) {
				return res.status(404).json({ error: "Room not found" });
			}

			if (room.creatorSessionId !== sessionId) {
				return res.status(403).json({ error: "Not allowed" });
			}

			await em.nativeDelete(Event, { roomId });

			return res.status(204).end();
		} catch (error) {
			console.error("Error deleting room:", error);
			return res.status(500).json({ error: "Failed to delete room" });
		}
	}

	res.setHeader("Allow", ["GET", "DELETE"]);
	return res.status(405).json({ error: "Method not allowed" });
}
