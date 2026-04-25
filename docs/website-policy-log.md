# 地区政策公开入口补录日志

> 结构化明细（每条 URL、来源、失败原因、候选 URL、分数、`listLooks`）已迁移到 [data/website-policy.xlsx](../data/website-policy.xlsx)。本文件只保留 xlsx 难以表达的判断口径、阶段结论和后续策略。

## 0. 当前覆盖概览（v10）

截至 v10，`POLICY_URL_MAP` 覆盖 **2834** 条：

| 维度 | 已覆盖 | 总数 | 说明 |
| --- | ---: | ---: | --- |
| 省级 | 31 | 31 | 已补齐 |
| 省会城市 | 27 | 27 | 已补齐 |
| 地级市（含省会） | 405 | 439 | 约 92% |
| 县区 | 2398 | 2742 | 约 87% |
| 总计 | 2834 | 3209 | 约 88% |

当前仍缺 **375** 条，集中于湖南、58​、河北、33​、四川、32​、黑龙江、28​、安徽、24​、江西、24​、湖北、23​、青海 19 等。这些缺口不是单一问题，而是不同类型政府门户的信息公开组织方式差异造成的。

## 1. 政策公开入口的主要类型

### 1.1 A 类：可检索政策库 / 文件库（最优）

典型名称：`政策文件库`、`找政策`、`政策检索`、`规范性文件库`、`政府文件库`。

特点：通常有筛选、搜索或统一发布列表，是最稳定、最适合研究使用的入口。优先级最高。

### 1.2 B 类：政策文件 / 政府文件列表

典型名称：`政策文件`、`政府文件`、`省政府文件`、`市政府文件`、`行政规范性文件`、`政策法规`。

特点：不是完整政策库，但能直接列出本级政策文件。若 A 类不存在，采用 B 类。

### 1.3 C 类：政府信息公开目录中的政策栏目

典型路径：`zfxxgk`、`xxgk`、`zwgk`、`openness`、`public/column`。

特点：政策文件没有单独一级路由，而是挂在“政务公开 / 政府信息公开 / 法定主动公开内容”体系下。若能定位到政策子栏目，则写政策子栏目；若点击后由前端动态加载政策内容、没有稳定子路由，则 v9 允许填写上一级“政务公开 / 政府信息公开”入口。

### 1.4 D 类：母级复用 / 共享政策库

一些县区首页明确把“政策文件库”链回市级或省级统一平台。此时本级没有独立库，但用户从县区入口点击到母级政策库是官方路径。v8 起允许写入母级已收录 URL，并在注释中标记 `shared from "母级 key"`。

### 1.5 E 类：手工补录 / WAF 站点

湖北、甘肃等省级入口曾被 HTTP probe/WAF 拒抓，但人工确认存在稳定入口。此类以“手工补录”标记，保留来源说明。

## 2. 找不到的主要原因

剩余缺口大致分为以下几类：

1. **首页不暴露政策或公开入口**：首页 HTML 与 Playwright 渲染后仍没有可识别的 `政策` / `政务公开` 锚点；常见于极简门户或导航完全由异步接口注入的站点。
2. **WAF / UA 拦截**：省、市、县门户能在浏览器访问，但脚本请求或 headless browser 仍被拦截。此类不能简单判定不存在。
3. **只有窄页，不是目录页**：候选命中“公开指南”“年度报告”“依申请公开”“财政预决算”“政府采购”“单篇文章”等。v9 之后明确排除这些窄页，避免把非政策公开入口写入地图。
4. **旧 CMS / 跳首页 / 空壳页面**：候选 URL 看似为 `zwgk` / `xxgk`，但实际跳首页、空页面或 404。
5. **跨域但不可验证为母级复用**：候选跳到外部平台或中央/省级泛入口，且没有明确对应的已收录母级 URL，因此不自动写入。

## 3. 方法演进

### v6：静态探测 + listLooks

初始自动探测要求 `score >= 55` 且页面像列表页（日期数量或“共 N 条”）。该策略保守但漏掉大量 JS 渲染列表页。

### v7：放宽强关键词候选

对 `score >= 80` 或命中典型政策路径（`zcwj`、`gfxwj`、`policycontent` 等）的候选放宽 `listLooks` 要求，覆盖提升到 1283 条。

### v8：跨域复用 + Playwright

加入两类策略：

- 子级明确链回母级政策库时复用母级 URL；
- 对 SPA/WAF 可疑站点用 Playwright 渲染后再抽取链接。

覆盖提升到 1578 条。Playwright 对纯 SPA 有帮助，但对“首页根本不暴露政策入口”的站点收益有限。

### v9：政务公开兜底

根据人工判断口径：若本级没有单独政策公开路由，且政策内容由“政务公开 / 政府信息公开”页面点击后动态加载，可填写该政务公开路由。v9 因此引入 `probe-disclosure-fallback.ts`，接受稳定的 `zwgk` / `zfxxgk` / `xxgk` / `openness` / `public` 路由，同时排除公开指南、年度报告、依申请公开、财政预决算、政府采购和单篇文章等窄页。

v9 首轮重滤后接受约 550 条，覆盖提升到 2128 条。

2026-04-26 增量轮：重新生成 `missing-policy.json`（1081 条）后重跑 `probe-disclosure-fallback.ts`。脚本默认重试此前缓存的 `homepage-unreachable` / `error:*` 临时失败项，三轮迭代如下：

