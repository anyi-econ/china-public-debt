---
name: fiscal-site-finder
description: "Find Chinese city/county government fiscal budget disclosure (预决算公开) websites and populate data/fiscal-budget-links.ts. USE WHEN: user asks to find fiscal budget URLs, add city/county links, supplement provincial data, or mentions 预决算公开/财政预算/预算决算/财政局 in the context of this project. Also use when checking whether existing URLs are still valid."
---

# Fiscal Budget Site Finder

Locate fiscal budget disclosure (预决算公开) pages for Chinese prefecture-level cities, counties, and districts. Populate results into `data/fiscal-budget-links.ts`.

## Strategy Overview

Finding fiscal budget disclosure pages for Chinese local governments requires combining **generic web discovery** techniques with **domain-specific knowledge** about how Chinese government websites are organized. The strategy below integrates both, ordered by efficiency and reliability.

## Method Priority (High → Low)

### Tier 1: Structured Provincial Platforms (Highest priority)

Some provinces operate centralized fiscal disclosure platforms with machine-readable city/county links. These are gold — **always check first**.

**Why highest priority:** One fetch can yield all city URLs (and sometimes county URLs) for an entire province. The Jiangsu (江苏) platform `yjsgk.jsczt.cn` is the ideal example — all 13 cities and 90+ counties with parameterized URLs.

**How to use:**
1. Check the province's existing `url` field in `fiscal-budget-links.ts`
2. Fetch the provincial page and search for city navigation links
3. Look for patterns: `<area>` image maps, sidebar navigation, tabbed city selectors

**Known working platforms:**
- See `references/experience-log.md` for per-province notes

### Tier 2: Fiscal Bureau Domain Pattern Matching

Most city fiscal bureaus use predictable domain patterns. Try these URL templates in order:

```
http://czj.{city_pinyin}.gov.cn/          # Most common (~60% hit rate)
https://czj.{city_pinyin}.gov.cn/         # HTTPS variant
http://czt.{city_pinyin}.gov.cn/          # Alternative abbreviation
http://cz.{city_pinyin}.gov.cn/           # Short form (e.g., 厦门 cz.xm.gov.cn)
```

**Why Tier 2:** High automation potential — you can batch-check 10+ cities in parallel with simple HTTP HEAD/GET requests. ~60% of cities have a working `czj.{pinyin}.gov.cn` domain.

**Implementation:**
- Use Node.js or PowerShell to batch-check candidate URLs
- Accept a response as valid if: HTTP 200, content length > 500 bytes
- Follow 301/302 redirects once (the redirect target is often the real URL)
- Timeout: 6-8 seconds per request

**Pinyin conventions:**
- Usually full pinyin of the city name without 市: 唐山 → `tangshan`, 张家口 → `zjk`
- Some cities use abbreviations: 石家庄 → `sjz`, 齐齐哈尔 → `qqhr`, 大庆 → `dq`
- Province-ambiguous cities may need qualifiers: 抚州(江西) vs 福州(福建)

### Tier 3: City Government Portal Fiscal Section (Government Site Fallback)

**When no dedicated fiscal bureau site exists — or the fiscal bureau site doesn't have a budget disclosure section — fall back to the city government portal.** This is the **standard fallback path** and applies to a significant proportion of cities (roughly 30-40% of prefecture-level cities nationwide, especially in central/western China).

#### Decision logic: fiscal bureau → government portal

```
1. Try Tier 2 (czj/czt/cz.{pinyin}.gov.cn)
2. If no response or no budget content → try city government portal
3. On the portal, check BOTH direct sub-paths AND homepage link crawling
```

#### Signals that a city needs the government portal fallback:
- All `czj/czt/cz.{pinyin}.gov.cn` HEAD checks return connection errors or 4xx/5xx
- Fiscal bureau site exists but contains no budget keywords (预算/决算/预决算)
- Provinces known for low fiscal bureau hit rates: 吉林, 黑龙江, 湖南, 广西, 云南, 贵州, 西藏, 甘肃, 青海, 宁夏

#### Direct sub-path patterns (try in order):

