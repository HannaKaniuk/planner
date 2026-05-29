import { randomUUID } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";

const SESSION_COOKIE_NAME = "planner_session_id";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const getOrCreateSessionId = (
	req: NextApiRequest,
	res: NextApiResponse,
): string => {
	let sessionId = req.cookies[SESSION_COOKIE_NAME];
	if (sessionId) return sessionId;
	sessionId = randomUUID();
	res.setHeader(
		"Set-Cookie",
		`${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`,
	);
	return sessionId;
};
