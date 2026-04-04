# Fiscal Site Finder — Experience Log

Last updated: 2026-04-03

---

## Batch URL Pattern Results

### Domain Pattern Hit Rates (from 97-city scan, 2026-04-03)

| Pattern | Hits | Notes |
|---------|------|-------|
| `czj.{pinyin}.gov.cn` (http/https) | ~55 | Most reliable single pattern |
| `www.{pinyin}.gov.cn/zwgk/czzj/` | ~5 | Works for cities without dedicated fiscal bureau |
| `www.{pinyin}.gov.cn/zwgk/czxx/` | ~2 | Rare variant |
| `czt.{pinyin}.gov.cn` | 0 | Tested but never hit for city-level |
| `cz.{pinyin}.gov.cn` | 2 | Only 厦门(cz.xm) and 三明(cz.sm) |

### Pinyin Abbreviation Patterns

**Common abbreviations (use short form, not full pinyin):**
- 石家庄 → `sjz` (not shijiazhuang)
- 张家口 → `zjk` (not zhangjiakou)
- 秦皇岛 → `qhd` (not qinhuangdao)
- 齐齐哈尔 → `qqhr` (not qiqihaer)
- 大兴安岭 → `dxal`
- 廊坊 → `lf`
- 马鞍山 → `mas`

**Cities using full pinyin:**
- 唐山 → `tangshan`
- 长治 → `changzhi`
- 长春 → `changchun`

**Non-obvious domain conventions:**
- 晋城 → `jcgov` (not jincheng)
- 阳泉 → `yq` (not yangquan)
- 铁岭 → `tl` (not tieling), but conflicts with 铜陵 `tl`
- 济南财政 → `jncz` (prefix pattern: 城市简称+cz)

---

## Per-Province Notes

### 河北省
- Provincial page (`czt.hebei.gov.cn`) uses JavaScript tree navigation — not scrapable with basic HTTP
- Hit rate: 4/11 — 石家庄(known), 唐山, 张家口, 廊坊, 衡水
- Missing: 秦皇岛, 邯郸, 邢台, 保定, 承德, 沧州
- Many Hebei city fiscal bureaus may use non-standard domains or be behind the provincial portal

### 山西省
- Provincial page returns only 77 bytes (redirect, not useful)
- Hit rate: 5/11 — 阳泉, 晋城(jcgov), 长治, 朔州, 临汾
- Missing: 太原, 大同, 忻州, 晋中, 运城, 吕梁
- 晋城 uses unusual domain `czj.jcgov.gov.cn`

### 辽宁省
- Hit rate: 9/14 — 沈阳(known), 大连, 鞍山(gov.cn only), 本溪, 锦州, 营口, 阜新, 辽阳, 盘锦, 葫芦岛, 朝阳(chaoyang.gov.cn — ambiguous with 北京朝阳)
- Missing: 抚顺, 丹东, 铁岭
- 铁岭 czj.tl.gov.cn found in second pass (https)

### 吉林省
- Hit rate: 3/9 — 长春, 辽源, 延边
- Very low hit rate; most cities may publish through provincial platform
- 吉林省 uses `czt.jl.gov.cn/yjs/` — but this appears to be province-level only

### 黑龙江省
- Hit rate: 3/13 — 伊春, 牡丹江(www.mdj.gov.cn), (朝阳 if applicable)
- Extremely low hit rate; many cities likely don't have standalone fiscal bureau sites
- Consider: province may centralize disclosure

### 浙江省
- Already populated with county-level data from previous sessions
- Missing city URLs found: 温州(czj.wenzhou.gov.cn), 嘉兴(czj.jiaxing.gov.cn), 湖州(czj.huzhou.gov.cn)
- 丽水 not found via pattern matching

### 安徽省
- Hit rate: 10/16 — 合肥(known), 蚌埠(www.bengbu.gov.cn/zwgk/czzj/), 淮北, 黄山, 滁州, 铜陵, 池州, 六安, 阜阳, 亳州(www.bozhou.gov.cn/zwgk/czzj/), 宣城
- Missing: 芜湖, 淮南, 马鞍山, 安庆, 宿州
- 蚌埠 and 亳州 use city portal pattern instead of dedicated fiscal bureau

