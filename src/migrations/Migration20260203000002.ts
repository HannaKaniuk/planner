import { Migration } from "@mikro-orm/migrations";

export class Migration20260203000002 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE \`event_new\` (
        \`id\` integer not null primary key autoincrement,
        \`title\` text not null,
        \`start\` datetime not null,
        \`end\` datetime not null,
        \`user\` text not null,
        \`project\` text null,
        \`priority\` text null,
        \`session_id\` text null
      );
    `);

    this.addSql(`
      INSERT INTO \`event_new\` (\`id\`, \`title\`, \`start\`, \`end\`, \`user\`, \`project\`, \`priority\`)
      SELECT \`id\`, \`title\`, \`start\`, \`end\`, \`user\`, \`project\`, \`priority\` FROM \`event\`;
    `);

    this.addSql(`DROP TABLE \`event\`;`);
    this.addSql(`ALTER TABLE \`event_new\` RENAME TO \`event\`;`);
  }

  async down(): Promise<void> {
    this.addSql(`
      CREATE TABLE \`event_old\` (
        \`id\` integer not null primary key autoincrement,
        \`title\` text not null,
        \`start\` datetime not null,
        \`end\` datetime not null,
        \`user\` text not null,
        \`project\` text null,
        \`priority\` text null
      );
    `);

    this.addSql(`
      INSERT INTO \`event_old\` (\`id\`, \`title\`, \`start\`, \`end\`, \`user\`, \`project\`, \`priority\`)
      SELECT \`id\`, \`title\`, \`start\`, \`end\`, \`user\`, \`project\`, \`priority\` FROM \`event\`;
    `);

    this.addSql(`DROP TABLE \`event\`;`);
    this.addSql(`ALTER TABLE \`event_old\` RENAME TO \`event\`;`);
  }
}


