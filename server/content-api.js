import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultProjectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export function readEditingEnabled(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;

  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

export function getContentPaths(projectRoot = defaultProjectRoot) {
  return {
    sectionsFilePath: path.join(projectRoot, "src/data/sections.json"),
    markdownDirPath: path.join(projectRoot, "src/data/markdown"),
    contentImagesDirPath: path.join(projectRoot, "src/data/content-images"),
  };
}

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

function parseRequestUrl(request) {
  return new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
}

function isReadMethod(request) {
  return request.method === "GET" || request.method === "HEAD";
}

function send(request, response, statusCode, body, headers = {}) {
  response.statusCode = statusCode;

  Object.entries(headers).forEach(([name, value]) => {
    response.setHeader(name, value);
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  response.end(body);
}

function sendJson(request, response, statusCode, payload) {
  send(request, response, statusCode, JSON.stringify(payload), {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
}

function sendText(request, response, statusCode, message) {
  send(request, response, statusCode, message, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
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

function getPathTail(url, prefix) {
  if (url.pathname === prefix) return "";
  if (!url.pathname.startsWith(`${prefix}/`)) return null;

  return decodeURIComponent(url.pathname.slice(prefix.length + 1))
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function rejectEditingDisabled(request, response) {
  sendJson(request, response, 403, {
    ok: false,
    error: "编辑功能已关闭。",
  });
}

async function handleConfig(request, response, editingEnabled) {
  if (!isReadMethod(request)) {
    sendText(request, response, 405, "Method not allowed.");
    return true;
  }

  sendJson(request, response, 200, {
    ok: true,
    editingEnabled,
  });
  return true;
}

async function handleSections(request, response, paths, editingEnabled) {
  if (isReadMethod(request)) {
    const content = await fs.readFile(paths.sectionsFilePath, "utf8");
    send(request, response, 200, content, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return true;
  }

  if (request.method === "PUT") {
    if (!editingEnabled) {
      rejectEditingDisabled(request, response);
      return true;
    }

    const body = await readRequestBody(request);
    const parsed = JSON.parse(body);

    if (!Array.isArray(parsed)) {
      sendText(request, response, 400, "Expected a JSON array.");
      return true;
    }

    const sections = parsed.map((section, index) => normalizeSection(section, index));
    await fs.writeFile(paths.sectionsFilePath, `${JSON.stringify(sections, null, 2)}\n`, "utf8");
    sendJson(request, response, 200, { ok: true });
    return true;
  }

  sendText(request, response, 405, "Method not allowed.");
  return true;
}

async function handleMarkdown(request, response, url, paths, editingEnabled) {
  const rawFileName = getPathTail(url, "/api/markdown");

  if (!rawFileName) {
    sendText(request, response, 400, "Invalid markdown file.");
    return true;
  }

  const markdownFile = sanitizeMarkdownFileName(rawFileName, "");
  const filePath = resolveSafeFile(paths.markdownDirPath, markdownFile, [".md"]);

  if (!filePath) {
    sendText(request, response, 400, "Invalid markdown file.");
    return true;
  }

  if (isReadMethod(request)) {
    try {
      const content = await fs.readFile(filePath, "utf8");
      send(request, response, 200, content, {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "no-store",
      });
    } catch {
      sendText(request, response, 404, "Not found.");
    }
    return true;
  }

  if (!editingEnabled && (request.method === "PUT" || request.method === "DELETE")) {
    rejectEditingDisabled(request, response);
    return true;
  }

  if (request.method === "PUT") {
    const body = await readRequestBody(request);
    await fs.mkdir(paths.markdownDirPath, { recursive: true });
    await fs.writeFile(filePath, body, "utf8");
    sendJson(request, response, 200, { ok: true });
    return true;
  }

  if (request.method === "DELETE") {
    await fs.rm(filePath, { force: true });
    sendJson(request, response, 200, { ok: true });
    return true;
  }

  sendText(request, response, 405, "Method not allowed.");
  return true;
}

async function handleContentImage(request, response, url, paths) {
  if (!isReadMethod(request)) {
    sendText(request, response, 405, "Method not allowed.");
    return true;
  }

  const fileName = getPathTail(url, "/content-images");
  const filePath = resolveSafeFile(paths.contentImagesDirPath, fileName);

  if (!filePath) {
    sendText(request, response, 400, "Invalid file path.");
    return true;
  }

  try {
    const content = await fs.readFile(filePath);
    send(request, response, 200, content, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    });
  } catch {
    sendText(request, response, 404, "Not found.");
  }

  return true;
}

export function createContentRequestHandler({
  projectRoot = defaultProjectRoot,
  editingEnabled = false,
  logger = console,
} = {}) {
  const paths = getContentPaths(projectRoot);

  return async function contentRequestHandler(request, response) {
    const url = parseRequestUrl(request);

    try {
      if (url.pathname === "/api/content-config") {
        return await handleConfig(request, response, editingEnabled);
      }

      if (url.pathname === "/api/sections") {
        return await handleSections(request, response, paths, editingEnabled);
      }

      if (url.pathname === "/api/markdown" || url.pathname.startsWith("/api/markdown/")) {
        return await handleMarkdown(request, response, url, paths, editingEnabled);
      }

      if (url.pathname === "/content-images" || url.pathname.startsWith("/content-images/")) {
        return await handleContentImage(request, response, url, paths);
      }
    } catch (error) {
      logger.error?.(error);
      sendText(request, response, 500, "Could not handle content request.");
      return true;
    }

    return false;
  };
}
