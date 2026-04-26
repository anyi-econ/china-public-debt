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

---

## v1 实测沉淀（2026-04 一次性 3209 portal 全扫描）

### 总体覆盖

| 维度 | 命中数 | 比例 |
|---|---|---|
| **总计 picked** | 1059 / 3209 | **33%** |
| Tier A（惠企 / 涉企 / 政策兑现）| 593 | 56% of picked |
| Tier B（营商环境）| 394 | 37% of picked |
| Tier C（产业 / 招商）| 72 | 7% of picked |
| 省级 picked | 17 / 31 | 55% |
| 地级 picked | 256 / 439 | 58% |
| 县区 picked | 786 / 2739 | **29%** |
| anchor 来源 | 891 | 84% |
| constructed 兜底 | 168 | 16% |

> **核心观察**：industrial 比 news（55%）低 22 个百分点。原因：县区"惠企"栏目本身就大面积缺位，不是探针漏判，而是页面客观不存在。Tier C 仅 72 个意味着 Tier A/B 关键词覆盖已经足够，再放宽阈值只会引入更多噪音。

### 高频命中标签 Top 10（实测 anchor 文本）

| 文本 | 次数 | 备注 |
|---|---|---|
| 惠企政策 | 156 | Tier A 主力 |
| 招商引资 | 70 | Tier C |
| 优化营商环境 | 69 | Tier B |
| 营商环境 | 67 | Tier B |
| 助企纾困 | 47 | Tier A |
| **涉企行政检查公示专栏** | **43** | ⚠️ 边界，见下文 |
| 涉企收费 | 31 | Tier A |
| 政策兑现 | 28 | Tier A 外部平台 |
| 营商环境专栏 | 25 | Tier B |
| 产业政策 | 22 | Tier C |

### 高频命中路径 Top 10

| 路径头 | 次数 |
|---|---|
| `/hqzc/` | 112 |
| `/zsyz/` | 22 |
| `/ztzl/hqzc/` | 16 |
| `/ywdt/qyfw/` | 11 |
| `/zwgk/hqzc/` | 10 |
| `/yshj/` | 9 |
| `/qyfw/` | 8 |
| `/cyzc/` | 6 |
| `/cyfz/` | 6 |
| `/zcdx/` | 5 |

### 失败聚类（unreach + noroute）Top 10 省

| 省 | 总失败 | 主要类型 |
|---|---|---|
| 四川省 | 150 | noroute 占多数（县区栏目缺位） |
| 河北省 | 141 | unreach（DNS / 超时为主） |
| 云南省 | 124 | noroute |
| 河南省 | 118 | noroute |
| 湖南省 | 111 | noroute |
| 黑龙江省 | 100 | unreach |
| 广西壮族自治区 | 93 | noroute |
| 广东省 | 91 | 江门 / 茂名等地县区 noroute |
| 安徽省 | 76 | **合肥系整片 521 WAF** |
| 江苏省 | 53 | **53/53 县区全 SPA noroute** |

> **关键洞察**：江苏省所有县区门户走 SPA，HTML 渲染前没有可解析的 `<a>`，需要 Playwright 二次渲染或人工兜底。安徽合肥及其下辖（包河 / 巢湖 / 肥东 / 阜南）整片 Cloudflare 521，建议跳过自动化、走 subagent 人工。

---

## ⚠️ 已知漏判模式 → ARTICLE_PATH 加固

v1 扫描发现 **99 个被 picked 但实为单篇文章 / 公告页面** 的误判（占 picked 9.4%，远高于 news 的 0.6%）。industrial 误判率高的根因：很多政府发"关于征集影响营商环境……"的单篇通告时，标题里直接含 "营商环境"，被 Tier B 锚点抓走。

### 典型漏判 URL 形态

```
https://www.bengbu.gov.cn/content/article/51079542.html         ← /content/article/<id>
https://www.mas.gov.cn/zxzx/tzgg/21346381.html                  ← 通知公告里的单篇
https://www.huidong.gov.cn/.../content/post_5739716.html        ← /content/post_<id>
https://www.xxx.gov.cn/202604/t20260424_3282331.htm             ← /YYYYMM/t<YYYYMMDD>_<id>
https://www.xxx.gov.cn/art/2026/4/24/art_1234_5678901.html      ← /art/Y/M/D/art_<a>_<b>
```

