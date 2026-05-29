import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

async function ensureDataDir() {
	const dataDir = join(process.cwd(), "data");
	if (!existsSync(dataDir)) {
		await mkdir(dataDir, { recursive: true });
	}
}

function formatDateForFilename(date: Date): string {
	const dd = String(date.getDate()).padStart(2, "0");
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const yyyy = date.getFullYear();
	return `${dd}-${mm}-${yyyy}`;
}

async function main() {
	await ensureDataDir();

	const dataDir = join(process.cwd(), "data");
	const dbPath = join(dataDir, "database.sqlite");

	const today = new Date();
	const suffix = formatDateForFilename(today);
	const backupPath = join(dataDir, `backup_${suffix}.sqlite`);

	if (!existsSync(dbPath)) {
		console.warn(
			`[backup-db] database file not found at ${dbPath}, nothing to backup`,
		);
		return;
	}

	await copyFile(dbPath, backupPath);
	console.log(`[backup-db] created backup: ${backupPath}`);
}

main().catch((err) => {
	console.error("[backup-db] failed:", err);
	process.exit(1);
});
