import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createContentRequestHandler,
  getContentPaths,
  readEditingEnabled,
} from "./server/content-api.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const contentPaths = getContentPaths(projectRoot);

function contentPersistencePlugin() {
  return {
    name: "math-17-content-persistence",
    async writeBundle(options) {
      const outputDir = options.dir || path.join(projectRoot, "dist");
      await fs.cp(contentPaths.contentImagesDirPath, path.join(outputDir, "content-images"), {
        force: true,
        recursive: true,
      });
    },
    configureServer(server) {
      const handleContentRequest = createContentRequestHandler({
        projectRoot,
        editingEnabled: readEditingEnabled(process.env.MATH17_EDITING_ENABLED, true),
        logger: server.config.logger,
      });

      server.middlewares.use(async (request, response, next) => {
        const handled = await handleContentRequest(request, response);
        if (handled) return;

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), contentPersistencePlugin()],
});
