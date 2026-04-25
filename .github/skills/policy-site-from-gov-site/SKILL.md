---
name: policy-site-from-gov-site
description: "Find Chinese province / city / county government 政策文件 / 规范性文件 / 政策检索库 entry pages by drilling down from already-verified government portals (政府门户). USE WHEN: user asks to find regional policy index URLs, supplement data/website-policy.ts, populate 地区政策导航, or mentions 政策文件库/找政策/行政规范性文件/规范性文件 in this project. PREREQUISITE: gov portal URL must already exist in data/website-gov.ts; if it is suspicious, repair via gov-site-finder first."
---

# Policy Site from Gov Site — 基于政府官网逐站核查地区政策入口

为每个省/市/区在 **政府门户** 上找到一个稳定、可代表本地政策文件的栏目页 URL，写入 `data/website-policy.ts` 的 `POLICY_URL_MAP`。

> **设计风格**：与 `fiscal-site-from-gov-site` 对齐 —— 谨慎的研究助理，不是激进爬虫。**宁缺勿错**，不写无法验证的 URL。

## Quick Reference

- **Gov portals data**: `data/website-gov.ts`
- **Policy data**: `data/website-policy.ts`
- **Log file**: `docs/website-policy-log.md`
- **Front-end**: `components/pages/website-policy-nav.tsx` → `website-region-nav.tsx`
- **Sister skill (fiscal)**: `fiscal-site-from-gov-site/SKILL.md`
- **Gov portal repair**: `gov-site-finder/SKILL.md`

---

## 与 fiscal-site-from-gov-site 的差异

| 维度 | fiscal | policy |
|---|---|---|
| 目标栏目 | 预决算 / 财政预决算公开 | 政策文件 / 规范性文件 / 政策库 / 找政策 |
| 唯一性 | 同一级一般只有 1 个真正的预决算栏目 | 同一级常存在 **2-3 个并列栏目**（"政策文件" + "规范性文件" + "找政策"），需按优先级择优 |
| 名称稳定 | "预决算公开" 用语稳定 | 用语高度不稳定，需识别同义集合 |
| 路径深度 | 通常 `信息公开 → 法定公开 → 财政预决算` | 通常 `政务公开 → 政策` 一级或 `信息公开 → 政策` 二级 |

---

## 核心流程

```
Step 1: 校验政府官网（同 fiscal skill）→ 可疑 → gov-site-finder 修复
Step 2: 从首页/政务公开页定位"政策"类栏目候选
Step 3: 按优先级择优 + 验证候选页
Step 4: 写入 POLICY_URL_MAP 并记录 log
```

---

## Step 1: 校验政府官网

完全沿用 `fiscal-site-from-gov-site/SKILL.md` 的 Step 1 标准（可达性、地名匹配、层级正确、是政府门户主站、页面结构正常）。

可疑 → 必须先调 `gov-site-finder` 修复 `data/website-gov.ts` 后再继续。

---

## Step 2: 定位候选栏目

### 2.1 可接受栏目名（同义集合）

按 **可检索性** 由高到低分组（这是与 fiscal 最大区别 —— 必须用优先级择优）：

**Tier A — 可检索 / 可筛选（最高优先级）**
- 找政策、政策检索、政策查询、政策库、政策图谱、政策文件库
- 政府文件库、规范性文件查询、规范性文件库
- 文件库 + 检索框

**Tier B — 政府门户一级"政策"列表**
- 政策文件、政策、政策法规、政策信息
- 政府文件、政府公文、最新文件、省/市政府文件
- 行政规范性文件、规范性文件、规范性文件统一发布
- 政府规章 + 政府文件 的合并栏目

**Tier C — 信息公开目录下的政策子栏目**
- `政府信息公开目录 → 市/省政府文件`
- `政府信息公开目录 → 市/省政府规章`
- `政府信息公开目录 → 行政规范性文件`

**Tier D — 法制办 / 司法局 的规范性文件子栏目**（下策，仅当无其他入口时使用）

**禁止使用**：单篇文章页、废止文件库、短期专题、API 端点、政府信息公开平台首页（太宽泛）。

