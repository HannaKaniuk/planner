import type { NextApiRequest, NextApiResponse } from "next";
import { createShortUrl } from "@/lib/shortener";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  try {
    const { url } = req.body as { url?: string };
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "url is required" });
    }

    if (url.length > 2000) {
      return res.status(400).json({ error: "URL too long" });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const shortId = await createShortUrl(url);
   
    const forwardedProto = req.headers["x-forwarded-proto"];
    const protocol = Array.isArray(forwardedProto) 
      ? forwardedProto[0] 
      : forwardedProto || 
        (req.headers.referer?.startsWith("https://") ? "https" : "http") ||
        (process.env.NODE_ENV === "production" ? "https" : "http");

    const forwardedHost = req.headers["x-forwarded-host"];
    const host = Array.isArray(forwardedHost)
      ? forwardedHost[0]
      : forwardedHost ||
        req.headers.host || 
        "localhost:3000";
    
    const origin = `${protocol}://${host}`;
    const shortUrl = `${origin}/r/${shortId}`;
    
    return res.status(200).json({ shortUrl });
  } catch (e) {
    console.error("Shortener API error:", e);
    return res.status(500).json({ error: "Internal error", detail: String(e) });
  }
}
