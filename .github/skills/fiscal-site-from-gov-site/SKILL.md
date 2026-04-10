---
name: fiscal-site-from-gov-site
description: "Based on government portal websites (政府官网), verify each county/district's gov portal first, then navigate to find the real fiscal budget disclosure (预决算公开) page. USE WHEN: user asks to find fiscal budget URLs starting from government portals, verify and fix gov portals before finding fiscal links, or process a province's county-level fiscal data with gov-site cross-checking. Calls gov-site-finder as a prerequisite repair tool when portals are suspicious."
---

# Fiscal Site from Gov Site — 基于政府官网逐站核查预决算公开链接

基于"政府官网主站"逐个区县核查，找到真正的"财政预决算公开链接"，同时排查"政府官网数据是否填错"。

> **设计风格：谨慎的研究助理，不是激进爬虫。** 默认逐站处理，宁缺勿错。

## Quick Reference

- **Gov portals data**: `data/gov-website-links.ts`
- **Fiscal data**: `data/fiscal-budget-links.ts`
- **Gov portal repair skill**: `gov-site-finder` (SKILL.md)
- **Fiscal methods catalog**: `fiscal-site-finder` (SKILL.md)

---

## 核心流程：先校验官网，再找预决算

对每个区县，执行以下严格串行流程：

```
Step 1: 校验政府官网 → 可疑？→ 调用 gov-site-finder 修复
Step 2: 从官网首页导航到预决算栏目
Step 3: 验证候选页面是否为真实栏目页
Step 4: 确认无误后写入数据
```

**绝不跳过 Step 1。** 在官网可疑的状态下找到的预决算链接不可信。

---

## Step 1: 校验政府官网

### 必检项目

对每个区县的 `gov-website-links.ts` 中记录的 URL，执行以下检查：

1. **可达性**: `fetch_webpage` 或 HTTP HEAD/GET 访问，至少尝试 2 次
2. **地名匹配**: 页面 `<title>` 或 `<h1>` 中必须包含该区县名称（去掉"市/县/区"后缀也算）
3. **层级正确**: 县级官网不能是市级门户（如 `www.anshan.gov.cn` 不是海城市的官网）
4. **站点类型正确**: 必须是政府门户主站，排除以下冒充：
   - 财政局官网 (`czj.xxx.gov.cn`)
   - 开发区/高新区/自贸区管委会
   - 宣传部/文旅局/住建局等部门子站
   - 旧域名、测试站、文章详情页、栏目列表页
5. **页面结构**: 像政府门户（有新闻、政务公开、办事服务等栏目），不是空白页/骨架页/纯报错页

### 可疑情形判定

以下任一情形出现，即判定官网可疑，**必须先修复再继续**：

| 情形 | 示例 |
|------|------|
| 链接打不开（超时、DNS 失败、连接拒绝） | 连续 2+ 次失败 |
| 根路径不行，但加 `/index.html` 才能打开 | 记录实际可用 URL |
| 打开后地区名不匹配 | 标题是"鞍山市人民政府"但数据是海城市 |
| 实际是财政局/部门子站 | `czj.xxx.gov.cn` 不是门户 |
| 是旧域名/跳转到其他站 | 3xx 跳到完全不同的域名 |
| 页面结构不像政府门户 | 只有几行文字，无导航 |
| URL 是文章页/栏目页而非首页 | `/art/2024/xxx.html` |

### 修复流程

官网可疑时：
1. 读取 `gov-site-finder` skill（如未读取）
2. 按 `gov-site-finder` 的 G2 方法，从市级门户找该县的正确官网
3. 更新 `gov-website-links.ts`
4. 用新 URL 重新执行 Step 1 直到通过

---

## Step 2: 从官网导航到预决算栏目

### 默认路径：人工导航模拟

**不要批量猜 URL。** 按人工浏览顺序逐层查找：

