import { Migration } from "@mikro-orm/migrations";

export class Migration20260430160000 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			"alter table `event` add column `source` text not null default 'manual';",
		);
		this.addSql("alter table `event` add column `external_id` text null;");
		this.addSql(
			"create unique index `event_clickup_room_unique` on `event` (`source`, `external_id`, `room_id`) where `source` = 'clickup' and `external_id` is not null and `room_id` is not null;",
		);
		this.addSql(
			"create unique index `event_clickup_session_unique` on `event` (`source`, `external_id`, `session_id`) where `source` = 'clickup' and `external_id` is not null and `session_id` is not null;",
		);
	}

	override async down(): Promise<void> {
		this.addSql("drop index if exists `event_clickup_room_unique`;");
		this.addSql("drop index if exists `event_clickup_session_unique`;");
		this.addSql("alter table `event` drop column `source`;");
		this.addSql("alter table `event` drop column `external_id`;");
	}
}
