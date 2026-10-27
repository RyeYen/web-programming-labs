# Prompt B 原始输入

你是 TypeScript/Vitest 测试工程师。请测试 ../src/todo 中的 addTodo(todos: Todo[], text: unknown): void。

业务契约：Todo={id:number,text:string,completed:boolean}；合法字符串 trim 后添加，completed=false，ID 为唯一安全整数；空串与纯空白不添加；重复文本允许连续添加，ID 仍须唯一；沿用 W8 无长度上限的策略，10000 字符合法文本须完整保留；null 和其他非字符串输入应安全忽略、不抛错、不改变旧数据。unknown 是面向 JS 运行时的输入边界，内部必须 typeof 收窄；不得使用 any、非空断言、as 或 @ts-ignore。

只为已明确维度注释编号：维度 1=null；维度 2=纯空格/空字符串；维度 6=连续重复文本；维度 2 拓展=超长文本。不编造其余维度定义。额外类型防御测试直接描述业务，不擅自编号。

使用 test/expect、显式 import 函数，每个测试独立创建 Todo[]；验证长度、完整文本、初始状态、原数据保留与 ID 唯一性，不得只有 toBeDefined 或仅不抛错。用受控 Date.now 复现同毫秒重复添加，finally 恢复 mock。给出可运行的完整测试。

# 本轮实际生成结果

完整原始输出保存在 `../tests/ai-generated.test.ts`，共 7 项；本轮 Codex 根据上述契约实际生成并运行。它与 Prompt A 为同一会话中的教学对比，不能据此推断不同模型的统计性能。

覆盖情况：合法输入、null、混合空白、空串、同毫秒重复文本、10000 字符、其他非法运行时类型。使用具体结果断言与独立数据；无类型绕过。详细比较见 AI_REVIEW.md。
