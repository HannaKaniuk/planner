import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { Project } from "../src/entities/Project.entity";
import { User } from "../src/entities/User.entity";

const seedUsers = [
	{ value: "81679226", label: "Дима" },
	{ value: "81728975", label: "Влад" },
	{ value: "81679227", label: "Влада" },
	{ value: "81728978", label: "Леня" },
	{ value: "87644641", label: "Аня" },
	{ value: "87886222", label: "Ася" },
	{ value: "87608164", label: "Максим" },
	{ value: "93833253", label: "Александра" },
	{ value: "93670228", label: "Игорь" },
	{ value: "81676657", label: "Слава" },
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
