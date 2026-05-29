import { Migration } from "@mikro-orm/migrations";

export class Migration20260501100000 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			"create table if not exists `clickup_sync_state` (`scope_key` text not null, `last_synced_at` datetime not null, constraint `clickup_sync_state_pkey` primary key (`scope_key`));",
		);
	}

	override async down(): Promise<void> {
		this.addSql("drop table if exists `clickup_sync_state`;");
	}
}
