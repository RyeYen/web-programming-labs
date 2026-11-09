# Week 10 AI 协作记录

日期：2026-11-09（北京时间）。协作方式：用户提供仓库链接与实验要求，AI 在本地重建 week10 工程、配置 ESLint、执行结构化 Prompt 审查，并起草本文档与 `AI_REVIEW.md`。模型的具体产品版本未由工具确认，不编造版本号。

## 实际任务与 Prompt

用户要求：在 week9 基础上完成 V3.0 工程化收尾——Vite 工程就位、`build` 脚本改为 `tsc --noEmit && vite build`、配置 ESLint 三条规则（complexity 10 / max-depth 3 / no-explicit-any error）并达成 0 error、warning ≤ 3；再用结构化 Prompt 让 AI 审查代码，重点判断 AI 是否“为了过检查而改坏业务”。

审查用的 Prompt 原文保存在 `prompts/prompt-c.md`，含五条硬约束（不许改阈值、不许用 disable 类注释、不许删运行时校验、不许改业务规则、每处改动必须给 before/after diff 和数值）。

## AI 实际执行

1. 读取 week9 全部源码与测试，确认这是 Vite + TypeScript + Vitest 工程，`tsconfig.json` 已开 strict 三项。
2. 建立 week10：以 week9 为基线复制，新增 `.eslintrc.cjs`；`package.json` 的 `build` 改为 `tsc --noEmit && vite build`，新增 `lint` 脚本与三个 ESLint 开发依赖；`index.html` 的周次标注改为 W10。
3. 先装 `eslint@9` 试跑，`npx eslint src/` 直接报 `ESLint couldn't find an eslint.config.js`，`.eslintrc.cjs` 被完全忽略。降到 `eslint@8.57.1` 后才按 `.eslintrc.cjs` 生效。配置格式与主版本必须对上，否则规则一条都没跑。
4. `parserOptions.project` 指向 `./tsconfig.json` 后，被 lint 的文件必须落在 tsconfig 的 `include` 里，否则报 `file was not found by the project service`。本项目 `include` 已含 `tests/**/*.ts`，所以没有为“减少报错”去删 include。
5. 用 `--rule` 把阈值临时降到 1，逼出所有函数的真实数值：`mountTodoApp` 9、`isTodo` 9、`onListClick` 7、`addTodo` 7、`parseTodos` 7、max-depth 最大 3。三条规则下本来就是 0 error、0 warning。
6. 结构化 Prompt 让 AI 先只读报告数值、再提改动。AI 判定“不需要为过检查改业务”，另提两处可读性改造。
7. 复核后接受改动①（`storage.ts` 抽 `collectTodo()`），拒绝改动②（拆 `onListClick`）。复测发现 AI 对改动①的收益描述有误：max-depth 仍是 3，只有 complexity 7 → 6。
8. 改完依次跑 `tsc --noEmit`、`vitest run`、`eslint src/`、`npm run build`，全部通过，原始输出写入 `evidence/`。

## AI 生成的代码与文字

`week10/.eslintrc.cjs`、`package.json` 的脚本与依赖改动、`src/storage.ts` 的 `collectTodo()` 抽取、`index.html` 的周次文案，以及 `README.md`、`AI_REVIEW.md`、本日志、`prompts/prompt-c.md` 均由 AI 辅助生成。`src/todo.ts`、`src/app.ts` 未改动，沿用 week9。`package-lock.json` 由 npm 实际生成，`evidence/` 是实际命令输出。

## 实际验证

| 命令 | 真实结果 |
| --- | --- |
| node -v | v22.22.2 |
| npm -v | 10.9.7 |
| npm run typecheck | 通过，0 错误 |
| npm run lint | 0 error、0 warning（4 个文件） |
| npm test | Vitest 5 文件，31 项通过，0 失败 |
| npm run build | `tsc --noEmit && vite build`，成功产出 dist/ |

逐文件计数：`app.ts`、`main.ts`、`storage.ts`、`todo.ts` 均为 error 0 / warning 0。原始输出在 `evidence/typecheck.txt`、`lint.txt`、`test.txt`、`build.txt`。

未执行的验证不写成已通过：本周没有重做真实浏览器冒烟测试，week9 的浏览器证据留在 `week9/evidence/`，不复制到本目录冒充本周结果。

## 审查回答草稿

**规矩行为**：AI 没有删校验、没有用 `eslint-disable` / `@ts-ignore` / `as any`、没有调低阈值、没有把逻辑挪到 lint 看不见的地方。但把改动①的收益说错了——声称降低嵌套深度，实测 max-depth 仍是 3。

**业务行为**：改动①碰在 W8 的原子拒绝策略上，改后 `return false` → 外层 `return []`，行为等价；`addTodo` 的空白与类型校验未动。31 项测试含非法属性、重复 ID 用例，全部通过。

**处置**：部分修改，接受①、拒绝②。②的复杂度实测 7，离阈值 10 还有 3，规则没报警，拆开只会让两处合法性判断重复。

完整 diff 与复现命令见 `AI_REVIEW.md`。

## 本人必须审查或补写

- 复核 `src/storage.ts` 的 `collectTodo()` diff，确认原子拒绝策略确实等价，再决定是否保留。
- 对改动②的拒绝给出自己的判断，补写 `AI_REVIEW.md` 末尾的留白。
- 自己跑一遍 `npm run lint` 并截取真实终端截图；若使用本文档展示的日志，应如实标注呈现方式。
- 用自己的话写本周学习总结，不把 AI 草稿当作个人经历陈述。

## GitHub 状态

本次改动在本地仓库 `week10/` 目录完成并提交，**推送由本人执行**。AI 未持有本人 GitHub 凭证（`gh auth status` 显示未登录），不声称已推送、不虚构 PR 链接。