### 2.2 同级并列时的择优规则

当同一区域同时存在多个 Tier 入口，按以下优先级择优：

```
Tier A (可检索) > Tier B (一级政策列表) > Tier C (信息公开子栏目) > Tier D (法制办)
```

例：北京市同时有
- `zhengce/zcdh`（找政策，Tier A） ← 采用
- `zhengce/zhengcefagui`（政策文件列表，Tier B）
- `zhengce/gfxwj`（行政规范性文件库，Tier B）

例：广州市同时有
- `gz.gov.cn/gzzcwjk`（政策文件库，Tier A） ← 采用
- `gz.gov.cn/gfxwj`（规范性文件统一发布，Tier B）

### 2.3 操作步骤

1. **打开官网首页**：用 `fetch_webpage` 获取渲染后 HTML
2. **首页一级栏目扫描**：搜索 `政策|找政策|政策文件|规范性|文件库|政策法规|政策信息` 关键词的 `<a>` 标签
3. **如首页无一级入口**：进入"政务公开"/"政府信息公开"页面，再深入一层（最多 2 层）
4. **同省/同市经验复用**：同一地级市下属区县通常共享 CMS 模板和路径模式（如安徽 `/openness/`、浙江 `col/col`、辽宁 `/zwgk/zcwj/`）
5. **记录所有候选**：每个 Tier 至少留 1 个候选，便于在 Step 3 失败时回退

---

## Step 3: 验证候选页面

### 3.1 真页面标准

候选 URL 必须满足全部条件：

1. **标题/H1 命中同义集合**：必须明确标注为 §2.1 中的栏目名之一
2. **有实际内容列表**：能看到政策文件/规章的标题列表（标题含年份、发文字号、政策名）
3. **地名匹配**：内容对应当前处理的区县
4. **不是政务公开总目录**：URL 不能是 `/zwgk/`、`/xxgk/`、`/zfxxgk/` 这类总入口

### 3.2 假阳性排除清单

| 类型 | 为什么不行 | 示例 |
|---|---|---|
| 政府官网首页 | 范围太宽 | `www.xxx.gov.cn/` |
| 政务公开总目录 | 不是政策栏目 | `/zwgk/` |
| 政府信息公开目录首页 | 需再下钻 | `/xxgk/` |
| 政府信息公开平台首页 | 范围太宽 | `public.xxx.gov.cn/` |
| 单篇文章 | 不是栏目 | `/art/2025/xxx.html` |
| 单个政策附件 | 不是栏目 | `/upload/xxx.pdf` |
| API 端点 | 非用户页 | `/api-gateway/xxx/index` |
| 已撤稿/404 页 | 不稳定 | "页面不存在" |
| 错误路径跳首页 | 伪结果（同 fiscal Step 3 跳首页检测） | 访问 `/zcwj/` 实际渲染首页 |
| 仅检索框无默认列表 | 内容为空 | 检索页但无最近政策 |

### 3.3 跳首页检测

与 fiscal skill 同样规则：候选页面 title 与首页 title 高度相似 / 候选 URL 实际跳到首页 → 一律视为未找到。

---

## Step 4: 写入数据

### 4.1 数据格式

```typescript
// data/website-policy.ts
export const POLICY_URL_MAP: RegionUrlMap = {
  "省名": "https://www.xxx.gov.cn/.../",
  "省名/市名": "https://www.yyy.gov.cn/.../",
  "省名/市名/区县名": "https://www.zzz.gov.cn/.../",
};
```

### 4.2 写入规则

1. 只写入 **Step 3 通过验证** 的 URL
2. 完整含协议（`https://` 或 `http://`）
3. 保留原始大小写、查询参数（如北京 `?token=4260&type=1`）
4. 同一 key 不重复；如已存在非空值，仅在确认旧值错误时才覆盖
5. 未找到 / 未确认 → 留空 `""` 或干脆不加 key（等价于灰色"待补充"）

---

## 慢站防误判规则

完全沿用 fiscal skill 的规则：

