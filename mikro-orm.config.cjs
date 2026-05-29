const tsNode = require("ts-node");
tsNode.register({
  project: "./tsconfig.mikro-orm.json",
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    esModuleInterop: true,
  },
});

require("tsconfig-paths").register({
  baseUrl: ".",
  paths: {
    "@/*": ["src/*"],
  },
});

const { defineConfig } = require("@mikro-orm/core");
const { SqliteDriver } = require("@mikro-orm/sqlite");
const { Migrator } = require("@mikro-orm/migrations");

module.exports = defineConfig({
  driver: SqliteDriver,
  dbName: "./data/database.sqlite",
  entities: ["./src/entities/**/*.entity.ts"],
  entitiesTs: ["./src/entities/**/*.entity.ts"],
  migrations: {
    path: "./src/migrations",
  },
  extensions: [Migrator],
  preferTs: true,
  tsNode: true,
});
