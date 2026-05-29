import { Migration } from "@mikro-orm/migrations";

export class Migration20260430154000 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			"alter table `user` add column `is_visible` integer not null default true;",
		);
		this.addSql("alter table `user` add column `sort_order` integer null;");
		this.addSql(
			"update `user` set `sort_order` = 9999 where `sort_order` is null;",
		);
		this.addSql(
			"update `user` set `label` = (select `display_label` from `clickup_user_rule` r where r.`clickup_user_id` = `user`.`value`), `sort_order` = (select `sort_order` from `clickup_user_rule` r where r.`clickup_user_id` = `user`.`value`), `is_visible` = (select `is_active` from `clickup_user_rule` r where r.`clickup_user_id` = `user`.`value`) where exists (select 1 from `clickup_user_rule` r where r.`clickup_user_id` = `user`.`value`);",
		);
	}

	override async down(): Promise<void> {
		this.addSql("alter table `user` drop column `is_visible`;");
		this.addSql("alter table `user` drop column `sort_order`;");
	}
}
