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
	{ value: "cdl", label: "CDL" },
	{ value: "president", label: "Президент" },
	{ value: "exchange", label: "Обменник" },
	{ value: "laitek", label: "Лайтек" },
	{ value: "tether", label: "Tether" },
	{ value: "trains", label: "Поезда" },
	{ value: "sgcb", label: "SGCB" },
	{ value: "planner", label: "Planner" },
	{ value: "kids", label: "Дети" },
	{ value: "kpa", label: "КПА" },
	{ value: "dallas", label: "Dallas" },
	{ value: "calc", label: "Калькулятор" },
	{ value: "course", label: "обучение" },
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
