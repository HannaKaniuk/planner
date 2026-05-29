import { Migration } from "@mikro-orm/migrations";

export class Migration20260204000004 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table if not exists \`share_event\` (
        \`id\` integer not null primary key autoincrement,
        \`share_id\` text not null,
        \`event_id\` integer not null,
        constraint \`share_event_share_id_foreign\` foreign key(\`share_id\`) references \`share\`(\`id\`) on delete cascade,
        constraint \`share_event_event_id_foreign\` foreign key(\`event_id\`) references \`event\`(\`id\`) on delete cascade
      );
    `);

    this.addSql(
      "create index if not exists `share_event_share_id_index` on `share_event` (`share_id`);",
    );
    this.addSql(
      "create index if not exists `share_event_event_id_index` on `share_event` (`event_id`);",
    );
  }

  async down(): Promise<void> {
    this.addSql("drop table if exists `share_event`;");
  }
}


