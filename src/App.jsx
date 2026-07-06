import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkDirective from "remark-directive";
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
const BACKGROUND_BLOCK_DIRECTIVE_NAME = "bg";
const BACKGROUND_BLOCK_UNFOLD_TITLE = "展开";
const BACKGROUND_BLOCK_FOLD_TITLE = "收起";
const BACKGROUND_BLOCK_INTERNAL_FOLD_ATTRIBUTE = "bgFold";
const BACKGROUND_BLOCK_INTERNAL_FOLD_TITLE_ATTRIBUTE = "bgFoldTitle";
const BACKGROUND_BLOCK_INTERNAL_UNFOLD_TITLE_ATTRIBUTE = "bgUnfoldTitle";
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

function makeUniqueMarkdownFileName(value, usedMarkdownFiles, fallback = "section.md") {
  const markdownFile = sanitizeMarkdownFileName(value, fallback);
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

function visitMarkdownNodes(node, visitor) {
  if (!node || typeof node !== "object") return;
  visitor(node);
  if (!Array.isArray(node.children)) return;
  node.children.forEach((child) => visitMarkdownNodes(child, visitor));
}

function replaceDisplayMathSpaces(value) {
  return value.replace(/ {2,}/g, (spaces) => "\\ ".repeat(spaces.length));
}

function preserveDisplayMathSpaces() {
  return (tree) => {
    visitMarkdownNodes(tree, (node) => {
      if (node.type !== "math" || typeof node.value !== "string") return;

      const nextValue = replaceDisplayMathSpaces(node.value);
      node.value = nextValue;

      const htmlTextNode = node.data?.hChildren?.[0]?.children?.[0];
      if (htmlTextNode?.type === "text") {
        htmlTextNode.value = nextValue;
      }
    });
  };
}

function normalizeDirectiveBoolean(value) {
  if (typeof value !== "string") return false;
  return /^(true|1|yes|on)$/i.test(value.trim());
}

function readQuotedDirectiveAttributeValue(source, startIndex) {
  const quote = source[startIndex];
  let value = "";
  let index = startIndex + 1;

  while (index < source.length) {
    const character = source[index];

    if (character === "\\" && index + 1 < source.length) {
      value += source[index + 1];
      index += 2;
      continue;
    }

    if (character === quote) {
      return {
        value,
        endIndex: index + 1,
      };
    }

    value += character;
    index += 1;
  }

  return null;
}

function parseBackgroundDirectiveAttributeString(value) {
  const attributes = {};
  let index = 0;

  while (index < value.length) {
    while (index < value.length && /[\s,]/.test(value[index])) {
      index += 1;
    }

    if (index >= value.length) break;

    const keyMatch = value.slice(index).match(/^[A-Za-z][\w-]*/);
    if (!keyMatch) return null;

    const key = keyMatch[0];
    index += key.length;

    while (index < value.length && /\s/.test(value[index])) {
      index += 1;
    }

    if (value[index] !== "=") return null;
    index += 1;

    while (index < value.length && /\s/.test(value[index])) {
      index += 1;
    }

    let attributeValue = "";
    if (value[index] === "\"" || value[index] === "'") {
      const quotedValue = readQuotedDirectiveAttributeValue(value, index);
      if (!quotedValue) return null;
      attributeValue = quotedValue.value;
      index = quotedValue.endIndex;
    } else {
      const startIndex = index;
      while (index < value.length && !/[\s,]/.test(value[index])) {
        index += 1;
      }
      attributeValue = value.slice(startIndex, index);
    }

    attributes[key] = attributeValue;
  }

  return attributes;
}

function serializeBackgroundDirectiveAttributes(attributes) {
  const normalizedAttributes = {};

  if (typeof attributes.fold === "string") {
    normalizedAttributes[BACKGROUND_BLOCK_INTERNAL_FOLD_ATTRIBUTE] = attributes.fold;
  }
  if (typeof attributes.foldTitle === "string" && attributes.foldTitle.trim()) {
    normalizedAttributes[BACKGROUND_BLOCK_INTERNAL_FOLD_TITLE_ATTRIBUTE] = attributes.foldTitle.trim();
  }
  if (typeof attributes.unfoldTitle === "string" && attributes.unfoldTitle.trim()) {
    normalizedAttributes[BACKGROUND_BLOCK_INTERNAL_UNFOLD_TITLE_ATTRIBUTE] = attributes.unfoldTitle.trim();
  }

  return Object.entries(normalizedAttributes)
    .map(([key, value]) =>
      key === BACKGROUND_BLOCK_INTERNAL_FOLD_ATTRIBUTE ? `${key}=${value}` : `${key}=${JSON.stringify(value)}`
    )
    .join(" ");
}

function normalizeBackgroundDirectiveSyntax(markdown) {
  if (typeof markdown !== "string" || !markdown.includes(`:::${BACKGROUND_BLOCK_DIRECTIVE_NAME}[`)) {
    return markdown;
  }

  return markdown
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\s*:::\s*bg)\[(.*)\]\s*$/);
      if (!match) return line;

      const [, prefix, rawAttributes = ""] = match;
      const normalizedAttributes = parseBackgroundDirectiveAttributeString(rawAttributes.trim());
      const serializedAttributes = normalizedAttributes
        ? serializeBackgroundDirectiveAttributes(normalizedAttributes)
        : "";

      if (!serializedAttributes) {
        return prefix;
      }

      return `${prefix}{${serializedAttributes}}`;
    })
    .join("\n");
}