```
政府官网首页
  ├─ 信息公开 / 政务公开 / 政府信息公开
  │   ├─ 法定主动公开内容
  │   │   └─ 财政预决算 / 预决算公开 ← 目标
  │   ├─ 重点领域信息公开
  │   │   └─ 财政资金 / 财政信息 ← 可能的目标
  │   └─ 财政预决算 / 政府预决算公开 ← 直接子栏目
  ├─ 专题专栏
  │   └─ 预决算公开 ← 少数站点放在这
  └─ 数据开放 / 财政公开 ← 极少数
```

### 操作步骤

1. **打开官网首页**：用 `fetch_webpage` 获取渲染后 HTML
2. **搜索导航链接**：在 HTML 中查找包含以下关键词的 `<a>` 标签：
   - 主关键词：`预算`, `决算`, `预决算`, `财政预决算`
   - 次关键词：`财政资金`, `财政信息`, `政府预决算公开`
   - 栏目关键词：`法定主动公开`, `重点领域`, `政务公开`, `信息公开`
3. **如首页未找到**：点进"政务公开"/"信息公开"子页面继续查找（最多深入 2 层）
4. **记录候选 URL**：找到的所有疑似预决算栏目 URL

### 按市分组的路径模式复用

同一个地级市下属区县通常共享：
- 相同的 CMS 系统（如浙江的 col/col 系统、安徽的 openness 系统）
- 相似的栏目路径结构
- 相同的编号规则（如 `?number=D001-A001`）

**因此，一旦在某个区县找到有效路径模式，优先在同市其他区县尝试相同模式。**

---

## Step 3: 验证候选页面

### 真页面标准

候选 URL 必须满足 **全部** 以下条件才能写入数据：

1. **页面标题或 `<h1>` 明确标注** 为以下之一：
   - "预决算公开"、"财政预决算"、"预算/决算"、"政府预决算公开"、"部门预决算"
   - 或包含"预算"+"决算"的同义组合

2. **页面有实际内容列表**：至少能看到预算/决算相关的文件条目（标题含年份+预算/决算），
   或有明确的子分类（如"政府预算"、"部门预算"、"政府决算"、"部门决算"）

3. **地名匹配**：页面内容对应当前处理的区县（非其他地区）

### 假阳性排除清单

以下 **一概不算** 最终答案：

| 类型 | 为什么不行 | 示例 |
|------|-----------|------|
| 政府官网首页 | 不是预决算专栏 | `www.xxx.gov.cn/` |
| 财政局首页 | 是部门首页不是预决算栏目 | `czj.xxx.gov.cn/` |
| 政务公开首页 | 太宽泛 | `/zwgk/` |
| 政府信息公开指南页 | 是指南不是数据 | `/zwgk/xxgkzn/` |
| 错误路径跳首页 | 404 跳转的伪结果 | 访问 `/czyjs/` 跳到 `/` |
| 政府信息公开平台首页 | 需要再往下找 | `/xxgk/` |
| 新闻文章/通知详情 | 单篇文章不是栏目 | `/art/2026/xxx.html` |
| 单个预算文件下载页 | 是文件不是栏目 | `/upload/xxx.pdf` |

### 跳首页检测

**关键规则：** 如果请求 `/zwgk/czyjs/` 但实际返回的是首页内容（URL 相同但内容是首页），
即使首页 HTML 中包含"财政""预决算"等字样，**也不能算找到了**。

检测方法：
- 比对候选页面 title 和首页 title 是否相同
- 检查页面内容长度和结构是否与首页高度相似
- 如果候选页面的 `<title>` 包含"首页"/"门户"/"人民政府"等，大概率是跳首页

---

## Step 4: 写入数据

确认是真页面后：
1. 更新 `data/fiscal-budget-links.ts` 中对应区县的 `url` 字段
2. 使用完整 URL（含协议）
3. 保留 URL 的原始大小写和参数

---

## 慢站防误判规则

政府网站通常很慢（3-15 秒响应），且经常出现临时故障。**必须遵守以下规则**：

### 重试策略

