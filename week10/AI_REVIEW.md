# Week 10 AI 改造审查

本文审查的对象不是“AI 写的代码能不能跑”，而是**AI 在通过 lint 这件事上有没有走捷径**。原始 Prompt 见 `prompts/prompt-c.md`，改动前后代码见下方 diff，实测数值均可用文末命令复现。

## 一、规矩行为审查：有没有“为了过检查而改坏业务”

### 1. 有没有删掉某段校验 / 判断？

没有。

改动①把 `return []` 换成 `return false`，再在外层 `return []`，原子拒绝策略仍在：我逐行对照 diff，确认 `isTodo(item)` 与 `ids.has(item.id)` 两个条件一个都没少。改动②被我拒绝，所以没有发生。

### 2. 有没有用 `any`、`eslint-disable`、调低规则来“过关”？

没有。

最终 `.eslintrc.cjs` 仍是 `complexity: 10`、`max-depth: 3`、`@typescript-eslint/no-explicit-any: error`；在 `src/` 与 `tests/` 里 grep 不到 `eslint-disable`、`@ts-ignore`、`as any`。

### 3. 有没有把逻辑挪到别处、让 ESLint 看不见？

没有。但这里有一处必须点出的问题。

AI 声称改动①“降低了嵌套深度”。我用 `npx eslint src/storage.ts --rule '{"max-depth":["warn",1]}'` 复测，`try → for → if` 的深度仍然是 3——`try` 自己就占一层，抽函数并没有把 `if` 从 `try` 里拿出来。实测只有 complexity 从 7 降到 6，多出一个 complexity 3 的 `collectTodo`。

它没有骗过规则，但把收益说错了。这种“看起来更干净”的改动最容易被当成达标证据，我按实测把它降级为纯可读性改动。

## 二、业务行为验证：改完之后，原来的规则还在吗？

### 规则一：存储里只要有一条记录非法，整份数据必须整体拒绝

这是 W8 定下的原子拒绝策略，不能跳过坏记录继续加载。

改动①正好碰在这条上。改后 `collectTodo` 返回 `false` → 外层立即 `return []`，行为不变：`parseTodos` 对 `null`、非法 JSON、非数组仍返回 `[]`。`boundaries.test.ts` 的非法属性、重复 ID 用例全部通过。

### 规则二：纯空白 / 空串不能添加，已有数据不变

本次没有碰 `todo.ts`，`addTodo` 里 `typeof text !== 'string'` 与 `trimmed.length === 0` 两道判断原样保留。

### 怎么验证的

四个动作，全部在本地实跑：

1. `npx tsc --noEmit` —— 0 错误
2. `npx vitest run` —— 5 个文件 31 项全过（含 `boundaries.test.ts` 的非法属性、重复 ID 用例）
3. `npx eslint src/` —— 0 error 0 warning
4. `npm run build` —— `tsc --noEmit && vite build`，产出 `dist/`

原始输出在 `evidence/` 下。

## 三、处置：接受、拒绝还是部分修改

**部分修改：接受改动①，拒绝改动②。**

### 接受①的理由

它把一次记录判定收拢成一个有返回值的纯函数，diff 能逐行对照，31 项测试和两条业务规则都复验过，风险可控。

但我不把它当成“降低了 max-depth”的证据，因为复测深度没变。收益只写“可读性 + `parseTodos` complexity 7 → 6”。

### 拒绝②的理由

`onListClick` 的复杂度实测是 7，离阈值 10 还有 3，规则根本没报警。

拆成两个 handler 之后，`item.closest('li')` 的合法性判断和 `item.parentElement !== list` 的归属判断，要么在两个函数里各写一遍（重复），要么提到公共入口（等于没拆）。为一次点击事件增加一层间接性，收益是零。

**一句话：规则没报警的地方，我不接受“为了好看”的重构。**

## 四、改动 diff

### `src/storage.ts` —— 接受

```diff
+// One record at a time: false means the whole payload must be rejected.
+function collectTodo(item: unknown, ids: Set<number>, todos: Todo[]): boolean {
+  // Match W8's atomic rejection policy instead of silently dropping records.
+  if (!isTodo(item) || ids.has(item.id)) return false;
+  ids.add(item.id);
+  todos.push({ id: item.id, text: item.text, completed: item.completed });
+  return true;
+}

 export function parseTodos(raw: string | null): Todo[] {
   ...
     for (const item of value) {
-      // Match W8's atomic rejection policy instead of silently dropping records.
-      if (!isTodo(item) || ids.has(item.id)) return [];
-      ids.add(item.id);
-      todos.push({ id: item.id, text: item.text, completed: item.completed });
+      if (!collectTodo(item, ids, todos)) return [];
     }
```

### `src/app.ts` —— 拒绝，未改动

## 五、复现命令

```bash
# 三条规则下的最终状态
npx eslint src/

# 逼出每个函数的真实数值（阈值临时降到 1）
npx eslint src/ --rule '{"complexity":["warn",1],"max-depth":["warn",1]}'

# 单独确认 max-depth
npx eslint src/storage.ts --rule '{"max-depth":["warn",1]}'
```

`--rule` 只是读取用的临时覆盖，不写回 `.eslintrc.cjs`，也不影响 CI 判定。

## 本人需要补写的部分

本人复核的 diff 与实跑截图：＿＿＿＿＿＿＿＿；本人对改动②的判断与理由：＿＿＿＿＿＿＿＿。
