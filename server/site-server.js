import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  contentTypes,
  createContentRequestHandler,
  readEditingEnabled,
} from "./content-api.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const staticRoot = path.resolve(process.env.MATH17_STATIC_ROOT || path.join(projectRoot, "dist"));
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4173);
const editingEnabled = process.argv.includes("--edit")
  || readEditingEnabled(process.env.MATH17_EDITING_ENABLED, false);

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

function sendText(request, response, statusCode, message) {
  send(request, response, statusCode, message, {
    "Content-Type": "text/plain; charset=utf-8",
  });
}

function resolveStaticPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath).replace(/\\/g, "/");

  if (decodedPath.includes("\0") || decodedPath.includes("..")) {
    return null;
  }

  const relativePath = decodedPath.replace(/^\/+/, "") || "index.html";
  const resolvedPath = path.resolve(staticRoot, relativePath);
  const resolvedRoot = path.resolve(staticRoot);

  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    return null;
  }

  return resolvedPath;
}

async function findStaticFile(urlPath) {
  const resolvedPath = resolveStaticPath(urlPath);

  if (!resolvedPath) return null;

  try {
    const stat = await fs.stat(resolvedPath);

    if (stat.isDirectory()) {
      const indexPath = path.join(resolvedPath, "index.html");
      const indexStat = await fs.stat(indexPath);
      return indexStat.isFile() ? indexPath : null;
    }

    if (stat.isFile()) return resolvedPath;
  } catch {
    if (path.extname(urlPath)) return null;

    const indexPath = path.join(staticRoot, "index.html");
    try {
      const indexStat = await fs.stat(indexPath);
      return indexStat.isFile() ? indexPath : null;
    } catch {
      return null;
    }
  }

  return null;
}

async function serveStaticFile(request, response) {
  if (!isReadMethod(request)) {
    sendText(request, response, 405, "Method not allowed.");
    return;
  }

  const url = parseRequestUrl(request);
  const filePath = await findStaticFile(url.pathname);

  if (!filePath) {
    sendText(request, response, 404, "Not found.");
    return;
  }

  const content = await fs.readFile(filePath);
  const headers = {
    "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
  };

  if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  } else if (path.basename(filePath) === "index.html") {
    headers["Cache-Control"] = "no-store";
  }

  send(request, response, 200, content, headers);
}

await fs.access(path.join(staticRoot, "index.html")).catch(() => {
  console.error(`未找到 ${staticRoot}/index.html，请先运行 npm run build。`);
  process.exit(1);
});

const handleContentRequest = createContentRequestHandler({
  projectRoot,
  editingEnabled,
});

const server = http.createServer(async (request, response) => {
  try {
    const handled = await handleContentRequest(request, response);
    if (handled) return;

    await serveStaticFile(request, response);
  } catch (error) {
    console.error(error);
    sendText(request, response, 500, "Server error.");
  }
});

server.listen(port, host, () => {
  const modeText = editingEnabled ? "编辑已开启" : "只读模式";
  console.log(`Math-17 服务已启动：http://${host}:${port}（${modeText}）`);
});
