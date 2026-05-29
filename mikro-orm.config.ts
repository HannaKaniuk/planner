import { defineConfig } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { ClickUpSyncState } from "./src/entities/ClickUpSyncState.entity";
import { ClickUpUserRule } from "./src/entities/ClickUpUserRule.entity";
import { Event } from "./src/entities/Event.entity";
import { Project } from "./src/entities/Project.entity";
import { Share } from "./src/entities/Share.entity";
import { User } from "./src/entities/User.entity";

export default defineConfig({
	driver: SqliteDriver,
	dbName: "./data/database.sqlite",
	entities: [Event, Share, User, Project, ClickUpUserRule, ClickUpSyncState],
	migrations: {
		path: "./src/migrations",
	},
	extensions: [Migrator],
});