| 轮次 | targets | already done | retry cached fetch failures | picked | 说明 |
| --- | ---: | ---: | ---: | ---: | --- |
| 1 | 1081 | 150 | 931 | 655 | 首次重试此前锁定的 931 个临时抓取失败 |
| 2 | 1081 | 926 | 155 | 657 | 继续重试剩余临时失败，新增 2 个 picked |
| 3 | 1081 | 930 | 151 | 658 | 再新增 1 个 picked |

再经 `emit-disclosure-fallback.ts` 过滤窄页后接受 **649** 条，全部并入 [data/website-policy.ts](../data/website-policy.ts) 的 v9 兜底（增量）区块，覆盖从 2128 提升至 **2777**，剩余缺口 432。

这也说明此前 900+ `homepage-unreachable` 主要是并发抓取下的临时 fetch 失败缓存，不代表政府门户本身长期不可访问；修复 `shouldRetry` 后一次重跑即收回大半缺口。

### v9.5：协议修正 + 手工补全 + 扩展路径枚举

2026-04-26 后期。以 [data/website-gov.xlsx](../data/website-gov.xlsx) `判断依据` 列为准，识别出 **76 个需协议切换** 的政府门户（诛塭「协议切换→http」与「协议切换→https」两类）。剧本化修正流程：

1. `apply-protocol-switch.mjs` — 按 host 将 [data/website-gov.ts](../data/website-gov.ts) 中 76 条 URL 切换到正确协议。
2. `apply-protocol-switch-policy.mjs` — 同 host 在 [data/website-policy.ts](../data/website-policy.ts) 的页面 URL 同步切换（同一域名内页与首页协议必须一致），共修 44 条。
3. `invalidate-protocol-switch-cache.mjs` — 清除 `policy-disclosure-fallback-results.json` 中 host 在切换集合的缓存记录（并发下的错误会锁定老协议url结果），本轮清除 36 条。
4. 重跑 `probe-disclosure-fallback.ts`：picked 30/432 → emit 过滤后接受 **21**，merge 后覆盖 2777 → 2798。
5. 手工补全：青海省 `http://www.qinghai.gov.cn/xxgk/1/`，四川省/成都市 `https://www.chengdu.gov.cn/cdsrmzf/c165075/zcwjk.shtml`。省级、省会覆盖都完成 31/31、27/27。
6. 扩展路径枚举：从已收录条目中挖出高频路径（`/zwgk/zcwj/`、`/zwgk/zcwjk/`、`/ztzl/zcwjk/`、`/zfxxgk/zfwj/`、`/zfxxgk/fdzdgknr/zfwj/`、`/policy-find/` 等）并入 `constructedCandidates`。`invalidate-no-route-cache.mjs` 作废原 `no-disclosure-route` 缓存 276 条，重跑 picked 15/410 → emit 接受 **6**，merge 后覆盖 2798 → **2805**。

v9.5 后剩余 404 条，集中在 湖南 / 河北 / 四川 / 湖北 / 安徽 5 省的县区。Playwright 重跑在当前缺口集上未产生新接受条目（lowConf 38，rejected 306），表明这些站点不是 SPA 渲染问题而是首页本来就不暴露任何可识别的公开/政策错点。

### v10：省域 CMS 模板枚举

思路：在同一省内，县区门户多为同一“省级统一站群”模板。可以从同省已收录的条目中提取高频路径，逐个拼到缺失县区的门户 host 上，HTTP 抓取 + 标题/正文关键词验证。

- `probe-template-enum.ts`：以同省高频 path Top 25 为模板，对 14 个高密度缺口省的 336 个县区/地级市门户逐个进行候选判断。
- `emit-template-enum.mjs`：后置过滤单篇文章、首页返跳、公开指南等窄页。
- 结果：picked **30/336**，过滤后接受 **29**，merge 后覆盖 2805 → **2834**，县区 2372 → 2398。

该路径在原本 湖南 / 安徽 / 湖北 / 高频县区上还是能拿到一些，但边际收益递减：高密度缺口省的县区必须同时满足“采用同省主流 CMS” + “顶级 path 已收录”，仅这两点在缺口中概不过 10%；其余多是独站 / 另套 CMS / 唯中心列表页路径。

## 4. 文件与命令

- 主数据：[data/website-policy.ts](../data/website-policy.ts)
- 结构化说明：[data/website-policy.xlsx](../data/website-policy.xlsx)
- 当前缺口：[missing-policy.json](../missing-policy.json)
- 兜底探测：`npx tsx scripts/website_management/probe-disclosure-fallback.ts`
- 兜底结果重滤：`npx tsx scripts/website_management/emit-disclosure-fallback.ts`
- xlsx 重建：`node scripts/website_management/build-policy-xlsx.mjs`

## 5. 后续策略

1. 剩余 375 条中的“低密度省 + 独立 CMS”县区需人工逐个打开门户看导航，自动化边际收益已明显递减。
2. 对 [data/website-policy.xlsx](../data/website-policy.xlsx) 的 `missing` 工作表按省筛选，优先处理地级市（34 条），再处理县区。
3. WAF / 长期不可达的站点不再重试，转人工浏览器确认 + 手工写入。
4. 考虑增加 `verify-existing.ts` 定期检查已收录的 2834 条是否 404 / 跳首页 / 改版，覆盖到 88% 后维护比扩张重要。
