---
name: fiscal-site-finder
description: "Find Chinese city/county government fiscal budget disclosure (预决算公开) websites and populate data/website-budget.ts. USE WHEN: user asks to find fiscal budget URLs, add city/county links, supplement provincial data, or mentions 预决算公开/财政预算/预算决算/财政局 in the context of this project. Also use when checking whether existing URLs are still valid."
---

# Fiscal Budget Site Finder

Locate fiscal budget disclosure (预决算公开) pages for Chinese prefecture-level cities, counties, and districts. Populate results into `data/website-budget.ts`.

## Quick Reference

- **Data file**: `data/website-budget.ts` — TypeScript, hierarchical province → city → county
- **Experience log**: `references/experience-log.md` — per-province notes, domain quirks, CMS patterns
- **Script templates**: `scripts/batch-validate-v3.mjs` (city), `scripts/hebei-discover.mjs` (county)
- **Stats**: `scripts/province-stats.mjs`, `scripts/count-gaps.mjs`

---

## Methods Catalog

### M1: Centralized Provincial Platforms
Some provinces expose all city/county fiscal pages under one portal. **One fetch can yield an entire province.**
- Check the province-level `url` field in the data file first
- Look for city selector / image map / tabbed navigation
- Examples: 江苏 `yjsgk.jsczt.cn`, 内蒙古, 宁波

### M2: Domain Pattern Matching (batch HEAD/GET)
Try predictable domain patterns in bulk:

| Target | Common patterns | Hit rate |
|--------|----------------|----------|
| City fiscal bureau | `czj.{pinyin}.gov.cn`, `czt.{pinyin}.gov.cn` | ~55% |
| County government | `www.{pinyin}.gov.cn` | ~30% ⚠️ |

⚠️ **County domain guessing is unreliable** — many counties use abbreviated or non-obvious domains. Always prefer M4 for county domain discovery.

### M3: Fiscal Sub-path Probing
Given a working government domain, try common fiscal page paths:
```
/zwgk/czyjsgk/           # 财政预决算公开
/zfxxgk/fdzdgknr/czyjs/  # 法定主动公开 → 财政预决算
/czyjs/                   # 直接路径
/czysindex.html           # 保定 CMS
/__sys_block__/czyjs.html # 邢台/秦皇岛
/col/col{N}/index.html    # 浙江/承德 col CMS
```

### M4: City Portal County Navigation ⭐
**The most reliable method for discovering county domains.** Prefecture-level city government homepages almost always list subordinate county/district government links.

**Where to find county links:**
1. **Footer**: "县（市、区）政府" / "区县网站" / "市辖区" navigation block
2. **Site map**: 网站地图 page
3. **Bottom link bar**: row of county names with href

**Workflow:**
1. Fetch city homepage (e.g., `http://www.sjz.gov.cn/`)
2. Extract all `*.gov.cn` links matching county/district names
3. Map each link to the correct county in the data file
4. Apply M3 (fiscal sub-paths) on each discovered domain

**Why this beats guessing:** County domains are often surprising (`lpx.gov.cn` = 滦平县, `hbkc.gov.cn` = 宽城县). The city portal gives the authoritative domain directly.

### M5: Homepage Link Crawling
Fetch a homepage, extract all `<a>` tags, filter for fiscal keywords:
- Match text: 预算, 决算, 财政预决算, 预决算公开, czyjs
- Reject: mof.gov.cn, www.gov.cn, provincial portal links

### M6: fetch_webpage
Use for JS-rendered sites. Limit to 4-5 URLs per call. Good for exploring CMS sites with dynamic navigation.

### M7: Search Engines (last resort)
- Baidu: `{地名}财政局 预决算公开 site:gov.cn`
- Bing: `{地名}财政局 预决算公开 site:gov.cn` (via bing.com)
- Google: `{地名}财政局 预决算公开 site:gov.cn` (via google.com)

---

## City-Level Workflow

**Priority: M1 → M2 → M3 → M5 → M6 → M7**