### 现有 ARTICLE_PATH 漏掉的两种关键模式

```ts
// 当前实现（probe-column.ts）
const ARTICLE_PATH = /\/\d{4}[\-_/]\d{2}([\-_/]\d{2})?\/|\/art\/\d{4}\/|\/[a-f0-9]{20,}\.s?html?$/i;

// ⚠️ 漏判 1：YYYYMM（无分隔符）+ tYYYYMMDD_<id>
//   /202604/t20260424_3282331.htm     ← /\d{4}\d{2}/t\d{8}_\d+\.s?html?$/
// ⚠️ 漏判 2：/content/(article|post)_<id>
//   /content/article/51079542.html    ← /\/content\/(article|post)[_\/]?\d+\.s?html?$/
// ⚠️ 漏判 3：/zxzx/tzgg/<id>.html     （通知公告单篇，纯数字 id）
//   ← /\/(tzgg|tongzhi|gonggao)\/\d{6,}\.s?html?$/i
```

**建议补丁**（probe-column.ts）：

```ts
const ARTICLE_PATH = new RegExp([
  /\/\d{4}[\-_/]\d{2}([\-_/]\d{2})?\//,
  /\/\d{4}\d{2}\/t\d{8}_\d+\.s?html?$/,           // YYYYMM/tYYYYMMDD_id
  /\/content\/(article|post)[_\/]?\d+\.s?html?$/,  // /content/article/id
  /\/(tzgg|tongzhi|gonggao|tzggk?)\/\d{6,}\.s?html?$/,
  /\/art\/\d{4}\//,
  /\/[a-f0-9]{20,}\.s?html?$/,
].map(r => r.source).join('|'), 'i');
```

补完后重跑应能从 1059 中剔除 ~80 条单篇，**真实命中率会从 33% 降到 ~30%，但精度上升**。这是值得的：industrial 的下游用户（财政课题组）比 news 更不能容忍单篇噪音。

---

## 涉企行政检查公示专栏 vs 惠企政策 边界

v1 共 **43 个**栏目命中文本"涉企行政检查公示专栏"。这是**国办 2024 年统一要求**地市开设的公示栏，性质类似"涉企收费目录"——本质是**约束政府执法**而非"为企业服务"。

### 判定

| 场景 | Tier | 说明 |
|---|---|---|
| 仅有"涉企行政检查公示专栏"，无其他惠企入口 | **不收** | 性质属"行政公开"，不属"惠企政策"导航；标 D，存档 |
| 同时有"惠企政策" + "涉企行政检查" | 收"惠企政策"，丢"涉企行政检查" | 主路径走前者 |
| 仅有"涉企收费目录" | **收 Tier A** | 直接为企业减负，性质 = 惠企 |

> 当前 v1 流水线把 "涉企行政检查公示专栏" 误收进 Tier A 是因为 TIER_A 里的 `涉企` 关键词太宽。下一版应：把 TIER_A 的 `涉企` 替换为 `涉企(收费|减负|帮扶|服务)`，并在 REJECT_TEXT 里追加 `涉企行政检查|行政检查公示`。

---

## 外部平台域名清单（v1 实测 39 个）

build-column-xlsx 阶段已自动识别，下游可直接 filter `是否外部平台 = 是`。Top 出现频次：

| 外部域名 | 次数 | 备注 |
|---|---|---|
| `sanya.gov.cn` | 4 | 三亚市本级跳本级，旁支县区共用 |
| `db.hainan.gov.cn` | 2 | 海南省"惠企政策直达" |
| `zfxxgk.yanbian.gov.cn` | 2 | 延边政务公开二级域 |
| `nbinvest.ningbo.gov.cn` | 1 | 宁波招商二级 |
| `zsj.sz.gov.cn` | 1 | 深圳招商局 |
| `huiqi.fz12345.gov.cn` | 1 | 福州 12345 挂载 |
| `zcfb.guizhou.gov.cn` | 1 | 贵州政策发布 |
| `zcdd.<city>.gov.cn` | ~6 | 多地"政策兑现"独立子域 |
| `huiqitong.<city>.gov.cn` | ~4 | "惠企通"独立子域 |
| `zhengcezhida.<city>.gov.cn` | ~3 | "政策直达" |
| ... 其余 18 个 | 1 | 长尾，多为单地市自建 |

