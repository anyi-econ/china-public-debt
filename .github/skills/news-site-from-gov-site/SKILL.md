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

**实际产物（已落盘）**：
- 探针：[`scripts/website_management/probe-column.ts`](../../../scripts/website_management/probe-column.ts) （news / industrial 共用，第一参数选类目）
- 输入展开：[`scripts/website_management/flatten-gov.ts`](../../../scripts/website_management/flatten-gov.ts) → `gov-flat.json` (3209 portals, key/url/level)
- xlsx 输出：[`scripts/website_management/build-column-xlsx.mjs`](../../../scripts/website_management/build-column-xlsx.mjs) （news / industrial 共用）

该流水线是 `policy-site-from-gov-site` §"自动化批处理流水线"的下一代抽象：把关键词集合 / 拒绝表 / canonical path / 构造路径全部参数化在一个 `Config` 对象里，新增一类只需追加一个 `CFG`。

### 核心配置（与代码完全一致，新增类目时照抄结构）

```ts
// scripts/website_management/probe-column.ts 内的 NEWS Config
const TIER_A = /本地要闻|本市要闻|本县要闻|本区要闻|要闻速递|今日要闻|政务要闻|时政要闻|头版头条/;
const TIER_B = /政务动态|工作动态|政府要闻|综合要闻|综合新闻|政务新闻|政府新闻/;
const TIER_C = /新闻中心|新闻动态|要闻|新闻/;

const REJECT_TEXT = /部门动态|部门信息|单位动态|上级要闻|中央要闻|国务院要闻|省委要闻|省政府要闻|通知公告|公示公告|政府公告|媒体看|媒体聚焦|视频新闻|图说|影像|专题|乡镇要闻|镇街动态|街道动态|图片新闻|宣传片|访谈|直播/;
const REJECT_PATH = /tzgg|gsgg|tongzhi|gonggao|videos?|tupian|zhuanti|spxw|fangtan|zhibo|zhxx|bmdt|bmxx|jcdt|xzjd|xjyw|szyw_/i;

// 文章页 URL（必须置 -50；下方'已知漏判'里有改进规则）
const ARTICLE_PATH = /\/\d{4}[\-_/]\d{2}([\-_/]\d{2})?\/|\/art\/\d{4}\/|\/[a-f0-9]{20,}\.s?html?$|\/[ct]_\d+\.s?html?$/i;

// 路径加分（命中则 +10）
const CANONICAL_PATH = /\/(yw|bdyw|jryw|szyw|swyw|sxyw|qyyw|xqyw|zwdt|gzdt|zfdt|zfyw|zwyw|news[a-z]*|xwzx[\/\?])/i;

// 内容验证：抓取候选 URL 后 body 必须命中下面之一，且不命中 CONTENT_REJECT
const CONTENT_REQUIRE = /要闻|动态|新闻|今日|政务/;
const CONTENT_REJECT  = /页面不存在|404|not found|访问出错|无法访问|维护中/;

// 锚点提取不到时的 12 条兜底构造路径（按 Tier 分级，A 70 分 / B 60 / C 50）
CONSTRUCT_PATHS = [
  { path: '/yw/', tier: 'A' }, { path: '/bdyw/', tier: 'A' }, { path: '/jryw/', tier: 'A' },
  { path: '/zwyw/', tier: 'A' }, { path: '/zwdt/', tier: 'B' }, { path: '/gzdt/', tier: 'B' },
  { path: '/zfdt/', tier: 'B' }, { path: '/news/', tier: 'C' }, { path: '/xwzx/', tier: 'C' },
  { path: '/xwzx/bdyw/', tier: 'A' }, { path: '/xwzx/szyw/', tier: 'A' }, { path: '/xwzx/zwyw/', tier: 'A' },
];
```

### 命令

```powershell
# 1. 展开 gov 数据
npx tsx scripts/website_management/flatten-gov.ts

# 2. 探针（断点续跑：保留 *-probe-results.json；重试缓存中失败：$env:COL_RETRY="1"）
$env:COL_CONC="14"
npx tsx scripts/website_management/probe-column.ts news

# 3. xlsx
node scripts/website_management/build-column-xlsx.mjs news
```

### 缓存与重跑
- 中间结果：`scripts/website_management/news-probe-results.json`
- `homepage-unreachable` / `error:*` 视为临时失败，下轮 `COL_RETRY=1` 时自动重试
- `no-route-found` 视为已结论，不会自动重试；如关键词更新，应**手动删除该行**或换文件名
- 协议切换：参考 policy skill v9.5 流程，先 `apply-protocol-switch.mjs`，再删对应 host 缓存

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

## v1 实测沉淀（3209 portal 一次性扫描）

