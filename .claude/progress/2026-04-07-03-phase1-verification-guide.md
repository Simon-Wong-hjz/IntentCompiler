# Phase 1 Manual Verification Guide

**Date**: 2026-04-07
**How to run**: `npm run dev` then open the localhost URL in browser

## Phase 1 功能验证清单

### 1. 页面布局
- [ ] 固定顶部栏，显示 "Intent Compiler" logo（Plus Jakarta Sans 字体，粗体）
- [ ] 右侧有 History / Settings 按钮（灰色禁用状态）和 EN/中 语言切换（纯展示）
- [ ] 下方是 6 张任务类型卡片：Ask, Create, Transform, Analyze, Ideate, Execute
- [ ] 再下方是 50/50 左右分栏（编辑器 | 预览），中间有细灰色分割线
- [ ] 最小宽度 1024px（缩小窗口时出现水平滚动条）

### 2. 任务类型选择
- [ ] 点击任意卡片 → 深色背景 + 金色文字（选中态）
- [ ] 其他卡片保持白色背景 + 浅金边框
- [ ] 悬停时有浅黄色背景过渡
- [ ] 宽屏 6 列一行，窄屏 (< 1280px) 3 列两行

### 3. Ask 任务类型编辑器（点击 "Ask"）
- [ ] Intent 字段：金色 2px 边框 + 微妙的金色阴影光晕，48px 最小高度
- [ ] 下方 6 个字段按顺序：Context, Requirements, Constraints, Output Format, Question Type, Audience
- [ ] textarea 输入随内容自动扩展高度
- [ ] 标签全部大写、灰色、小号字体、字间距加宽
- [ ] 输入框聚焦时边框变为金色

### 4. 实时 Markdown 预览
- [ ] 在任何字段输入内容 → 右侧预览区即时更新
- [ ] 预览用等宽字体（SF Mono / Cascadia Code / Consolas）
- [ ] 每个字段渲染为 `# 字段名` + 内容
- [ ] 多个字段之间用空行分隔
- [ ] 空字段不出现在预览中
- [ ] 字段顺序与定义顺序一致（Intent 永远第一）

### 5. 复制功能
- [ ] 有内容时 "Copy to Clipboard" 按钮为金色可点击
- [ ] 点击后显示 "✓ Copied!" 约 1.5 秒后恢复
- [ ] 无内容时按钮为半透明禁用状态
- [ ] 复制失败显示红色 "✗ Copy failed"

### 6. 空状态 & 任务切换
- [ ] 未选任务 → 编辑器显示 "Select a task type above to begin"
- [ ] 点击 Create/Transform/Analyze/Ideate/Execute → 编辑器显示 🚧 "Coming soon"
- [ ] 切换任务类型时，之前填写的字段值被清空
- [ ] 预览区无内容时显示 "Select a task type and fill in fields to see the preview"

### 7. 视觉风格
- [ ] 奶油色页面背景（#fffdf5）
- [ ] Plus Jakarta Sans 字体（几何圆润的无衬线体，与系统默认字体明显不同）
- [ ] 整体 "Sunflower + Ink" 品牌感：金黄 + 奶白 + 深黑
- [ ] 左右面板可独立滚动（当内容超出时）

## 不属于 Phase 1 的功能（请忽略）

| 功能 | 所属 Phase |
|------|-----------|
| 其他 5 种任务类型的字段编辑 | Phase 2 |
| Select 下拉框、Combo 组合框、List 列表编辑器 | Phase 2 |
| 可折叠的 "可选字段" 面板 | Phase 2 |
| JSON / YAML / XML 输出格式切换 | Phase 3 |
| 中英文双语 UI 切换（实际生效） | Phase 3 |
| Settings 面板（API Key 等） | Phase 4 |
| History 历史记录 | Phase 4 |
| AI 自动填充字段 | Phase 5 |
| 帮助系统、键盘快捷键、自定义 favicon | Phase 6 |