function readBackgroundBlockOptions(node) {
  const attributes = node.attributes ?? {};
  const foldTitle =
    typeof attributes[BACKGROUND_BLOCK_INTERNAL_FOLD_TITLE_ATTRIBUTE] === "string"
      && attributes[BACKGROUND_BLOCK_INTERNAL_FOLD_TITLE_ATTRIBUTE].trim()
      ? attributes[BACKGROUND_BLOCK_INTERNAL_FOLD_TITLE_ATTRIBUTE].trim()
      : BACKGROUND_BLOCK_FOLD_TITLE;
  const unfoldTitle =
    typeof attributes[BACKGROUND_BLOCK_INTERNAL_UNFOLD_TITLE_ATTRIBUTE] === "string"
      && attributes[BACKGROUND_BLOCK_INTERNAL_UNFOLD_TITLE_ATTRIBUTE].trim()
      ? attributes[BACKGROUND_BLOCK_INTERNAL_UNFOLD_TITLE_ATTRIBUTE].trim()
      : BACKGROUND_BLOCK_UNFOLD_TITLE;

  if (Object.prototype.hasOwnProperty.call(attributes, BACKGROUND_BLOCK_INTERNAL_FOLD_ATTRIBUTE)) {
    return {
      hasFold: true,
      isInitiallyFolded: normalizeDirectiveBoolean(attributes[BACKGROUND_BLOCK_INTERNAL_FOLD_ATTRIBUTE]),
      foldTitle,
      unfoldTitle,
    };
  }

  return {
    hasFold: false,
    isInitiallyFolded: false,
    foldTitle,
    unfoldTitle,
  };
}

function normalizeClassName(className) {
  if (Array.isArray(className)) return className.filter(Boolean).join(" ");
  return typeof className === "string" ? className : "";
}