| 情况 | 最少尝试次数 | 间隔 |
|------|------------|------|
| 超时 / 连接失败 | 3 次 | 等待 5-10 秒 |
| HTTP 502/503/504 | 2 次 | 等待 10 秒 |
| 空白页 / 骨架页 | 2 次 | 可能是 JS 未加载完 |
| SSL 错误 | 1 次 HTTPS + 1 次 HTTP | — |
| **WAF/CDN 拦截 (422/521/403)** | **1 次 HTTP + 1 次 fetch_webpage** | **见下方 WAF 专节** |

### WAF/CDN 封锁场景

部分地区（如赣州市）使用统一安全网关，HTTP 探测全部返回 422/521/403 + 极短 body（< 500 bytes）。

**识别特征：**
- HTTP 状态码 422、521、403 且 body < 500 bytes
- 同一地级市下多个县统一出现同一异常状态码
- 首页可达但子路径全部返回异常

**应对策略：**
1. **不要反复 HTTP probing** — WAF 场景下所有路径探测都会失败
2. **必须使用 `fetch_webpage`** — 浏览器渲染可绕过多数 WAF 质询
3. 如果 `fetch_webpage` 也失败，在 `docs/fiscal-site-log.md` 中标记为 `WAF-blocked`
4. 同市多县同一 WAF 时，只需测试 1-2 个县确认 fetch_webpage 是否有效，再决定是否批量处理

### 不可直接判定"不存在"的情况

- 单次超时 → 可能只是网络波动
- 502/503 → 服务器临时故障
- 空 body → JS 渲染站点，需用 `fetch_webpage`
- 返回非常短的 HTML（< 500 字节） → 可能是错误页残片
- **422/521 → WAF 拦截，非页面不存在，须用 fetch_webpage 验证**

### 宁缺勿错原则

- **宁可留空（`url: ""`），不可写入错误链接**
- 证据不足时标记为"待确认"，不强行写入
- 对于慢站、502 站，记录问题但不写入无法验证的 URL

---

## 并行策略：按地级市分组 + subagent

### 默认处理模式

为提高效率，按以下策略组织工作：

1. **按地级市拆分任务**：同一地级市下的区县共享相似的官网结构和 CMS 模板
2. **使用 subagent 并行处理**：
   - 大市（≥5 个区县）：单独分配一个 subagent
   - 小市（< 5 个区县）：可合并 2-3 个市到一个 subagent
3. **subagent 产出**：每个区县的结果分为三类：
   - ✅ **confirmed**：官网正确 + 找到真实预决算栏目页 → 含具体 URL
   - ⚠️ **gov-suspicious**：官网可疑，需主 agent 用 `gov-site-finder` 修复
   - ❓ **fiscal-unconfirmed**：官网正确但预决算链接无法确认（慢站/502/JS 渲染无内容）
4. **主 agent 复核**：
   - 所有 gov-suspicious 项：调用 `gov-site-finder` 修复后重试
   - 所有 fiscal-unconfirmed 项：人工用 `fetch_webpage` 重试或标记暂缺
   - confirmed 项抽检 2-3 个验证

### subagent 提示词模板

给 subagent 的提示词应包含：
```
你是一个谨慎的政府网站研究助理。任务是为 {市名} 下辖的 N 个区县查找财政预决算公开链接。

对每个区县：
1. 先用 fetch_webpage 访问其政府官网 {URL}，检查：
   - 页面是否可达
   - 标题/内容是否包含该区县名称
   - 是否是政府门户主站（非财政局/部门子站）
   如有任何可疑，标记为 gov-suspicious 并说明原因

2. 官网确认正确后，在首页 HTML 中搜索预决算相关链接：
   - 搜索关键词：预算、决算、预决算、财政预决算、财政信息、财政资金
   - 如首页无结果，找"政务公开"/"信息公开"入口页再搜索一层

3. 找到候选链接后用 fetch_webpage 访问验证：
   - 页面标题必须明确标注"预决算"或同义词
   - 页面有实际预算/决算文件列表
   - 排除：首页、财政局首页、政务公开首页、单篇文章
   通过验证标记为 confirmed

4. 如果多次尝试超时/502/空白，标记为 fiscal-unconfirmed

同市内发现有效路径模式后，优先在其他区县尝试相同模式。

返回结果格式（JSON 数组）：
{county, govUrl, govStatus, fiscalUrl, fiscalStatus, notes}
- govStatus: "ok" | "suspicious"
- fiscalStatus: "confirmed" | "unconfirmed" | "not-found"
```

