# React/Vite 项目规则

- 使用现有的 Vite + React 工程结构和 npm 脚本。
- 一级目录元数据保存在 `src/data/sections.json` 中。
- 每个一级目录的正文内容保存在 `src/data/markdown/` 下的独立 Markdown 文件中。
- 内容图片保存在 `src/data/content-images/` 下；不要把内容图片放到 `public/` 中。
- 不要把浏览器存储作为可编辑目录内容的标准持久化来源。
- 修改右侧内容视图时，需要保留 Markdown + LaTeX 的渲染能力。
- 右侧内容区域应保持可独立滚动，不应带动左侧目录滚动。
- 优先使用 React 函数组件和 hooks，并保持当前组件风格。
- 视觉风格应保持古典、极简、极淡的土色/棕色调。
- 在可行时，前端或 Vite 配置变更后运行 `npm run build`。