function MarkdownContainer({ node: _node, className, children, ...props }) {
  const resolvedClassName = normalizeClassName(className);
  const classNames = resolvedClassName.split(/\s+/).filter(Boolean);
  const isBackgroundBlock = classNames.includes("reading-background-block");
  const hasFold = props["data-has-fold"] === "true";
  const isInitiallyFolded = props["data-folded"] === "true";
  const foldTitle =
    typeof props["data-fold-title"] === "string" && props["data-fold-title"].trim()
      ? props["data-fold-title"].trim()
      : BACKGROUND_BLOCK_FOLD_TITLE;
  const unfoldTitle =
    typeof props["data-unfold-title"] === "string" && props["data-unfold-title"].trim()
      ? props["data-unfold-title"].trim()
      : BACKGROUND_BLOCK_UNFOLD_TITLE;
  const [isOpen, setIsOpen] = useState(() => !isInitiallyFolded);
  const isFoldableBackgroundBlock = isBackgroundBlock && hasFold;
  const {
    ["data-has-fold"]: _dataHasFold,
    ["data-folded"]: _dataFolded,
    ["data-fold-title"]: _dataFoldTitle,
    ["data-unfold-title"]: _dataUnfoldTitle,
    ...elementProps
  } = props;

  useEffect(() => {
    if (!isFoldableBackgroundBlock) return;
    setIsOpen(!isInitiallyFolded);
  }, [isFoldableBackgroundBlock, isInitiallyFolded]);

  if (!isFoldableBackgroundBlock) {
    return (
      <div className={resolvedClassName || undefined} {...elementProps}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`${resolvedClassName} reading-background-block-foldable${isOpen ? " is-open" : ""}`}
      {...elementProps}
    >
      <button
        type="button"
        className="reading-background-block-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? foldTitle : unfoldTitle}
      >
        <span className="reading-background-block-toggle-copy" aria-hidden="true">
          <span className="reading-background-block-toggle-label reading-background-block-toggle-label-collapsed">
            {unfoldTitle}
          </span>
          <span className="reading-background-block-toggle-label reading-background-block-toggle-label-expanded">
            {foldTitle}
          </span>
        </span>
      </button>

      <div className="reading-background-block-panel" aria-hidden={!isOpen}>
        <div className="reading-background-block-panel-inner">
          <div className="reading-background-block-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

function renderBackgroundBlocks() {
  return (tree) => {
    visitMarkdownNodes(tree, (node) => {
      if (node.type !== "containerDirective" || node.name !== BACKGROUND_BLOCK_DIRECTIVE_NAME) return;
      const { hasFold, isInitiallyFolded, foldTitle, unfoldTitle } = readBackgroundBlockOptions(node);

      node.data = {
        ...node.data,
        hName: "div",
        hProperties: {
          ...node.data?.hProperties,
          className: ["reading-background-block"],
          ...(hasFold
            ? {
                "data-has-fold": "true",
                "data-folded": isInitiallyFolded ? "true" : "false",
                "data-fold-title": foldTitle,
                "data-unfold-title": unfoldTitle,
              }
            : {}),
        },
      };
    });
  };
}

function markdownApiPath(markdownFile) {
  return `${MARKDOWN_API_BASE_PATH}/${encodeURIComponent(markdownFile)}`;
}

function getPersistedSectionMetas(sections) {
  return normalizeSections(sections).map(({ id, title, eyebrow, markdownFile }) => ({
    id,
    title,
    eyebrow,
    markdownFile,
  }));
}

async function saveSectionMetas(sections) {
  const sectionsResponse = await fetch(SECTIONS_API_PATH, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getPersistedSectionMetas(sections)),
  });

  if (!sectionsResponse.ok) {
    throw new Error(`Failed to save sections: ${sectionsResponse.status}`);
  }
}

async function deleteMarkdownFile(markdownFile) {
  const deleteResponse = await fetch(markdownApiPath(markdownFile), {
    method: "DELETE",
  });

  if (!deleteResponse.ok) {
    throw new Error(`Failed to delete markdown: ${markdownFile}`);
  }
}

