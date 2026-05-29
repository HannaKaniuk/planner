import { ClickUpUserRule } from "@/entities/ClickUpUserRule.entity";
import { User } from "@/entities/User.entity";
import { getORM } from "@/lib/database";
import { getEntityScopeMeta, type RequestScope } from "@/lib/scope";
import {
	type ApiResponse,
	buildVacationsPayload,
	type ClickUpTeamResponse,
	fetchClickUpJson,
	fetchTasksFromList,
	mapTeamMembersToPlannerUsers,
	resolveTargetTeam,
} from "./vacations.logic";

// Fetches source data from ClickUp and converts it to planner payload shape.
export const fetchVacationsPayloadFromClickUp = async (
	token: string,
	listId: string,
): Promise<ApiResponse> => {
	const [teamResponse, tasksResponse] = await Promise.all([
		fetchClickUpJson<ClickUpTeamResponse>("/team", token),
		fetchTasksFromList(token, listId),
	]);
	const targetTeam = resolveTargetTeam(teamResponse);
	const teamMembers = mapTeamMembersToPlannerUsers(targetTeam);
	return buildVacationsPayload(tasksResponse.tasks, teamMembers);
};

type ScopedPlannerUser = {
	value: string;
	label: string;
	sortOrder: number;
	isVisible: boolean;
};

// Upserts scoped users using rules and returns only users visible in planner.
export const upsertScopedUsersAndListVisible = async (
	payloadUsers: ApiResponse["users"],
	scope: RequestScope,
	sessionId: string,
): Promise<ApiResponse["users"]> => {
	const orm = await getORM();
	const em = orm.em.fork();
	const rules = await em.find(ClickUpUserRule, {});
	const rulesByClickupId = new Map(
		rules.map((rule) => [rule.clickupUserId, rule]),
	);

	const scopedUsers: ScopedPlannerUser[] = payloadUsers
		.map((importedUser) => {
			const rule = rulesByClickupId.get(importedUser.value);
			return {
				value: importedUser.value,
				label: rule?.displayLabel || importedUser.label,
				sortOrder: rule?.sortOrder ?? 9999,
				isVisible: rule?.isActive ?? false,
			};
		})
		.filter((user) => user.isVisible)
		.sort(
			(a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
		);

	const {
		scopeWhere,
		sessionId: scopedSessionId,
		roomId: scopedRoomId,
	} = getEntityScopeMeta(scope, sessionId);
	const existingUsers = await em.find(User, scopeWhere);
	const existingByValue = new Map(
		existingUsers.map((user) => [user.value, user]),
	);
	const visibleValues = new Set(scopedUsers.map((user) => user.value));

	for (const user of scopedUsers) {
		const existingUser = existingByValue.get(user.value);
		if (existingUser) {
			existingUser.label = user.label;
			existingUser.sortOrder = user.sortOrder;
			existingUser.isVisible = true;
			continue;
		}

		em.persist(
			em.create(User, {
				value: user.value,
				label: user.label,
				sortOrder: user.sortOrder,
				isVisible: true,
				sessionId: scopedSessionId,
				roomId: scopedRoomId,
			}),
		);
	}

	for (const rule of rules) {
		if (visibleValues.has(rule.clickupUserId)) continue;
		const existingUser = existingByValue.get(rule.clickupUserId);
		if (existingUser) {
			existingUser.isVisible = false;
		}
	}

	await em.flush();

	return scopedUsers.map((user) => ({
		value: user.value,
		label: user.label,
	}));
};
