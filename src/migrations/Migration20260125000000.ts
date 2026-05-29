import { Migration } from '@mikro-orm/migrations';

export class Migration20260125000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`create table if not exists \`share\` (\`id\` text not null primary key, \`payload\` text not null, \`created_at\` datetime not null);`);
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "share";`);
  }
}

