import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

@Entity({ tableName: "clickup_user_rule" })
@Unique({ properties: ["clickupUserId"] })
export class ClickUpUserRule {
	@PrimaryKey({ type: "number" })
	id!: number;

	@Property({ type: "string", fieldName: "clickup_user_id" })
	clickupUserId!: string;

	@Property({ type: "string", fieldName: "display_label" })
	displayLabel!: string;

	@Property({ type: "number", fieldName: "sort_order" })
	sortOrder!: number;

	@Property({ type: "boolean", fieldName: "is_active", default: true })
	isActive: boolean = true;
}