> 全量结果文件：[`data/website-news.xlsx`](../../../data/website-news.xlsx)；进度日志：[`docs/website-news-log.md`](../../../docs/website-news-log.md)。

### 总体覆盖：1765 / 3209 = **55%**（A 852 / B 391 / C 522）

按层级：省级 15/31 (48%)、地级 243/439 (55%)、县区 1507/2739 (55%)

### Top 命中文本（label 频次，前 10）

| 频次 | 标签 | Tier |
|---|---|---|
| 481 | 政务要闻 | A |
| 255 | 政务动态 | B |
| 195 | 要闻 | C |
| 150 | 新闻中心 | C |
| 88 | 工作动态 | B |
| 87 | 要闻动态 | B |
| 75 | 时政要闻 | A |
| 53 | 本地要闻 | A |
| 28 | 今日要闻 | A |
| 21 | 新闻中心-政务要闻 | A（构造路径 `/xwzx/zwyw/`）|

→ **"政务要闻" 是中国地方门户事实上最常见的本地新闻栏目命名**（远多于教科书式的"本地要闻"53 次）。新增类似关键词集合时，应优先靠*实测高频命名*而不是字面教科书命名。

### Top 命中 path 段（前 10）

| 频次 | path 头 |
|---|---|
| 160 | `/yw/` |
| 81 | `/xwzx/zwyw/` |
| 68 | `/xwzx/` |
| 51 | `/zwdt/` |
| 46 | `/zwyw/` |
| 25 | `/ywdt/` |
| 17 | `/News/showList/` |
| 16 | `/xwzx/bdyw/` |
| 12 | `/zwgk/gzdt/` `/zwgk/xwzx/` `/zwgk/zwdt/` |

### 候选来源构成

- 锚点抽取：1542 条（87%）
- 构造路径兜底：223 条（13%）

→ 构造路径仍贡献 1/8 命中量，**移除会损失约 220 个县区**。

### 失败聚类（1444 条）

| 失败原因 | 数量 |
|---|---|
| `no-route-found`（首页可达，未识别栏目） | 1264 |
| `homepage-unreachable`（首页不可达 / WAF / 超时） | 180 |

**Top 失败省份**（unreach + noroute）：

| 省份 | 总失败 | unreach | noroute |
|---|---|---|---|
| 河北省 | 144 | 16 | 128 |
| 四川省 | 127 | 31 | 96 |
| 云南省 | 88 | 19 | 69 |
| 河南省 | 84 | 8 | 76 |
| 湖南省 | 77 | 21 | 56 |
| 山东省 | 66 | 8 | 58 |
| 黑龙江省 | 63 | 2 | 61 |
| 湖北省 | 61 | 6 | 55 |
| 广东省 | 60 | 5 | 55 |
| 江苏省 | 53 | 0 | 53 |

→ **江苏省 53 个县区全部 noroute（首页可达）**：典型 SPA 首页，需要 Playwright 渲染或精确二级目录命名研究。
→ **安徽合肥系（hefei/baohe/chaohu/feidong/funan）整片首页 521**：WAF 整片拦截，需协议切换 + UA 轮换。

---

## 已知漏判模式 → 拒绝表演进

### v1 中观测到的 10 条单篇文章被误判为栏目（占 0.6%）

现有 `ARTICLE_PATH` 漏掉了 `t<YYYYMMDD>_<id>.html` 和 `content/post_<id>.html` 两种新闻 CMS 风格：

```
http://www.huidong.gov.cn/hdxwz/zwgk/zwdt/zwyw/content/post_5739716.html
http://www.huaxi.gov.cn/xwzx/hxyw/202604/t20260425_90044173.html
http://www.furong.gov.cn/affairs/fdzdgknr/qtfdxx/zwdt/news/202604/t20260417_12363140.html
http://www.ningchengxian.gov.cn/zwgk/zwdt/spnc/ncxw/202604/t20260422_2757911.html
```

**vNext 修复**：在 `ARTICLE_PATH` 加 `/\d{6}\/t\d{8}_\d+\.s?html?$/` 与 `/content\/post_\d+\.s?html?$/`。

### Tier C 普遍偏宽

- `"新闻中心" 150 次` 中，约 60% 实际是聚合页（含部门动态 / 通知 / 视频）。**Tier C 命中默认 needReview=是**，必须人工抽查或继续下钻 `/xwzx/{bdyw|szyw|zwyw}/`。
- `"要闻" 195 次` 在县区可能是上级要闻转载页，也需要复核。

### 县区 noroute 兜底（vNext 思路）

