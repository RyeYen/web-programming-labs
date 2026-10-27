# Week 9 TypeScript 重构与测试审查

本实验将 Week 8 已修复的 Todo V2.0 迁移为严格 TypeScript，通过 Vitest 验证数据操作、外部输入与事件委托，并对 AI 测试给出可核查的审查草稿。所有实现、参考测试和文字初稿均有 AI 参与，不作为学生独立手写证明。

## 与 Week 8 的适配

仓库不存在课件中的 `todo.js`。实际来源为 `week8/app.js`：其中 addTodo/toggleTodo/deleteTodo、筛选与 ID 解析提取至 `src/todo.ts`；load/save 提取至 `src/storage.ts`；render、表单与委托监听迁入 `src/app.ts`。`src/main.ts` 为入口。`styles.css` 复制 W8 样式，页面只修改周次、模块入口和存储错误提示。

Week 8 使用闭包数组和不可变数组替换；Week 9 改为显式传入 `Todo[]` 的原地更新接口，add/toggle/delete 返回 void，保存与渲染由 DOM 层负责。切换会替换目标对象，保持其他任务的数据；删除分支保留 return，避免误触切换。Week 7/8 文件未修改。

## 环境与运行

实际环境：Node.js v22.22.2、npm 10.9.7。依赖的精确版本由 package-lock.json 固定；Vitest 5.0.5、TypeScript 5.9.3、Vite 7.3.7。建议使用 Node.js 22.22.2 或兼容的更新版本。

```bash
cd week9
npm install
npm run typecheck
npm run test
npm run dev
# 浏览器打开 Vite 输出的地址，通常为 http://127.0.0.1:5173/
npm run build
npm run preview
```

`test` 固定为 `vitest run`，单次退出；`typecheck` 为 `tsc --noEmit`，包含 src 和 tests 的 TS 文件。strict、ES2020、ESNext、noEmit 均开启；额外启用数组下标和可选属性严格检查。Vite 转换 TS 后供浏览器使用，不关闭 noEmit，也不直接以静态服务器运行原始 TS。

## 目录结构

```text
week9/
├── README.md / AI_REVIEW.md / AI_COLLABORATION_LOG.md
├── package.json / package-lock.json / tsconfig.json / .gitignore
├── index.html / styles.css
├── src/{todo,storage,app,main}.ts
├── tests/
│   ├── todo.test.ts                 五项基础测试，AI 辅助参考
│   ├── student-template.ts.txt      学生待填结构，不进入测试统计
│   ├── ai-prompt-a.test.ts          Prompt A 原始输出
│   ├── ai-generated.test.ts         Prompt B 原始输出
│   ├── boundaries.test.ts          数据边界回归
│   └── app.test.ts                 jsdom 集成验证
├── prompts/{prompt-a,prompt-b}.md
└── evidence/{typecheck,test,build}.txt
```

## 关键技术决策

- 导出 Todo 接口，id:number、text:string、completed:boolean；函数、数组、DOM、事件及存储端口均有类型。
- addTodo 的 text 有意声明为 unknown：它是面向 JS 调用者的运行时入口，先 typeof 收窄再 trim。null 测试可直接调用，无需 any、as、非空断言或类型屏蔽。调用者可以传 string，接口比课件示例更能表达不可信输入边界。
- trim 后为空则忽略；允许同文任务和超长合法字符串，沿用 W8 策略。未人为设立长度上限；存储配额不足时保留内存操作并显示保存失败。10000 字符测试不是无限长度与所有存储配额的保证。
- 保留 Date.now 风格 ID；同毫秒碰撞时递增，防止重复 ID 导致刷新恢复失败。ID 仅要求安全整数，保留 W8 合法整数数据，不额外要求正数。
- dataset 先检查 undefined 与 trim 后空串，再 Number() 与 Number.isSafeInteger()。因此 123abc、1.5、空串、纯空格、缺失和不安全整数都会拒绝；合法数值 0 不误判。事件 target/currentTarget 经 instanceof 收窄，不能以类型断言代替验证。
- JSON.parse 结果立即进入 unknown；验证数组、对象属性类型、安全整数及唯一 ID。任一记录损坏或 JSON 异常则整组降级为空，沿用 W8 原子拒绝策略；不自动覆盖损坏的原始数据，用户下一次有效操作才保存。
- 使用独立 `week9.todos` 键；测试用 Map/独立 jsdom 数据，不接触用户真实存储。Week 7/8 继续使用原 `todos`。首次迁移不自动读取 W8 数据；可将符合模型的旧数组导入新键。
- 保存捕获异常并返回 boolean；获取 localStorage 失败时仍允许页面内操作。文本使用 textContent，列表委托监听不随 render 重建。

## 单元测试与真实结果

2026-10-27 北京时间执行：类型检查通过（0 错误）；Vitest 5 个文件、31 项通过、0 失败；Vite 生产构建通过；安装升级后 npm 审计报告 0 个漏洞。原始命令输出在 evidence/ 中。jsdom 集成测试验证 DOM 行为，不代表所有浏览器的真实端到端兼容性。

| 文件 | 数量 | 验证内容 |
| --- | ---: | --- |
| todo.test.ts | 5 | 添加、空白、空串、切换隔离、未知 ID |
| ai-prompt-a.test.ts | 3 | 原始简略输出，保留待审查的长度断言 |
| ai-generated.test.ts | 7 | 合法输入、null、空白、空串、重复、长文本、非法类型 |
| boundaries.test.ts | 12 | dataset、存储、ID、删除、筛选等 |
| app.test.ts | 4 | 子图标委托、脏 ID、非 Element、添加筛选恢复、存储与 DOM 缺失 |

五项基础测试的设计与待填结构见 student-template.ts.txt，完整 AI 参考见 todo.test.ts。每项独立初始化，断言真实业务结果。学生应在理解后关闭参考、自行重写，再重跑验证；当前不能将这五项标记为“学生手写”。

Prompt A/B 的原始输入、实际生成文件与覆盖情况已保存。A 的长度断言具有业务意义，但不足以证明文本和状态正确；B 用具体字段、旧数据保留及同毫秒 ID 检查修补。两组来自同一 Codex 会话，未进行隔离、多次或跨模型实验。详见 AI_REVIEW.md。

## 提交与证据

提交前本人需要审核 AI_REVIEW.md 的留白、独立重写五项基础测试、补写个人总结并截取真实终端运行截图。建议截图：node/npm 版本、typecheck 零错误、31 项通过摘要、浏览器添加/切换/筛选/刷新恢复、GitHub PR 文件列表。node_modules、dist 和临时缓存均已忽略。
