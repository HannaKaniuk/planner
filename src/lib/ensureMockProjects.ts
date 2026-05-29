import { Project } from "@/entities/Project.entity";
import { getORM } from "@/lib/database";
import { getEntityScopeMeta, type RequestScope } from "@/lib/scope";
import { MOCK_PROJECTS } from "./mockProjects";

/** Seeds default mock projects when a scope has none yet. */
export const ensureMockProjectsForScope = async (
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

	const existing = await em.find(Project, scopeWhere);
	if (existing.length > 0) return;

	for (const mock of MOCK_PROJECTS) {
		em.persist(
			em.create(Project, {
				value: mock.value,
				label: mock.label,
				sessionId: scopedSessionId,
				roomId: scopedRoomId,
			}),
		);
	}

	await em.flush();
};
