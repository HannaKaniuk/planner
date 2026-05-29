import { Migration } from "@mikro-orm/migrations";

export class Migration20260227185259 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table \`project\` (\`id\` integer not null primary key autoincrement, \`value\` text not null, \`label\` text not null, \`session_id\` text null, \`room_id\` text null);`,
		);
		this.addSql(
			`create unique index \`project_value_room_id_unique\` on \`project\` (\`value\`, \`room_id\`);`,
		);
		this.addSql(
			`create unique index \`project_value_session_id_unique\` on \`project\` (\`value\`, \`session_id\`);`,
		);

		this.addSql(
			`create table \`user\` (\`id\` integer not null primary key autoincrement, \`value\` text not null, \`label\` text not null, \`session_id\` text null, \`room_id\` text null);`,
		);
		this.addSql(
			`create unique index \`user_value_room_id_unique\` on \`user\` (\`value\`, \`room_id\`);`,
		);
		this.addSql(
			`create unique index \`user_value_session_id_unique\` on \`user\` (\`value\`, \`session_id\`);`,
		);
	}

	override async down(): Promise<void> {
		this.addSql("drop table if exists `project`;");
		this.addSql("drop table if exists `user`;");
	}
}
