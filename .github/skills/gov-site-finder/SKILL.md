---
name: gov-site-finder
description: "Find Chinese province/city/county official government portal websites (政府门户网站) and populate data/website-gov.ts. USE WHEN: user asks to find government portal URLs, add city/county government websites, supplement gov portal data, or mentions 政府门户/政府官网/人民政府网站 in the context of this project. Also use when checking whether existing government portal URLs are still valid."
---

# Government Portal Site Finder

Locate official government portal websites (政府门户网站/人民政府官网) for Chinese provinces, prefecture-level cities, counties, and districts. Populate results into `data/website-gov.ts`.

> **This skill is for government portals only.** For fiscal budget disclosure pages (财政预决算公开), use the `fiscal-site-finder` skill instead. Do NOT extract portal URLs by backtracking from fiscal bureau URLs — those are different sites.

## Quick Reference

- **Data file**: `data/website-gov.ts` — TypeScript, hierarchical province → city → county
- **Interface**: `GovWebsiteNode { name: string; url: string; children?: GovWebsiteNode[] }`
- **Export**: `GOV_WEBSITES: GovWebsiteNode[]`
- **Stats script**: `scripts/extract-gov-urls.mjs` (initial population from fiscal domains)

---

## Core Principle: Hierarchical Drill-Down

Government portals in China form a natural hierarchy. **Parent government sites almost always link to all direct children.** This is the primary discovery strategy:

```
Province portal  →  links to all prefecture city portals
City portal      →  links to all county/district portals
```

This is fundamentally different from the fiscal-site-finder approach. We do NOT guess domains or probe sub-paths. We navigate the official government link hierarchy.

---

## Methods Catalog

### G1: Province Portal Navigation (provinces → cities) ⭐
Every provincial government portal has a page listing all prefecture-level city government links.

**Where to find city links on a province portal:**
1. **Footer**: "市(州)政府" / "地市政府网站" link section
2. **Site map** (网站地图): comprehensive link list
3. **"各市政府"** or **"下辖市州"** dedicated page
4. **Government services** (政务服务): regional selector

**Workflow:**
1. Open province portal (well-known URL, all 34 are populated)
2. Locate the "市(州)政府网站" or equivalent section
3. Extract all city government URLs
4. Map to city names in data file

**Coverage per province**: Typically 100% of cities found this way.

### G2: City Portal Navigation (cities → counties) ⭐
Prefecture-level city government portals list all subordinate county/district government links.

**Where to find county links on a city portal:**
1. **Footer**: "县(市、区)政府" / "区县政府网站" navigation block
2. **Bottom link bar**: row of county/district names with hrefs
3. **Site map** (网站地图)
4. **Regional overview page** (行政区划)

**Workflow:**
1. Open city portal URL (from G1 or existing data)
2. Locate subordinate government links section
3. Extract all county/district government portal URLs
4. Map to county names in the data file

**Expected yield**: 80–100% of counties found per city.

### G3: fetch_webpage for JS-Rendered Sites
Some portals load their link sections dynamically. Use `fetch_webpage` to get rendered HTML.

**When to use:**
- G1/G2 returned HTML without county/city links
- Links section is in an `<iframe>` or loaded via AJAX
- Site uses React/Vue/Angular SPA

**Limit**: 4–5 URLs per call. Parse the rendered HTML for `*.gov.cn` links.

### G4: Search Engine Discovery (for gaps)
When G1/G2 fail to find a specific city or county portal:

- **Baidu**: `{地名} 人民政府 site:gov.cn`
- **Bing**: `{地名} 人民政府 官网`
- **Google**: `{地名} 人民政府 site:gov.cn`

**Verification required**: Government names are not unique across provinces (e.g., multiple 永安市). Always verify the result matches the correct province/city.

### G5: Administrative Division Pattern Matching (supplementary)
Government portal domains follow semi-predictable patterns:

| Level | Common pattern | Reliability |
|-------|---------------|-------------|
| Province | `www.{province}.gov.cn` | ~95% |
| City | `www.{city-pinyin}.gov.cn` | ~60% |
| County | `www.{county-pinyin}.gov.cn` | ~30% |

⚠️ **Domain guessing is unreliable for counties.** Many use abbreviated or combined pinyin (`hbkc.gov.cn` = 宽城县, `lpx.gov.cn` = 滦平县). Only use this as a last resort, and always verify.

### G6: Baidu Baike / Wikipedia Verification
Baidu Baike (百度百科) articles for counties and cities almost always include the official government website URL.

**When to use**: To verify a URL found via G4/G5, or to find a URL when all other methods fail.

**Workflow:**
1. Search: `{地名} 百度百科`
2. Check the "政府驻地" / "政府网站" field in the info box
3. Cross-reference with existing data

---

## Province-Level Workflow

All 34 provinces are pre-populated with well-known portal URLs. No discovery needed.

If verification is requested:
1. HEAD-check each province portal URL
2. For 3xx redirects: update to the redirected URL
3. For failures: search for updated URL via G4

---

## City-Level Workflow

**Priority: G1 → G3 → G4 → G5**

### Step 1: Batch discovery via province portals (G1)
For each province with missing city URLs:
1. Fetch province portal homepage
2. Locate city government links (footer, site map, or dedicated page)
3. Extract and map all city portal URLs
4. Record cities not found

