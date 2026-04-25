---
name: news-site-from-gov-site
description: "Find Chinese province / city / county government 本地要闻 / 政务动态 / 政府要闻 entry pages by drilling down from already-verified government portals (政府门户). USE WHEN: user asks to find regional local-news index URLs, supplement data/website-news.ts or data/website-news.xlsx, populate 地区新闻导航, or mentions 本地要闻/政务动态/政府要闻/今日要闻 in this project. PREREQUISITE: gov portal URL must already exist in data/website-gov.ts; if it is suspicious, repair via gov-site-finder first."
---

# News Site from Gov Site — 基于政府官网逐站核查地区本地要闻入口

为每个省/市/区/县在 **政府门户** 上找到一个稳定、能持续更新本级综合性新闻的栏目页 URL，写入 `data/website-news.xlsx`（或同结构 `.ts`）。

> **设计风格**：与 `policy-site-from-gov-site`、`fiscal-site-from-gov-site` 对齐。**宁缺勿错**，不写非本地、非综合的新闻栏目。

## Quick Reference

- **Gov portals data**: `data/website-gov.ts`
- **News data**: `data/website-news.xlsx`
- **Log file**: `docs/website-news-log.md`
- **Sister skills**: `policy-site-from-gov-site/SKILL.md`、`industrial-site-from-gov-site/SKILL.md`
- **Gov portal repair**: `gov-site-finder/SKILL.md`

---

## 与 policy-site-from-gov-site 的差异

| 维度 | policy | news |
|---|---|---|
| 目标栏目 | 政策文件 / 规范性文件 / 政策库 | 本地要闻 / 政务动态 / 政府要闻 / 今日 X 闻 |
| 名称稳定 | 高度不稳定（要 Tier A/B/C 同义集合） | 中等稳定（"本地要闻" / "X 政要闻" / "政务动态" 占大头） |
| 假阳性高发 | 单篇文章 / 公开指南 / 跳首页 | **上级要闻 / 部门动态 / 通知公告 / 媒体看 X / 视频版** —— 这些都不是本级综合新闻 |
| 唯一性 | 同级常并列 2-3 个，需择优 | 同级常并列 4-5 个新闻栏目（要闻 / 部门 / 通知 / 视频 / 媒体），**只取一个综合本地要闻** |

---

## 核心流程

```
Step 1: 校验政府官网（同 fiscal / policy skill）→ 可疑 → gov-site-finder 修复
Step 2: 从首页定位"新闻 / 要闻 / 政务动态"类栏目候选
Step 3: 按"本地综合 > 部门动态 > 上级要闻"优先级择优 + 验证
Step 4: 写入 website-news.xlsx 并记录 log
```

---

## Step 1: 校验政府官网

完全沿用 `fiscal-site-from-gov-site/SKILL.md` 的 Step 1 标准。可疑必须先调 `gov-site-finder` 修复 `data/website-gov.ts`。

---

## Step 2: 定位候选栏目

### 2.1 可接受栏目名（同义集合）

按 **"本级综合性"** 程度由高到低分组：

**Tier A — 本级综合本地要闻（最高优先级）**
- 本地要闻、本市要闻、本县要闻、本区要闻
- {地名}要闻（"北京要闻""上海要闻""杭州要闻""临沂要闻"……）
- 今日 X 闻、今日 X 事
- 政务要闻（明确标注本级时）
- 头条新闻 / 头条要闻（明确标注本级时）

**Tier B — 政务动态 / 政府要闻**
- 政务动态、政务要闻、政府要闻
- 工作动态、政务工作动态
- {地名}动态（"全市动态""全县动态"）
- 综合新闻、综合要闻

**Tier C — 必须人工判定的边界栏目**（仅当 Tier A/B 都缺失时使用）
- "新闻中心" / "新闻动态" 入口（其下若有"本地要闻"子栏目则采用子栏目，不要采用根入口）
- "X 政府新闻" / "X 政府动态"

**禁止采用（即便首页醒目）**：

| 栏目名 | 不采用原因 |
|---|---|
| 部门动态 / 部门信息 / 单位工作动态 | 是部门稿件而非综合新闻 |
| 上级要闻 / 中央要闻 / 国务院要闻 / 省委要闻（在市/县门户上）| 不是本级 |
| 通知公告 / 公示公告 / 政府公告 | 通知不是新闻 |
| 媒体看 X / 媒体聚焦 X / 媒体关注 | 二次转载，非首发 |
| 视频新闻 / 图说 X / 影像 X | 单一介质，覆盖窄 |
| 专题专栏 / 主题宣传 | 短期专题，不是常态栏目 |
| 镇街动态 / 街道动态 / 乡镇要闻（在区县门户）| 是下级动态，不是本级综合 |
| 单篇新闻 / 文章页 | 不是栏目 |

### 2.2 同级并列时的择优规则

```
Tier A（本级综合本地要闻）> Tier B（政务动态 / 政府要闻）> Tier C（"新闻中心" 子栏目）
```

例：某市同时有"本市要闻""政务动态""部门动态""通知公告""媒体看市" → 取"本市要闻"。

例：某县只有"政务动态""通知公告""部门工作" → 取"政务动态"（Tier B），不取"部门工作"（拒绝）。

例：某区有"新闻中心" → 进入二级页找"X 区要闻"子栏目，**不**写"新闻中心"根入口。

### 2.3 操作步骤

1. **打开官网首页**：`fetch_webpage` 拿渲染后 HTML
2. **首页一级栏目扫描**：搜索关键词 `要闻|动态|新闻|今日|政务|头条`
3. **如首页只有"新闻中心"聚合**：进二级页找"X 要闻 / 本地要闻"子栏目
4. **同省/同市经验复用**：同一站群下属区县通常 path 一致（如 `/yw/`、`/xwzx/swyw/`、`/dtxx/bdyw/`）
5. **记录所有候选**：每个 Tier 至少留 1 个，便于在 Step 3 失败时回退

