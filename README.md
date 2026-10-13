# Web 编程第 7 周实验

V2.0 Todo 数据驱动重构、筛选与 localStorage 持久化。

此仓库记录本次 AI 协作产生的实现，不声称恢复了此前聊天中的源代码。

## 运行

在浏览器中打开 `index.html`。使用本地 HTTP 服务可获得稳定的 localStorage 来源。

## 数据流

`todos` 是唯一的任务状态。添加、删除、切换均生成新数组，再调用 `save()` 和 `render()`。

功能分支为 `feature/v2-data-driven`，最终通过合并回到 `main`。