function createSectionId() {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSectionTitle(section) {
  return section?.title?.trim() || "未命名目录";
}

function createNewSectionDraft(sectionCount) {
  return {
    title: `新目录 ${sectionCount + 1}`,
    eyebrow: "",
    markdownFile: `section-${sectionCount + 1}.md`,
  };
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
  const pendingMarkdownDeletesRef = useRef([]);
  const [initialState] = useState(() => {
    const loadedSections = loadSections();
    return {
      activeId: loadedSections[0]?.id ?? initialSections[0].id,
      sections: loadedSections,
    };
  });
  const [sections, setSections] = useState(initialState.sections);
  const sectionsRef = useRef(initialState.sections);
  const [activeId, setActiveId] = useState(initialState.activeId);
  const [mode, setMode] = useState("read");
  const [directoryMode, setDirectoryMode] = useState(false);
  const [markdownFileDrafts, setMarkdownFileDrafts] = useState({});
  const [newSectionDraft, setNewSectionDraft] = useState(() =>
    createNewSectionDraft(initialState.sections.length)
  );
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
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
    sectionsRef.current = sections;
  }, [sections]);

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
        pendingMarkdownDeletesRef.current = [];
        setSections(loadedSections);
        setMarkdownFileDrafts({});
        setActiveId((currentActiveId) =>
          loadedSections.some((section) => section.id === currentActiveId)
            ? currentActiveId
            : loadedSections[0]?.id ?? ""
        );
        setPersistenceState({
          available: true,
          message: "已连接",
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
      message: "保存中",
    }));

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        const normalizedSections = normalizeSections(sections);
        await saveSectionMetas(normalizedSections);

        await Promise.all(
          normalizedSections.map(async (section) => {
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

        const resolvedMarkdownDeletes = new Set();
        const failedMarkdownDeletes = new Set();
        const staleMarkdownFiles = [...new Set(pendingMarkdownDeletesRef.current)];

        for (const markdownFile of staleMarkdownFiles) {
          const activeMarkdownFiles = new Set(
            normalizeSections(sectionsRef.current).map((section) => section.markdownFile)
          );

          if (activeMarkdownFiles.has(markdownFile)) {
            resolvedMarkdownDeletes.add(markdownFile);
            continue;
          }

          try {
            await deleteMarkdownFile(markdownFile);
            resolvedMarkdownDeletes.add(markdownFile);
          } catch {
            failedMarkdownDeletes.add(markdownFile);
          }
        }

        pendingMarkdownDeletesRef.current = pendingMarkdownDeletesRef.current.filter(
          (markdownFile) => !resolvedMarkdownDeletes.has(markdownFile)
        );

        setPersistenceState({
          available: true,
          message: failedMarkdownDeletes.size > 0
            ? "已保存，新文件已写入，旧文件删除失败"
            : "已保存",
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

  function updateMarkdownFileDraft(sectionId, value) {
    setActiveId(sectionId);
    setMarkdownFileDrafts((current) => ({
      ...current,
      [sectionId]: value,
    }));
  }

  function clearMarkdownFileDraft(sectionId) {
    setMarkdownFileDrafts((current) => {
      if (!(sectionId in current)) return current;

      const next = { ...current };
      delete next[sectionId];
      return next;
    });
  }

  function commitMarkdownFileName(sectionId) {
    const draft = markdownFileDrafts[sectionId];
    if (draft === undefined) return;

    const section = sections.find((item) => item.id === sectionId);
    clearMarkdownFileDraft(sectionId);
    if (!section) return;

    const previousMarkdownFile = sanitizeMarkdownFileName(section.markdownFile);
    const usedMarkdownFiles = new Set(
      sections
        .filter((item) => item.id !== sectionId)
        .map((item) => sanitizeMarkdownFileName(item.markdownFile))
    );
    const markdownFile = makeUniqueMarkdownFileName(draft, usedMarkdownFiles, previousMarkdownFile);

    if (markdownFile !== previousMarkdownFile) {
      pendingMarkdownDeletesRef.current = [
        ...pendingMarkdownDeletesRef.current,
        previousMarkdownFile,
      ];
    }

    if (markdownFile === section.markdownFile) return;

    setSections((current) =>
      current.map((item) =>
        item.id === sectionId ? { ...item, markdownFile } : item
      )
    );
  }

  function handleMarkdownFileKeyDown(event) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    event.currentTarget.blur();
  }

  function openNewSectionDialog() {
    setNewSectionDraft(createNewSectionDraft(sections.length));
    setNewSectionDialogOpen(true);
  }

  function closeNewSectionDialog() {
    setNewSectionDialogOpen(false);
  }

  function updateNewSectionDraft(field, value) {
    setNewSectionDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNewSectionDialogKeyDown(event) {
    if (event.key !== "Escape") return;

    event.preventDefault();
    closeNewSectionDialog();
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

  function addSection(event) {
    event.preventDefault();

    const usedMarkdownFiles = new Set(
      sections.map((section) => sanitizeMarkdownFileName(section.markdownFile))
    );
    const fallbackTitle = `新目录 ${sections.length + 1}`;
    const fallbackMarkdownFile = `section-${sections.length + 1}.md`;
    const markdownFile = makeUniqueMarkdownFileName(
      newSectionDraft.markdownFile,
      usedMarkdownFiles,
      fallbackMarkdownFile
    );
    const title = newSectionDraft.title.trim() || fallbackTitle;
    const newSection = {
      id: createSectionId(),
      title,
      eyebrow: newSectionDraft.eyebrow.trim(),
      markdownFile,
      content: `# ${title}\n`,
    };

    setSections((current) => [...current, newSection]);
    setActiveId(newSection.id);
    setMode("edit");
    setDirectoryMode(true);
    setNewSectionDialogOpen(false);
  }

  async function deleteSection(sectionId) {
    if (sections.length <= 1) return;

    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;

    if (!persistenceState.available) {
      setPersistenceState((current) => ({
        ...current,
        message: "内容文件未连接，无法删除目录",
      }));
      return;
    }

    const confirmed = window.confirm(
      `删除目录“${getSectionTitle(section)}”？对应的 Markdown 文件 ${section.markdownFile} 也会被删除。`
    );

    if (!confirmed) return;

    const nextSections = sections.filter((item) => item.id !== sectionId);
    const markdownFileToDelete = sanitizeMarkdownFileName(section.markdownFile);
    pendingMarkdownDeletesRef.current = [
      ...pendingMarkdownDeletesRef.current,
      markdownFileToDelete,
    ];
    setSections(nextSections);
    clearMarkdownFileDraft(sectionId);

    if (activeId === sectionId) {
      setActiveId(nextSections[0]?.id ?? "");
    }

    try {
      setPersistenceState({
        available: true,
        message: "正在删除目录",
      });

      await saveSectionMetas(nextSections);
      try {
        await deleteMarkdownFile(markdownFileToDelete);
        pendingMarkdownDeletesRef.current = pendingMarkdownDeletesRef.current.filter(
          (markdownFile) => markdownFile !== markdownFileToDelete
        );
      } catch {
        setPersistenceState({
          available: true,
          message: "目录已删除，Markdown 文件删除失败",
        });
        return;
      }

      setPersistenceState({
        available: true,
        message: "已删除目录",
      });
    } catch {
      setPersistenceState({
        available: true,
        message: "目录删除保存失败",
      });
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="一级目录">
        <div className="brand-block">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="brand-icon" />
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
                  <input
                    className="directory-file-input"
                    value={markdownFileDrafts[section.id] ?? section.markdownFile}
                    spellCheck="false"
                    onFocus={() => setActiveId(section.id)}
                    onChange={(event) => updateMarkdownFileDraft(section.id, event.target.value)}
                    onBlur={() => commitMarkdownFileName(section.id)}
                    onKeyDown={handleMarkdownFileKeyDown}
                    placeholder="Markdown 文件名"
                    aria-label={`${getSectionTitle(section)} Markdown 文件名`}
                  />
                </div>
                <button
                  type="button"
                  className="directory-delete-button"
                  onClick={() => deleteSection(section.id)}
                  disabled={sections.length <= 1 || !persistenceState.available}
                  aria-label={`删除 ${getSectionTitle(section)}`}
                  title="删除"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            ))}

            <button type="button" className="add-section-button" onClick={openNewSectionDialog}>
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
          <div className="chapter-meta" aria-hidden="true">
            <span>
              <PenLine size={16} />
              markdown + latex
            </span>
          </div>

          <div className="toolbar" aria-label="阅读和编辑控制">
            <div className="segmented" role="group" aria-label="切换显示模式">
              <button
                type="button"
                className={mode === "read" ? "selected" : ""}
                onClick={() => setMode("read")}
                title="只读"
              >
                <BookOpenText size={18} aria-hidden="true" />
                只读
              </button>
              <button
                type="button"
                className={mode === "edit" ? "selected" : ""}
                onClick={() => setMode("edit")}
                title="编辑"
              >
                <Edit3 size={18} aria-hidden="true" />
                编辑
              </button>
            </div>

            <button
              type="button"
              className="ghost-button draw-toggle"
              onClick={() => setDoodleMode(true)}
              title="随意写"
            >
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
                remarkPlugins={[
                  remarkGfm,
                  remarkBreaks,
                  remarkMath,
                  remarkDirective,
                  preserveDisplayMathSpaces,
                  renderBackgroundBlocks,
                ]}
                rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                components={{ div: MarkdownContainer, img: MarkdownImage }}
              >
                {normalizeBackgroundDirectiveSyntax(activeSection.content)}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </section>

      {doodleMode ? <DoodleLayer onExit={() => setDoodleMode(false)} /> : null}

      {newSectionDialogOpen ? (
        <div className="modal-backdrop">
          <form
            className="section-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-section-dialog-title"
            onSubmit={addSection}
            onKeyDown={handleNewSectionDialogKeyDown}
          >
            <div className="section-dialog-header">
              <h2 id="new-section-dialog-title">新增目录</h2>
              <button
                type="button"
                className="section-dialog-close"
                onClick={closeNewSectionDialog}
                aria-label="关闭新增目录弹窗"
                title="关闭"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="section-form">
              <label>
                <span>目录名字</span>
                <input
                  autoFocus
                  value={newSectionDraft.title}
                  onChange={(event) => updateNewSectionDraft("title", event.target.value)}
                  placeholder="目录名字"
                />
              </label>
              <label>
                <span>目录描述</span>
                <input
                  value={newSectionDraft.eyebrow}
                  onChange={(event) => updateNewSectionDraft("eyebrow", event.target.value)}
                  placeholder="目录描述"
                />
              </label>
              <label>
                <span>Markdown 文件名</span>
                <input
                  className="section-dialog-file-input"
                  spellCheck="false"
                  value={newSectionDraft.markdownFile}
                  onChange={(event) => updateNewSectionDraft("markdownFile", event.target.value)}
                  placeholder="section.md"
                />
              </label>
            </div>

            <div className="section-dialog-actions">
              <button type="button" className="section-dialog-secondary" onClick={closeNewSectionDialog}>
                取消
              </button>
              <button type="submit" className="section-dialog-primary">
                <Check size={17} aria-hidden="true" />
                创建目录
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

export default App;
