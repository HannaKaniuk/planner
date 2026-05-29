import { User } from "@/entities/User.entity";
import { getORM } from "@/lib/database";
import { getEntityScopeMeta, type RequestScope } from "@/lib/scope";
import { MOCK_USERS } from "./mockUsers";

/** Seeds default mock users when a scope has none yet. */
export const ensureMockUsersForScope = async (
	scope: RequestScope,
	sessionId: string,
): Promise<void> => {
	const orm = await getORM();
	const em = orm.em.fork();
	const {
		scopeWhere,
		sessionId: scopedSessionId,
		roomId: scopedRoomId,
	} = getEntityScopeMeta(scope, sessionId);

	const existing = await em.find(User, { ...scopeWhere, isVisible: true });
	if (existing.length > 0) return;

	for (const mock of MOCK_USERS) {
		em.persist(
			em.create(User, {
				value: mock.value,
				label: mock.label,
				sortOrder: mock.sortOrder,
				isVisible: true,
				sessionId: scopedSessionId,
				roomId: scopedRoomId,
			}),
		);
	}

	await em.flush();
};
