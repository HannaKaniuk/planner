import { Migration } from "@mikro-orm/migrations";

export class Migration20260501151500 extends Migration {
	override async up(): Promise<void> {
		// Build deterministic mapping old user values -> ClickUp ids per scope.
		this.addSql(`
			create table if not exists "_user_rebind_map" as
			with candidate_matches as (
				select
					u.id as old_user_id,
					u.value as old_value,
					u.label as old_label,
					u.session_id as session_id,
					u.room_id as room_id,
					r.clickup_user_id as new_value
				from "user" u
				join clickup_user_rule r
					on lower(trim(u.label)) = lower(trim(r.display_label))
				where trim(u.value) <> trim(r.clickup_user_id)
			),
			unique_matches as (
				select cm.*
				from candidate_matches cm
				join (
					select old_user_id
					from candidate_matches
					group by old_user_id
					having count(*) = 1
				) one on one.old_user_id = cm.old_user_id
			)
			select * from unique_matches;
		`);

		// Rebind historical events to new ClickUp user ids in the same scope.
		this.addSql(`
			update event
			set user = (
				select m.new_value
				from "_user_rebind_map" m
				where m.old_value = event.user
				  and ifnull(m.session_id, '') = ifnull(event.session_id, '')
				  and ifnull(m.room_id, '') = ifnull(event.room_id, '')
				limit 1
			)
			where exists (
				select 1
				from "_user_rebind_map" m
				where m.old_value = event.user
				  and ifnull(m.session_id, '') = ifnull(event.session_id, '')
				  and ifnull(m.room_id, '') = ifnull(event.room_id, '')
			);
		`);

		// Remove old user duplicates when a target ClickUp-id user already exists.
		this.addSql(`
			delete from "user"
			where id in (
				select old.id
				from "user" old
				join "_user_rebind_map" m on m.old_user_id = old.id
				join "user" target
					on target.value = m.new_value
					and ifnull(target.session_id, '') = ifnull(old.session_id, '')
					and ifnull(target.room_id, '') = ifnull(old.room_id, '')
			);
		`);

		// Rebind remaining legacy user rows to ClickUp ids.
		this.addSql(`
			update "user"
			set value = (
				select m.new_value
				from "_user_rebind_map" m
				where m.old_user_id = "user".id
				limit 1
			)
			where id in (select old_user_id from "_user_rebind_map");
		`);

		this.addSql(`drop table if exists "_user_rebind_map";`);
	}

	override async down(): Promise<void> {
		// One-way data migration: no deterministic rollback.
	}
}
