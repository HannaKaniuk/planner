import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/entities/User.entity";
import { getORM } from "@/lib/database";
import { getOrCreateSessionId } from "@/lib/session";
import { resolveRequestScope } from "@/lib/scope";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const orm = await getORM();
	const em = orm.em.fork();

	const sessionId = getOrCreateSessionId(req, res);
	const scope = resolveRequestScope(req, sessionId);
	const usersOrderBy = { sortOrder: "asc" as const, label: "asc" as const };

	if (req.method === "GET") {
		try {
			const users = await em.find(
				User,
				{ ...scope.scopeWhere, isVisible: true },
				{ orderBy: usersOrderBy },
			);
			return res.status(200).json(users);
		} catch (error) {
			console.error("Error fetching users:", error);
			return res.status(500).json({ error: "Failed to fetch users" });
		}
	}

	res.setHeader("Allow", ["GET"]);
	return res.status(405).json({ error: "Method not allowed" });
}
