import type { NextApiRequest, NextApiResponse } from "next";
import { Event } from "@/entities/Event.entity";
import { getORM } from "@/lib/database";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const orm = await getORM();
	const em = orm.em.fork();

	const { id } = req.query;

	if (!id || typeof id !== "string") {
		return res.status(400).json({ error: "Event ID is required" });
	}

	const eventId = parseInt(id, 10);
	if (Number.isNaN(eventId)) {
		return res.status(400).json({ error: "Invalid event ID" });
	}

	if (req.method === "GET") {
		try {
			const event = await em.findOne(Event, { id: eventId });

			if (!event) {
				return res.status(404).json({ error: "Event not found" });
			}

			return res.status(200).json(event);
		} catch (error) {
			console.error("Error fetching event:", error);
			return res.status(500).json({ error: "Failed to fetch event" });
		}
	}

	if (req.method === "PUT" || req.method === "PATCH") {
		try {
			const event = await em.findOne(Event, { id: eventId });

			if (!event) {
				return res.status(404).json({ error: "Event not found" });
			}

			const { title, start, end, user, project, priority } = req.body;

			if (title !== undefined) event.title = title;
			if (start !== undefined) event.start = new Date(start);
			if (end !== undefined) event.end = new Date(end);
			if (user !== undefined) {
				if (typeof user !== "string" || user.trim() === "") {
					return res.status(400).json({
						error: "User cannot be empty",
					});
				}
				event.user = user.trim();
			}
			if (project !== undefined) event.project = project || undefined;
			if (priority !== undefined) event.priority = priority || undefined;

			await em.flush();

			return res.status(200).json(event);
		} catch (error) {
			console.error("Error updating event:", error);
			return res.status(500).json({ error: "Failed to update event" });
		}
	}

	if (req.method === "DELETE") {
		try {
			const event = await em.findOne(Event, { id: eventId });

			if (!event) {
				return res.status(404).json({ error: "Event not found" });
			}

			await em.removeAndFlush(event);

			return res.status(200).json({ message: "Event deleted successfully" });
		} catch (error) {
			console.error("Error deleting event:", error);
			return res.status(500).json({ error: "Failed to delete event" });
		}
	}

	res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
	return res.status(405).json({ error: "Method not allowed" });
}
