import { Migration } from "@mikro-orm/migrations";

export class Migration20260430145000 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			"create table `clickup_user_rule` (`id` integer not null primary key autoincrement, `clickup_user_id` text not null, `display_label` text not null, `sort_order` integer not null, `is_active` integer not null default true);",
		);
		this.addSql(
			"create unique index `clickup_user_rule_clickup_user_id_unique` on `clickup_user_rule` (`clickup_user_id`);",
		);

		this.addSql(
			"insert into `clickup_user_rule` (`clickup_user_id`, `display_label`, `sort_order`, `is_active`) values ('87608164', 'Максим', 1, 1), ('93833253', 'Александра', 2, 1), ('93670228', 'Игорь', 3, 1), ('81676657', 'Слава', 4, 1), ('81679226', 'Дима', 5, 1), ('87644641', 'Аня', 6, 1), ('87886222', 'Ася', 7, 1), ('81728975', 'Влад', 8, 1), ('81679227', 'Влада', 9, 1), ('81728978', 'Леня', 10, 1);",
		);

		this.addSql(
			"delete from `user` where (`session_id` = 'seed' and `room_id` is null) or (`session_id` is null and `room_id` is null);",
		);
		this.addSql(
			"insert into `user` (`value`, `label`, `session_id`, `room_id`) values ('87608164', 'Максим', 'seed', null), ('93833253', 'Александра', 'seed', null), ('93670228', 'Игорь', 'seed', null), ('81676657', 'Слава', 'seed', null), ('81679226', 'Дима', 'seed', null), ('87644641', 'Аня', 'seed', null), ('87886222', 'Ася', 'seed', null), ('81728975', 'Влад', 'seed', null), ('81679227', 'Влада', 'seed', null), ('81728978', 'Леня', 'seed', null);",
		);
	}

	override async down(): Promise<void> {
		this.addSql("delete from `clickup_user_rule`;");
		this.addSql("drop table if exists `clickup_user_rule`;");
	}
}
