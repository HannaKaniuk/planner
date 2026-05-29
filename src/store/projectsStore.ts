import { create } from "zustand";

import { getRoomSocket } from "@/lib/roomSocketRef";
import { useStore } from "@/store/store";

export type PlannerProjects = {
	value: string;
	label: string;
};

type ProjectsStore = {
	projects: PlannerProjects[];
	setProjects: (projects: PlannerProjects[]) => void;
	loadProjects: (roomId?: string | null) => Promise<void>;
	addProject: (label: string) => Promise<void>;
	removeProject: (value: string) => Promise<void>;
};

const toPlannerProject = (project: { value: string; label: string }) => ({
	value: project.value,
	label: project.label,
});

export const useProjectsStore = create<ProjectsStore>()((set) => ({
	projects: [],
	setProjects: (projects) => set({ projects }),
	loadProjects: async (roomId?: string | null) => {
		try {
			const url = roomId?.trim()
				? `/api/projects?roomId=${encodeURIComponent(roomId)}`
				: "/api/projects";
			const res = await fetch(url, { credentials: "include" });
			if (!res.ok) return;
			const data = await res.json();
			set({
				projects: (data as { value: string; label: string }[]).map(
					toPlannerProject,
				),
			});
		} catch (err) {
			console.error("loadProjects failed:", err);
		}
	},

	addProject: async (label: string) => {
		const trimmed = label.trim();
		if (!trimmed) return;

		const roomId = useStore.getState().roomId;
		const url = roomId?.trim()
			? `/api/projects?roomId=${encodeURIComponent(roomId)}`
			: "/api/projects";

		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ label: trimmed }),
				credentials: "include",
			});

			if (res.ok) {
				const newProject = (await res.json()) as {
					value: string;
					label: string;
				};
				set((state) => ({
					projects: [...state.projects, toPlannerProject(newProject)],
				}));
				const socket = getRoomSocket();
				if (roomId?.trim() && socket) {
					socket.emit("projects-changed", roomId);
				}
			} else {
				const err = await res.json().catch(() => ({}));
				console.error("addProject failed:", err);
			}
		} catch (err) {
			console.error("addProject failed:", err);
		}
	},

	removeProject: async (value: string) => {
		const roomId = useStore.getState().roomId;
		const url = roomId?.trim()
			? `/api/projects/${encodeURIComponent(value)}?roomId=${encodeURIComponent(
					roomId,
				)}`
			: `/api/projects/${encodeURIComponent(value)}`;

		try {
			const res = await fetch(url, {
				method: "DELETE",
				credentials: "include",
			});

			if (res.ok) {
				set((state) => ({
					projects: state.projects.filter((p) => p.value !== value),
				}));
				const { setEvents } = useStore.getState();
				setEvents((prev) => prev.filter((ev) => ev.project !== value));
				const socket = getRoomSocket();
				if (roomId?.trim() && socket) {
					socket.emit("projects-changed", roomId);
				}
			} else {
				const err = await res.json().catch(() => ({}));
				console.error("removeProject failed:", err);
			}
		} catch (err) {
			console.error("removeProject failed:", err);
		}
	},
}));
