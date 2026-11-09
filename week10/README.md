# Week 10 工程化收尾：ESLint 三规则与构建脚本

本周不写新功能。任务是把 week9 的 TypeScript 工程收进一条可复现的质量闸门：`build` 先跑类型检查再打包、ESLint 只收敛三条硬规则、再用结构化 Prompt 让 AI 审查代码，重点验证它有没有为了“过检查”而改坏业务。

Week 10 以 week9 为基线，`src/todo.ts` 与 `src/app.ts` 一字未改，业务行为与 week9 完全一致。

## 与 Week 9 的差异

| 文件 | 变化 |
| --- | --- |
| `.eslintrc.cjs` | 新增。complexity 10 / max-depth 3 / no-explicit-any error，共三条规则 |
| `package.json` | `build` 由 `vite build` 改为 `tsc --noEmit && vite build`；新增 `lint`；新增三个 ESLint 开发依赖 |
| `src/storage.ts` | `parseTodos` 的循环体抽成 `collectTodo()`，用返回值替代内层 `return []`；原子拒绝策略不变 |
| `index.html` | 周次文案 W9 → W10，页面结构不变 |
| `prompts/prompt-c.md` | 新增。结构化审查 Prompt 与实测数值 |
| `AI_REVIEW.md` | 重写为本周的改造审查 |
| `evidence/` | 换成本周四条命令的实际输出 |

## 环境与运行

实际环境：Node.js v22.22.2、npm 10.9.7。ESLint 8.57.1、@typescript-eslint/parser 6.21.0、@typescript-eslint/eslint-plugin 6.21.0、Vitest 5.0.5、TypeScript 5.9.3、Vite 7.3.7。精确版本由 `package-lock.json` 固定。

```bash
cd week10
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src/
npm test            # vitest run
npm run build       # tsc --noEmit && vite build
npm run dev
```

`build` 里 `tsc --noEmit` 与 `vite build` 是 `&&` 关系：类型不过就不产出 `dist/`，不会出现“打包成功但类型是错的”这种假绿。

## 目录结构

```text
week10/
├── README.md / AI_REVIEW.md / AI_COLLABORATION_LOG.md
├── .eslintrc.cjs                    三条规则，ESLint 8 的配置格式
├── package.json / package-lock.json / tsconfig.json / .gitignore
├── index.html / styles.css
├── src/{todo,storage,app,main}.ts
├── tests/                           week9 的 5 个文件 31 项，未改动
├── prompts/{prompt-a,prompt-b}.md   week9 留存
├── prompts/prompt-c.md              本周的结构化审查 Prompt
└── evidence/{typecheck,lint,test,build}.txt
```

## 关键技术决策

- **用 ESLint 8 而不是 9。** 先装 `eslint@9` 试跑，`npx eslint src/` 直接报 `ESLint couldn't find an eslint.config.js`，`.eslintrc.cjs` 被完全忽略——不是规则没通过，是配置根本没被读到。降到 8.57.1 才生效。配置格式与主版本必须对上。
- **`parserOptions.project` 必须让被 lint 的文件落在 tsconfig 的 `include` 里。** 否则报 `file was not found by the project service`。本项目 `include` 已含 `tests/**/*.ts`，所以没有为了“减少报错”去删 include。
- **只收敛三条规则。** `eslint:recommended` + `plugin:@typescript-eslint/recommended` 打底，额外只加 complexity、max-depth、no-explicit-any。类型正确性交给 `tsc`，不让 lint 和编译器重复劳动。
- **复杂度看实测，不看行数。** `mountTodoApp` 有 100 多行，实测 complexity 只有 9；反倒是单条 `if` 里的 `onListClick` 到 7、`isTodo` 到 9 更接近上限。复杂度只算当前函数体里的判定点，不含嵌套函数内部。
- **存储键沿用 `week9.todos`。** 同一应用迭代，改键会让用户已有任务凭空消失。测试断言也依赖这个键。
- **拒绝拆 `onListClick`。** 实测复杂度 7，离阈值 10 还有 3，规则没报警；拆开后两处 DOM 合法性判断要么重复、要么提到公共入口，等于没拆。理由见 `AI_REVIEW.md`。

## 实测结果

2026-11-09 北京时间执行，原始输出在 `evidence/`。

| 命令 | 结果 |
| --- | --- |
| `npm run typecheck` | 0 错误 |
| `npm run lint` | 0 error、0 warning（4 个文件） |
| `npm test` | 5 个文件、31 项通过、0 失败 |
| `npm run build` | 成功，产出 `dist/index.html`、`dist/assets/*` |

`npx eslint src/` 在 0 问题时终端不打印任何文件名，只有退出码 0；逐文件计数用 `npx eslint src/ --format json` 取得，四个文件全部 0 error / 0 warning。

各函数实测数值（用 `--rule` 把阈值临时降到 1 逼出来，不写回配置）：

| 函数 | complexity | 文件 |
| --- | ---: | --- |
| mountTodoApp | 9 | app.ts |
| isTodo | 9 | storage.ts |
| onListClick | 7 | app.ts |
| addTodo | 7 | todo.ts |
| parseTodos | 6 | storage.ts |
| collectTodo | 3 | storage.ts |

max-depth 最大 3，出现在 `storage.ts` 的 `try → for → if`。

## 已知限制

- 本周没有重做真实浏览器冒烟验证。week9 的浏览器证据留在 `week9/evidence/`，不复制到本目录冒充本周结果。
- `evidence/lint.txt` 是终端文本日志，不是截图；需要截图请自行运行 `npm run lint` 后截取。
- ESLint 8.57.1 官方已停止支持，本次只为兼容 `.eslintrc.cjs` 格式；迁移到 flat config 是后续工作。
- `AI_REVIEW.md` 末尾保留了本人复核留白，未填写。
