import type { NextApiRequest, NextApiResponse } from "next";
import { Project } from "@/entities/Project.entity";
import { getORM } from "@/lib/database";
import { getOrCreateSessionId } from "@/lib/session";
import { resolveRequestScope } from "@/lib/scope";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "DELETE") {
		res.setHeader("Allow", ["DELETE"]);
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { value } = req.query;
	if (!value || typeof value !== "string") {
		return res.status(400).json({ error: "Project value is required" });
	}

	const orm = await getORM();
	const em = orm.em.fork();

	const sessionId = getOrCreateSessionId(req, res);
	const scope = resolveRequestScope(req, sessionId);

	try {
		const where = scope.hasRoomId
			? { value, roomId: scope.roomId }
			: { value, sessionId };

		const project = await em.findOne(Project, where);

		if (!project) {
			return res.status(404).json({ error: "Project not found" });
		}

		await em.removeAndFlush(project);

		return res.status(200).json({ message: "Project deleted successfully" });
	} catch (error) {
		console.error("Error deleting project:", error);
		return res.status(500).json({ error: "Failed to delete project" });
	}
}