- 重试次数：超时 ≥3、502/503 ≥2、空白页 ≥2
- WAF/CDN 拦截（422/521/403 + body < 500 bytes）：必须用 `fetch_webpage`，不要反复 HTTP probe
- 不可直接判定"不存在"的情况：单次超时、502、空 body、< 500 字节 HTML、422/521

---

## 并行策略

### 默认处理模式

按 **5-7 个区域** 一组分配 subagent，**将 3-5 个 `runSubagent` 调用放在同一个 `<function_calls>` block** 实现真正并行。

每轮并行完成后，主 agent：
1. 汇总所有 `confirmed` URL 写入数据文件
2. 处理 `gov-suspicious` → 调 `gov-site-finder` 修复
3. 处理 `unconfirmed` → 主 agent 用 `fetch_webpage` 兜底重试
4. 抽样 2-3 个 confirmed 二次验证

### subagent 提示词模板

**必须内联核心规则**，不要让 subagent 自行去读 SKILL.md：

```
你是一个谨慎的政府网站研究助理。任务是为以下 N 个区域查找"地区政策"栏目页 URL。

## 数据
{清单：每行 "区域路径 = gov_portal_url"}

## 核心规则
- 宁缺勿错：找不到就 unconfirmed，绝不写入无法验证的 URL
- DNS 失败 / 超时 ≥2 次 → 标记 gov-suspicious 交主 agent
- 不要反复重试同一失败策略

## Step 1: 校验政府官网
用 fetch_webpage 访问其 gov_portal_url，确认地名匹配、是政府门户主站、页面结构正常。
可疑 → 标记 gov-suspicious，停止后续。

## Step 2: 定位"政策"栏目候选
在首页 HTML 中搜索关键词：
- Tier A（首选）：找政策、政策库、政策检索、政策文件库、规范性文件库、文件库
- Tier B：政策文件、政策法规、政策信息、政府文件、最新文件、省/市政府文件、规范性文件、行政规范性文件
- Tier C：政府信息公开目录 → 市/省政府文件
首页无 → 进政务公开/信息公开页面再找一层。

## Step 3: 按 Tier A > B > C 优先级择优 + fetch_webpage 验证
真页面 = 标题命中同义集合 + 有政策列表 + 地名匹配。
排除：首页、政务公开总页、信息公开平台首页、单篇文章、API 端点、已撤稿、跳首页。

## Step 4: 输出
返回 JSON 数组，每条：
{ region, govUrl, govStatus, policyUrl, policyTier, policyStatus, candidates, notes }
- govStatus: ok / suspicious（必须说明原因）
- policyTier: A / B / C / D
- policyStatus: confirmed / unconfirmed / not-found
- candidates: 备选 URL 列表（即使最终未采用也列出）
```

---

## 与 gov-site-finder 的联动

完全等同 fiscal skill：

| 何时调用 | 操作 |
|---|---|
| Step 1 发现官网可疑 | 读取 `gov-site-finder`，按 G2/G3/G4 修复 `website-gov.ts` |
| subagent 返回 gov-suspicious | 主 agent 统一修复 |
| 修复后官网仍不可达 | 标记彻底缺失，跳过该区域 |

---

## 输出与提交

### 数据更新
1. 更新 `data/website-policy.ts` 的 `POLICY_URL_MAP`
2. `npm run lint`（`tsc --noEmit`）必须通过
3. `npm run build` 生成所有静态页

### Log 记录（`docs/website-policy-log.md`）

每轮处理完成后追加 vN 段落：

```markdown
## v{N} 扩充（{摘要}）

### v{N}.1 本轮新增确认

| 路径 | Tier | 入口名 | URL | 来源 |
|---|---|---|---|---|

### v{N}.2 未采用的候选
列出 candidates 但未采用，并说明排除原因（API 端点、跳首页、404、Tier 较低等）。

### v{N}.3 仍未能核验
分省级 / 省会 / 副省级 / 县级 列出，并标注原因（JS 渲染、WAF、官网不可达、已被 gov-site-finder 修复后仍无政策入口）。

### v{N}.4 覆盖率变化
| 类别 | v{N-1} | 新增 | 当前 |
```

### Commit message
`feat(policy): add N regional policy URLs from gov portals (vN)`

---

## 经验法则（持续更新）