---

## Step 3: 验证候选页面

### 3.1 真页面标准

候选 URL 必须满足全部：

1. **标题/H1 命中同义集合且明确为本级**（"X 区要闻""X 市要闻""政务动态"）
2. **有近期文章列表**：列表能看到近 1-3 个月的政府新闻条目
3. **新闻主体是本级**：随机抽查 2-3 篇，发文主体应为本级党委 / 政府 / 主要领导
4. **不是聚合根**：不是 `/news/`、`/xwzx/`、`/dtxx/` 这类一级聚合（这些下面通常含部门动态、上级要闻）

### 3.2 假阳性排除

| 类型 | 为什么不行 |
|---|---|
| 上级要闻栏目 | 不是本级 |
| 部门动态栏目 | 是部门，非政府综合 |
| 媒体看 X | 转载稿，非首发 |
| 通知公告 | 是通知不是新闻 |
| 单篇文章 | 不是栏目 |
| `/xwzx/` 等聚合根 | 范围太宽 |
| 视频 / 图说 | 介质单一 |
| 跳首页 | 同 policy / fiscal 跳首页规则 |

### 3.3 跳首页检测

候选页面 title 与首页 title 高度相似 / 候选 URL 实际跳到首页 → 视为未找到。

---

## Step 4: 写入数据

### 4.1 xlsx 字段（数据主存）

`data/website-news.xlsx`，sheet 名 `news`，字段：

| 列 | 说明 |
|---|---|
| 地区 | `省/市/县` 形式 key |
| 行政层级 | 省级 / 地级 / 县区 |
| 政府门户网站名称 | 标题中地名 + "人民政府"等 |
| 政府门户首页 URL | 来自 `website-gov.ts` |
| 新闻栏目名称 | 命中的栏目原文 |
| 新闻栏目 URL | 通过验证的 URL |
| 栏目类型 | Tier A / Tier B / Tier C |
| 是否目标栏目 | 是 / 否（否者必须填"失败原因"列）|
| 判断依据 | 一句话：标题命中 X，列表近 N 条本级新闻 |
| 链接状态 | 200 / 跳首页 / 4xx / 超时 / WAF |
| 是否需要复核 | 是 / 否 |
| 失败原因 / 备注 | 文字说明 |
| 检查时间 | YYYY-MM-DD |

### 4.2 写入规则

1. 只写入通过 Step 3 的 URL；其余写 `否` + 失败原因，便于下一轮处理
2. 完整含协议、保留参数
3. 同一 key 不重复
4. 找不到 → 行仍保留，"是否目标栏目"=否，"失败原因"=`未找到本级综合新闻栏目` / `WAF 拦截` / `仅有部门动态` / 等

---

## 慢站防误判规则

完全沿用 fiscal / policy skill 的规则。

---

## 自动化批处理流水线

复用 `policy-site-from-gov-site` §"自动化批处理流水线"的整套架构，只换关键词集合：

```ts
const TIER_A = /本地要闻|本市要闻|本县要闻|本区要闻|要闻速递|今日[\u4e00-\u9fa5]{1,4}|政务要闻/;
const TIER_B = /政务动态|工作动态|政府要闻|综合新闻|综合要闻/;
const TIER_C = /新闻中心|新闻动态/;  // 必须二次进子栏目验证

const REJECT_TEXT = /部门动态|部门信息|上级要闻|中央要闻|国务院要闻|省委要闻|省政府要闻|通知公告|公示公告|媒体看|媒体聚焦|视频新闻|图说|影像|专题|乡镇要闻|镇街动态|街道动态/;
const REJECT_PATH = /tzgg|gsgg|tongzhi|gonggao|videos?|tupian|zhuanti|spxw/i;
const ARTICLE_PATH = /\/\d{4}\/\d{2}\/|\/art\/\d{4}\/|\/[a-f0-9]{20,}\.s?html?$/i;

const CANONICAL_PATH = /\/(yw|bdyw|jryw|zwdt|gzdt|xwzx[\/\?]|news[\/\?])/i;
```

脚本套路（与 policy 完全同构）：

```powershell
# 1. 探针
npx tsx scripts/website_management/probe-news.ts
# 2. emit 过滤
npx tsx scripts/website_management/emit-news.ts
# 3. 写 xlsx
node scripts/website_management/build-news-xlsx.mjs
```

---

## 输出与提交

### 数据更新
1. 更新 `data/website-news.xlsx`
2. （可选）维护 `data/website-news.ts` 用于前端导航
3. `npm run lint`、`npm run build`

### Log 记录（`docs/website-news-log.md`）

只保留：方法演进、失败聚类、复核结论、下一步动作。**不要把每条结果重复写一遍** —— 那是 xlsx 的职责。

### Commit message

`feat(news): add N regional local-news URLs from gov portals (vN)`

---

## 经验法则（持续更新）

> 该节由每轮处理后总结的具体经验补充。

### 同义栏目命名习惯

- 省级和省会几乎都用 `{省/市}要闻`，路径多是 `/yw/`、`/szyw/`、`/[省拼音]yw/`
- 县区一级常退化为 `政务动态` / `工作动态`，路径 `/zwdt/`、`/gzdt/`
- 江浙系县区有"今日 X 闻"传统，路径常 `/news/jr{县拼音}/`

### 假阳性高发陷阱

- 县区门户首页"新闻中心"几乎都是聚合页 → 必须下钻
- 老 CMS 把"通知公告"和"X 要闻"放同一个 `/news/` 路径，必须看子分类
- `/xwzx/` 是聚合根的可能性 > 80%，慎选
