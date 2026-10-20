# W8 Todo V2.0：事件委托重构

从分享对话中的原始生成记录恢复的 W8 代码，基于本仓库 W7 Todo 数据驱动版本。

## 运行与文件

在仓库根目录运行 `python -m http.server 8000`，打开 <http://localhost:8000/week8/index.html>。

- `index.html` / `app.js`：修复版，在列表 `ul` 上统一处理点击；通过 `closest()`、`dataset.id` 和空值检查定位任务，删除后立即 `return`。
- `debug-bug.html` / `app.bug.js`：教学缺陷复现版，故意省略删除分支的 `return`，一次删除会产生 `[deleteTodo]` 与 `[toggleTodo]` 双重日志。
- `edit-demo.html` / `app.edit-demo.js`：AI 辅助生成的编辑分支演示，包含确认、取消和空输入处理。
- `test-fixture.html`：浏览器交互验证，覆盖量规的五项测试、双重日志复现、页面重新加载、筛选与编辑演示。运行后显示实际断言结果，并恢复测试前的本来源 `todos` 数据。
- `browser_results.json`：本次在浏览器中运行测试所捕获的结果。

## 控制台证据

在 `debug-bug.html` 中添加任务，打开 F12 → Console，再点击删除按钮，可观察到相同 ID 的两条日志。修复版 `index.html` 同一次删除只会打印 `[deleteTodo]`；点击任务文字只会打印 `[toggleTodo]`。

## AI 协作说明

代码恢复、编辑演示和测试由 AI 辅助完成。编辑演示不能作为“禁用 AI、本人完全独立完成”的证明。浏览器测试结果也不替代本人提交时拍摄的原生控制台截图。

课堂代码使用 `Date.now()` 生成任务 ID；同一毫秒连续添加可能产生重复 ID。`save()` 保留课堂实现，未扩展存储配额耗尽或禁用写入的处理。
