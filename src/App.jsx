import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  BookOpenText,
  Brush,
  Eraser,
  Edit3,
  FileText,
  Landmark,
  PenLine,
  Undo2,
  X,
} from "lucide-react";

const STORAGE_KEY = "math-17-sections-v1";

const initialSections = [
  {
    id: "problem",
    title: "问题提出",
    eyebrow: "从一个圆开始",
    content: `# 问题提出

给定一个圆，只允许使用**无刻度直尺**和**圆规**，能否作出它的内接正十七边形？

这个问题可以被理解为：

$$
\\text{能否构造 } \\cos\\frac{2\\pi}{17}
$$

若中心角

$$
\\theta = \\frac{2\\pi}{17}
$$

可以通过尺规作图得到，那么在圆周上依次截取相同弦长，就能得到正十七边形。

## 观察

- 正三角形、正四边形、正五边形都容易作出。
- 正七边形不能用尺规精确作出。
- 正十七边形的可作性并不直观，它是代数结构给出的结论。`,
  },
  {
    id: "gauss",
    title: "历史和高斯的贡献",
    eyebrow: "1796 年的发现",
    content: `# 历史和高斯的贡献

1796 年，高斯证明正十七边形可以用尺规作图。这一结果惊人之处在于：正十七边形不是古希腊几何中常见的低阶图形，却仍然落在尺规可作的范围内。

关键事实是 17 是费马素数：

$$
17 = 2^{2^2} + 1
$$

高斯的结果说明，如果奇素数 $p$ 是费马素数，那么正 $p$ 边形可作。

## 意义

这不是单纯的几何技巧，而是几何、复数根和域扩张之间的联系：

$$
\\zeta_{17}=e^{2\\pi i/17}
$$

构造正十七边形，本质上是在构造单位根的实部。`,
  },
  {
    id: "atoms",
    title: "尺规作图原子操作",
    eyebrow: "工具能做什么",
    content: `# 尺规作图原子操作

尺规作图允许有限次执行下面的原子操作：

| 操作 | 几何含义 |
| --- | --- |
| 过两点作直线 | 生成一条直线 |
| 以一点为圆心、过另一点作圆 | 生成一个圆 |
| 求两条直线交点 | 得到新点 |
| 求直线与圆的交点 | 得到新点 |
| 求两个圆的交点 | 得到新点 |

每一步最多引入一次平方根。因此可作数总处在反复二次扩张中：

$$
\\mathbb{Q}=K_0\\subset K_1\\subset\\cdots\\subset K_m
$$

其中每一步满足

$$
[K_{j+1}:K_j]=2
$$`,
  },
  {
    id: "abstraction",
    title: "问题的抽象",
    eyebrow: "从几何到代数",
    content: `# 问题的抽象

将单位圆放在复平面上。正 $n$ 边形的顶点可以写成：

$$
1,\\ \\zeta_n,\\ \\zeta_n^2,\\ldots,\\zeta_n^{n-1}
$$

其中

$$
\\zeta_n=e^{2\\pi i/n}
$$

要作出正 $n$ 边形，等价于能构造

$$
\\cos\\frac{2\\pi}{n}
$$

因为

$$
\\zeta_n + \\zeta_n^{-1}=2\\cos\\frac{2\\pi}{n}
$$

于是几何问题转化为：某个代数数是否能通过有限次平方根构造出来。`,
  },
  {
    id: "necessity",
    title: "猜想和必要性证明",
    eyebrow: "为什么会有限制",
    content: `# 猜想和必要性证明

一个数若可由尺规作图得到，则它所在的域扩张次数必须是 2 的幂。

因此正 $n$ 边形可作时，相关的代数扩张次数应满足：

$$
\\varphi(n)=2^k \\cdot m
$$

在典型的奇素数情形 $n=p$ 下：

$$
\\varphi(p)=p-1
$$

若正 $p$ 边形可作，则必须有

$$
p-1=2^k
$$

也就是说

$$
p=2^k+1
$$

进一步可以推出 $k$ 本身必须是 2 的幂，所以 $p$ 必须是费马素数：

$$
p=2^{2^r}+1
$$`,
  },
  {
    id: "sufficiency",
    title: "充分性证明",
    eyebrow: "十七的特殊结构",
    content: `# 充分性证明

对 $p=17$，有

$$
\\varphi(17)=16=2^4
$$

这意味着单位根的伽罗瓦群阶数是 2 的幂。它可以被分解为一串二次关系，从而把

$$
\\cos\\frac{2\\pi}{17}
$$

写成嵌套平方根。

一种经典表达会出现如下结构：

$$
16\\cos\\frac{2\\pi}{17}
=-1+\\sqrt{17}+\\sqrt{34-2\\sqrt{17}}+2\\sqrt{17+3\\sqrt{17}-\\sqrt{34-2\\sqrt{17}}-2\\sqrt{34+2\\sqrt{17}}}
$$

表达式看起来复杂，但它只含加减乘除和平方根，所以符合尺规作图能力。`,
  },
  {
    id: "pentagon",
    title: "实战正五边形",
    eyebrow: "热身样例",
    content: `# 实战正五边形

正五边形是理解正十七边形之前的好热身。它同样依赖黄金比：

$$
\\phi=\\frac{1+\\sqrt{5}}{2}
$$

在单位圆中，正五边形的中心角为

$$
\\frac{2\\pi}{5}
$$

而

$$
\\cos\\frac{2\\pi}{5}=\\frac{\\sqrt{5}-1}{4}
$$

这个表达式只含平方根，所以可以尺规作图。正十七边形的思路更长，但代数本质相同：把目标角的余弦拆成嵌套平方根。`,
  },
];

function loadSections() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!Array.isArray(saved)) return initialSections;

    return initialSections.map((section) => {
      const savedSection = saved.find((item) => item.id === section.id);
      return savedSection?.content
        ? { ...section, content: savedSection.content }
        : section;
    });
  } catch {
    return initialSections;
  }
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
  const [sections, setSections] = useState(loadSections);
  const [activeId, setActiveId] = useState(initialSections[0].id);
  const [mode, setMode] = useState("read");
  const [doodleMode, setDoodleMode] = useState(false);

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeId) ?? sections[0],
    [activeId, sections]
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sections.map(({ id, content }) => ({ id, content })))
    );
  }, [sections]);

  function updateActiveContent(content) {
    setSections((current) =>
      current.map((section) =>
        section.id === activeSection.id ? { ...section, content } : section
      )
    );
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
                <strong>{section.title}</strong>
                <small>{section.eyebrow}</small>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h2>{activeSection.title}</h2>
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
                aria-label={`${activeSection.title} Markdown 内容`}
              />
            </div>
          ) : (
            <article className="reading-view">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
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