```
# 政务公开 → 财政相关栏目
http://www.{pinyin}.gov.cn/zwgk/czzj/           # 财政资金
http://www.{pinyin}.gov.cn/zwgk/czxx/           # 财政信息
http://www.{pinyin}.gov.cn/zwgk/czyjsgk/        # 财政预决算公开
http://www.{pinyin}.gov.cn/zwgk/zdly/czzj/      # 重点领域 → 财政资金
http://www.{pinyin}.gov.cn/zwgk/zdlyxxgk/czyjshsgjf/  # 重点领域信息公开 → 财政

# 政府信息公开 → 法定主动公开 → 财政栏目
http://www.{pinyin}.gov.cn/zfxxgk/fdzdgknr/czyjsgk/   # 财政预决算公开
http://www.{pinyin}.gov.cn/zfxxgk/fdzdgknr/czyjs/      # 财政预决算
http://www.{pinyin}.gov.cn/zfxxgk/fdzdgknr/czxx/       # 财政信息
http://www.{pinyin}.gov.cn/zfxxgk/czxx/                # 财政信息（简短路径）

# 信息公开子站
http://xxgk.{pinyin}.gov.cn/                    # 政务公开平台独立子站

# 部门子路径（政府门户下直接挂财政局页面）
http://www.{pinyin}.gov.cn/czj/                 # 财政局子路径
http://www.{pinyin}.gov.cn/bmjd/bm_XXXX/czj/   # 部门集中页 → 财政局
http://{pinyin}.gov.cn/zfxxgk_{abbr}_czj       # 云南等省份特殊路径模式
```

#### Homepage link crawling (Phase 3 strategy):

When direct sub-paths fail, **fetch the city government homepage and extract fiscal-related links**:

1. GET `http://www.{pinyin}.gov.cn/`
2. Parse all `<a>` tags, filter by:
   - Link text contains: 预算/决算/财政/czj/czzj/财务
   - URL domain is `.gov.cn` (not external)
   - URL NOT in domain blacklist (see below)
3. For each matching link, GET and score content for budget keywords
4. Accept the highest-scoring link as the result

#### Content scoring keywords:
- **High value (5 points):** 预决算公开
- **Medium (3 points):** 预算公开, 决算公开, 一般公共预算, 政府性基金预算
- **Low (1-2 points):** 预算, 决算, 财政, 部门预算, 部门决算

#### Domain blacklist (false positive prevention):
URLs containing these domains must be **rejected** — they are national/provincial sites, not city-level:
```
mof.gov.cn         # 国家财政部
www.gov.cn         # 国务院
most.gov.cn        # 科技部
mca.gov.cn         # 民政部
czj.cq.gov.cn      # 重庆财政局（两字母域名冲突）
czj.sh.gov.cn      # 上海财政局
czj.dl.gov.cn      # 大连财政局
czt.ln.gov.cn      # 辽宁省财政厅
jiangxi.gov.cn     # 江西省政府
zwfw.*.gov.cn      # 各省政务服务平台
```

#### Two-letter domain alias collision warning:
Many city pinyin abbreviations collide with provincial or major-city domains:
| Abbreviation | Intended city | Actually resolves to |
|------|------|------|
| `sh` | 绥化市 | 上海市 |
| `cq` | 潜江/庆阳 | 重庆市 |
| `dl` | 大理 | 大连市 |
| `ln` | 陇南 | 辽宁省 |
| `gy` | 固原 | 贵阳市 |
| `hg` | 鹤岗/黄冈 | 互相冲突 |
| `lz` | 柳州/林芝 | 兰州市 |

#### County domain name traps:
Some county domains resolve to completely wrong locations:
| Domain | Expected | Actually resolves to |
|--------|----------|---------------------|
| `xihu.gov.cn` | 杭州西湖区 | 辽宁本溪溪湖区 |
| `wuyi.gov.cn` | 浙江武义县 | 河北衡水市 |

**Rule:** When generating candidate URLs, **avoid two-letter abbreviations that conflict with major cities or provinces**. Only use full pinyin or the city's known official abbreviation.

**Why Tier 3 is critical:** Roughly 30-40% of prefecture-level cities do NOT have a standalone fiscal bureau website. This is the norm in western/central China (云南, 贵州, 西藏, 青海, 甘肃, 宁夏, 广西). The government portal fallback is not an exception — it is a **standard search path**.

### Tier 3B: Municipality District (直辖市区县) URL Discovery

