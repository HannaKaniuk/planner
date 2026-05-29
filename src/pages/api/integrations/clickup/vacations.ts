import type { NextApiRequest, NextApiResponse } from "next";
import { resolveRequestScope } from "@/lib/scope";
import { getOrCreateSessionId } from "@/lib/session";
import {
	buildScopeKey,
	getLastSyncedAt,
	getSyncSchedule,
	saveLastSyncedAt,
} from "./vacations.schedule";
import {
	fetchVacationsPayloadFromClickUp,
	upsertScopedUsersAndListVisible,
} from "./vacations.service";
import { syncClickUpEvents } from "./vacations.sync";
import type { SyncResponse } from "./vacations.types";

// API handler: syncs ClickUp vacations into scoped planner users/events.
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<SyncResponse | { error: string }>,
) {
	if (req.method !== "GET") {
		res.setHeader("Allow", ["GET"]);
		return res.status(405).json({ error: "Method not allowed" });
	}

	const token = process.env.CLICKUP_API_TOKEN;
	const listId = process.env.CLICKUP_VACATIONS_VIEW_ID;
	const sessionId = getOrCreateSessionId(req, res);
	const scope = resolveRequestScope(req, sessionId);
	const force = req.query.force === "1" || req.query.force === "true";
	const now = new Date();
	const { todaySync, nextAutoSyncAt } = getSyncSchedule(now);
	const scopeKey = buildScopeKey(scope.roomId, sessionId);

	if (!token) {
		return res.status(500).json({
			error: "Missing CLICKUP_API_TOKEN in env",
		});
	}
	if (!listId) {
		return res.status(500).json({
			error: "Missing CLICKUP_VACATIONS_VIEW_ID in env",
		});
	}

	try {
		const lastSyncedAt = await getLastSyncedAt(scopeKey);
		const shouldAutoSync =
			!lastSyncedAt || (now >= todaySync && lastSyncedAt < todaySync);
		if (!force && !shouldAutoSync) {
			return res.status(200).json({
				users: [],
				events: [],
				synced: false,
				nextAutoSyncAt: nextAutoSyncAt.toISOString(),
				skippedReason:
					now < todaySync
						? "before-scheduled-time"
						: "already-synced-for-today",
			});
		}

		const payload = await fetchVacationsPayloadFromClickUp(token, listId);
		const users = await upsertScopedUsersAndListVisible(
			payload.users,
			scope,
			sessionId,
		);
		const events = await syncClickUpEvents({
			events: payload.events,
			allowedUserIds: new Set(users.map((user) => user.value)),
			scope,
			sessionId,
		});
		await saveLastSyncedAt(scopeKey, now);

		return res.status(200).json({
			users,
			events,
			synced: true,
			nextAutoSyncAt: nextAutoSyncAt.toISOString(),
		});
	} catch (error) {
		console.error("Failed to import vacations from ClickUp:", error);
		return res.status(500).json({
			error:
				error instanceof Error
					? error.message
					: "Failed to import vacations from ClickUp",
		});
	}
}
