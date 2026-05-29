export type ClickUpUser = {
	id: number | string;
	username?: string;
	email?: string;
	initials?: string;
};

export type ClickUpTask = {
	id: string;
	name: string;
	date_created?: string | null;
	start_date: string | null;
	due_date: string | null;
	assignees?: ClickUpUser[];
	status?: {
		status?: string;
		type?: string;
		date_created?: string | null;
	};
	custom_fields?: Array<{
		name?: string;
		type?: string;
		value?:
			| string
			| number
			| boolean
			| null
			| Array<{
					id: number | string;
					username?: string;
					email?: string;
					initials?: string;
			  }>;
		type_config?: {
			options?: Array<{ id: string | number; name?: string }>;
		};
	}>;
};

export type PlannerVacationEvent = {
	id: number;
	externalId: string;
	title: string;
	start: string;
	end: string;
	user: string;
	project: string;
	priority: "normal";
};

export type PlannerUser = {
	value: string;
	label: string;
};

export type ApiResponse = {
	users: PlannerUser[];
	events: PlannerVacationEvent[];
};

export type SyncSkippedReason =
	| "before-scheduled-time"
	| "already-synced-for-today";

export type SyncResponse = ApiResponse & {
	synced: boolean;
	nextAutoSyncAt: string;
	skippedReason?: SyncSkippedReason;
};

export type ClickUpTeamResponse = {
	teams: Array<{ id: string; members?: Array<{ user: ClickUpUser }> }>;
};