The four municipalities (北京市, 天津市, 上海市, 重庆市) have **districts (区)** instead of prefecture-level cities. District fiscal URLs require a distinct approach since there is no intermediate "city fiscal bureau" — each district's government portal is the primary source.

#### Beijing (北京市)
Beijing's fiscal bureau has a centralized district page at:
```
https://czj.beijing.gov.cn/zwxx/czsj/gqczyjs/index.html
```
This lists all 16 districts with direct links to their budget disclosure pages. **Always check this page first.**

#### Tianjin (天津市)
- No centralized district listing page found on `cz.tj.gov.cn` (JS-heavy, often fails to load)
- Each district government portal has its own unique path structure — **no single pattern works for all**
- Known working patterns:
  ```
  https://www.tjhp.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/     # 和平区
  https://www.tjnk.gov.cn/NKQZF/ZWGK5712/.../czyjs1/     # 南开区 (deeply nested)
  https://www.tjhx.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/    # 河西区
  https://www.tjbh.gov.cn/zw/zfxxgk/fdzdgknr/czyjs/      # 滨海新区
  ```
- District domains follow `www.tj{abbr}.gov.cn` (e.g., `tjhp`, `tjnk`, `tjhx`, `tjbh`)

#### Shanghai (上海市)
- Each district uses completely different URL patterns
- Some use query-string based navigation: `xxgk/portal/article/list?menuType=wgk&code=jcgk_czyjsgk`
- Others use standard paths: `/zwgk/zfxxgk/fd/czyjs/`

#### Chongqing (重庆市)
- Has 38 districts/counties — the most among municipalities
- `czj.cq.gov.cn` is JS-rendered and hard to access via automated tools
- District government portals are the primary search path

#### Key lesson for 直辖市:
The UI component uses "区" (not "市") as the unit label for municipality children. When the fiscal-budget-nav.tsx component shows coverage stats for municipalities, it should say "区 x/y" instead of "市 x/y".

### Tier 3C: Zhejiang Province CMS Column Pattern (col/col{number})

Zhejiang province counties share a unified CMS platform (浙江省政府网站集约化平台). Budget pages use a column-based URL pattern:

```
https://{domain}/col/col{number}/index.html
```

Each county has a unique numeric column ID for its budget page. The ID **cannot be guessed** — it must be discovered from the county's website navigation.

#### Discovery method:
1. Navigate to the county portal → "政务公开" → "法定主动公开内容" or "政府信息公开"
2. Look for "财政信息" or "财政预决算" in the sidebar navigation
3. Extract the `col{number}` from the link URL

#### Common false positives:
- `col1229396854` — This is a **shared news column** (省政府要闻) that appears on many ZJ county sites. **Always reject this column number.** It contains national/provincial news, not budget data.
- Homepage link crawling returns many non-budget columns (公告公示, 要闻, 今日xxx) — only accept links whose anchor text explicitly contains "预决算", "财政预决算", or "财政信息"

#### Hangzhou district domain warnings:
Some Hangzhou districts use non-obvious domain names:
| District | Correct Domain | Trap (wrong) |
|----------|---------------|--------------|
| 上城区 | `www.hzsc.gov.cn` | `shangcheng.gov.cn` (not exist) |
| 西湖区 | `www.hzxh.gov.cn` | `xihu.gov.cn` → 辽宁溪湖区 |
| 滨江区 | `www.hhtz.gov.cn` | `binjiang.gov.cn` (no budget info) |
| 淳安县 | `www.qdh.gov.cn` | `chunan.gov.cn` (not exist) |

**Tip:** Fetch a known Hangzhou district page (e.g., 临安区 `www.linan.gov.cn`) and check the footer — it lists clickable links to all sibling districts with their correct domains.

### Tier 4: Provincial Fiscal Bureau Navigation Pages

Provincial finance departments (省财政厅) often maintain a navigation page listing all subordinate cities' fiscal bureaus.

**How to use:**
1. Navigate to the province's fiscal bureau website (usually `czt.{province}.gov.cn`)
2. Look for: "各市财政" / "下属单位" / "友情链接" sections
3. These usually yield fiscal bureau homepages, not direct fiscal disclosure pages — an extra step is needed to find the 预决算公开 section within each bureau site

