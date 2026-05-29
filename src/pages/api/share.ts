import { customAlphabet } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { Event } from "@/entities/Event.entity";
import { Share } from "@/entities/Share.entity";
import { getORM } from "@/lib/database";

type ShareUser = { value: string; label: string };

type ShareCreatePayload = {
	events?: { id?: number | string }[];
	showWeekend?: boolean;
	visibleDays?: number[];
	users?: ShareUser[];
};

type ShareMeta = {
	showWeekend?: boolean;
	visibleDays?: number[];
	users?: ShareUser[];
};

type ShareEventRow = {
	event_id: number;
};

const nanoid = customAlphabet(
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	6,
);

const MAX_AGE_DAYS = 7;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const orm = await getORM();
	const em = orm.em.fork();

	const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
	const cutoffDate = new Date(Date.now() - maxAge);

	try {
		await em.nativeDelete(Share, {
			createdAt: { $lt: cutoffDate },
		});
	} catch (error) {
		console.warn("Failed to cleanup old shares:", error);
	}

	if (req.method === "POST") {
		const { payload } = req.body;
		if (!payload) {
			return res.status(400).json({ error: "Payload is required" });
		}

		try {
			const id = nanoid();
			const conn = em.getConnection();

			const payloadObj = payload as ShareCreatePayload;

			const events =
				payloadObj && Array.isArray(payloadObj.events) ? payloadObj.events : [];

			const meta: ShareMeta = {
				showWeekend:
					typeof payloadObj.showWeekend === "boolean"
						? payloadObj.showWeekend
						: undefined,
				visibleDays: Array.isArray(payloadObj.visibleDays)
					? payloadObj.visibleDays
					: undefined,
				users: Array.isArray(payloadObj.users) ? payloadObj.users : undefined,
			};

			await conn.execute(
				"insert into `share` (`id`, `payload`, `created_at`) values (?, ?, ?)",
				[id, JSON.stringify(meta), new Date()],
			);

			const eventIds = events
				.map((e) => {
					if (typeof e.id === "number") return e.id;
					if (typeof e.id === "string") {
						const parsed = Number(e.id);
						return Number.isFinite(parsed) ? parsed : undefined;
					}
					return undefined;
				})
				.filter(
					(idValue): idValue is number =>
						typeof idValue === "number" && Number.isFinite(idValue),
				);

			if (eventIds.length > 0) {
				const existingEvents = await em.find(Event, {
					id: { $in: eventIds },
				});
				const existingIds = new Set(existingEvents.map((e) => e.id));

				for (const eventId of eventIds) {
					if (!existingIds.has(eventId)) continue;
					await conn.execute(
						"insert into `share_event` (`share_id`, `event_id`) values (?, ?)",
						[id, eventId],
					);
				}
			}

			return res.status(201).json({ id });
		} catch (error) {
			console.error("Error creating share:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	}

	if (req.method === "GET") {
		const { id } = req.query;
		if (!id || typeof id !== "string") {
			return res.status(400).json({ error: "ID is required" });
		}

		try {
			const share = await em.findOne(Share, { id });

			if (!share) {
				return res.status(404).json({ error: "Share not found" });
			}

			const now = Date.now();
			const createdAt = share.createdAt.getTime();
			const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

			if (now - createdAt >= maxAge) {
				await em.removeAndFlush(share);
				return res.status(404).json({ error: "Share not found" });
			}

			let meta: ShareMeta = {};
			if (share.payload) {
				try {
					const parsed = JSON.parse(
						share.payload as string,
					) as Partial<ShareCreatePayload>;
					if (parsed && typeof parsed === "object") {
						meta = {
							showWeekend:
								typeof parsed.showWeekend === "boolean"
									? parsed.showWeekend
									: undefined,
							visibleDays: Array.isArray(parsed.visibleDays)
								? parsed.visibleDays
								: undefined,
							users: Array.isArray(parsed.users) ? parsed.users : undefined,
						};
					}
				} catch (error) {
					console.warn("Failed to parse share payload meta:", error);
				}
			}

			const conn = em.getConnection();
			const rows = (await conn.execute(
				"select `event_id` from `share_event` where `share_id` = ?",
				[id],
			)) as ShareEventRow[];

			let events: unknown[] = [];

			if (rows.length > 0) {
				const eventIds = rows.map((r) => r.event_id);
				events = await em.find(Event, { id: { $in: eventIds } });
			}

			if (rows.length === 0 && share.payload) {
				try {
					const parsed = JSON.parse(
						share.payload as string,
					) as ShareCreatePayload;
					if (
						parsed &&
						typeof parsed === "object" &&
						Array.isArray(parsed.events)
					) {
						events = parsed.events;
					}
				} catch (error) {
					console.warn("Failed to parse share payload events:", error);
				}
			}

			return res.status(200).json({
				events,
				showWeekend: meta.showWeekend,
				visibleDays: meta.visibleDays,
				users: meta.users,
			});
		} catch (error) {
			console.error("Error fetching share:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	}

	res.setHeader("Allow", ["GET", "POST"]);
	return res.status(405).end();
}