---

## 与 gov-site-finder 的联动

本 skill **不替代** `gov-site-finder`，而是把它作为 **前置修复工具**。

### 调用时机

| 何时调用 | 操作 |
|---------|------|
| Step 1 发现官网可疑 | 读取并执行 `gov-site-finder` 的 G2/G3/G4 方法修复 |
| subagent 返回 gov-suspicious 项 | 主 agent 调用 `gov-site-finder` 统一修复 |
| 修复后官网仍打不开 | 标记为彻底缺失，不再尝试找预决算 |

### 数据更新顺序

1. 先修复 `gov-website-links.ts`（政府官网）
2. 再更新 `fiscal-budget-links.ts`（预决算链接）
3. 两个文件分开 commit 或合并 commit 均可

---

## 输出格式

### 写入数据文件

```typescript
// data/fiscal-budget-links.ts
{ name: "县/区名", url: "https://www.xxx.gov.cn/zwgk/czyjs/" }
```

只有 `fiscalStatus === "confirmed"` 的才能写入。

### 完成报告

每次处理完一个省/市后，输出简短总结：

```
## {省名} 县级预决算链接处理结果

- 总处理数：N 个区县
- 修复政府官网：X 个
- 新增预决算链接：Y 个（confirmed）
- 暂未确认：Z 个
  - 慢站/502: A 个
  - JS 渲染无内容: B 个
  - 官网仍缺失: C 个
```

---

## 数据更新规则

1. **只更新 `url` 字段**，不修改 `name` 或树形结构
2. **不覆盖已有的非空 URL**，除非明确发现现有 URL 是错误的
3. **空字符串 `""` 表示未找到**，保留而非删除节点
4. **URL 格式**：完整含协议，如 `https://www.xxx.gov.cn/zwgk/czyjs/`
5. **TypeScript 编译**：更新后运行 `get_errors` 确认无语法错误
6. **Git 提交**：`feat({省名}): verify gov portals + add N county fiscal budget URLs`

---

## 结论记录：docs/fiscal-site-log.md

对每个省份的查找工作，必须在 `docs/fiscal-site-log.md` 中记录结论，避免重复劳动。

### 记录时机

- 每完成一个地级市的全部区县处理后，立即记录
- 每次 commit 前检查 log 是否已更新

### 记录格式

```markdown
## {省名}

### {市名}（处理日期：YYYY-MM-DD）

| 区县 | 状态 | 说明 |
|------|------|------|
| XX区 | ✅ confirmed | URL: ... |
| XX县 | ❌ gov-dns-fail | 域名不解析，已尝试 gov-site-finder 修复，仍无法找到 |
| XX县 | ❌ WAF-blocked | 同市统一 WAF，fetch_webpage 也失败 |
| XX县 | ❌ no-fiscal-link | 官网可达，首页+2层深入均无预决算链接 |
| XX县 | ⚠️ unconfirmed | 502 暂不可达，待后续重试 |
```

### 状态码含义

| 状态 | 含义 | 是否需要重试 |
|------|------|-------------|
| ✅ confirmed | 已找到并写入 | 否 |
| ❌ gov-dns-fail | 域名不解析且修复失败 | 换日期/换网络重试 |
| ❌ WAF-blocked | WAF 拦截，fetch_webpage 也失败 | 换日期重试 |
| ❌ no-fiscal-link | 官网可达但无预决算栏目 | 一般不重试 |
| ⚠️ unconfirmed | 暂时故障（502/超时） | 是，换日期重试 |

### 用途

- **避免重复探测**：下次处理同省时先读 log，跳过已确认/已排除的县
- **追踪进度**：快速了解每个省的完成度和阻塞点
- **知识传递**：记录 CMS 模式、WAF 规律等，便于后续复用
