import { Migration } from "@mikro-orm/migrations";

export class Migration20250305AddSessionAndRoomIdIndexes extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'create index if not exists idx_user_session_id on "user"(session_id);',
		);
		this.addSql(
			'create index if not exists idx_user_room_id on "user"(room_id);',
		);
		this.addSql(
			'create index if not exists idx_project_session_id on "project"(session_id);',
		);
		this.addSql(
			'create index if not exists idx_project_room_id on "project"(room_id);',
		);
		this.addSql(
			'create index if not exists idx_event_session_id on "event"(session_id);',
		);
		this.addSql(
			'create index if not exists idx_event_room_id on "event"(room_id);',
		);
	}

	async down(): Promise<void> {
		this.addSql("drop index if exists idx_user_session_id;");
		this.addSql("drop index if exists idx_user_room_id;");
		this.addSql("drop index if exists idx_project_session_id;");
		this.addSql("drop index if exists idx_project_room_id;");
		this.addSql("drop index if exists idx_event_session_id;");
		this.addSql("drop index if exists idx_event_room_id;");
	}
}
