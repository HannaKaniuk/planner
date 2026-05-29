import type {
	ApiResponse,
	ClickUpTask,
	ClickUpTeamResponse,
	ClickUpUser,
	PlannerUser,
	PlannerVacationEvent,
} from "./vacations.types";

type PlannerUserCandidate = PlannerUser & {
	rawValue: string;
	rawLabel: string;
};

const CALENDAR_WORKDAY_START_HOUR = 11;
const CALENDAR_WORKDAY_END_HOUR = 19;

const sortUsers = (users: PlannerUser[]) =>
	[...users].sort((a, b) => a.label.localeCompare(b.label, "ru"));

const extractUserLabel = (user: ClickUpUser): string =>
	(user.username || user.email || user.initials || String(user.id)).trim();
const extractUserValue = (user: ClickUpUser): string => String(user.id).trim();
const normalizeText = (value?: string | null): string =>
	(value || "").toLowerCase().trim();

const toPlannerUser = (clickupUser: ClickUpUser): PlannerUserCandidate => {
	const rawLabel = extractUserLabel(clickupUser);
	const rawValue = extractUserValue(clickupUser);
	return {
		value: rawValue,
		label: rawLabel,
		rawValue,
		rawLabel,
	};
};

const isAllowedPlannerUser = (user: PlannerUserCandidate): boolean =>
	Boolean(user.value);
const toPublicPlannerUser = ({
	value,
	label,
}: PlannerUserCandidate): PlannerUser => ({ value, label });

// Parses ClickUp timestamps that may come in seconds or milliseconds.
const parseClickUpDateValue = (value?: string | null): Date | null => {
	if (!value) return null;
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return null;
	const normalized = parsed < 1_000_000_000_000 ? parsed * 1000 : parsed;
	const date = new Date(normalized);
	return Number.isNaN(date.getTime()) ? null : date;
};

const isDateLikeField = (
	field: NonNullable<ClickUpTask["custom_fields"]>[number],
): boolean => {
	const fieldType = normalizeText(field.type);
	const fieldName = normalizeText(field.name);
	return (
		fieldType === "date" ||
		fieldType === "datetime" ||
		fieldName.includes("дата") ||
		fieldName.includes("date")
	);
};

const getCustomFieldDate = (
	field: NonNullable<ClickUpTask["custom_fields"]>[number],
): Date | null => {
	const value = field.value;
	if (typeof value === "number") return parseClickUpDateValue(String(value));
	if (typeof value === "string") {
		const fromTimestamp = parseClickUpDateValue(value);
		if (fromTimestamp) return fromTimestamp;
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}
	return null;
};

// Resolves start/end dates using task fields with safe fallbacks.
const resolveLeaveBoundaryDates = (task: ClickUpTask) => {
	const defaultStart =
		parseClickUpDateValue(task.start_date) ??
		parseClickUpDateValue(task.due_date);
	const defaultEnd =
		parseClickUpDateValue(task.due_date) ??
		parseClickUpDateValue(task.start_date);
	const genericCandidates: Date[] = [];

	for (const field of task.custom_fields || []) {
		if (!isDateLikeField(field)) continue;
		const parsedDate = getCustomFieldDate(field);
		if (!parsedDate) continue;
		genericCandidates.push(parsedDate);
	}

	const genericMin =
		genericCandidates.length > 0
			? new Date(Math.min(...genericCandidates.map((date) => date.getTime())))
			: null;
	const genericMax =
		genericCandidates.length > 0
			? new Date(Math.max(...genericCandidates.map((date) => date.getTime())))
			: null;

	return {
		rawStartDate: defaultStart ?? genericMin ?? genericMax,
		rawEndDate: defaultEnd ?? genericMax ?? genericMin,
	};
};

const toStartOfWorkDay = (date: Date): Date => {
	const next = new Date(date);
	next.setHours(CALENDAR_WORKDAY_START_HOUR, 0, 0, 0);
	return next;
};
const toEndOfWorkDay = (date: Date): Date => {
	const next = new Date(date);
	next.setHours(CALENDAR_WORKDAY_END_HOUR, 0, 0, 0);
	return next;
};
const hashToPositiveInt = (value: string): number => {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1)
		hash = (hash * 31 + value.charCodeAt(i)) | 0;
	return Math.abs(hash) + 1;
};
const getLeaveTitle = (leaveType: "vacation" | "sick" | "dayoff"): string => {
	if (leaveType === "sick") return "Больничный";
	if (leaveType === "dayoff") return "Отгул";
	return "Отпуск";
};

// Converts one task + user to a normalized planner event.
const buildLeaveRangeEvent = (
	task: ClickUpTask,
	assignee: PlannerUser,
	leaveType: "vacation" | "sick" | "dayoff",
): PlannerVacationEvent | null => {
	const { rawStartDate, rawEndDate } = resolveLeaveBoundaryDates(task);
	if (!rawStartDate || !rawEndDate) return null;
	const startDate = toStartOfWorkDay(rawStartDate);
	const endDate = toEndOfWorkDay(rawEndDate);
	const safeStart =
		startDate.getTime() <= endDate.getTime() ? startDate : endDate;
	const safeEnd =
		startDate.getTime() <= endDate.getTime() ? endDate : startDate;
	return {
		id: hashToPositiveInt(
			`${task.id}:${assignee.value}:${safeStart.toISOString()}:${safeEnd.toISOString()}`,
		),
		externalId: `${task.id}:${assignee.value}`,
		title: getLeaveTitle(leaveType),
		start: safeStart.toISOString(),
		end: safeEnd.toISOString(),
		user: assignee.value,
		project: "ClickUp: Отпуска",
		priority: "normal",
	};
};

