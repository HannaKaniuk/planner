import type { NextApiRequest, NextApiResponse } from "next";
import { Event } from "@/entities/Event.entity";
import { getORM } from "@/lib/database";
import { getOrCreateSessionId } from "@/lib/session";
import { resolveRequestScope } from "@/lib/scope";

type EventRow = {
	id: number;
	title: string;
	start: string;
	end: string;
	user: string;
	project: string | null;
	priority: string | null;
	session_id: string | null;
	room_id: string | null;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const orm = await getORM();
	const em = orm.em.fork();

	const sessionId = getOrCreateSessionId(req, res);
	const scope = resolveRequestScope(req, sessionId);

	if (req.method === "GET") {
		try {
			const events = await em.find(Event, scope.scopeWhere);
			return res.status(200).json(events);
		} catch (error) {
			console.error("Error fetching events:", error);
			return res.status(500).json({ error: "Failed to fetch events" });
		}
	}

	if (req.method === "POST") {
		try {
			const { title, start, end, user, project, priority, roomId: bodyRoomId } =
				req.body;

			if (!title || !start || !end) {
				return res.status(400).json({
					error: "Title, start, and end are required",
				});
			}

			if (!user || typeof user !== "string" || user.trim() === "") {
				return res.status(400).json({
					error: "User is required",
				});
			}

			const conn = em.getConnection();

			const hasRoomId =
				typeof bodyRoomId === "string" && bodyRoomId.trim() !== "";

			const sessionIdToSave = hasRoomId ? null : sessionId;
			const roomIdToSave = hasRoomId ? bodyRoomId.trim() : null;

			await conn.execute(
				"insert into `event` (`title`, `start`, `end`, `user`, `project`, `priority`, `session_id`, `room_id`) values (?, ?, ?, ?, ?, ?, ?, ?)",
				[
					title,
					new Date(start),
					new Date(end),
					user.trim(),
					project || null,
					priority || null,
					sessionIdToSave,
					roomIdToSave,
				],
			);

			const rows = await conn.execute(
				"select * from `event` where rowid = last_insert_rowid()",
			);
			const typedRows = rows as EventRow[];
			const createdEvent =
				Array.isArray(typedRows) && typedRows.length > 0 ? typedRows[0] : null;

			return res.status(201).json(createdEvent);
		} catch (error) {
			console.error("Error creating event:", error);
			return res.status(500).json({ error: "Failed to create event" });
		}
	}

	res.setHeader("Allow", ["GET", "POST"]);
	return res.status(405).json({ error: "Method not allowed" });
}
