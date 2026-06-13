# Math-17

尺规作图正 17 边形演示工程。

## 本地启动

```bash
./startup.sh
```

页面支持左侧一级目录导航，目录标题、描述、顺序和新增目录都可在页面内管理。右侧内容可在编辑态和只读态之间切换，编辑态可输入 Markdown 和 LaTeX 公式，只读态会渲染为排版后的文章与数学公式。也支持进入“随意写”状态，在页面上临时涂鸦、撤销上一笔，并在退出时自动清空笔迹。

## 内容存储

目录定义保存在 `src/data/sections.json`，每个目录的正文保存在 `src/data/markdown/*.md`。`sections.json` 只记录标题、描述和引用的 Markdown 文件名。页面内新增目录时会输入并创建对应 `.md` 文件；删除目录时会删除它引用的 `.md` 文件。本地开发服务器会提供读写接口，页面内编辑后会自动保存回这些工程文件，因此可以通过 git commit/push 持久化。

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