const buildLeaveEvents = (
	task: ClickUpTask,
	leaveType: "vacation" | "sick" | "dayoff",
	assignee: PlannerUser,
): PlannerVacationEvent[] => {
	const event = buildLeaveRangeEvent(task, assignee, leaveType);
	return event ? [event] : [];
};

const hasValidTimestamp = (value: string | null | undefined): boolean =>
	Boolean(value) && Number.isFinite(Number(value));
// Minimal guard to skip draft-like tasks without creation metadata.
const isTaskReadyForSync = (task: ClickUpTask): boolean =>
	hasValidTimestamp(task.date_created) ||
	hasValidTimestamp(task.status?.date_created);

// Reads selected option label for ClickUp dropdown-like custom fields.
const resolveSelectedOptionName = (
	field: NonNullable<ClickUpTask["custom_fields"]>[number],
): string => {
	if (!field.type_config?.options?.length) return "";
	const selected = field.type_config.options.find(
		(option) => String(option.id) === String(field.value),
	);
	return normalizeText(selected?.name);
};

// Classifies task as vacation/sick/dayoff based on custom field or title.
const getLeaveType = (
	task: ClickUpTask,
): "vacation" | "sick" | "dayoff" | null => {
	const leaveTypeField = (task.custom_fields || []).find((field) =>
		normalizeText(field.name).includes("тип выходного"),
	);
	const taskName = normalizeText(task.name);
	const classify = (value: string): "vacation" | "sick" | "dayoff" | null => {
		if (value.includes("больничный")) return "sick";
		if (value.includes("отгул")) return "dayoff";
		if (value.includes("отпуск")) return "vacation";
		return null;
	};
	if (!leaveTypeField) return classify(taskName);
	const selectedType = resolveSelectedOptionName(leaveTypeField);
	return classify(selectedType || taskName);
};

// Prefers explicit vacation owner field, falls back to task assignees.
const extractVacationOwnerUsers = (task: ClickUpTask): ClickUpUser[] => {
	const ownerField = (task.custom_fields || []).find((field) =>
		normalizeText(field.name).includes("постановщик задачи"),
	);
	if (
		ownerField?.type === "users" &&
		Array.isArray(ownerField.value) &&
		ownerField.value.length > 0
	) {
		return ownerField.value as ClickUpUser[];
	}
	return task.assignees || [];
};

// Creates fast lookup map for users by ClickUp id.
const mapUsersById = (teamMembers: PlannerUser[]): Map<string, PlannerUser> => {
	const usersMap = new Map<string, PlannerUser>();
	for (const member of teamMembers) usersMap.set(member.value, member);
	return usersMap;
};
const toAllowedPublicUser = (user: ClickUpUser): PlannerUser | null => {
	const candidate = toPlannerUser(user);
	return isAllowedPlannerUser(candidate)
		? toPublicPlannerUser(candidate)
		: null;
};
// Appends users/events derived from one task into mutable accumulators.
const appendTaskLeaveEvents = (
	task: ClickUpTask,
	usersMap: Map<string, PlannerUser>,
	events: PlannerVacationEvent[],
): void => {
	if (!isTaskReadyForSync(task)) return;
	const leaveType = getLeaveType(task);
	if (!leaveType) return;
	for (const ownerUser of extractVacationOwnerUsers(task)) {
		const assignee = toAllowedPublicUser(ownerUser);
		if (!assignee) continue;
		usersMap.set(assignee.value, assignee);
		events.push(...buildLeaveEvents(task, leaveType, assignee));
	}
};
// Keeps only one event per external id to avoid duplicates in output.
const deduplicateEventsByExternalId = (
	events: PlannerVacationEvent[],
): PlannerVacationEvent[] =>
	Array.from(
		new Map(events.map((event) => [event.externalId, event])).values(),
	);

export const resolveTargetTeam = (
	teamResponse: ClickUpTeamResponse,
): ClickUpTeamResponse["teams"][number] | undefined => teamResponse.teams[0];

// Maps team members from ClickUp API shape to planner user shape.
export const mapTeamMembersToPlannerUsers = (
	targetTeam: ClickUpTeamResponse["teams"][number] | undefined,
): PlannerUser[] =>
	(targetTeam?.members || [])
		.map((member) => toPlannerUser(member.user))
		.filter(isAllowedPlannerUser)
		.map(toPublicPlannerUser);

// Main transformer from raw ClickUp tasks/team to planner API payload.
export const buildVacationsPayload = (
	tasks: ClickUpTask[],
	teamMembers: PlannerUser[],
): ApiResponse => {
	const usersMap = mapUsersById(teamMembers);
	const events: PlannerVacationEvent[] = [];
	for (const task of tasks) appendTaskLeaveEvents(task, usersMap, events);
	return {
		users: sortUsers(Array.from(usersMap.values())),
		events: deduplicateEventsByExternalId(events),
	};
};
