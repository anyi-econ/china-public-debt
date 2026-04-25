---
name: industrial-site-from-gov-site
description: "Find Chinese province / city / county government 惠企政策 / 助企纾困 / 产业政策 / 营商环境 entry pages by drilling down from already-verified government portals (政府门户). USE WHEN: user asks to find regional enterprise/industrial-policy URLs, supplement data/website-industrial.xlsx, populate 地区涉企政策导航, or mentions 惠企政策/助企纾困/产业政策/营商环境/政策兑现 in this project. PREREQUISITE: gov portal URL must already exist in data/website-gov.ts; if it is suspicious, repair via gov-site-finder first."
---

# Industrial Site from Gov Site — 基于政府官网逐站核查地区惠企/产业/营商入口

为每个省/市/区/县在 **政府门户** 上找到一个稳定、能持续更新本级面向企业的政策/服务/产业类专栏 URL，写入 `data/website-industrial.xlsx`。

> **设计风格**：与 `policy-site-from-gov-site`、`news-site-from-gov-site` 对齐。**宁缺勿错**。

---

## Quick Reference

- **Gov portals data**: `data/website-gov.ts`
- **Industrial data**: `data/website-industrial.xlsx`
- **Log file**: `docs/website-industrial-log.md`
- **Sister skills**: `policy-site-from-gov-site/SKILL.md`、`news-site-from-gov-site/SKILL.md`

---

## 与姐妹 skill 的差异

| 维度 | policy | news | **industrial** |
|---|---|---|---|
| 目标 | 政策文件库 | 本级综合新闻 | **面向企业的政策汇编 / 助企服务 / 产业指南 / 营商环境** |
| 入口形式 | 政府门户内部栏目 | 政府门户内部栏目 | **政府门户内部 + 跳转外部"政策兑现 / 政务服务网"** |
| 颗粒度 | 文件级 | 文章级 | **专题汇编级**（多个文件 + 申报指南 + 兑现入口） |
| 唯一性 | 同级 1-2 个 | 同级 1 个 | **同级常 2-3 个并存：惠企政策、产业指南、营商环境** |

> **关键区别**：industrial 类入口 **大量为外部平台跳转**（如各地"政策兑现平台""惠企通""政策计算器"），需要明确记录"是否外部平台"。

---

## 核心流程

```
Step 1: 校验政府官网（同 policy / news skill）
Step 2: 定位"惠企/涉企/产业/营商/服务企业"类专栏 + 外部跳转平台
Step 3: 验证（区分内部栏目页 vs 外部平台首页）
Step 4: 写入 xlsx，含"是否外部平台"列
```

---

## Step 2: 定位候选入口

### 2.1 可接受栏目名

按"涉企覆盖度 / 平台化程度"由高到低：

**Tier A — 综合涉企政策门户（最高优先级）**
- 惠企政策、惠企服务、惠企通、惠企直达
- 政策兑现、政策计算器、政策直达、政策一键兑现
- 涉企政策、为企服务、亲清服务、亲清在线
- 助企纾困、稳企帮扶、援企稳岗

**Tier B — 营商环境 / 优化营商**
- 营商环境、优化营商环境、营商环境专栏
- {地名}营商、{地名}营商建设
- 一网通办企业服务专栏（明确面向企业）

**Tier C — 产业政策 / 行业指南**
- 产业政策、产业发展、重点产业
- 工业经济 / 工业运行（仅当含政策汇编入口时）
- 招商引资、招商引智（含政策维度）

**Tier D — 必须二次判定的边界**
- "政企互动" / "企业之家"（要看是否含政策模块，纯互动留言不收）
- "服务企业"（看是否聚合，太空泛不收）

**禁止采用**：

| 类型 | 不采用原因 |
|---|---|
| 单一办事事项页（如"小微企业开办"指南页）| 颗粒度不够 |
| 行政审批 / 政务服务总入口 | 不是企业专属 |
| 招聘 / 就业 / 人社（除非明确"援企稳岗"专栏）| 不是涉企政策 |
| 部门内部"产业科" / "经济发展科"页面 | 是机构介绍 |
| 单一招商项目页（如"XX 产业园"）| 不是政策汇编 |
| 工商联 / 行业协会主页（除非政府门户跳转的官方平台）| 非官方政府渠道 |

### 2.2 同级择优规则

```
Tier A（综合涉企）> Tier B（营商环境）> Tier C（产业政策）> Tier D
```

