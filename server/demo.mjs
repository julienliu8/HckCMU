import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { networkInterfaces } from "node:os";
import { validateGift } from "../store/gifting.ts";
const root = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
export function createDemoServer() {
  const rooms = new Map();
  return createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Cache-Control", "no-store");
    const json = (status, data) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    try {
      const url = new URL(req.url, "http://demo.local");
      const match = url.pathname.match(
        /^\/api\/rooms\/([a-zA-Z0-9-]{1,32})(\/gifts)?$/,
      );
      if (match) {
        const room = match[1];
        if (req.method === "GET" && !match[2])
          return json(200, { gifts: rooms.get(room) || [] });
        if (req.method === "POST" && match[2]) {
          let body = "";
          for await (const chunk of req) {
            body += chunk;
            if (Buffer.byteLength(body) > 10000)
              return json(413, { error: "Flower payload too large" });
          }
          const gift = validateGift(JSON.parse(body));
          if (!rooms.has(room) && rooms.size >= 50)
            return json(429, { error: "Demo room limit reached" });
          const previous = rooms.get(room) || [];
          const existing = previous.find((g) => g.id === gift.id);
          if (existing) {
            if (JSON.stringify(existing) !== JSON.stringify(gift))
              return json(409, { error: "Gift ID already used" });
            return json(200, { gift: existing });
          }
          rooms.set(room, [...previous, gift].slice(-100));
          return json(201, { gift });
        }
        return json(405, { error: "Method not allowed" });
      }
      if (url.pathname.startsWith("/api/"))
        return json(400, {
          error: "Room code must be 1–32 letters, digits, or hyphens",
        });
      if (req.method !== "GET")
        return json(405, { error: "Method not allowed" });
      const file = resolve(
        root,
        "." +
          decodeURIComponent(
            url.pathname === "/" ? "/index.html" : url.pathname,
          ),
      );
      if (!file.startsWith(root + sep))
        return json(403, { error: "Invalid path" });
      const mime = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".json": "application/json",
        ".woff2": "font/woff2",
      };
      try {
        const content = await readFile(file);
        res.writeHead(200, {
          "Content-Type": mime[extname(file)] || "application/octet-stream",
        });
        res.end(content);
      } catch {
        return json(404, {
          error: "Preview missing. Run npm run demo:build first.",
        });
      }
    } catch (error) {
      json(400, { error: error.message || "Invalid request" });
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const port = Number(process.env.DEMO_PORT || 8787);
  createDemoServer().listen(port, "0.0.0.0", () => {
    console.log(`Bloom Village demo: http://localhost:${port}`);
    for (const entries of Object.values(networkInterfaces()))
      for (const item of entries || [])
        if (item.family === "IPv4" && !item.internal)
          console.log(`Same Wi-Fi: http://${item.address}:${port}`);
    console.log(
      "Use Live room with the same room code and different identities. Demo identities are not authenticated. Room data resets when this server stops.",
    );
  });
}
