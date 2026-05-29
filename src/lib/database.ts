import { MikroORM, RequestContext } from "@mikro-orm/core";
import type { SqlEntityManager } from "@mikro-orm/sqlite";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { ClickUpSyncState } from "@/entities/ClickUpSyncState.entity";
import { ClickUpUserRule } from "@/entities/ClickUpUserRule.entity";
import { Event } from "@/entities/Event.entity";
import { Project } from "@/entities/Project.entity";
import { Room } from "@/entities/Room.entity";
import { Share } from "@/entities/Share.entity";
import { User } from "@/entities/User.entity";

const globalForOrm = globalThis as unknown as {
	orm: MikroORM<SqliteDriver, SqlEntityManager<SqliteDriver>> | undefined;
	ormPromise:
		| Promise<MikroORM<SqliteDriver, SqlEntityManager<SqliteDriver>>>
		| undefined;
};

export async function getORM() {
	if (globalForOrm.orm) {
		return globalForOrm.orm;
	}

	if (globalForOrm.ormPromise) {
		return globalForOrm.ormPromise;
	}

	globalForOrm.ormPromise = MikroORM.init<
		SqliteDriver,
		SqlEntityManager<SqliteDriver>
	>({
		driver: SqliteDriver,
		dbName: "./data/database.sqlite",
		entities: [
			Event,
			Share,
			User,
			Project,
			Room,
			ClickUpUserRule,
			ClickUpSyncState,
		],
		migrations: {
			path: "./src/migrations",
		},
	});

	globalForOrm.orm = await globalForOrm.ormPromise;
	globalForOrm.ormPromise = undefined;

	return globalForOrm.orm;
}

export function getEntityManager() {
	return RequestContext.getEntityManager();
}