**模式提炼**：外部平台域名规律性极强 —— `(huiqi|zcdd|zhengcezhida|huiqitong|zcfb|qyfw)[a-z0-9]*\.[a-z]+\.gov\.cn`。可加进 `EXTERNAL_HINT` 提前预测。

---

## CMS 路径模式库（按片区收集）

| 片区 / CMS | 典型路径 | 命中省 |
|---|---|---|
| 国办通用 `/zwgk/hqzc/` | 政务公开二级目录 | 大部分省级 + 地级 |
| 浙系 `/hqzc/` 一级 | 顶层短路径 | 浙江 / 江苏 / 安徽 |
| 鲁系 `/ztzl/hqzc/` | 专题专栏挂载 | 山东 / 河南 |
| 粤系 `/ywdt/qyfw/` | "要闻动态-企业服务" | 广东 / 广西 |
| 川渝系 `/zsyz/` + `/cyzc/` 并列 | 招商和产业分两栏 | 四川 / 重庆 / 云南 |
| 政策兑现独立平台 | `huiqi.<city>.gov.cn` 或 `zcdd.<city>.gov.cn` | 长三角 / 珠三角 |
| 老 .NET CMS | `/News/showList/<deptId>` | 西北若干市县 |

---

## Subagent 并行模板（人工兜底失败用）

当某省/某地市自动化漏判 ≥10 个，启 subagent 一次性扫一片：

```text
你是一个 Chinese 政府门户结构识别助手。给定 N 个 <city.gov.cn> 首页 HTML，
请：
1. 列出每个门户的"惠企/涉企/营商环境/政策兑现"导航条目（含锚文本和 href）
2. 标记是否为外部平台跳转（host 不同于 gov.cn 主域）
3. 若首页未直接出现，请在 /zwgk/、/ztzl/、/ywdt/ 三个二级目录下尝试
4. 用 JSON 数组返回 [{ gov: "...", picks: [{label, url, externalHost?}] }]

⚠️ 不要收以下页面：
- 单篇通告（URL 含 /content/article/、/202604/t<...>.html、/post_<id>.html）
- "涉企行政检查公示专栏"（除非同时有"惠企政策"则只取后者）
- "工商联"/"行业协会"/"招聘信息"/"党建"/"纪检"
- "12345 留言板"
```

---

## 经验法则（v1 后更新）

### 频率回报的命名洞察

- "惠企政策" (156) >> "政策兑现" (28)：内部栏目 vs 外部平台之比 ≈ 5.6:1，说明大多数地市还没建独立平台，仍走门户内栏
- Tier C "产业政策" 仅 22 次：说明国办未统一要求地市单独建"产业政策"栏，多数挂在"经信局工作动态"下
- Tier B "营商环境" 系列（69+67+25=161）反而比 Tier A 单 keyword "惠企政策" 还多 → **不可降权 Tier B**

### 假阳性高发陷阱（v1 实测）

1. **单篇通告**：`/content/article/<id>`、`/202604/t<...>.htm`、`/post_<id>.html` —— 现有 ARTICLE_PATH 漏判，需要补丁（见上节）
2. **"涉企行政检查公示专栏"**：43 例边界，按上节规则处理
3. **"营商环境征集意见"单篇**：标题命中 Tier B 但内容是单次活动公告，需要 CONTENT_REQUIRE 加严
4. **国资委 / 产业园区招商单篇**：如"XX 工业园 2026 春季招商推介会"，命中 Tier C "招商引资"

### 失败重灾区路线图

- 江苏全省 53/53 县区 SPA → **下一步上 Playwright headless 渲染**
- 安徽合肥系（合肥/包河/巢湖/肥东/阜南）整片 521 WAF → **subagent 一次性人工查 5 个**
- 河北 / 四川 / 云南 / 河南 / 湖南 noroute 集中 → **大概率栏目客观不存在，标 D 存档即可，不要勉强**
