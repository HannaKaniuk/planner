import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

@Entity({ tableName: "user" })
@Unique({ properties: ["value", "sessionId"] })
@Unique({ properties: ["value", "roomId"] })
export class User {
	@PrimaryKey({ type: "number" })
	id!: number;

	@Property({ type: "string" })
	value!: string;

	@Property({ type: "string" })
	label!: string;

	@Property({
		type: "boolean",
		default: true,
		fieldName: "is_visible",
	})
	isVisible: boolean = true;

	@Property({
		type: "number",
		nullable: true,
		fieldName: "sort_order",
	})
	sortOrder?: number;

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
		isVisible?: boolean;
		sortOrder?: number;
		sessionId?: string;
		roomId?: string;
	}) {
		this.value = params.value;
		this.label = params.label;
		this.isVisible = params.isVisible ?? true;
		this.sortOrder = params.sortOrder;
		this.sessionId = params.sessionId;
		this.roomId = params.roomId;

		if (!this.roomId && !this.sessionId) {
			throw new Error("User must belong to session or room");
		}
	}
}
