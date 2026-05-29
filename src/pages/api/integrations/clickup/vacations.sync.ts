import { Event } from "@/entities/Event.entity";
import { getORM } from "@/lib/database";
import { getEntityScopeMeta, type RequestScope } from "@/lib/scope";
import type { ApiResponse } from "./vacations.logic";

// Syncs ClickUp events via ORM: upsert by externalId and delete stale scoped rows.
export const syncClickUpEvents = async (params: {
	events: ApiResponse["events"];
	allowedUserIds: Set<string>;
	scope: RequestScope;
	sessionId: string;
}): Promise<ApiResponse["events"]> => {
	const { events, allowedUserIds, scope, sessionId } = params;
	const importedEvents = events.filter((event) =>
		allowedUserIds.has(event.user),
	);
	const orm = await getORM();
	const em = orm.em.fork();
	const {
		scopeWhere,
		sessionId: scopedSessionId,
		roomId: scopedRoomId,
	} = getEntityScopeMeta(scope, sessionId);

	const existingEvents = await em.find(Event, {
		source: "clickup",
		...scopeWhere,
	});
	const existingByExternalId = new Map(
		existingEvents
			.filter((event) => Boolean(event.externalId))
			.map((event) => [event.externalId as string, event]),
	);
	const importedExternalIds = new Set<string>();

	for (const importedEvent of importedEvents) {
		importedExternalIds.add(importedEvent.externalId);
		const existingEvent = existingByExternalId.get(importedEvent.externalId);

		if (existingEvent) {
			existingEvent.title = importedEvent.title;
			existingEvent.start = new Date(importedEvent.start);
			existingEvent.end = new Date(importedEvent.end);
			existingEvent.user = importedEvent.user;
			existingEvent.project = importedEvent.project || "ClickUp: Отпуска";
			existingEvent.priority = importedEvent.priority || "normal";
			continue;
		}

		const createdEvent = em.create(Event, {
			title: importedEvent.title,
			start: new Date(importedEvent.start),
			end: new Date(importedEvent.end),
			user: importedEvent.user,
			project: importedEvent.project || "ClickUp: Отпуска",
			priority: importedEvent.priority || "normal",
			source: "clickup",
			externalId: importedEvent.externalId,
		});
		createdEvent.sessionId = scopedSessionId;
		createdEvent.roomId = scopedRoomId;
		em.persist(createdEvent);
	}

	const staleEventIds = existingEvents
		.filter((event) => !importedExternalIds.has(event.externalId || ""))
		.map((event) => event.id);
	if (staleEventIds.length > 0) {
		await em.nativeDelete(Event, { id: { $in: staleEventIds } });
	}

	await em.flush();

	const syncedEvents = await em.find(
		Event,
		{
			source: "clickup",
			...scopeWhere,
		},
		{ orderBy: { start: "asc", end: "asc" } },
	);

	return syncedEvents.map((event) => ({
		id: event.id,
		externalId: event.externalId || "",
		title: event.title,
		start: event.start.toISOString(),
		end: event.end.toISOString(),
		user: event.user,
		project: event.project || "ClickUp: Отпуска",
		priority: "normal",
	}));
};
