# Prompt C 原始输入（结构化约束）

你是 TypeScript 工程化审查者。目标：让 week10/src 在 `.eslintrc.cjs` 的三条规则下 0 error、warning ≤ 3。

硬约束：

1. 不得修改 `.eslintrc.cjs` 里 complexity(10) / max-depth(3) / no-explicit-any(error) 的阈值与级别；不得用 `eslint-disable`、`@ts-ignore`、`as any`、非空断言来消除告警。
2. 不得删除或弱化任何运行时校验（typeof 收窄、`Number.isSafeInteger`、`isTodo` 的字段校验、`parseTodos` 的原子拒绝策略）；不得把校验挪到 lint 看不见的地方（`.d.ts`、ts 生成代码、eval）。
3. 不得修改业务规则：纯空白/空串不添加；重复文本允许；ID 为唯一安全整数；存储中任一条记录非法则整体拒绝并返回 `[]`；切换/删除不存在的 ID 不抛错。
4. 每处改动给出 before/after diff，并说明它降低了哪条规则的哪个数值，不许只说“更清晰”。
5. 改完必须通过 `npx tsc --noEmit`、`npx vitest run`（31 项）、`npm run build`。

先只读代码报告实测数值，再提改动。如果你认为不需要改，直接说“不需要改”并给出数值证据。

# 本轮实际执行

## 第一步：只读实测

用 `npx eslint src/ --rule '{"complexity":["warn",1],"max-depth":["warn",1]}'` 把阈值临时降到 1，逼出所有函数的真实数值：

| 函数 | complexity | 文件 |
| --- | ---: | --- |
| mountTodoApp | 9 | app.ts |
| isTodo | 9 | storage.ts |
| onListClick | 7 | app.ts |
| addTodo | 7 | todo.ts |
| parseTodos | 6 | storage.ts（改造后） |
| collectTodo | 3 | storage.ts（改造后新增） |

max-depth 最大 3，出现在 storage.ts 的 `try → for → if`。三条规则下 0 error、0 warning，一次就达标。

## 第二步：AI 的结论

AI 判定“不需要为过检查改业务代码”，但额外提了两处“可读性改造”：

- 改动①（接受）：`storage.ts` 把 for 循环体抽成 `collectTodo()`，用返回值代替内层 `return []`。
- 改动②（拒绝）：`app.ts` 把 `onListClick` 里“删除 / 切换”两条分支拆成 `onDeleteClick` / `onToggleClick` 两个 handler。

## 第三步：复核结果

改动①落地后复测：`parseTodos` complexity 7 → 6，`collectTodo` 为 3，max-depth 仍是 3（`try` 自己占一层，抽函数并没有把 `if` 从 `try` 里拿出来）。AI 声称它“降低了嵌套深度”，这一句与实测不符，已按纯可读性改动降级记录。

改动②被拒：`onListClick` 实测 7，离阈值 10 还有 3，规则根本没报警。拆开后 `item.closest('li')` 的合法性判断和 `item.parentElement !== list` 的归属判断要在两个函数里各写一遍，或者提到公共入口，等于没拆，只增加一层间接性。

完整 diff 与逐条审查见 `../AI_REVIEW.md`。
