# Week 9 AI 协作记录

日期：2026-10-27（北京时间）。协作方式：用户在 Codex 中提供仓库、实验要求、原 Word 模板及报告填写信息；Codex 读取仓库、实现、测试并起草文档。身份信息仅填写本地报告。模型的具体产品版本未由工具确认，不编造版本号。

## 实际任务与 Prompt

用户要求：以 week8/app.js 修复版提取 Todo 数据逻辑，进行严格 TypeScript 重构；先提供五项测试设计与待填模板，再给出明确 AI 标记的参考；生成 A/B 测试并基于真实输出审查；填写原 Word 另存，17:00 前优先完成 DOCX；新分支提交并创建 PR，不合并 main。

提示文本 A/B 原文分别保存于 prompts/prompt-a.md 与 prompt-b.md，对应完整实际生成结果位于 tests/ai-prompt-a.test.ts（3 项）与 tests/ai-generated.test.ts（7 项）。本次为同一 Codex 会话中的生成与审查，未通过额外 API 或隔离模型调用重复实验，不虚构独立对话或模型性能结论。

## AI 实际执行

1. 读取根 README、week8/app.js、HTML/CSS 及 Word 模板，确认不存在课件 todo.js；通过 GitHub 连接器取得完整仓库文件。git clone 的两次网络直连均失败，未据此声称克隆成功；通过原始内容验证全部 blob 哈希，重建与远端 SHA 完全相同的 main 树和提交，形成可正常推送的浅仓库，实验提交以真实 main 为父提交。Week 7/8 的字节与远端逐文件核对一致。
2. 生成 week9 的 TS 数据层、存储层、DOM 层、Vite 入口、配置与全部测试；只更新根 README 的导航，Week 7/8 不改。
3. 在聊天中展示五项基础测试设计，并提供 student-template.ts.txt 待填结构及 todo.test.ts 完整 AI 参考。没有学生独立手写记录。
4. 生成 Prompt A/B 原始输出、比较表、有效性与边界审查草稿及最小修补。A 的长度断言是实际存在的不足，不编造 toBeDefined 原稿。
5. npm install 初次审计报告 3 个漏洞；查询实际审计信息后升级 Vitest 到 5.0.5，安装审计降至 0。没有执行 audit fix --force。
6. 首次 tsc 报告 9 条 DOM 捕获变量的可空/成员类型错误；用 instanceof 验证后的具体类型变量修复，再次类型检查通过。未使用 any、as、非空断言或 @ts-ignore。
7. 使用原 DOCX 的 OOXML 进行槽位填写，另存新文件并保持原模板不变。标准 render_docx.py 缺少 LibreOffice，改用本机 Word 只读导出 PDF，再以捆绑 PDFium 渲染检查。渲染图像是排版质检中间件。

## AI 生成的代码与文字

src/ 全部 TS 文件、tests/ 全部参考与扩展测试、配置、Prompt A/B、README、AI_REVIEW 与本日志均由 AI 辅助生成。页面沿用 Week 8 外观。package-lock 由 npm 实际生成，evidence 是实际命令输出，不能当作学生独立创作。

## 实际验证

| 命令 | 真实结果 |
| --- | --- |
| node -v | v22.22.2 |
| npm -v | 10.9.7 |
| npm install | 成功；升级后审计 0 漏洞 |
| npm run typecheck | 修复后通过，0 错误 |
| npm run test | Vitest 5.0.5，5 文件，31 通过，0 失败 |
| npm run build | Vite 7.3.7，成功 |

原始输出保存在 evidence/typecheck.txt、test.txt、build.txt。另有 4 项 jsdom DOM 集成测试；它们不等于真实浏览器端到端测试。未执行的验证不写成已通过。

随后完成真实内置浏览器冒烟验证：初始空列表、添加两项、切换与筛选、刷新恢复、子图标删除、空白拒绝及清理本次数据共 7 项观察通过，截图与记录已保存到 evidence/。它们单独记录，不冒充额外 Vitest 用例或跨浏览器测试。

## 有效性审查回答草稿

A 正常测试只有 expect(todos).toHaveLength(1)，即使新增错误文本或 completed=true 也可能通过；应补全文本、初始状态及安全 ID。A 的空白测试从空数组开始，不能发现清空旧数据的副作用；应先放入任务并比较完整数组。not.toThrow 必须配合业务结果。完整原位置、解释、补丁见 AI_REVIEW.md。

## 边界审查回答草稿

A 缺失维度 1 null、维度 6 重复、维度 2 拓展长文本。需拒绝非字符串而保留旧数据；允许重复文本但防同毫秒 ID 冲突；沿用无长度上限策略完整保留 10000 字符。unknown 表达运行时输入，typeof 收窄后使用。未完整提供的课件维度不编造定义。测试不足与实现缺陷分别说明，最小代码见 AI_REVIEW.md。

## 本人必须审查或补写

- 关闭参考代码，根据契约独立重写五项基础测试，再运行并记录自己的结果；当前参考不能宣称手写。
- 审查 null 策略、重复和超长文本策略、存储整体拒绝与独立键的选择，改写 AI_REVIEW 中的个人回答位置。
- 核对报告身份信息，补入本人真实终端截图；若使用本次真实日志展示图，应如实标注其呈现方式。
- 用自己的话写学习总结，不能将 AI 草稿作为个人经历陈述。
- 复核 PR 后再决定是否合并；本次没有合并 main。

## GitHub 权限核对

连接器创建分支与树返回 403 Resource not accessible by integration，未把失败写成上传成功。沙箱内 gh 登录检测曾报无效；允许网络访问后，实际核对到现有 RyeYen 账户有效且具有 repo 范围，改用 GitHub CLI 执行授权提交。最终推送与 PR 的真实状态以本次交付反馈为准。

已通过正常 git push 推送 feat/week9-typescript-tests，并创建草稿 PR：https://github.com/RyeYen/web-programming-labs/pull/1。未强推，未合并 main。本人独立重写与审查仍保留为本人待完成事项。
