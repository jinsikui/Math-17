# Math-17

尺规作图正 17 边形演示工程。

## 本地启动

```bash
./startup.sh
```

页面支持左侧一级目录导航，目录标题、描述、顺序和新增目录都可在页面内管理。右侧内容可在编辑态和只读态之间切换，编辑态可输入 Markdown 和 LaTeX 公式，只读态会渲染为排版后的文章与数学公式。也支持进入“随意写”状态，在页面上临时涂鸦、撤销上一笔，并在退出时自动清空笔迹。

## 生产运行

一体化生产启动脚本会自动安装依赖、构建前端、停止旧生产服务，并启动 Node 生产服务。默认只读：

```bash
HOST=127.0.0.1 PORT=4173 ./production.sh
```

开启编辑和自动保存：

```bash
HOST=127.0.0.1 PORT=4173 MATH17_EDITING_ENABLED=1 ./production.sh
```

如果需要公网监听，把 `HOST` 改为 `0.0.0.0`：

```bash
HOST=0.0.0.0 PORT=4173 ./production.sh
```

运行时终端需要保持打开，按 `Ctrl+C` 停止服务。

也可以使用 npm 脚本：

```bash
npm run production
npm run production:edit
npm run production:build
npm run production:stop
npm run production:status
```

脚本默认会运行 `npm ci`、`npm run build`、清理旧的本项目生产服务，然后启动 `node server/site-server.js`。

如果只想手动运行生产服务，也可以先构建前端：

```bash
npm run build
HOST=0.0.0.0 PORT=4173 npm run serve
```

生产服务由 `server/site-server.js` 提供，会同时托管 `dist/` 静态文件和 `/api/sections`、`/api/markdown/*` 内容接口。默认只读；只有开启 `MATH17_EDITING_ENABLED=1` 或使用 `npm run serve:edit` 时，页面编辑和自动保存才会写回 `src/data/sections.json` 与 `src/data/markdown/*.md`。

如果只把 `dist/` 目录交给 Nginx 等静态服务器托管，页面仍可阅读构建时打包进去的内容，但不会有内容 API，编辑入口会自动关闭。

## 内容存储

目录定义保存在 `src/data/sections.json`，每个目录的正文保存在 `src/data/markdown/*.md`。`sections.json` 只记录标题、描述和引用的 Markdown 文件名。页面内新增目录时会输入并创建对应 `.md` 文件；删除目录时会删除它引用的 `.md` 文件。内容服务接口会负责读写这些工程文件，页面内编辑后会自动保存，因此可以通过 git commit/push 持久化。

## 内容图片

内容图片统一放在 `src/data/content-images/`。Markdown 中可以使用：

```md
![示意图](example.png)
```

应用会自动解析为 `/content-images/example.png`。

## 背景块语法

正文 Markdown 支持一种只负责加背景色的块级容器语法：

```md
:::bg
这里可以继续写普通 Markdown。

- 列表
- 公式

$$
\alpha + \beta = \gamma
$$
:::
```

`:::bg` 内部仍然按正常 Markdown 渲染，背景色与当前块级公式框保持一致。

如果希望显示折叠 UI，并且默认折叠，可写成：

```md
:::bg[fold=true]
这里的内容默认折叠，点击后展开。

- 可以继续写列表
- 也可以写公式
:::
```

如果希望初始就是展开状态，但仍然允许收起，可写成：

```md
:::bg[fold=false]
这里的内容默认展开，但顶部仍然会显示“收起”入口。
:::
```

也可以单独覆盖展开/收起文案：

```md
:::bg[fold=true, foldTitle=收起证明, unfoldTitle=展开证明]
这里写详细证明。
:::
```

说明：

- `:::bg`：普通背景块，没有折叠 UI
- `:::bg[fold=true]`：有折叠 UI，初始为收起
- `:::bg[fold=false]`：有折叠 UI，初始为展开
- `foldTitle`：展开后按钮显示的文案，默认是“收起”
- `unfoldTitle`：收起时按钮显示的文案，默认是“展开”
- `[...]` 整体可以不写；只有写了 `fold` 属性，才会出现“展开 / 收起”的交互头
- 中括号内属性既可以用逗号分隔，也可以用空格分隔
- 不再支持旧的 `:::bg{...}` 配置写法
