import { Migration } from "@mikro-orm/migrations";

export class Migration20260311000000 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			"create table `room` (`id` text not null, `creator_session_id` text not null, constraint `room_pkey` primary key (`id`));",
		);
		this.addSql(
			"create index `room_creator_session_id_index` on `room` (`creator_session_id`);",
		);
	}

	override async down(): Promise<void> {
		this.addSql("drop table if exists `room`;");
	}
}

