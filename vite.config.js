import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const sectionsFilePath = path.join(projectRoot, "src/data/sections.json");
const markdownDirPath = path.join(projectRoot, "src/data/markdown");
const contentImagesDirPath = path.join(projectRoot, "src/data/content-images");

const contentTypes = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sanitizeMarkdownFileName(value, fallback) {
  const cleaned = String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/[^\p{L}\p{N}._-]/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .replace(/\.+$/, "");

  const baseName = cleaned || fallback;
  return baseName.toLowerCase().endsWith(".md") ? baseName : `${baseName}.md`;
}

function normalizeSection(section, index) {
  const id = typeof section.id === "string" && section.id.trim() ? section.id : `section-${index + 1}`;

  return {
    id,
    title: typeof section.title === "string" ? section.title : `目录 ${index + 1}`,
    eyebrow: typeof section.eyebrow === "string" ? section.eyebrow : "",
    markdownFile: sanitizeMarkdownFileName(section.markdownFile, `${id}.md`),
  };
}

async function readRequestBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function getRequestedFileName(request) {
  return decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname)
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function resolveSafeFile(baseDir, fileName, allowedExtensions = []) {
  const normalizedFileName = fileName.replace(/\\/g, "/");

  if (!normalizedFileName || normalizedFileName.includes("..") || path.isAbsolute(normalizedFileName)) {
    return null;
  }

  const resolvedPath = path.resolve(baseDir, normalizedFileName);
  const resolvedBase = path.resolve(baseDir);

  if (!resolvedPath.startsWith(`${resolvedBase}${path.sep}`)) {
    return null;
  }

  if (allowedExtensions.length > 0 && !allowedExtensions.includes(path.extname(resolvedPath).toLowerCase())) {
    return null;
  }

  return resolvedPath;
}

async function serveDataFile(request, response, baseDir, allowedExtensions = []) {
  const fileName = getRequestedFileName(request);
  const filePath = resolveSafeFile(baseDir, fileName, allowedExtensions);

  if (!filePath) {
    response.statusCode = 400;
    response.end("Invalid file path.");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    response.setHeader("Content-Type", contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    response.end(content);
  } catch {
    response.statusCode = 404;
    response.end("Not found.");
  }
}

function sectionsPersistencePlugin() {
  return {
    name: "math-17-sections-persistence",
    async writeBundle(options) {
      const outputDir = options.dir || path.join(projectRoot, "dist");
      await fs.cp(contentImagesDirPath, path.join(outputDir, "content-images"), {
        force: true,
        recursive: true,
      });
    },
    configureServer(server) {
      server.middlewares.use("/api/sections", async (request, response) => {
        try {
          if (request.method === "GET") {
            const content = await fs.readFile(sectionsFilePath, "utf8");
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(content);
            return;
          }

          if (request.method === "PUT") {
            const body = await readRequestBody(request);
            const parsed = JSON.parse(body);

            if (!Array.isArray(parsed)) {
              response.statusCode = 400;
              response.end("Expected a JSON array.");
              return;
            }

            const sections = parsed.map((section, index) => normalizeSection(section, index));
            await fs.writeFile(sectionsFilePath, `${JSON.stringify(sections, null, 2)}\n`, "utf8");
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ ok: true }));
            return;
          }

          response.statusCode = 405;
          response.end("Method not allowed.");
        } catch (error) {
          server.config.logger.error(error);
          response.statusCode = 500;
          response.end("Could not persist sections.");
        }
      });

      server.middlewares.use("/api/markdown", async (request, response) => {
        try {
          const rawFileName = getRequestedFileName(request);
          const markdownFile = sanitizeMarkdownFileName(rawFileName, "");
          const filePath = resolveSafeFile(markdownDirPath, markdownFile, [".md"]);

          if (!filePath) {
            response.statusCode = 400;
            response.end("Invalid markdown file.");
            return;
          }

          if (request.method === "GET") {
            try {
              const content = await fs.readFile(filePath, "utf8");
              response.setHeader("Content-Type", "text/markdown; charset=utf-8");
              response.end(content);
            } catch {
              response.statusCode = 404;
              response.end("Not found.");
            }
            return;
          }

          if (request.method === "PUT") {
            const body = await readRequestBody(request);
            await fs.mkdir(markdownDirPath, { recursive: true });
            await fs.writeFile(filePath, body, "utf8");
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ ok: true }));
            return;
          }

          if (request.method === "DELETE") {
            await fs.rm(filePath, { force: true });
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ ok: true }));
            return;
          }

          response.statusCode = 405;
          response.end("Method not allowed.");
        } catch (error) {
          server.config.logger.error(error);
          response.statusCode = 500;
          response.end("Could not handle markdown file.");
        }
      });

      server.middlewares.use("/content-images", async (request, response) => {
        await serveDataFile(request, response, contentImagesDirPath);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), sectionsPersistencePlugin()],
});