### Step 2: JS-rendered sites (G3)
For province portals where Step 1 yielded no links:
1. Use `fetch_webpage` to get rendered HTML
2. Look for dynamic link sections
3. Extract city portal URLs

### Step 3: Remaining gaps (G4 + G5)
For cities still missing:
1. Try `www.{pinyin}.gov.cn` pattern (G5)
2. Search engine fallback (G4)
3. Verify every URL matches the correct city

---

## County-Level Workflow

**Priority: G2 → G3 → G4 → G6 → G5**

### Step 1: Batch discovery via city portals (G2)
For each city with missing county URLs:
1. Fetch city portal homepage (URL must be known first)
2. Locate county/district government links
3. Extract and map all county portal URLs
4. Record counties not found

### Step 2: JS-rendered / iframe links (G3)
For city portals where Step 1 yielded no links:
1. Use `fetch_webpage` to render the page
2. Look for dynamically loaded county link sections
3. Extract county portal URLs

### Step 3: Search + Baike (G4 + G6)
For counties still missing:
1. Search: `{县名} 人民政府 site:gov.cn`
2. Verify via Baidu Baike info box
3. Cross-reference province/city to avoid false matches

### Step 4: Domain guessing (G5) — last resort only
Only when G2–G4/G6 fail. Always verify:
- Page title contains correct 省+市+区/县
- ICP备案号 prefix matches province (冀=河北, 辽=辽宁, etc.)
- Footer 主办单位 matches

---

## Verification Checklist

Government portals are prone to domain collisions and redirects. **Every URL must pass these checks:**

1. **Responds**: HTTP 200 or 301/302 → follow redirect
2. **Correct entity**: Page title or header contains the intended 地名 + "人民政府"
3. **Correct level**: A county URL should be for the county, not its parent city
4. **Not a sub-site**: Reject URLs like `{county}.{city}.gov.cn/` if they redirect to the city portal
5. **ICP match**: 备案号 province prefix matches (京=北京, 沪=上海, 冀=河北, etc.)

| Province | ICP prefix | Province | ICP prefix |
|----------|-----------|----------|-----------|
| 北京 | 京 | 河北 | 冀 |
| 天津 | 津 | 山西 | 晋 |
| 上海 | 沪 | 辽宁 | 辽 |
| 重庆 | 渝 | 吉林 | 吉 |
| 江苏 | 苏 | 浙江 | 浙 |
| 安徽 | 皖 | 福建 | 闽 |
| 江西 | 赣 | 山东 | 鲁 |
| 河南 | 豫 | 湖北 | 鄂 |
| 湖南 | 湘 | 广东 | 粤 |
| 广西 | 桂 | 海南 | 琼 |
| 四川 | 川/蜀 | 贵州 | 黔/贵 |
| 云南 | 滇/云 | 西藏 | 藏 |
| 陕西 | 陕 | 甘肃 | 甘/陇 |
| 青海 | 青 | 宁夏 | 宁 |
| 新疆 | 新 | 内蒙古 | 蒙 |
| 黑龙江 | 黑 | 香港 | — |
| 澳门 | — | 台湾 | — |

---

## Common Pitfalls

### Domain Collisions
County names repeat across provinces. The same pinyin domain may belong to a different province:

| Domain | Multiple matches |
|--------|-----------------|
| `tongshan.gov.cn` | 江苏铜山 vs 湖北通山 |
| `fengxian.gov.cn` | 上海奉贤 vs 陕西凤县 |
| `lushan.gov.cn` | 江西庐山 vs 河南鲁山 |

**Always verify province match** before recording a URL.

### Redirect Traps
- Some county sites redirect to city-level portals → reject these
- HTTP → HTTPS redirects are fine → record the HTTPS version
- Domain change redirects → record the new domain

### Stale URLs
Government sites reorganize. If a URL returns 4xx/5xx:
1. Try with/without `www.` prefix
2. Try both `http://` and `https://`
3. Search for the current URL via G4

---

## Data File Format

```typescript
{ name: "省名", url: "省级门户URL", children: [
  { name: "市名", url: "市级门户URL", children: [
    { name: "县/区名", url: "县级门户URL" },
  ]},
]}
```

URL rules:
- Include trailing slash: `https://www.beijing.gov.cn/`
- Use HTTPS when available
- Empty string `""` for unknown URLs (shown as greyed out in the UI)

---

## Workflow Completion

After updating the data file:
1. `get_errors` on `data/website-gov.ts` — TypeScript must compile
2. `npx next build` must succeed
3. Spot-check 3–5 URLs via `fetch_webpage` or HEAD check
4. Git commit: `feat(gov-portals): add N city/county government portal URLs for {province}`

---

## Batch Processing Strategy

When filling in URLs for an entire province:
1. Start with the province portal → extract all city URLs (G1)
2. For each city with a known URL → extract all county URLs (G2)
3. Group remaining gaps by city, then apply G3/G4/G6 per city
4. Commit per-province for clean git history

**Rate limiting**: When using `fetch_webpage`, space requests. Process one city at a time to avoid overwhelming servers.

**Progress tracking**: Use the county count in the UI (website-gov-nav.tsx displays coverage stats) to measure progress after each commit.
