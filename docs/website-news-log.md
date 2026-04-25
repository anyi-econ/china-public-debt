# 地区本地要闻栏目 — 自动批处理日志

> 数据交付：[`data/website-news.xlsx`](../data/website-news.xlsx)（3209 行，全部门户）
> Skill：[`.github/skills/news-site-from-gov-site/SKILL.md`](../.github/skills/news-site-from-gov-site/SKILL.md)
>
> **逐条结果一律入 xlsx**，本日志只记录方法演进、覆盖率与失败聚类。

---

## 1. 栏目定义与筛选标准（方法论）

收录目标：各级政府门户网站中**代表本级政府本地综合新闻**的稳定栏目列表页。

### 可接受栏目名（Tier 由高到低）
- **Tier A（最高优先级）**：`{地名}要闻`、本地要闻、本市要闻、本县要闻、政务要闻、今日要闻、要闻速递
- **Tier B**：政务动态、工作动态、政府要闻、综合要闻、综合新闻
- **Tier C（需人工复核）**：新闻中心、要闻、新闻动态（必须验证页面实际内容）

### 层级约束（极易出错）
- **省级**：只收省级要闻；不接受下辖地市要闻聚合
- **地级**：只收市级要闻；**不接受下辖区县要闻**；不接受"部门动态"
- **县区**：只收本级；不接受上级要闻、不接受镇街动态

### 硬拒
部门动态 / 部门信息 / 上级要闻 / 中央要闻 / 国务院要闻 / 省委要闻 / 通知公告 / 公示公告 / 媒体看 X / 媒体聚焦 / 视频新闻 / 图说 / 影像 / 专题 / 镇街动态 / 街道动态 / 单篇文章 URL

---

## 2. v1 全量批处理结果（3209 个政府门户）

### 总体覆盖

| 维度 | 总数 | 命中 | 命中率 |
|---|---|---|---|
| 全部门户 | 3209 | **1765** | **55.0%** |
| 省级 | 31 | 15 | 48% |
| 地级 | 439 | 243 | 55% |
| 县区 | 2739 | 1507 | 55% |

### 命中分布

| Tier | 数量 | 占命中比 |
|---|---|---|
| Tier A | 852 | 48% |
| Tier B | 391 | 22% |
| Tier C（需复核） | 522 | 30% |

### 失败构成（1444 条 = 45%）

| 失败原因 | 数量 | 处理建议 |
|---|---|---|
| `no-route-found`（首页可达，未识别栏目） | 1264 | 子页面下钻 / Tier C 关键词扩充 / Playwright 渲染 |
| `homepage-unreachable`（首页不可达 / WAF / 超时） | 180 | 协议切换、UA 轮换、Playwright 重试 |

---

## 3. 流水线（v1，one-shot）

```
data/website-gov.ts
   └──► flatten-gov.ts                ► gov-flat.json (3209 portals, key/url/level)
              └──► probe-column.ts news (concurrent fetch + score + validate, 缓存可断点续跑)
                       └──► news-probe-results.json
                                └──► build-column-xlsx.mjs news ► data/website-news.xlsx
```

### 评分关键
- Tier A 文本命中 → 90 分；Tier B → 75；Tier C → 55
- 路径加分：`/yw/ /bdyw/ /jryw/ /szyw/ /swyw/ /zwdt/ /gzdt/ /xwzx/ /news/`（+10）
- 文章页 URL（如 `/2024-12/01/` 或 hash 文件名）→ 直接置 -50
- 锚点不足时启用 12 条构造路径作为兜底候选
- 验证：HTML body 命中 `要闻|动态|新闻|今日|政务` 且无 404 / 维护中

### 命令

```powershell
# 1. 展开 gov 数据（一次性）
npx tsx scripts/website_management/flatten-gov.ts

# 2. 探测（断点续跑：保留 results.json；重试缓存中的失败：$env:COL_RETRY="1"）
$env:COL_CONC="14"
npx tsx scripts/website_management/probe-column.ts news

# 3. 输出 xlsx
node scripts/website_management/build-column-xlsx.mjs news
```

---

## 4. 文件清单

| 路径 | 用途 |
|---|---|
| `scripts/website_management/flatten-gov.ts` | 展开 GOV_WEBSITES 为扁平列表 |
| `scripts/website_management/probe-column.ts` | 通用栏目探针（news/industrial 共用） |
| `scripts/website_management/build-column-xlsx.mjs` | 输出标准 xlsx |
| `scripts/website_management/news-probe-results.json` | 中间结果（含失败原因，可断点续跑） |
| `scripts/website_management/gov-flat.json` | 输入扁平列表 |
| `scripts/website_management/news-run.log` | 本次运行日志 |
| `data/website-news.xlsx` | **最终交付** |

---

## 5. 下一步（vNext）

1. **Tier C 复核**：522 条 Tier C 抽样人工核验（多为"新闻中心"/"要闻"等聚合页），升级为 A/B 或剔除并更新"是否需要复核"列
2. **no-route 下钻**：1264 个 `no-route-found` 中地级 196 个、县区 1056 个；在县区门户中聚合页型 `/news/` 居多，需追加二级子分类下钻
3. **首页不可达 180 个**：参考 policy v9.5 流程批量做协议切换 + UA 轮换 + Playwright
4. **种子样例已迁入 xlsx**：原日志中"已验证种子样例"和"代表性地区待复核清单"全部并入 xlsx 行级数据，本日志不再保留

---

## 6. v0 历史（前端导航相关，留作上下文）

- 数据文件：`data/website-news.ts`（前端导航用，仅省/市/部分区县种子数据）
- 前端组件：`components/pages/website-news-nav.tsx` → `components/pages/website-region-nav.tsx`
- 挂载位置：`/news` 页面子菜单 "地区要闻导航"
