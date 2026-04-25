# 地区惠企 / 营商 / 产业栏目 — 自动批处理日志

> 数据交付：[`data/website-industrial.xlsx`](../data/website-industrial.xlsx)（3209 行，全部门户）
> Skill：[`.github/skills/industrial-site-from-gov-site/SKILL.md`](../.github/skills/industrial-site-from-gov-site/SKILL.md)
>
> **逐条结果一律入 xlsx**，本日志只记录方法、覆盖率与失败聚类。

---

## 1. 栏目定义与筛选标准（方法论）

收录目标：各级政府门户网站中**面向企业的政策汇编 / 助企服务 / 营商环境 / 产业政策**类专栏入口。

### 可接受栏目名（Tier）

- **Tier A — 综合涉企政策门户**
  惠企政策 / 惠企服务 / 惠企通 / 惠企直达
  政策兑现 / 政策计算器 / 政策直达 / 政策超市
  涉企政策 / 为企服务 / 亲清服务 / 亲清在线 / 政企互动
  助企纾困 / 稳企帮扶 / 援企稳岗

- **Tier B — 营商环境**
  营商环境 / 优化营商环境 / 双招双引 / {地名}营商

- **Tier C — 产业 / 招商**
  产业政策 / 产业发展 / 产业布局 / 产业集群 / 招商引资 / 招商引智

### 与 news/policy 的关键差异
- **大量入口为外部平台跳转**（"政策兑现平台""惠企通"独立域名）→ xlsx 设有"是否外部平台"列，自动按域名比对识别
- **同一地区允许多行**（不同 Tier 并存，最多 3 行）

### 硬拒
工商联 / 行业协会主页（非官方政府渠道） / 12345 / 留言板 / 信访 / 单一办事事项页 / 行政审批总入口 / 招聘 / 党建 / 纪检

---

## 2. v1 全量批处理结果（3209 个政府门户）

### 总体覆盖

| 维度 | 总数 | 命中 | 命中率 |
|---|---|---|---|
| 全部门户 | 3209 | **1059** | **33.0%** |
| 省级 | 31 | 17 | 55% |
| 地级 | 439 | 197 | 45% |
| 县区 | 2739 | 845 | 31% |

> 命中率显著低于 news（55%）的根本原因：**惠企/产业类专栏在县区门户广泛缺位**，许多县区只有部门内部"经济发展局工作动态"等不达标入口。

### 命中分布

| Tier | 数量 | 占命中比 |
|---|---|---|
| Tier A（惠企/政策兑现等） | 593 | 56% |
| Tier B（营商环境） | 394 | 37% |
| Tier C（产业政策） | 72 | 7% |

### 失败构成（2150 条 = 67%）

| 失败原因 | 数量 | 处理建议 |
|---|---|---|
| `no-route-found` | 1948 | 县区门户惠企类专栏缺位为主；需结合外部平台名录补登 |
| `homepage-unreachable` | 202 | 协议切换 / UA 轮换 / Playwright |

---

## 3. 流水线（与 news 完全同构）

```
data/website-gov.ts ─► flatten-gov.ts ─► gov-flat.json
                                    └─► probe-column.ts industrial
                                              └─► industrial-probe-results.json
                                                       └─► build-column-xlsx.mjs industrial
                                                                └─► data/website-industrial.xlsx
```

### 评分关键
- Tier A 文本命中 → 90 分；Tier B → 75；Tier C → 55
- 路径加分：`/hqzc/ /hqfw/ /zcdx/ /zcdd/ /qyfw/ /yshj/ /cyzc/ /cyfz/ /zsyz/`
- 构造路径 14 条（含 `/zwgk/hqzc/`、`/ztzl/yshj/` 等政务公开/专题前缀变体）
- 验证：body 命中 `惠企|涉企|企业|营商|产业|政策`

### 外部平台识别
- 候选 URL 域名 ≠ 政府门户域名（去除 `www.`） → xlsx「是否外部平台」=是，「平台运营主体」记录该外部域名

### 命令

```powershell
$env:COL_CONC="14"
npx tsx scripts/website_management/probe-column.ts industrial
node scripts/website_management/build-column-xlsx.mjs industrial
```

---

## 4. 文件清单

| 路径 | 用途 |
|---|---|
| `scripts/website_management/probe-column.ts` | 通用栏目探针（共用） |
| `scripts/website_management/build-column-xlsx.mjs` | xlsx 输出（共用） |
| `scripts/website_management/industrial-probe-results.json` | 中间结果，可断点续跑 |
| `scripts/website_management/industrial-run.log` | 本次运行日志 |
| `data/website-industrial.xlsx` | **最终交付** |

---

## 5. 下一步（vNext）

1. **外部平台名录补充**：维护一份"政策兑现平台 / 惠企通 / 政策超市"已知域名清单，对 `homepage-unreachable` 失败地区按所在省/市精确补登
2. **county fallback**：1502 个县区缺位中，可降级使用上级地级市的"惠企政策"链接（在 xlsx 备注列标注"借用上级"）
3. **Tier C 升级**：72 条 Tier C 中部分实为"产业经济运行"统计页，需要剔除
4. **首页不可达 202 个**：协议切换 + UA 轮换 + Playwright

---

## 6. 已知样本（仅作 prompt-eval 参考，不入数据）

- 浙江省/杭州市：`亲清在线`（典型 Tier A 外部平台 `qinqing.hangzhou.gov.cn` → 后跳独立域名）
- 江苏省/苏州市：`政策计算器`（Tier A）
- 广东省/深圳市：`深圳市惠企政策`（Tier A）
- 福建省/厦门市：`营商环境专栏`（Tier B）

> 全部地区的命中/未命中明细见 [data/website-industrial.xlsx](../data/website-industrial.xlsx)。