**Why Tier 4 (not higher):** Requires crawling the provincial site, which often uses JavaScript-rendered navigation (frames, AJAX). Many provincial pages return minimal HTML without the actual navigation content. Still valuable as a discovery step when Tier 2 fails.

### Tier 5: Fetch Webpage Tool with Targeted Queries

Use the `fetch_webpage` tool to load government websites and look for navigation structures. This handles JavaScript-rendered content better than raw HTTP requests.

**When to use:** When Tier 2 batch-checking returns too many "not found" for a province, fetch the provincial fiscal bureau site or a city government homepage to find navigation links.

### Tier 6: Baidu Search (Fallback)

**When to use:** When all automated methods fail for a specific city. Baidu indexes Chinese government sites better than Google.

**Effective search queries:**
```
{城市名}财政局 预决算公开
{城市名}财政预算决算 site:gov.cn
{城市名}财政局官网
```

**Why lowest priority:** Manual, slow, and doesn't scale. Reserve for individual cities that resist all other methods.

## Workflow

### Phase 1: Batch Discovery (HEAD-first validation)

Use a **two-phase URL validation** approach for efficiency:

1. **Generate candidates**: For each missing city, generate all candidate URLs (Tier 2 + Tier 3 patterns) — typically 40-60 URLs per city
2. **Phase 1 — HEAD check (parallel)**: Run concurrent HEAD requests (30 workers, 3.5s timeout) to quickly filter alive URLs. This eliminates 80-90% of candidates in seconds.
3. **Phase 2 — GET + score (sequential per city)**: Only for alive URLs, fetch content and score for budget keywords.
4. **Phase 3 — Link crawling**: For cities where no sub-path matched, crawl the government homepage for fiscal links.

Script template: `scripts/batch-validate-v3.mjs`

Key design principles:
- **HEAD before GET**: 3s HEAD timeout eliminates dead URLs 10x faster than GET
- **Domain blacklist**: Filter out national/provincial sites that appear in homepage links
- **Content scoring**: Rank results by fiscal keyword density, prefer pages with "预决算公开" in content
- **Source classification**: Tag each result as 财政局官网 / 市政府官网 / 政务公开平台

### Phase 2: Gap Filling
4. For provinces with many failures, try Tier 1 (provincial platform) or Tier 4 (provincial navigation)
5. For remaining individual cities, use `fetch_webpage` for targeted manual investigation
6. For stubborn cases, try Tier 5/6 (Baidu search)

### Phase 3: Data Update
7. Update `data/fiscal-budget-links.ts` with found URLs
8. For each city that gets a URL, create empty county `children` arrays using standard administrative divisions
9. Validate TypeScript compilation (no errors)
10. Git commit and push

## Data File Format

The data file uses this TypeScript structure:

```typescript
interface FiscalRegionNode {
  name: string;
  url: string;
  children?: FiscalRegionNode[];
}
```

Example:
```typescript
{
  name: "江门市",
  url: "http://www.jiangmen.gov.cn/newzwgk/czgk/index.html",
  children: [
    { name: "蓬江区", url: "http://www.pjq.gov.cn/ztzl/zdlyxxgkzl/czyjshsgjfgk/zfyjs/" },
    { name: "江海区", url: "" },
    // ...
  ],
},
```

## County Data

When adding a city, always create county children with empty URLs using the standard administrative divisions (2023 standard). Counties include:
- 市辖区 (districts)
- 县 (counties)
- 县级市 (county-level cities)
- 自治县 (autonomous counties)

Do NOT include: development zones (开发区), high-tech zones (高新区), or other non-standard administrative areas unless they are proper administrative divisions.

## Verification

After updating the data file:
1. Run `get_errors` on `data/fiscal-budget-links.ts` to check for TypeScript errors
2. Spot-check 2-3 URLs by fetching them to confirm they load
3. Compare county lists against known administrative divisions

## Experience Library

Detailed per-province patterns, domain quirks, and failure lessons are tracked in:
→ `references/experience-log.md`

Consult this file when working on a specific province. Update it after each search session with new findings.

## When to Promote Experience to This Skill

A pattern should be promoted from experience-log.md to this main skill when:
1. It has been verified across 3+ provinces or 10+ cities
2. It represents a generalizable strategy (not a one-off exception)
3. It would change the priority ordering of methods

Conversely, if a method here is found unreliable across multiple sessions, demote or annotate it.