### 福建省
- Provincial platform (`czt.fujian.gov.cn/ztzl/sjyjsgkpt/`) has all city links! (Tier 1 success)
- All 9 cities found via provincial page
- Pattern: `czj.{city}.gov.cn` for most, `cz.{city}.gov.cn` for 厦门 and 三明

### 江西省
- Hit rate: 6/11 — 南昌(www.nc.gov.cn), 景德镇(www.jdz.gov.cn/zwgk/czzj/), 萍乡, 鹰潭, 新余, 吉安, 赣州
- Missing: 九江, 宜春, 上饶, 抚州

### 山东省
- Hit rate: 8/16 — 济南(known), 潍坊, 泰安, 烟台, 日照, 德州, 临沂, 聊城, 威海, 滨州(www.binzhou.gov.cn/zwgk/czzj/)
- Missing: 青岛, 淄博, 枣庄, 东营, 济宁, 菏泽
- Provincial page has SSL issues (not fetchable)

---

## Failure Patterns

### Sites That Block or Timeout
- 梅州 (`meizhou.gov.cn`) — returned 521 error
- 清远 (`gdqy.gov.cn`) — returned 412 Precondition Failed
- 佛山 (`foshan.gov.cn`) — timeout on first try
- 山东省财政厅 — SSL connection failure

### JavaScript-Heavy Sites (Not Scrapable with Basic HTTP)
- 河北省财政厅 — uses TRS tree navigation
- Many provincial platforms render content client-side

### Redirect-Only Responses
- 山西省财政厅 — 77 bytes (redirect page)
- 漳州/南平 fiscal bureaus — redirect to full URL with CMS path
- 湛江 — only 1531 bytes returned

---

## Successful Strategies by Province Type

### Best case: Centralized platform
- 江苏: `yjsgk.jsczt.cn` — parameterized URLs for all cities and counties
- 内蒙古: `czt.nmg.gov.cn/yjs/` — similar parameterized system
- 福建: provincial page has all city fiscal bureau links

### Good case: Standard domain patterns
- 辽宁, 安徽, 福建, 山东: >60% of cities follow `czj.{pinyin}.gov.cn`

### Hard case: No standard patterns
- 吉林, 黑龙江: Very few cities have discoverable fiscal bureau sites
- 河北: Many missing despite being a large province

---

## Guangdong Deep-Dive Results (2026-04-03)

- Provincial page (`www.gd.gov.cn/zwgk/czxx/`) has all 21 city links
- City pages checked for county links: only 茂名 and 江门 had navigable county fiscal sections
- 茂名 county page at `.../czyjshsgjfgk/czyjus/qx/index.html` — 5 counties found
- 江门 page at `.../newzwgk/czgk/index.html` — 7 counties/districts found with fiscal links
- Other 19 cities: no county navigation on their fiscal pages

---

## Update Log

| Date | Action | Details |
|------|--------|---------|
| 2026-04-03 | Initial creation | Based on 97-city batch scan across 10 provinces |
| 2026-04-03 | Guangdong notes | Province + 21 cities + 12 counties |
| 2026-04-04 | Gov portal fallback | Added 3-phase HEAD→GET→link-crawl batch validator; found 33 confirmed URLs for cities without fiscal bureau sites |

---

## Government Portal Fallback — Results (2026-04-04)

### Three-phase batch validation results (77 missing cities):
- Phase 1 HEAD: 11856 URLs → 1039 alive + 897 redirect (156s)
- Phase 2 GET + Phase 3 link crawl: 33 confirmed, 8 likely, 10 false positives, 5 non-budget pages, 21 not found

### Confirmed government portal URLs found:

