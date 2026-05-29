import type { NextApiRequest } from "next";

type ScopeWhere = { roomId: string } | { sessionId: string };

export type RequestScope = {
	roomId?: string;
	hasRoomId: boolean;
	scopeWhere: ScopeWhere;
	saveScope: { sessionId?: string; roomId?: string };
};

export const resolveRequestScope = (
	req: NextApiRequest,
	sessionId: string,
): RequestScope => {
	const roomIdFromQuery = req.query.roomId;
	const trimmedRoomId =
		typeof roomIdFromQuery === "string" ? roomIdFromQuery.trim() : "";
	const hasRoomId = Boolean(trimmedRoomId);
	const roomId = hasRoomId ? trimmedRoomId : undefined;
	return {
		roomId,
		hasRoomId,
		scopeWhere: hasRoomId ? { roomId: trimmedRoomId } : { sessionId },
		saveScope: hasRoomId
			? { sessionId: undefined, roomId: trimmedRoomId }
			: { sessionId, roomId: undefined },
	};
};

export const getEntityScopeMeta = (scope: RequestScope, sessionId: string) => ({
	scopeWhere: scope.hasRoomId
		? { roomId: scope.roomId, sessionId: null }
		: { sessionId, roomId: null },
	sessionId: scope.hasRoomId ? undefined : sessionId,
	roomId: scope.hasRoomId ? scope.roomId : undefined,
});
