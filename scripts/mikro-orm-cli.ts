import { CLIConfigurator, CLIHelper } from "@mikro-orm/cli";

const argv = CLIConfigurator.configure();

type ParsedArgs = {
	_: unknown[];
	[key: string]: unknown;
};

void argv.parse(process.argv.slice(2)).then((args: ParsedArgs) => {
	if (args._.length === 0) {
		CLIHelper.showHelp();
	}
});
