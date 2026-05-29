import { ClickUpSyncState } from "@/entities/ClickUpSyncState.entity";
import { getORM } from "@/lib/database";

const DEFAULT_SYNC_HOUR = 17;

// Computes today's sync time and the next allowed automatic sync.
export const getSyncSchedule = (now: Date) => {
	const todaySync = new Date(now);
	todaySync.setHours(DEFAULT_SYNC_HOUR, 0, 0, 0);

	const nextAutoSyncAt = new Date(todaySync);
	if (now >= todaySync) {
		nextAutoSyncAt.setDate(nextAutoSyncAt.getDate() + 1);
	}

	return { todaySync, nextAutoSyncAt };
};

// Builds a stable scope key so each room/session has its own sync marker.
export const buildScopeKey = (roomId: string | undefined, sessionId: string) =>
	roomId?.trim() ? `room:${roomId.trim()}` : `session:${sessionId}`;

// Reads last successful sync timestamp for a given scope.
export const getLastSyncedAt = async (
	scopeKey: string,
): Promise<Date | null> => {
	const orm = await getORM();
	const em = orm.em.fork();
	const syncState = await em.findOne(ClickUpSyncState, { scopeKey });
	if (!syncState) return null;
	return syncState.lastSyncedAt;
};

// Persists the latest successful sync timestamp (insert or update).
export const saveLastSyncedAt = async (scopeKey: string, when: Date) => {
	const orm = await getORM();
	const em = orm.em.fork();
	const existingState = await em.findOne(ClickUpSyncState, { scopeKey });

	if (existingState) {
		existingState.lastSyncedAt = when;
		await em.flush();
		return;
	}

	const createdState = em.create(ClickUpSyncState, {
		scopeKey,
		lastSyncedAt: when,
	});
	em.persist(createdState);
	await em.flush();
};
