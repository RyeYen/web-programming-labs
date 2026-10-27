# AI 测试审查草稿

本文由 AI 辅助起草，供学生核对、改写和补充个人判断。没有将 AI 代码写成学生手写成果。原始输入见 prompts/，实际输出分别为 tests/ai-prompt-a.test.ts 与 tests/ai-generated.test.ts；两组均在本轮生成并实际运行。

## 两组实际输出比较

| 审查项 | Prompt A，3 项 | Prompt B，7 项 |
| --- | --- | --- |
| 正常覆盖 | 只查添加后长度为 1 | 查 trim 后全文、completed=false、安全 ID、旧数据保留 |
| 边界覆盖 | 空串、普通空格 | null、混合空白、空串、重复文本、同毫秒、10000 字符、非字符串 |
| 断言强度 | 长度有业务意义，单独使用较弱 | 验证具体字段、完整数组和唯一 ID |
| 预期正确性 | 三项与当前业务一致，未规定其余策略 | 明确允许重复和长文本，拒绝非法类型 |
| 测试独立性 | 每项新数组 | 每项新数组，mock 在 finally 中恢复 |

这是同一会话的两个实际产物对比，没有隔离上下文，也没有统计重复；不能推断 Prompt B 对所有模型或所有任务都更优。原稿没有删除失败测试或为了通过而修改预期。

## 题目一 有效性审查

原位置：`tests/ai-prompt-a.test.ts` 第一个 test 中的 `expect(todos).toHaveLength(1)`。它只能证明数量增加，无法证明新增 text、completed、id 正确。如果实现错误地添加 `{id:1,text:'错误文本',completed:true}`，该断言仍会通过。这里是“不充分的弱断言”，不是完全没有业务意义的断言；实际原稿没有 toBeDefined 之类完全避开业务的断言，不应虚构 AI 曾生成过它。

最小修补应验证具体字段，保留原有数量检查：

```ts
const todos: Todo[] = [];
addTodo(todos, '写作业');
expect(todos).toHaveLength(1);
expect(todos[0]?.text).toBe('写作业');
expect(todos[0]?.completed).toBe(false);
expect(Number.isSafeInteger(todos[0]?.id)).toBe(true);
```

原位置：A 的两个拒绝用例只对空数组检查长度为 0。若实现遇到非法文本时错误清空已有数组，这两项仍会通过。最小修补是预先放入一个任务，拒绝后比较整个数组；B 的 null/非字符串测试与基础空白测试采取了这一做法。

`not.toThrow()` 能验证异常行为，但单独使用不足以证明没有副作用，因此所有使用此断言的业务测试均搭配具体数据或可见结果断言。类型检查通过也不能代替运行时数据验证。

本人审核与改写：＿＿＿＿＿＿＿＿；本人确认的弱断言位置：＿＿＿＿＿＿＿＿。

## 题目二 边界审查

Prompt A 遗漏了本次已明确的维度 1（null）、维度 6（连续重复文本）、维度 2 拓展（超长文本）。null 会在未经检查直接 trim 时抛错；重复任务是合法业务，两条应均保留，但同毫秒 Date.now 可能碰撞，而存储加载拒绝重复 ID；长文本没有既定上限，应先说明策略再测试完整保留，不能凭空要求拒绝。

维度 1 的最小补丁：

```ts
test('null 被安全忽略且保留旧数据', (): void => {
  const todos: Todo[] = [{ id: 1, text: '保留', completed: false }];
  expect((): void => addTodo(todos, null)).not.toThrow();
  expect(todos).toEqual([{ id: 1, text: '保留', completed: false }]);
});
```

unknown 是被测接口的真实类型设计，不以 any 或 as 制造非法静态调用。合法字符串在内部 typeof 验证后才 trim；这区分了 TS 编译期约束与来自 JS/JSON 的非法运行时输入。

维度 6 的最小补丁（需要 import vi，并在 finally 恢复）：

```ts
const todos: Todo[] = [];
const clock = vi.spyOn(Date, 'now').mockReturnValue(100);
try {
  addTodo(todos, '重复');
  addTodo(todos, '重复');
  expect(todos).toEqual([
    { id: 100, text: '重复', completed: false },
    { id: 101, text: '重复', completed: false },
  ]);
} finally { clock.mockRestore(); }
```

维度 2 拓展的最小补丁：

```ts
const todos: Todo[] = [];
const text: string = '长'.repeat(10000);
addTodo(todos, text);
expect(todos).toHaveLength(1);
expect(todos[0]?.text).toBe(text);
expect(todos[0]?.completed).toBe(false);
```

测试问题与实现问题：缺少上述用例、只检查长度，是测试覆盖与断言不足；直接 trim 非字符串、同毫秒 ID 冲突则是实现缺陷。Week 9 分别用 typeof 防御与 ID 碰撞递增修复。Week 8 的 dataset 仅 isFinite 可接受小数与空格转换，存储仅有限数校验可接受不安全整数；Week 9 改为非空校验与安全整数验证。这些改动只在 week9 中实现，未更改旧实验。

Prompt B 已覆盖指定 addTodo 维度，但不是全项目边界测试：dataset 非法值、JSON 属性类型/重复 ID、localStorage 访问/配额异常、删除按钮嵌套图标与非 Element target 另由 boundaries/app 测试覆盖。原模板列出九类名称；本次只使用课件已明确的 1、2、6 编号，不扩写其余维度细则，也不为同步 addTodo 编造异步行为。

本人选择需要修补的边界与理由：＿＿＿＿＿＿＿＿；本人复核的最终代码与运行截图：＿＿＿＿＿＿＿＿。

## 运行核对

Vitest 5.0.5：5 个文件，31 项通过，0 失败；类型检查与 Vite 构建通过。日志见 evidence/。首次类型检查暴露 DOM 收窄在闭包中的错误，已使用守卫后声明的具体 DOM 类型修复；没有以断言或屏蔽绕过。
