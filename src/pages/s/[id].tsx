import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStore } from "@/store/store";
import { useUsersStore } from "@/store/usersStore";
import type { Event } from "@/types/event";

type SharedState = {
	events?: RawEvent[];
	showWeekend?: boolean;
	visibleDays?: number[];
	users?: { value: string; label: string }[];
};

type RawEvent = {
	id?: number;
	title?: string;
	start: string | Date;
	end: string | Date;
	user?: unknown;
	project?: unknown;
	priority?: "urgent" | "high" | "normal";
};

const parseEvents = (events: RawEvent[]): Event[] => {
	return events.map((e) => ({
		id: e.id ?? Date.now(),
		title: String(e.title ?? ""),
		start: e.start instanceof Date ? e.start : new Date(e.start),
		end: e.end instanceof Date ? e.end : new Date(e.end),
		user: typeof e.user === "string" ? e.user : "",
		project: typeof e.project === "string" ? e.project : "",
		priority: e.priority ?? "normal",
	}));
};

const SharePage: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const { setEvents, setShowWeekend, setVisibleDays } = useStore();
	const setUsers = useUsersStore((s) => s.setUsers);

	useEffect(() => {
		if (!id) return;

		const fetchSharedState = async () => {
			try {
				const res = await fetch(`/api/share?id=${id}`);
				if (!res.ok) throw new Error("Share not found");

				const data: SharedState = await res.json();

				if (Array.isArray(data.users) && data.users.length > 0) {
					setUsers(data.users);
				}
				if (Array.isArray(data.events)) {
					setEvents(parseEvents(data.events));
				}
				if (typeof data.showWeekend === "boolean") {
					setShowWeekend(data.showWeekend);
				}
				if (Array.isArray(data.visibleDays)) {
					setVisibleDays(data.visibleDays);
				}

				router.replace("/");
			} catch (err) {
				console.error(err);
				alert("Error");
				router.replace("/");
			}
		};

		fetchSharedState();
	}, [id, setEvents, setShowWeekend, setVisibleDays, setUsers, router]);

	return <div className="p-4 text-center">Loading...</div>;
};

export default SharePage;
