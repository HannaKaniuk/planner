import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

@Entity({ tableName: "project" })
@Unique({ properties: ["value", "sessionId"] })
@Unique({ properties: ["value", "roomId"] })
export class Project {
	@PrimaryKey({ type: "number" })
	id!: number;

	@Property({ type: "string" })
	value!: string;

	@Property({ type: "string" })
	label!: string;

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

	constructor(params: {
		value: string;
		label: string;
		sessionId?: string;
		roomId?: string;
	}) {
		this.value = params.value;
		this.label = params.label;
		this.sessionId = params.sessionId;
		this.roomId = params.roomId;

		if (!this.roomId && !this.sessionId) {
			throw new Error("Project must belong to session or room");
		}
	}
}