1. Check M1 — centralized provincial platform?
2. Batch domain check (M2) — `czj/czt.{pinyin}.gov.cn`
3. Sub-path probing (M3) — fiscal paths on alive domains
4. Homepage crawling (M5) — for remaining gaps
5. Manual exploration (M6) — JS-heavy sites
6. Update data file, verify, commit

---

## County-Level Workflow

**Priority: M1 → M4 → M3 → M5 → M6 → M7**

County discovery fundamentally differs from city-level: county domains are unpredictable, so **M4 (city portal navigation) is the primary domain discovery method**, not M2 (domain guessing).

### Step 1: Domain discovery via city portals (M4)
For each prefecture city with missing county URLs:
1. Fetch city homepage (one per city)
2. Extract county/district government links from footer/navigation/sitemap
3. Map links to county names in the data file
4. You now have verified domains for most/all counties under that city

### Step 2: Batch fiscal page discovery (M3 + M5)
With verified domains:
1. HEAD-check fiscal sub-paths (6-8 workers, 6-8s timeout)
2. GET alive URLs, score for fiscal keyword density
3. For domains with no fiscal sub-path hit, crawl homepage for links (M5)

### Step 3: Manual exploration (M6)
For counties still missing:
1. Fetch homepage via fetch_webpage
2. Navigate: 政务公开 → 法定主动公开内容 → 财政预决算
3. Check: 专题专栏, 重点领域信息公开, 数据开放 sections
4. Try province/city-specific CMS patterns (see below)

### Step 4: Domain guessing (M2) — only for counties not found in Step 1
Some county links may be missing from city portals. Only then try pinyin guessing, and **always verify the page matches the correct province/city**.

---

## CMS Pattern Reference

| Pattern | Where used | URL example |
|---------|-----------|-------------|
| col/col{N} | 浙江, 承德 | `/col/col1229652717/index.html` |
| columns/{UUID} | 石家庄 CMS | `/columns/83e856a8-.../index.html` |
| __sys_block__ | 邢台, 秦皇岛 | `/__sys_block__/czyjs.html` |
| czysindex.html | 保定系统 | `/czysindex.html` |
| JSP CMS | 邯郸部分 | `/main/newsMore.action?subjectid={N}` |
| info/#/czyjs | 承德部分 | `/info/index.html#/czyjs` |

---

## Domain Traps

County pinyin domains frequently collide across provinces. **Always verify page content matches the intended county.**

| Domain | You want | Actually is |
|--------|----------|-------------|
| `pingshan.gov.cn` | 石家庄平山县 | 辽宁本溪平山区 |
| `funing.gov.cn` | 秦皇岛抚宁区 | 江苏盐城阜宁县 |
| `qingyuan.gov.cn` | 保定清苑区 | 辽宁抚顺清原县 |
| `fuping.gov.cn` | 保定阜平县 | 陕西渭南富平县 |
| `xihu.gov.cn` | 杭州西湖区 | 辽宁本溪溪湖区 |
| `wuyi.gov.cn` | 浙江武义县 | 河北衡水武邑县 |

**Verification checks:**
- Page title / header contains correct 省+市+区/县
- ICP备案号 prefix (冀=河北, 辽=辽宁, 苏=江苏, etc.)
- Footer 主办单位 matches

---

## Data File Format

```typescript
{ name: "省名", url: "省级平台URL(可空)", children: [
  { name: "市名", url: "市级财政预决算URL", children: [
    { name: "县/区名", url: "县级财政预决算URL" },
  ]},
]}
```

## Workflow Completion

After updating the data file:
1. `get_errors` on `data/website-budget.ts` — TypeScript must compile
2. Spot-check 2-3 URLs (especially any from domain guessing)
3. Git commit with descriptive message: `feat(省名): add N county fiscal budget URLs`

## When to Promote to This Skill

A pattern belongs here when:
- Verified across 3+ provinces or 10+ cities
- Represents a generalizable strategy
- Would change method priority ordering

Province-specific details (e.g., ZJ col CMS domain mappings) belong in `references/experience-log.md`.
