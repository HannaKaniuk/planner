import { Migration } from '@mikro-orm/migrations';

export class Migration20260124195950 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists \`event\` (\`id\` integer not null primary key autoincrement, \`title\` text not null, \`start\` datetime not null, \`end\` datetime not null, \`user\` text null, \`project\` text null, \`priority\` text null);`);
  }

}