| Province | City | URL | Source Type |
|----------|------|-----|-------------|
| 河南省 | 南阳市 | `www.nanyang.gov.cn/zdlyxxgk/czzj/` | 市政府官网 |
| 湖北省 | 宜昌市 | `www.yichang.gov.cn/list-62944-1.html` | 市政府官网 |
| 湖北省 | 仙桃市 | `www.xt.gov.cn/xt/czxx/list.shtml` | 市政府官网 |
| 湖北省 | 神农架林区 | `czj.snj.gov.cn/` | 财政局官网 |
| 湖南省 | 衡阳市 | `www.hy.gov.cn/xxgk/zfxxgkml/czyjs/` | 市政府官网 |
| 湖南省 | 益阳市 | `www.yy.gov.cn/col/col1229454672/` | 市政府官网 |
| 湖南省 | 怀化市 | `www.huaihua.gov.cn/czj/c100743/czys.shtml` | 市政府官网 |
| 云南省 | 玉溪市 | `www.yuxi.gov.cn/ (部门预算页)` | 市政府官网 |
| 云南省 | 保山市 | `www.baoshan.gov.cn/bmym/bssczj1/zfxxgkpt.htm` | 市政府官网 |
| 云南省 | 昭通市 | `www.zt.gov.cn/lanmu/zwgk/1136.html` | 市政府官网 |
| 云南省 | 临沧市 | `lincang.gov.cn/zfxxgk_lcs_czj` | 其他官方站点 |
| 云南省 | 楚雄彝族自治州 | `www.chuxiong.gov.cn/zwgk/fdzdgknr/czxx.htm` | 市政府官网 |
| 云南省 | 怒江傈僳族自治州 | `www.nujiang.gov.cn/ (年度预算报告)` | 市政府官网 |
| 云南省 | 迪庆藏族自治州 | `www.diqing.gov.cn/zfxxgk_dqzzf_zczj` | 市政府官网 |
| 广西壮族自治区 | 南宁市 | `nncz.nanning.gov.cn/` | 财政局官网 |
| 广西壮族自治区 | 柳州市 | `lzscz.liuzhou.gov.cn/` | 财政局官网 |
| 广西壮族自治区 | 北海市 | `www.beihai.gov.cn/.../yujuesuangongkai/` | 市政府官网 |
| 广西壮族自治区 | 河池市 | `www.hc.gov.cn/bmjd/bm_100475/czj/` | 市政府官网 |
| 广西壮族自治区 | 崇左市 | `www.chongzuo.gov.cn/.../czxx/` | 市政府官网 |
| 西藏自治区 | 林芝市 | `www.czj.linzhi.gov.cn/` | 财政局官网 |
| 西藏自治区 | 那曲市 | `www.nq.gov.cn/nqzd/nqzwgk/czzj/` | 市政府官网 |
| 甘肃省 | 天水市 | `www.tianshui.gov.cn/zwgk/fdzdgknr/czxx.htm` | 市政府官网 |
| 甘肃省 | 张掖市 | `www.zhangye.gov.cn/czj/index.html` | 市政府官网 |
| 甘肃省 | 庆阳市 | `www.qy.gov.cn/qy/czxx/list.shtml` | 市政府官网 |
| 青海省 | 海东市 | `www.haidong.gov.cn/ (部门预算页)` | 市政府官网 |
| 吉林省 | 吉林市 | `xxgk.jlcity.gov.cn/ (单位预算页)` | 政务公开平台 |
| 吉林省 | 四平市 | `cz.siping.gov.cn/czxx/czysgk/` | 财政局官网 |
| 吉林省 | 通化市 | `www.tonghua.gov.cn/zwgk/czsj/` | 市政府官网 |

### False positive patterns discovered:
Two-letter domain aliases causing cross-city contamination:
- `sh` → 上海 (intended: 绥化)
- `cq` → 重庆 (intended: 潜江)
- `dl` → 大连 (intended: 大理)
- `ln` → 辽宁 (intended: 陇南)
- `gy` → 贵阳 (intended: 固原)

### Provinces with high government portal ratio:
- 云南: 7/13 found via gov portal (54%)
- 广西: 3/9 via gov portal + 2 via fiscal bureau variant
- 甘肃: 3/9 via gov portal
- 湖南: 3/7 via gov portal
- 湖北: 2/7 via gov portal
