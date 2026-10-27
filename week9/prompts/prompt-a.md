# Prompt A 原始输入

请为 addTodo 编写 Vitest 单元测试。

输入上下文：addTodo(todos: Todo[], text: unknown): void；Todo 有 id:number、text:string、completed:boolean；模块 ../src/todo。

# 本轮实际生成结果

完整原始输出保存在 `../tests/ai-prompt-a.test.ts`，共 3 项：正常添加、空字符串、纯空格。由本轮 Codex 实际生成，并运行验证；未声称来自额外模型或外部会话。原稿保留以便审查，改进断言另见 `ai-generated.test.ts` 与 `AI_REVIEW.md`。

覆盖情况：三个场景均仅检查数组长度；缺少字段与旧数据断言，未覆盖 null、重复文本和超长文本。独立初始化数组，没有共享可变状态。
