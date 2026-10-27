# Web Programming Labs · Web 编程课程实验

按周整理的 Web 编程实验仓库，记录 Todo 应用从数据驱动到事件委托的实现、调试与验证。

## 实验目录

| 实验 | 主要内容 | 代码与说明 |
| --- | --- | --- |
| Week 7 | Todo V2.0 数据驱动重构、任务筛选、localStorage 持久化 | [week7](./week7/) · [实验说明](./week7/README.md) |
| Week 8 | 事件委托重构、删除分支缺陷诊断、操作分流与编辑演示 | [week8](./week8/) · [实验说明](./week8/README.md) |
| Week 9 | TypeScript 严格类型重构、Vitest 单元测试与 AI 测试审查 | [week9](./week9/) · [实验说明](./week9/README.md) · [AI 审查](./week9/AI_REVIEW.md) |

## 目录结构

```text
web-programming-labs/
├── README.md
├── week7/
│   ├── README.md
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── test-fixture.html
└── week8/
    ├── README.md
    ├── index.html
    ├── app.js
    ├── styles.css
    ├── debug-bug.html
    ├── app.bug.js
    ├── edit-demo.html
    ├── app.edit-demo.js
    ├── test-fixture.html
    └── browser_results.json
```

## 本地运行

Week 7/8 使用原生 HTML、CSS 和 JavaScript，无需构建。Week 9 使用独立的 TypeScript/Vite 项目，运行方法见 [Week 9 README](./week9/README.md)，请勿用静态服务器直接加载 TS 源文件。安装 Python 后，在仓库根目录执行：

```bash
python -m http.server 8000
```

- W7 页面：<http://localhost:8000/week7/>
- W8 修复版：<http://localhost:8000/week8/>
- W8 缺陷复现：<http://localhost:8000/week8/debug-bug.html>
- W8 编辑演示：<http://localhost:8000/week8/edit-demo.html>

使用同一域名和端口打开时，W7 与 W8 共用 localStorage 的 `todos` 数据；刷新页面可以恢复已保存的任务。

## 验证

- [W7 数据流验证](./week7/test-fixture.html)：在本地打开 `/week7/test-fixture.html`，点击“运行数据流验证”，执行 12 项检查。此测试会覆盖当前来源的任务数据。
- [W8 浏览器验证](./week8/test-fixture.html)：在本地打开 `/week8/test-fixture.html`，点击“运行验证”，执行 9 项检查；测试结束时恢复原有任务数据。
- [W8 已记录的验证结果](./week8/browser_results.json)：包含实际捕获的控制台日志与断言结果。

## AI 协作说明

仓库中的实现、调试与测试使用了 AI 辅助。W7 的 `clearCompleted()` 和 W8 的编辑演示均不能作为“未使用 AI、独立完成”的证明。具体说明及课堂简化条件见各周 README。

