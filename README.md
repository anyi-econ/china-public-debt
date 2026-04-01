# 中国政府债务追踪平台（China Government Debt Tracker）

面向高校财税研究团队的内部研究型网页 MVP，用于持续汇总中国政府债务的政策制度、债券发行与存量动态、媒体讨论，以及学术文献与研究报告。

## 项目特性

- 中文界面，偏学术、清爽、可读性优先
- `Next.js + TypeScript + Tailwind CSS` 快速搭建，结构清晰
- 本地 `JSON` 数据驱动，首版无须复杂数据库即可运行
- 预置样例数据，首次启动不会出现空页面
- 提供周更 / 月更脚本，支持半自动更新与手动导入链接
- 抓取失败自动回退到兜底样例，不因单个来源异常导致整个项目崩溃

## 页面结构

- `/` 首页 Dashboard
- `/updates` 更新中心
- `/policies` 政策与制度
- `/debt` 债务动态
- `/news` 新闻与讨论
- `/papers` 文献与研究

## 技术栈

- `Next.js` App Router
- `TypeScript`
- `Tailwind CSS`
- `Node.js` 更新脚本
- `Cheerio` 用于首版静态页面解析

## 项目目录

```text
app/
  debt/page.tsx
  news/page.tsx
  papers/page.tsx
  policies/page.tsx
  updates/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  charts/
  filters/
  layout/
  lists/
  pages/
  ui/
data/
  bundle.json
  source-catalog.json
lib/
  data.ts
  types.ts
  utils.ts
scripts/
  import-url.mjs
  update.mjs
.env.example
package.json
README.md
tailwind.config.ts
tsconfig.json
```

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认访问：

- [http://localhost:3000](http://localhost:3000)

### 3. 生产构建

```bash
npm run build
npm run start
```

## 数据更新

### 周更

```bash
npm run update:weekly
```

### 月更

```bash
npm run update:monthly
```

更新脚本会：

1. 尝试抓取配置中的公开来源
2. 解析标题、日期、来源、链接
3. 生成规则摘要
4. 按 URL + 标题做去重
5. 写回 `data/bundle.json`
6. 更新 `/updates` 页面所需日志与来源状态

### 手动导入链接

当某些来源不适合直接抓取，或遇到复杂 JS / 反爬页面时，可采用手动导入：

```bash
npm run import:url -- https://example.com/news policy
```

或：

```bash
npm run import:url -- https://example.com/news news
```

或导入文献 / 报告链接：

```bash
npm run import:url -- https://example.com/paper paper
```

脚本会自动抽取：

- 页面标题
- `meta description`
- 前几段正文文本

并写入本地数据文件。

## 当前首版数据方案

### 官方源

首版已为以下方向预留抓取配置：

- 财政部预算司政策规章页
- 中国政府网最新政策页
- 中国地方政府债券信息公开平台（政策法规、发行结果、数据统计）
- 来源注册表集中维护于 `data/source-catalog.json`

### 新闻与评论源

首版采用“少量样例 + 半自动导入”的务实方案，页面已经支持：

- 按时间浏览
- 按来源筛选
- 关键词搜索
- 通过更新中心查看来源状态与可信度分层

### 文献源

首版预留开放检索接口：

- OpenAlex
- Crossref
- SSRN
- RePEc

目前默认内置样例文献，确保页面可直接展示。

## 数据模型

主要模型定义在 `lib/types.ts`：

- `PolicyItem`
- `DebtDataItem`
- `NewsItem`
- `PaperItem`
- `UpdateLogItem`
- `SourceCatalogItem`

统一字段设计便于后续：

- 增加数据源
- 接入数据库
- 接入全文抽取
- 接入 LLM 摘要与标签分类

## 摘要与标签逻辑

首版更新脚本包含兜底摘要逻辑：

- 没有模型时：使用规则摘要 / 标题摘要
- 后续可按环境变量扩展模型调用

推荐后续扩展方式：

1. 在 `scripts/update.mjs` 中增加 `summarizeWithLLM()` 方法
2. 检查 `LLM_API_KEY`
3. 有 Key 时调用模型生成：
   - 1-3 句摘要
   - 分类标签
   - 风险级别或主题标签
4. 无 Key 时继续使用当前兜底逻辑

## 部署建议

### 方案一：Vercel

适合只做前端展示与轻量静态更新：

1. 推送到 Git 仓库
2. 在 Vercel 导入项目
3. 执行 `npm install && npm run build`
4. 若需要定期更新，可在外部定时任务中运行更新脚本后再部署

### 方案三：GitHub Pages

本仓库已包含 `GitHub Pages` 自动部署工作流：

1. 将仓库推送到 GitHub
2. 在仓库 `Settings -> Pages` 中将 `Source` 设置为 `GitHub Actions`
3. 每次 push 到 `main` 分支后，会自动生成静态站点并发布

如果仓库地址为：

- `https://github.com/1486964828-beep/china-government-debt-tracker`

则发布后的网页地址通常为：

- `https://1486964828-beep.github.io/china-government-debt-tracker/`

### 方案二：本地 / 服务器部署

```bash
npm install
npm run build
npm run start
```

建议配合：

- Windows 任务计划程序
- `cron`
- GitHub Actions

定期运行：

```bash
npm run update:weekly
```

或：

```bash
npm run update:monthly
```

## 真实抓取的注意事项

- 仅面向公开网页、公开列表页进行抓取
- 不绕过登录、验证码或访问限制
- 对复杂 JS 页面优先采用“手动导入链接 + 自动抽取元数据”替代
- 建议对每个来源单独做配置与错误兜底，不要让单个来源影响整体更新

## 后续迭代建议

### 1. 增加更多数据源

- 扩展财政部更多栏目
- 接入各省财政厅 / 发改委专项债项目公开页面
- 增加权威媒体与研究机构的稳定来源

### 2. 引入真正的 LLM 摘要与标签分类

- 自动生成研究摘要
- 自动打标签，如“专项债”“隐性债务”“中央加杠杆”“风险化解”
- 自动输出“本周观察”或“本月观察”

### 3. 增加专题页

- 隐性债务
- 专项债
- 中央加杠杆
- 再融资债与置换

### 4. 增加时间序列图表与导出功能

- 月度发行规模趋势图
- 一般债 / 专项债结构图
- 债务余额趋势图
- CSV / Excel 导出

### 5. 引入轻量数据库

- 将 `data/bundle.json` 升级为 `SQLite`
- 支持更稳定的去重、索引和查询

### 6. 增加人工校对工作流

- 新抓取条目进入“待复核”
- 人工确认摘要、标签、分类后发布

## 说明

首版强调“先跑起来、结构清晰、便于扩展”。如果某个真实来源当前抓取不稳定，项目仍会通过样例数据和兜底逻辑保证网页可用。
