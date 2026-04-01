# 中国政府债务追踪平台（China Government Debt Tracker）

面向高校财税研究团队的内部研究网页。当前版本聚焦两件事：

- 权威来源导航
- 月度 / 历史简报归档

系统仅保存元数据和 AI 生成的简报内容，不持久化保存原文。

## 当前能力

- 前端展示政策、数据、新闻、文献四类来源导航
- 支持按月生成简报，并归档到 `data/reports.json`
- 支持指定月份回溯生成，如 `2026-03`
- 通过 `data/crawl-index.json` 维护增量去重索引
- 本地提供轻量 API 服务，便于后续与前端或云部署对接
- 无 LLM Key 时使用规则摘要；有 Key 时可生成更自然的简报段落

## 页面

- `/` 总览
- `/briefs` 月度简报归档
- `/sources` 权威来源导航
- `/policies` 政策元数据
- `/debt` 债务动态
- `/news` 新闻讨论
- `/papers` 文献研究
- `/updates` 更新中心

## 目录

```text
app/
  briefs/page.tsx
  sources/page.tsx
  debt/page.tsx
  news/page.tsx
  papers/page.tsx
  policies/page.tsx
  updates/page.tsx
data/
  bundle.json
  source-catalog.json
  reports.json
  crawl-index.json
lib/
  data.ts
  types.ts
scripts/
  update.mjs
  import-url.mjs
server/
  api.mjs
```

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动前端

```bash
npm run dev
```

访问：

- [http://localhost:3000](http://localhost:3000)

### 3. 启动本地 API

```bash
npm run api
```

默认地址：

- [http://localhost:4010/api/health](http://localhost:4010/api/health)

## 数据更新与简报生成

### 生成上个月简报

```bash
npm run update:monthly
```

### 生成指定月份简报

```bash
npm run update:monthly -- --month=2026-03
```

### 周度更新

```bash
npm run update:weekly
```

更新脚本会：

1. 读取 `data/source-catalog.json`
2. 只处理指定月份内的记录
3. 通过 `data/crawl-index.json` 去重
4. 仅保存元数据，不保存原文
5. 生成 / 更新当月简报到 `data/reports.json`
6. 同步更新 `data/bundle.json` 与前端页面

## 手动导入链接

当来源不适合自动抓取时，可手动导入：

```bash
npm run import:url -- https://example.com/news news
```

```bash
npm run import:url -- https://example.com/policy policy
```

```bash
npm run import:url -- https://example.com/paper paper
```

## 本地 API

当前提供只读接口：

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/sources`
- `GET /api/sources?category=policy`
- `GET /api/briefs`
- `GET /api/briefs/2026-03`
- `GET /api/records?category=policy&month=2026-03`

说明：

- API 直接读取本地 JSON 文件
- 适合本地开发和后续迁移到云服务器
- GitHub Pages 静态站点不承载这些 API；云部署时建议使用 Node 进程运行

## 数据设计

### 元数据

主数据保存在 `data/bundle.json`：

- `policies`
- `debt`
- `news`
- `papers`
- `updates`

### 简报

月度简报保存在 `data/reports.json`：

- `month`
- `title`
- `sourceCounts`
- `sections.policy`
- `sections.data`
- `sections.news`
- `sections.papers`
- `sections.analysis`

### 增量索引

去重索引保存在 `data/crawl-index.json`：

- `key`
- `url`
- `date`
- `month`
- `source`
- `category`
- `lastSeenAt`

## 来源策略

### 自动抓取优先

- 财政部预算司
- 中国政府网

### 手动 / 半自动优先

- 中国人大网预算与债务报告
- 财政部债务管理司月度统计
- 中国地方政府债券信息公开平台
- 新华社、人民日报、央视新闻

### 仅导航，不自动抓取

- 财新网
- 第一财经
- 中国知网

## 关于中国知网

按你的要求，文献来源保留中国知网，但当前版本采取合规降级：

- 作为导航源展示
- 不做自动抓取
- 不绕过访问限制
- 支持研究团队人工检索后，再用 `import:url` 导入元数据

## LLM 摘要

如果配置了环境变量：

- `LLM_API_KEY`
- `LLM_BASE_URL`
- `LLM_MODEL`

更新脚本会尝试增强月度简报内容。

未配置时，系统使用规则摘要和模板化月报生成逻辑。

## 已生成的示例

当前仓库已内置：

- `2026-03` 月度简报

对应内容可在：

- `/briefs`

查看。

## 构建与部署

### 本地生产环境

```bash
npm run build
npm run start
```

### GitHub Pages

当前仓库仍支持静态导出：

```bash
npm run build
```

GitHub Pages 可展示前端页面和静态 JSON 内容，但不承载本地 API。

### 后续云部署建议

建议拆成两部分：

- Next.js 前端
- Node API / 定时任务进程

推荐流程：

1. 云服务器运行 `npm run api`
2. 定时执行 `npm run update:monthly -- --month=YYYY-MM`
3. 前端读取同一份 JSON 或通过 API 拉取

## 后续迭代建议

- 增加真实自动抓取源的覆盖面
- 引入更稳健的详情页正文临时抽取
- 增加“最新简报卡片”到首页首屏
- 增加简报单月详情页
- 把本地 JSON 升级为 SQLite
- 为人工导入增加审核状态
- 将新闻源按“自动 / 手动 / 导航-only”分层展示

## 说明

这版优先满足：

1. 可以生成指定月份简报
2. 只保存元数据与简报
3. 有增量索引
4. 有本地 API
5. 前端已能查看来源导航和历史简报
