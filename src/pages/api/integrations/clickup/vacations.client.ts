import type { ClickUpTask } from "./vacations.types";

const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

export const fetchClickUpJson = async <T>(
	path: string,
	token: string,
): Promise<T> => {
	const response = await fetch(`${CLICKUP_API_BASE}${path}`, {
		headers: { Authorization: token },
	});
	if (!response.ok) {
		const details = await response.text().catch(() => "");
		throw new Error(`ClickUp API error ${response.status}: ${details}`);
	}
	return (await response.json()) as T;
};

// Loads all tasks from a specific ClickUp list (including closed ones).
export const fetchTasksFromList = async (
	token: string,
	listId: string,
): Promise<{ tasks: ClickUpTask[] }> => {
	const query = "include_closed=true";
	return fetchClickUpJson<{ tasks: ClickUpTask[] }>(
		`/list/${listId}/task?${query}`,
		token,
	);
};
