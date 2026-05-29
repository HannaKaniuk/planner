import type { NextApiRequest, NextApiResponse } from "next";
import { Project } from "@/entities/Project.entity";
import { getORM } from "@/lib/database";
import { getOrCreateSessionId } from "@/lib/session";
import { resolveRequestScope } from "@/lib/scope";

const slugify = (label: string): string => {
	const normalized = label.trim();
	return normalized.length === 0 ? `project-${Date.now()}` : normalized;
};

const DEFAULT_SESSION_ID = "seed";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const orm = await getORM();
	const em = orm.em.fork();

	const sessionId = getOrCreateSessionId(req, res);
	const scope = resolveRequestScope(req, sessionId);

	if (req.method === "GET") {
		try {
			const projects = await em.find(Project, scope.scopeWhere);

			if (projects.length > 0) {
				return res.status(200).json(projects);
			}

			const baseProjects = await em.find(Project, {
				sessionId: DEFAULT_SESSION_ID,
				roomId: undefined,
			});

			if (baseProjects.length === 0) {
				return res.status(200).json([]);
			}

			const ProjectClass = orm.getMetadata().get("Project").class;

			if (!scope.hasRoomId) {
				const seededForSession = baseProjects.map((p) =>
					em.create(ProjectClass, {
						value: p.value,
						label: p.label,
						sessionId,
						roomId: scope.roomId,
					}),
				);
				em.persist(seededForSession);
				await em.flush();
				return res.status(200).json(seededForSession);
			}

			const sessionProjects = await em.find(Project, { sessionId });
			const source =
				sessionProjects.length > 0 ? sessionProjects : baseProjects;

			const seededForRoom = source.map((p) =>
				em.create(ProjectClass, {
					value: p.value,
					label: p.label,
					sessionId: undefined,
					roomId: scope.roomId,
				}),
			);
			em.persist(seededForRoom);
			await em.flush();

			return res.status(200).json(seededForRoom);
		} catch (error) {
			console.error("Error fetching projects:", error);
			return res.status(500).json({ error: "Failed to fetch projects" });
		}
	}

	if (req.method === "POST") {
		try {
			const { label } = req.body;

			if (!label || typeof label !== "string") {
				return res.status(400).json({ error: "Label is required" });
			}

			const trimmedLabel = label.trim();
			if (!trimmedLabel) {
				return res.status(400).json({ error: "Label cannot be empty" });
			}

			const existingProjects = await em.find(Project, scope.scopeWhere);
			const existingValues = new Set(existingProjects.map((p) => p.value));

			let value = slugify(trimmedLabel);
			let suffix = 1;
			while (existingValues.has(value)) {
				value = `${slugify(trimmedLabel)}-${suffix}`;
				suffix += 1;
			}

			const ProjectClass = orm.getMetadata().get("Project").class;
			const project = em.create(ProjectClass, {
				value,
				label: trimmedLabel,
				...scope.saveScope,
			});

			await em.persistAndFlush(project);

			if (scope.hasRoomId) {
				const sessionHas = await em.findOne(Project, {
					sessionId,
					value,
				});
				if (!sessionHas) {
					const sessionProject = em.create(ProjectClass, {
						value,
						label: trimmedLabel,
						sessionId,
						roomId: undefined,
					});
					await em.persistAndFlush(sessionProject);
				}
			}

			return res.status(201).json(project);
		} catch (error) {
			console.error("Error creating project:", error);
			return res.status(500).json({ error: "Failed to create project" });
		}
	}

	res.setHeader("Allow", ["GET", "POST"]);
	return res.status(405).json({ error: "Method not allowed" });
}
