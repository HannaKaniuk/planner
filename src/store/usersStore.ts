import { create } from "zustand";

export type PlannerUser = {
	value: string;
	label: string;
	avatar?: string;
};

type UsersStore = {
	users: PlannerUser[];
	setUsers: (users: PlannerUser[]) => void;
	loadUsers: (roomId?: string | null) => Promise<void>;
};

const toPlannerUser = (u: { value: string; label: string }) => ({
	value: u.value,
	label: u.label,
});

export const useUsersStore = create<UsersStore>()((set) => ({
	users: [],
	setUsers: (users) => set({ users }),

	loadUsers: async (roomId?: string | null) => {
		try {
			const url = roomId?.trim()
				? `/api/users?roomId=${encodeURIComponent(roomId)}`
				: "/api/users";
			const res = await fetch(url, { credentials: "include" });
			if (!res.ok) return;
			const data = await res.json();
			set({
				users: (data as { value: string; label: string }[]).map(toPlannerUser),
			});
		} catch (err) {
			console.error("loadUsers failed:", err);
		}
	},
}));
