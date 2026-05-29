import { Migration } from "@mikro-orm/migrations";

export class Migration20260501153000 extends Migration {
	override async up(): Promise<void> {
		this.addSql(`
			create table if not exists "_legacy_user_alias_map" (
				legacy_value text not null primary key,
				clickup_user_id text not null
			);
		`);

		// Explicit aliases for legacy manual values observed in production data.
		this.addSql(`
			insert into "_legacy_user_alias_map" (legacy_value, clickup_user_id) values
				('dima', '81679226'),
				('Александра', '93833253'),
				('aleksandra kh.', '93833253')
			on conflict(legacy_value) do update
			set clickup_user_id = excluded.clickup_user_id;
		`);

		this.addSql(`
			update event
			set user = (
				select m.clickup_user_id
				from "_legacy_user_alias_map" m
				where lower(trim(m.legacy_value)) = lower(trim(event.user))
				limit 1
			)
			where exists (
				select 1
				from "_legacy_user_alias_map" m
				where lower(trim(m.legacy_value)) = lower(trim(event.user))
			);
		`);

		this.addSql(`drop table if exists "_legacy_user_alias_map";`);
	}

	override async down(): Promise<void> {
		// One-way data migration.
	}
}
