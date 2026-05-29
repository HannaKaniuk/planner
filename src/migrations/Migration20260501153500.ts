import { Migration } from "@mikro-orm/migrations";

export class Migration20260501153500 extends Migration {
	override async up(): Promise<void> {
		// Backfill scoped users for events that have no matching user row.
		this.addSql(`
			insert into "user" (
				value,
				label,
				is_visible,
				sort_order,
				session_id,
				room_id
			)
			select
				e.user as value,
				coalesce(r.display_label, e.user) as label,
				1 as is_visible,
				coalesce(r.sort_order, 9999) as sort_order,
				e.session_id as session_id,
				e.room_id as room_id
			from (
				select distinct
					user,
					session_id,
					room_id
				from event
			) e
			left join clickup_user_rule r
				on r.clickup_user_id = e.user
			left join "user" u
				on u.value = e.user
				and ifnull(u.session_id, '') = ifnull(e.session_id, '')
				and ifnull(u.room_id, '') = ifnull(e.room_id, '')
			where u.id is null
			  and e.user is not null
			  and trim(e.user) <> '';
		`);
	}

	override async down(): Promise<void> {
		// Irreversible backfill migration.
	}
}
