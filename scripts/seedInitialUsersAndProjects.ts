import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { Project } from "../src/entities/Project.entity";
import { User } from "../src/entities/User.entity";

const seedUsers = [
	{ value: "user-1", label: "User1" },
	{ value: "user-2", label: "User2" },
	{ value: "user-3", label: "User3" },
	{ value: "user-4", label: "User4" },
	{ value: "user-5", label: "User5" },
	{ value: "user-6", label: "User6" },
];

const seedProjects = [
	{ value: "project-1", label: "Project1" },
	{ value: "project-2", label: "Project2" },
	{ value: "project-3", label: "Project3" },
	{ value: "project-4", label: "Project4" },
	{ value: "project-5", label: "Project5" },
	{ value: "project-6", label: "Project6" },
];

const main = async () => {
	const orm = await MikroORM.init({
		driver: SqliteDriver,
		dbName: "./data/database.sqlite",
		entities: [User, Project],
	});

	const em = orm.em.fork();

	await em.getConnection().execute(
		`
      insert into "user" ("value","label","session_id","room_id")
      values ${seedUsers.map(() => "(?, ?, ?, ?)").join(", ")}
    `,
		seedUsers.flatMap((u) => [u.value, u.label, "seed", null]),
	);

	await em.getConnection().execute(
		`
      insert into "project" ("value","label","session_id","room_id")
      values ${seedProjects.map(() => "(?, ?, ?, ?)").join(", ")}
    `,
		seedProjects.flatMap((p) => [p.value, p.label, "seed", null]),
	);

	await orm.close(true);
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
