import { promises as fs } from "node:fs";
import { join } from "node:path";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	8,
);

const STORAGE_FILE = join(process.cwd(), "data", "shortener.json");
const MAX_AGE_DAYS = 7;

interface ShortUrlEntry {
	url: string;
	createdAt: number;
}

type ShortenerStore = Record<string, ShortUrlEntry>;

async function ensureDataDir(): Promise<void> {
	const dataDir = join(process.cwd(), "data");
	try {
		await fs.access(dataDir);
	} catch {
		await fs.mkdir(dataDir, { recursive: true });
	}
}

async function loadStore(): Promise<ShortenerStore> {
	await ensureDataDir();
	try {
		const data = await fs.readFile(STORAGE_FILE, "utf-8");
		return JSON.parse(data);
	} catch {
		return {};
	}
}

async function saveStore(store: ShortenerStore): Promise<void> {
	await ensureDataDir();
	await fs.writeFile(STORAGE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

async function cleanupOldEntries(
	store: ShortenerStore,
): Promise<ShortenerStore> {
	const now = Date.now();
	const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
	const cleaned: ShortenerStore = {};

	for (const [id, entry] of Object.entries(store)) {
		if (now - entry.createdAt < maxAge) {
			cleaned[id] = entry;
		}
	}

	return cleaned;
}

export async function createShortUrl(originalUrl: string): Promise<string> {
	const store = await loadStore();
	const cleanedStore = await cleanupOldEntries(store);

	for (const [id, entry] of Object.entries(cleanedStore)) {
		if (entry.url === originalUrl) {
			return id;
		}
	}

	const id = nanoid();
	cleanedStore[id] = {
		url: originalUrl,
		createdAt: Date.now(),
	};

	await saveStore(cleanedStore);
	return id;
}

export async function getOriginalUrl(shortId: string): Promise<string | null> {
	const store = await loadStore();
	const entry = store[shortId];

	if (!entry) {
		return null;
	}

	const now = Date.now();
	const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

	if (now - entry.createdAt >= maxAge) {
		const cleanedStore = await cleanupOldEntries(store);
		await saveStore(cleanedStore);
		return null;
	}

	return entry.url;
}

export async function performCleanup(): Promise<number> {
	const store = await loadStore();
	const cleanedStore = await cleanupOldEntries(store);
	const removedCount =
		Object.keys(store).length - Object.keys(cleanedStore).length;

	if (removedCount > 0) {
		await saveStore(cleanedStore);
	}

	return removedCount;
}