**与 policy/news 不同：industrial 允许同一地区记录多条**（最多 3 条），但必须不同 Tier 且互不重复。例如某市同时有：
1. "南京惠企通"（Tier A，外部平台）
2. "营商环境专栏"（Tier B，内部栏目）
3. "产业发展" 专栏（Tier C，内部栏目）

→ 记 3 行。

---

## Step 3: 验证候选页面

### 3.1 真页面标准

**内部栏目**（候选 URL 在政府门户域名下）：
1. 标题 / H1 命中同义集合
2. 有近期内容更新（≤ 6 个月）
3. 内容主体面向企业 / 产业（而非泛公众通知）

**外部平台**（候选 URL 跳出政府门户）：
1. 平台名称含"惠企"/"政策"/"营商"等字样
2. 政府门户上有明确入口指向该平台（保留入口标注）
3. 平台主体单位为本级政府或政府授权运营方
4. **必须同时记录政府门户上的入口 URL** 和 **外部平台 URL**（在"备注"中说明跳转关系）

### 3.2 假阳性排除

- 政务服务网总入口（不是企业专属）
- 12345 热线 / 留言板（非政策）
- 部门"产业经济"内部介绍页
- 单篇产业政策文件（不是汇编）

---

## Step 4: 写入数据

### 4.1 xlsx 字段

`data/website-industrial.xlsx`，sheet 名 `industrial`：

| 列 | 说明 |
|---|---|
| 地区 | `省/市/县` |
| 行政层级 | 省级 / 地级 / 县区 |
| 政府门户名称 | |
| 政府门户首页 URL | |
| 涉企栏目名称 | |
| 涉企栏目 URL | |
| 栏目类型 | Tier A / B / C / D |
| 是否外部平台 | 是 / 否 |
| 平台运营主体 | （外部平台时填，如"市发改委""市营商局"）|
| 是否目标栏目 | 是 / 否 |
| 判断依据 | |
| 链接状态 | 200 / 跳首页 / 4xx / 超时 / WAF |
| 是否需要复核 | |
| 失败原因 / 备注 | |
| 检查时间 | |

### 4.2 写入规则

- 同一地区允许多行（不同 Tier）
- 外部平台必须填"平台运营主体"
- 找不到 → 保留行，"是否目标栏目"=否

---

## 自动化批处理流水线

复用 policy 流水线，只换关键词集合：

```ts
const TIER_A = /惠企|涉企|为企服务|亲清(服务|在线)|政策(兑现|直达|一键|计算器)|助企纾困|稳企帮扶/;
const TIER_B = /营商环境|优化营商/;
const TIER_C = /产业(政策|发展)|招商引资/;

const REJECT_TEXT = /工商联|行业协会|招聘|就业指导|党建|纪检|人才(引进|公寓)|12345/;
const REJECT_PATH = /jb12345|dangjian|jijian|rcyj/i;

// 外部平台域名识别（命中 → "是否外部平台" = 是）
const EXTERNAL_HINT = /huiqi|zcdd|zcjsq|yyhj|qyfw\./i;

const CANONICAL_PATH = /\/(hqzc|hqfw|zcdx|qyfw|yshj|cyzc|zsyz)\//i;
```

脚本：

```powershell
npx tsx scripts/website_management/probe-industrial.ts
npx tsx scripts/website_management/emit-industrial.ts
node scripts/website_management/build-industrial-xlsx.mjs
```

---

## 输出与提交

### 数据更新
1. 更新 `data/website-industrial.xlsx`
2. `npm run lint`、`npm run build`

### Log 记录（`docs/website-industrial-log.md`）

只保留方法、失败聚类、外部平台清单和下一步。逐条结果一律入 xlsx。

### Commit message

`feat(industrial): add N regional 惠企/产业/营商 URLs from gov portals (vN)`

---

## 经验法则

### 命名习惯

- 长三角 / 珠三角 县区已大面积上线"政策兑现平台"（多为外部平台），命名常含 `huiqitong / zcdd / zhengcezhida`
- 中西部市县仍以"营商环境专栏 + 产业政策"为主（内部栏目）
- 县区"惠企"栏目极易缺位，常以"工业经济"或"经济发展局工作动态"勉强代替 —— 此时按 Tier C 收，不要勉强升 Tier A

### 外部平台识别

- 看域名是否独立（非 `gov.cn` 二级域）
- 看页脚版权是否署"X 市人民政府主办" / "X 市发改委承办"
- 跳转链路要可追溯：政府门户首页 → 中间页 → 平台
