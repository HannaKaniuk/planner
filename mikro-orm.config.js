require("ts-node").register({
  project: "./tsconfig.mikro-orm.json",
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  },
});

module.exports = require("./mikro-orm.config.ts").default;