> 该节由每轮处理后总结的具体经验补充，便于下一轮复用。

### CMS / 路径模式（按 batch 收集）

- **浙江系**（省级 + 杭州）：一律 `col/col<编号>/index.html`（"法规文件""规范性文件数据库"皆此模板）
- **安徽系**（省级 + 合肥）：省级 "我要找政策" `/site/tpl/<id>?activeId=<id>`；合肥 `publicColumn/<key>/index.html`
- **辽宁系**（省级 + 沈阳）：`/zwgk/zcwj/szfwj/`，省/市同构
- **福建系**（省级 + 福州）：`/zwgk/zxwj/szfwj/`，省/市同构 ← **同省同 CMS 时直接把域名换掉即得**
- **石家庄 / 河北**：`columns/<UUID>/index.html`（GUID 路径）
- **西宁 / 兰州 / 太原 / 海口 / 南宁 / 昆明**：均用最朴素的 `/zwgk|xxgk/.../zcwj|zfwj|zcfg/`，可作为兜底猜测路径
- **江西省级规范性文件**：实际在子域 `xzgfxwjk.jiangxi.gov.cn`（不在主门户 `jiangxi.gov.cn` 路径下）→ 找不到时应在主页 HTML 里搜 `*.gov.cn` 子域
- **山东 / 济南**：政策入口被改造为 `api-gateway/jpaas-jpolicy-web-server/...` API 端点，**必须改用门户 HTML 列表**（如 `/col/col85285/index.html` 政府规章）
- **郑州**：政策入口挂在 `public.zhengzhou.gov.cn` 信息公开平台子站，但带参数 `?a=dir&h=1&p=D0104X` 可直达"政府文件"目录页 → 此时 `public.*.gov.cn` 例外可接受为 Tier C
- **河南省**：主门户唯一稳定政策入口是 `省政府令` `/zwgk/fgwj/szfl/`，范围窄于"政策文件"但属 Tier B 可接受

### 同义栏目命名习惯

- "政策文件" 与 "政府文件" 在大多数省门户等价
- "规范性文件" 严格意义上是 "政策文件" 的子集，但许多市级门户仅设此一类
- "找政策" / "我要找政策" 几乎专指可检索 SPA，遇到必属 Tier A
- "最新文件" 通常是发文时间倒序列表，可视为 Tier B 等价物
- **Tier A 不必都叫"找政策"**：哈尔滨/南京/杭州/合肥/石家庄/陕西的 Tier A 入口分别叫 "政策文件库""行政规范性文件库""规范性文件数据库""市级政策文件库"。判定 Tier A 看的是"有检索框 + 列表 + 标题含同义集合"三要素，不是字面名称。

### WAF / JS 渲染高发地区

参考 `docs/website-policy-log.md` v2-v5，累计如下：
- **长期 WAF / JS 渲染省级**：内蒙古、湖北、四川、甘肃、青海、山东（v5 新增确认）；浙江、河南、广西、贵州（v3-v4 困难，v5 已部分突破）
- **长期 WAF / JS 渲染省会**：长春、成都、贵阳（v5 仍未突破）；杭州、济南、海口、昆明、兰州、西宁（v5 已突破）
- **WAF 的典型表现**：fetch_webpage 返回壳页 / 403 / 521 / `Failed to extract meaningful content`
- 对剩余 WAF 地区，第一轮 fetch_webpage 失败 → 直接标记 unconfirmed → 放入 Playwright 待办，**不要反复 probe**

### Subagent 并行教训（v5）

- 5 路并行 subagent + 6-8 区域/路 是合适粒度，单轮即可覆盖 35 个目标
- 提示词必须在内联中包含 **Tier 优先级、典型反例（API 端点、单篇文章、跳首页）和已知失败案例**（如济南的 jpaas API、贵阳的 404 旧 URL、昆明的单篇文章 URL），否则 subagent 会重蹈覆辙
- subagent 最容易出错：在主页直接看到一个 "政策" 链接就标 confirmed，而未实际 fetch 该 URL 验证内容 → 提示词必须强调 "Step 3: 必须 fetch_webpage 候选 URL 再确认"
