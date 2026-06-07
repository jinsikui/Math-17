import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import projectSections from "./data/sections.json";
import {
  BookOpenText,
  Brush,
  Check,
  Eraser,
  Edit3,
  FileText,
  Landmark,
  PenLine,
  Plus,
  Settings2,
  Trash2,
  Undo2,
  ArrowDown,
  ArrowUp,
  X,
} from "lucide-react";

const SECTIONS_API_PATH = "/api/sections";
const MARKDOWN_API_BASE_PATH = "/api/markdown";
const PROBLEM_IMAGE_FILE = "gauss-heptadecagon-memorial.jpg";
const OLD_PROBLEM_IMAGE_FILE = "gauss-tombstone-heptadecagon-illustration.svg";
const PROBLEM_IMAGE_MARKDOWN = `

## 示例

![布伦瑞克高斯纪念碑上的 17 角星](${PROBLEM_IMAGE_FILE})

图中是布伦瑞克高斯纪念碑上的 17 角星意象。它常被用来纪念高斯对正十七边形可作性的发现。图片：Brunswyk / [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Braunschweig_Gauss-Denkmal_17-eckiger_Stern.jpg)，CC BY-SA 3.0 / GFDL。`;
const OLD_PROBLEM_IMAGE_MARKDOWN = `

## 示例

![高斯墓碑与正十七边形示意图](${OLD_PROBLEM_IMAGE_FILE})

据传高斯希望墓碑上刻正十七边形，但这个愿望没有实际实现。图中是为了说明这个故事而制作的示意图，不是实物照片。`;

