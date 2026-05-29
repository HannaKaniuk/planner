import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

export type Priority = "normal" | "high" | "urgent";
export type EventSource = "manual" | "clickup";

@Entity({ tableName: "event" })
export class Event {
	@PrimaryKey({ type: "number" })
	id!: number;

	@Property({
		type: "string",
		nullable: true,
		fieldName: "session_id",
		index: true,
	})
	sessionId?: string;

	@Property({
		type: "string",
		nullable: true,
		fieldName: "room_id",
		index: true,
	})
	roomId?: string;

	@Property({ type: "string" })
	title!: string;

	@Property({ type: "datetime" })
	start!: Date;

	@Property({ type: "datetime" })
	end!: Date;

	@Property({ type: "string" })
	user!: string;

	@Property({ type: "string", nullable: true })
	project?: string;

	@Property({ type: "string", nullable: true })
	priority?: Priority;

	@Property({ type: "string", default: "manual" })
	source: EventSource = "manual";

	@Property({ type: "string", nullable: true, fieldName: "external_id" })
	externalId?: string;

	constructor(data: {
		title: string;
		start: Date;
		end: Date;
		user: string;
		project?: string;
		priority?: Priority;
		source?: EventSource;
		externalId?: string;
	}) {
		this.title = data.title;
		this.start = data.start;
		this.end = data.end;
		this.user = data.user;
		this.project = data.project;
		this.priority = data.priority;
		this.source = data.source ?? "manual";
		this.externalId = data.externalId;
	}
}