1. 抽前 50 个 noroute 县区门户，人工观察其 "新闻" 入口实际路径
2. 把高频新增 path（如 `/xwdt/zwyw/`、`/cms/html/{xxx}/`）回写 `CONSTRUCT_PATHS`
3. 对 SPA 首页（江苏全省 53/53）启用 Playwright 渲染探针（参考 policy v8 的 `probe-policy-pw.ts`）

---

## CMS 路径模式库（按片区收集）

按 v1 实测命中归纳，新建子探针时可作为先验：

| 片区 / CMS | 典型 path | 实测命中典型代表 |
|---|---|---|
| 通用一级 | `/yw/` | 北京/门头沟、河北/省级 |
| 国办 "政务公开聚合" | `/zwgk/zwdt/` `/zwgk/xwzx/` `/zwgk/gzdt/` | 多数县区 |
| 政府门户新闻聚合 | `/xwzx/zwyw/` `/xwzx/bdyw/` `/xwzx/szyw/` | 北京/上海/广州/深圳 |
| 政务动态独立 | `/zwdt/` | 天津/海淀、河北系 |
| 省级 "X 要闻" 字头 | `/szyw/` `/swyw/` | 山西/山东省级 |
| 老 .NET CMS | `/News/showList/` `/News/show/` | 西部部分县区 |
| 通用 CMS html 静态 | `/cms/html/{deptId}/` | 江苏部分县区 |
| 江浙系县区 | `/news/jr{县拼音}/` `/jryn/ynyw/` | 宁夏银川/永宁、江浙县区 |

---

## Subagent 并行模板（人工兜底失败用）

当 `no-route-found` 但 batch 探针不能解决时，按 5-7 区域/路、5 路并行投放给 subagent。提示词必须内联：

```
你是新闻栏目定位 subagent。每个目标按下列 4 步：
1. fetch_webpage 政府门户首页，确认可达；不可达 → 标记 unreachable。
2. 在首页/二级页搜索关键词 [本地要闻|{地名}要闻|政务要闻|时政要闻|工作动态|政府要闻]。
3. 进入候选页面 fetch_webpage，必须满足：
   - 标题 / H1 命中关键词且地名匹配（不是上级地名）
   - 列表至少含近 3 个月内文章
   - 不是聚合页（不含'部门动态/通知公告/视频新闻'子分类入口）
4. 严格 reject：单篇文章 URL（含 t<YYYYMMDD>_<id>、post_<id>、content/article 等）、'新闻中心'根入口、'通知公告'、'媒体看 X'、'部门动态'。
输出 JSON：{ region, govUrl, govStatus, newsUrl, newsTier, newsStatus, candidates, notes }。
常见反例（务必先 fetch 验证）：
- 江苏全省县区门户 SPA → 必须用渲染抓取
- 安徽合肥系（hefei/baohe/chaohu/feidong）→ 521 WAF，先尝试 https↔http 切换
- 'X 区新闻中心' / '/xwzx/' 直接根入口几乎都是聚合页，须再下钻一级
```

---

## 经验法则（持续更新）

### 同义栏目命名习惯

- **"政务要闻" 才是高频实测冠军**（481 次），不是教科书的"本地要闻"
- 省级和省会多用 `{省/市}要闻`（`山西要闻 8 次`），路径多是 `/yw/`、`/szyw/`、`/swyw/`
- 县区一级常退化为 `政务动态` / `工作动态`，路径 `/zwdt/`、`/gzdt/`
- 江浙系县区有"今日 X 闻"传统，路径常 `/news/jr{县拼音}/`
- 老式 .NET CMS 站点：`/News/showList/?CategoryNum=xxx`，路径上无明显语义

### 假阳性高发陷阱

- 县区门户首页"新闻中心"几乎都是聚合页 → 必须下钻 `/xwzx/{bdyw|szyw|zwyw}/`
- `/xwzx/` 是聚合根的可能性 > 80%，慎选
- 单篇文章被误识为栏目：常见 URL 模式 `t<YYYYMMDD>_<id>.html`、`post_<id>.html`、`content/article/<id>` —— 必须在 `ARTICLE_PATH` 中拦截
- "上级要闻"在县区门户首页极常见（转载省/市领导讲话），文本 `中央要闻 / 国务院要闻 / 省委要闻 / 省政府要闻` 必须置 -50
- 老 CMS 把"通知公告"和"X 要闻"放同一个 `/news/` 路径，必须看子分类

### WAF / SPA 重灾区

- **整片 WAF 521**：安徽合肥+下辖（hefei/baohe/chaohu/feidong/funan）
- **SPA 首页**：江苏全省县区（53/53 noroute）
- **首页可达但栏目下钻失败重灾**：河北、四川、云南、河南、湖南（前 5 共占 noroute 总数的 33%）
