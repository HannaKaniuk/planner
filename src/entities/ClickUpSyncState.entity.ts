import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "clickup_sync_state" })
export class ClickUpSyncState {
	@PrimaryKey({ type: "string", fieldName: "scope_key" })
	scopeKey!: string;

	@Property({ type: "datetime", fieldName: "last_synced_at" })
	lastSyncedAt!: Date;
}
