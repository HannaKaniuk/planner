import { Migration } from "@mikro-orm/migrations";

export class Migration20260430150500 extends Migration {
	override async up(): Promise<void> {
		this.addSql("delete from `clickup_user_rule`;");
		this.addSql(
			"insert into `clickup_user_rule` (`clickup_user_id`, `display_label`, `sort_order`, `is_active`) values ('81679226', 'Дима', 1, 1), ('81728975', 'Влад', 2, 1), ('81679227', 'Влада', 3, 1), ('81728978', 'Леня', 4, 1), ('87644641', 'Аня', 5, 1), ('87886222', 'Ася', 6, 1), ('87608164', 'Максим', 7, 1), ('93833253', 'Александра', 8, 1), ('93670228', 'Игорь', 9, 1), ('81676657', 'Слава', 10, 1);",
		);
	}

	override async down(): Promise<void> {
		this.addSql("delete from `clickup_user_rule`;");
		this.addSql(
			"insert into `clickup_user_rule` (`clickup_user_id`, `display_label`, `sort_order`, `is_active`) values ('87608164', 'Максим', 1, 1), ('93833253', 'Александра', 2, 1), ('93670228', 'Игорь', 3, 1), ('81676657', 'Слава', 4, 1), ('81679226', 'Дима', 5, 1), ('87644641', 'Аня', 6, 1), ('87886222', 'Ася', 7, 1), ('81728975', 'Влад', 8, 1), ('81679227', 'Влада', 9, 1), ('81728978', 'Леня', 10, 1);",
		);
	}
}