const initialSections = projectSections;
const fallbackMarkdownFiles = import.meta.glob("./data/markdown/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

function loadSections() {
  return ensureProblemImageExample(cloneInitialSections().map((section) => ({
    ...section,
    content: getFallbackMarkdownContent(section.markdownFile),
  })));
}

function cloneInitialSections() {
  return initialSections.map((section, index) => normalizeSection(section, index));
}

function sanitizeMarkdownFileName(value, fallback = "section.md") {
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

  const fileName = cleaned || fallback;
  return fileName.toLowerCase().endsWith(".md") ? fileName : `${fileName}.md`;
}

function normalizeSection(section, index, usedMarkdownFiles = new Set()) {
  const id = typeof section.id === "string" && section.id.trim() ? section.id : `section-${index + 1}`;
  const markdownFile = makeUniqueMarkdownFileName(
    section.markdownFile || `${id}.md`,
    usedMarkdownFiles
  );
  usedMarkdownFiles.add(markdownFile);

  return {
    id,
    title: typeof section.title === "string" ? section.title : `目录 ${index + 1}`,
    eyebrow: typeof section.eyebrow === "string" ? section.eyebrow : "",
    markdownFile,
    content: typeof section.content === "string" ? section.content : "",
  };
}

function normalizeSections(sections) {
  const usedMarkdownFiles = new Set();
  return sections.map((section, index) => normalizeSection(section, index, usedMarkdownFiles));
}

function serializeSections(sections) {
  return normalizeSections(sections).map(({ id, title, eyebrow, markdownFile }) => ({
    id,
    title,
    eyebrow,
    markdownFile,
  }));
}

function makeUniqueMarkdownFileName(value, usedMarkdownFiles) {
  const markdownFile = sanitizeMarkdownFileName(value);
  if (!usedMarkdownFiles.has(markdownFile)) return markdownFile;

  const extension = ".md";
  const baseName = markdownFile.endsWith(extension)
    ? markdownFile.slice(0, -extension.length)
    : markdownFile;
  let index = 2;
  let candidate = `${baseName}-${index}${extension}`;

  while (usedMarkdownFiles.has(candidate)) {
    index += 1;
    candidate = `${baseName}-${index}${extension}`;
  }

  return candidate;
}

function getFallbackMarkdownContent(markdownFile) {
  return fallbackMarkdownFiles[`./data/markdown/${markdownFile}`] ?? "";
}

function markdownApiPath(markdownFile) {
  return `${MARKDOWN_API_BASE_PATH}/${encodeURIComponent(markdownFile)}`;
}

function createSectionId() {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSectionTitle(section) {
  return section?.title?.trim() || "未命名目录";
}

function ensureProblemImageExample(sections) {
  return sections.map((section) => {
    if (section.id !== "problem") {
      return section;
    }

    if (section.content.includes(PROBLEM_IMAGE_FILE)) {
      return section;
    }

    if (section.content.includes(OLD_PROBLEM_IMAGE_FILE)) {
      const replacedContent = section.content
        .replace(OLD_PROBLEM_IMAGE_MARKDOWN, PROBLEM_IMAGE_MARKDOWN)
        .replaceAll(OLD_PROBLEM_IMAGE_FILE, PROBLEM_IMAGE_FILE)
        .replaceAll("高斯墓碑与正十七边形示意图", "布伦瑞克高斯纪念碑上的 17 角星")
        .replaceAll("据传高斯希望墓碑上刻正十七边形，但这个愿望没有实际实现。图中是为了说明这个故事而制作的示意图，不是实物照片。", "图中是布伦瑞克高斯纪念碑上的 17 角星意象。它常被用来纪念高斯对正十七边形可作性的发现。图片：Brunswyk / [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Braunschweig_Gauss-Denkmal_17-eckiger_Stern.jpg)，CC BY-SA 3.0 / GFDL。");

      return {
        ...section,
        content: replacedContent.includes(PROBLEM_IMAGE_FILE)
          ? replacedContent
          : `${replacedContent.trimEnd()}${PROBLEM_IMAGE_MARKDOWN}`,
      };
    }

    return {
      ...section,
      content: `${section.content.trimEnd()}${PROBLEM_IMAGE_MARKDOWN}`,
    };
  });
}

function isExternalImageSrc(src) {
  return /^(https?:)?\/\//i.test(src) || /^(data|blob):/i.test(src);
}

function resolveMarkdownImageSrc(src = "") {
  const trimmedSrc = src.trim();
  if (!trimmedSrc || isExternalImageSrc(trimmedSrc) || trimmedSrc.startsWith("/")) {
    return trimmedSrc;
  }

  const normalizedSrc = trimmedSrc.replace(/^\.?\//, "");
  if (normalizedSrc.startsWith("content-images/")) {
    return `/${normalizedSrc}`;
  }

  return `/content-images/${normalizedSrc}`;
}

function MarkdownImage({ src, alt = "", title }) {
  return (
    <img
      src={resolveMarkdownImageSrc(src)}
      alt={alt}
      title={title}
      loading="lazy"
      decoding="async"
    />
  );
}

function seededNoise(seed) {
  return Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
}

function roughPoint(point, index, pass) {
  const seed = point.x * 12.9898 + point.y * 78.233 + index * 37.719 + pass * 91.17;
  const amount = pass === 0 ? 0 : 2.2 + pass * 0.7;

  return {
    x: point.x + (seededNoise(seed) - 0.5) * amount,
    y: point.y + (seededNoise(seed + 19.31) - 0.5) * amount,
  };
}

function traceStroke(ctx, points, pass) {
  if (points.length === 0) return;

  ctx.beginPath();
  const start = roughPoint(points[0], 0, pass);
  ctx.moveTo(start.x, start.y);

  for (let index = 1; index < points.length; index += 1) {
    const current = roughPoint(points[index], index, pass);
    const next = points[index + 1] ? roughPoint(points[index + 1], index + 1, pass) : current;
    const midpoint = {
      x: (current.x + next.x) / 2,
      y: (current.y + next.y) / 2,
    };
    ctx.quadraticCurveTo(current.x, current.y, midpoint.x, midpoint.y);
  }

  ctx.stroke();
}

function drawRoughStroke(ctx, points) {
  if (points.length === 0) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(109, 12, 10, 0.18)";
  ctx.shadowBlur = 1.5;

  if (points.length === 1) {
    const point = points[0];
    ctx.fillStyle = "rgba(255, 0, 0, 0.82)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  const layers = [
    { color: "rgba(255, 0, 0, 0.1)", width: 8.4 },
    { color: "rgba(255, 0, 0, 0.16)", width: 7.1 },
    { color: "rgba(255, 0, 0, 0.3)", width: 5.8 },
    { color: "rgba(255, 0, 0, 0.86)", width: 4.4 },
  ];

  layers.forEach((layer, pass) => {
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = layer.width;
    traceStroke(ctx, points, pass);
  });

  ctx.restore();
}

function DoodleLayer({ onExit }) {
  const canvasRef = useRef(null);
  const strokesRef = useRef([]);
  const activeStrokeRef = useRef([]);
  const drawingRef = useRef(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    strokesRef.current.forEach((stroke) => drawRoughStroke(ctx, stroke));
    if (drawingRef.current) {
      drawRoughStroke(ctx, activeStrokeRef.current);
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    repaint();
  }, [repaint]);

  useEffect(() => {
    document.body.classList.add("doodle-active");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      document.body.classList.remove("doodle-active");
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [resizeCanvas]);

  function getPoint(event) {
    return { x: event.clientX, y: event.clientY };
  }

  function startStroke(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    activeStrokeRef.current = [getPoint(event)];
    repaint();
  }

  function extendStroke(event) {
    if (!drawingRef.current) return;

    event.preventDefault();
    const point = getPoint(event);
    const previous = activeStrokeRef.current[activeStrokeRef.current.length - 1];
    const distance = Math.hypot(point.x - previous.x, point.y - previous.y);

    if (distance < 1.6) return;
    activeStrokeRef.current = [...activeStrokeRef.current, point];
    repaint();
  }

  function finishStroke(event) {
    if (!drawingRef.current) return;

    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    drawingRef.current = false;
    strokesRef.current = [...strokesRef.current, activeStrokeRef.current];
    activeStrokeRef.current = [];
    setStrokeCount(strokesRef.current.length);
    repaint();
  }

  function undoStroke() {
    if (strokeCount === 0) return;

    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    repaint();
  }

  function clearStrokes() {
    if (strokeCount === 0) return;

    drawingRef.current = false;
    strokesRef.current = [];
    activeStrokeRef.current = [];
    setStrokeCount(0);
    repaint();
  }

  function exitDoodle() {
    strokesRef.current = [];
    activeStrokeRef.current = [];
    setStrokeCount(0);
    repaint();
    onExit();
  }

  return (
    <div className="doodle-layer" aria-label="随意写画布">
      <canvas
        ref={canvasRef}
        className="doodle-canvas"
        onPointerDown={startStroke}
        onPointerMove={extendStroke}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
      />

      <div className="doodle-toolbar" aria-label="随意写控制">
        <button type="button" className="doodle-control" onClick={undoStroke} disabled={strokeCount === 0}>
          <Undo2 size={18} aria-hidden="true" />
          撤销
        </button>
        <button type="button" className="doodle-control" onClick={clearStrokes} disabled={strokeCount === 0}>
          <Eraser size={18} aria-hidden="true" />
          清空
        </button>
        <button type="button" className="doodle-control exit" onClick={exitDoodle}>
          <X size={18} aria-hidden="true" />
          退出随意写
        </button>
      </div>
    </div>
  );
}

function App() {
  const skipNextSaveRef = useRef(true);
  const saveTimeoutRef = useRef(null);
  const [initialState] = useState(() => {
    const loadedSections = loadSections();
    return {
      activeId: loadedSections[0]?.id ?? initialSections[0].id,
      sections: loadedSections,
    };
  });
  const [sections, setSections] = useState(initialState.sections);
  const [activeId, setActiveId] = useState(initialState.activeId);
  const [mode, setMode] = useState("read");
  const [directoryMode, setDirectoryMode] = useState(false);
  const [doodleMode, setDoodleMode] = useState(false);
  const [persistenceState, setPersistenceState] = useState({
    available: false,
    message: "正在连接内容文件",
  });

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeId) ?? sections[0],
    [activeId, sections]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProjectSections() {
      try {
        const response = await fetch(SECTIONS_API_PATH);
        if (!response.ok) {
          throw new Error(`Failed to load sections: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Sections response is not an array.");
        }

        if (cancelled) return;

        const sectionMetas = normalizeSections(data);
        const loadedSections = ensureProblemImageExample(
          await Promise.all(
            sectionMetas.map(async (section) => {
              try {
                const markdownResponse = await fetch(markdownApiPath(section.markdownFile));
                if (!markdownResponse.ok) {
                  throw new Error(`Failed to load ${section.markdownFile}`);
                }

                return {
                  ...section,
                  content: await markdownResponse.text(),
                };
              } catch {
                return {
                  ...section,
                  content: getFallbackMarkdownContent(section.markdownFile),
                };
              }
            })
          )
        );
        skipNextSaveRef.current = true;
        setSections(loadedSections);
        setActiveId((currentActiveId) =>
          loadedSections.some((section) => section.id === currentActiveId)
            ? currentActiveId
            : loadedSections[0]?.id ?? ""
        );
        setPersistenceState({
          available: true,
          message: "已连接工程内容文件",
        });
      } catch {
        if (cancelled) return;
        setPersistenceState({
          available: false,
          message: "内容文件未连接",
        });
      }
    }

    loadProjectSections();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!persistenceState.available) return undefined;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return undefined;
    }

    window.clearTimeout(saveTimeoutRef.current);
    setPersistenceState((current) => ({
      ...current,
      message: "正在保存到工程文件",
    }));

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        const sectionsResponse = await fetch(SECTIONS_API_PATH, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serializeSections(sections)),
        });

        if (!sectionsResponse.ok) {
          throw new Error(`Failed to save sections: ${sectionsResponse.status}`);
        }

        await Promise.all(
          normalizeSections(sections).map(async (section) => {
            const markdownResponse = await fetch(markdownApiPath(section.markdownFile), {
              method: "PUT",
              headers: {
                "Content-Type": "text/markdown; charset=utf-8",
              },
              body: section.content,
            });

            if (!markdownResponse.ok) {
              throw new Error(`Failed to save markdown: ${section.markdownFile}`);
            }
          })
        );

        setPersistenceState({
          available: true,
          message: "已保存到工程文件",
        });
      } catch {
        setPersistenceState({
          available: true,
          message: "保存失败",
        });
      }
    }, 350);

    return () => window.clearTimeout(saveTimeoutRef.current);
  }, [persistenceState.available, sections]);

  useEffect(() => {
    if (!sections.some((section) => section.id === activeId)) {
      setActiveId(sections[0]?.id ?? "");
    }
  }, [activeId, sections]);

  function updateActiveContent(content) {
    setSections((current) =>
      current.map((section) =>
        section.id === activeSection.id ? { ...section, content } : section
      )
    );
  }

  function updateSectionMeta(sectionId, field, value) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  }

  function moveSection(sectionId, offset) {
    setSections((current) => {
      const index = current.findIndex((section) => section.id === sectionId);
      const nextIndex = index + offset;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function addSection() {
    const requestedMarkdownFile = window.prompt(
      "请输入新目录的 Markdown 文件名",
      `section-${sections.length + 1}.md`
    );

    if (requestedMarkdownFile === null) return;

    const usedMarkdownFiles = new Set(sections.map((section) => section.markdownFile));
    const markdownFile = makeUniqueMarkdownFileName(requestedMarkdownFile, usedMarkdownFiles);
    const newSection = {
      id: createSectionId(),
      title: `新目录 ${sections.length + 1}`,
      eyebrow: "",
      markdownFile,
      content: "",
    };

    setSections((current) => [...current, newSection]);
    setActiveId(newSection.id);
    setMode("edit");
    setDirectoryMode(true);
  }

  async function deleteSection(sectionId) {
    if (sections.length <= 1) return;

    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;

    const confirmed = window.confirm(
      `删除目录“${getSectionTitle(section)}”？对应的 Markdown 文件 ${section.markdownFile} 也会被删除。`
    );

    if (!confirmed) return;

    const nextSections = sections.filter((item) => item.id !== sectionId);
    setSections(nextSections);

    if (activeId === sectionId) {
      setActiveId(nextSections[0]?.id ?? "");
    }

    if (!persistenceState.available) return;

    try {
      const response = await fetch(markdownApiPath(section.markdownFile), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete markdown: ${section.markdownFile}`);
      }

      setPersistenceState({
        available: true,
        message: "已删除 Markdown 文件",
      });
    } catch {
      setPersistenceState({
        available: true,
        message: "Markdown 文件删除失败",
      });
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="一级目录">
        <div className="brand-block">
          <Landmark size={24} aria-hidden="true" />
          <div>
            <h1>尺规作图正17边形</h1>
          </div>
        </div>

        <div className="sidebar-tools">
          <button
            type="button"
            className={directoryMode ? "sidebar-tool active" : "sidebar-tool"}
            onClick={() => setDirectoryMode((current) => !current)}
          >
            {directoryMode ? <Check size={17} aria-hidden="true" /> : <Settings2 size={17} aria-hidden="true" />}
            {directoryMode ? "完成管理" : "目录管理"}
          </button>
        </div>

        {directoryMode ? (
          <div className="directory-editor-list" aria-label="目录管理">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={section.id === activeId ? "directory-editor-row active" : "directory-editor-row"}
              >
                <div className="directory-move-controls">
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, -1)}
                    disabled={index === 0}
                    aria-label={`上移 ${getSectionTitle(section)}`}
                    title="上移"
                  >
                    <ArrowUp size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, 1)}
                    disabled={index === sections.length - 1}
                    aria-label={`下移 ${getSectionTitle(section)}`}
                    title="下移"
                  >
                    <ArrowDown size={15} aria-hidden="true" />
                  </button>
                </div>
                <div className="directory-fields">
                  <input
                    value={section.title}
                    onFocus={() => setActiveId(section.id)}
                    onChange={(event) => updateSectionMeta(section.id, "title", event.target.value)}
                    placeholder="目录标题"
                    aria-label={`${getSectionTitle(section)} 标题`}
                  />
                  <input
                    value={section.eyebrow}
                    onFocus={() => setActiveId(section.id)}
                    onChange={(event) => updateSectionMeta(section.id, "eyebrow", event.target.value)}
                    placeholder="目录描述"
                    aria-label={`${getSectionTitle(section)} 描述`}
                  />
                  <span className="directory-file-name">{section.markdownFile}</span>
                </div>
                <button
                  type="button"
                  className="directory-delete-button"
                  onClick={() => deleteSection(section.id)}
                  disabled={sections.length <= 1}
                  aria-label={`删除 ${getSectionTitle(section)}`}
                  title="删除"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            ))}

            <button type="button" className="add-section-button" onClick={addSection}>
              <Plus size={17} aria-hidden="true" />
              新增目录
            </button>
          </div>
        ) : (
          <nav className="section-nav">
            {sections.map((section, index) => (
              <button
                type="button"
                key={section.id}
                className={section.id === activeId ? "nav-item active" : "nav-item"}
                onClick={() => setActiveId(section.id)}
              >
                <span className="nav-index">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{getSectionTitle(section)}</strong>
                  {section.eyebrow.trim() ? <small>{section.eyebrow}</small> : null}
                </span>
              </button>
            ))}
          </nav>
        )}
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h2>{getSectionTitle(activeSection)}</h2>
          </div>

          <div className="toolbar" aria-label="阅读和编辑控制">
            <div className="segmented" role="group" aria-label="切换显示模式">
              <button
                type="button"
                className={mode === "read" ? "selected" : ""}
                onClick={() => setMode("read")}
              >
                <BookOpenText size={18} aria-hidden="true" />
                只读
              </button>
              <button
                type="button"
                className={mode === "edit" ? "selected" : ""}
                onClick={() => setMode("edit")}
              >
                <Edit3 size={18} aria-hidden="true" />
                编辑
              </button>
            </div>

            <button type="button" className="ghost-button draw-toggle" onClick={() => setDoodleMode(true)}>
              <Brush size={18} aria-hidden="true" />
              随意写
            </button>

            <span
              className={persistenceState.available ? "persistence-pill" : "persistence-pill warning"}
              aria-live="polite"
            >
              {persistenceState.message}
            </span>
          </div>
        </header>

        <div className="content-frame">
          <div className="chapter-meta" aria-hidden="true">
            <span>
              <PenLine size={16} />
              markdown + latex
            </span>
          </div>

          {mode === "edit" ? (
            <div className="editor-panel">
              <div className="editor-heading">
                <FileText size={18} aria-hidden="true" />
                <span>Markdown 编辑器</span>
              </div>
              <textarea
                spellCheck="false"
                value={activeSection.content}
                onChange={(event) => updateActiveContent(event.target.value)}
                aria-label={`${getSectionTitle(activeSection)} Markdown 内容`}
              />
            </div>
          ) : (
            <article className="reading-view">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                components={{ img: MarkdownImage }}
              >
                {activeSection.content}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </section>

      {doodleMode ? <DoodleLayer onExit={() => setDoodleMode(false)} /> : null}
    </main>
  );
}

export default App;
