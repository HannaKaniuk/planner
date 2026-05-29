import LZString from "lz-string";

export async function createShortShareLink(
	state: object,
): Promise<string | null> {
	if (typeof window === "undefined") return null;

	try {
		const compressed = LZString.compressToEncodedURIComponent(
			JSON.stringify(state),
		);
		const longUrl = new URL(window.location.href);
		longUrl.searchParams.set("share", compressed);
		const longUrlString = longUrl.toString();

		try {
			const resp = await fetch("/api/share", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ payload: state }),
			});
			if (resp.ok) {
				const { id } = await resp.json();
				const url = new URL(window.location.origin);
				url.pathname = `/s/${id}`;
				return url.toString();
			}
		} catch (e) {
			console.warn("/api/share failed, using long URL", e);
		}

		return longUrlString;
	} catch (error) {
		console.error("Error creating share link:", error);
		return null;
	}
}

export function loadSharedState<T>(): T | null {
	if (typeof window === "undefined") return null;

	const params = new URLSearchParams(window.location.search);
	const compressed = params.get("share");
	if (!compressed) return null;

	try {
		const decompressed = LZString.decompressFromEncodedURIComponent(
			compressed,
		);
		if (!decompressed) return null;
		return JSON.parse(decompressed) as T;
	} catch {
		return null;
	}
}
