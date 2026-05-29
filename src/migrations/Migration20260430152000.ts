import { Migration } from "@mikro-orm/migrations";

export class Migration20260430152000 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			"update `clickup_user_rule` set `display_label` = 'Максим', `sort_order` = 7, `is_active` = 1 where `clickup_user_id` = '87608164';",
		);
		this.addSql(
			"update `clickup_user_rule` set `display_label` = 'Александра', `sort_order` = 8, `is_active` = 1 where `clickup_user_id` = '93833253';",
		);
		this.addSql(
			"update `clickup_user_rule` set `sort_order` = 9, `is_active` = 1 where `clickup_user_id` = '93670228';",
		);
		this.addSql(
			"update `clickup_user_rule` set `sort_order` = 10, `is_active` = 1 where `clickup_user_id` = '81676657';",
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			"update `clickup_user_rule` set `display_label` = 'Макс', `sort_order` = 7, `is_active` = 1 where `clickup_user_id` = '87608164';",
		);
		this.addSql(
			"update `clickup_user_rule` set `display_label` = 'Александра', `sort_order` = 100, `is_active` = 0 where `clickup_user_id` = '93833253';",
		);
		this.addSql(
			"update `clickup_user_rule` set `sort_order` = 8, `is_active` = 1 where `clickup_user_id` = '93670228';",
		);
		this.addSql(
			"update `clickup_user_rule` set `sort_order` = 9, `is_active` = 1 where `clickup_user_id` = '81676657';",
		);
	}
}
