/**
 * 地区要闻导航数据
 *
 * 链接查找优先级：
 * 1. 该地区政府门户网站中的"本地要闻/政务要闻/今日要闻"等稳定栏目列表页
 * 2. 可接受栏目：本地要闻、市县要闻、市级要闻、区县要闻、政务要闻、今日要闻、新闻动态、工作动态等
 * 3. 市级政府仅收录市级要闻栏目，不使用下辖区县要闻或部门动态替代
 * 4. 区县级政府仅收录本区县自身要闻栏目，不使用上级市/省要闻
 * 5. 不使用单篇新闻、专题报道、转载页作为导航入口
 *
 * url 为空字符串表示暂未找到可验证的要闻栏目链接（前端显示灰色"待补充"）
 *
 * 种子策略：首期手工核验 20 个代表性地区，其余等待后续半自动发现。
 * 详见 `docs/news-site-log.md`。
 */

import { buildRegionTree, type RegionUrlMap } from "./region-link-builder";
import type { RegionLinkNode } from "@/components/pages/region-link-nav";

/** 路径键 → 要闻栏目 URL。未列出的地区 url 留空。 */
export const NEWS_SITE_URL_MAP: RegionUrlMap = {
  // ═══════ 已人工核验（v1 种子）═══════
  // —— 省级（直辖市/省/自治区）——
  "北京市": "https://www.beijing.gov.cn/ywdt/yaowen/index.html",              // 北京要闻
  "上海市": "https://www.shanghai.gov.cn/nw2315/index.html",                  // 要闻动态
  "重庆市": "https://www.cq.gov.cn/ywdt/jrcq/",                               // 今日重庆—市级要闻
  "辽宁省": "https://www.ln.gov.cn/web/ywdt/jrln/wzxx2018/index.shtml",        // 今日辽宁
  "吉林省": "https://www.jl.gov.cn/szyw/jlyw/",                               // 吉林要闻
  "黑龙江省": "https://www.hlj.gov.cn/hlj/c107855/news.shtml",                // 龙江要闻
  "江苏省": "https://www.jiangsu.gov.cn/col/col33686/index.html",             // 今日江苏 / 要闻动态
  // —— 地/县级 ——
  "上海市/黄浦区": "https://www.shhuangpu.gov.cn/xw/001001/news_important.html", // 黄浦要闻
  "广东省/广州市": "https://www.gz.gov.cn/xw/gzyw/index.html",                // 广州要闻
  "广东省/深圳市": "https://www.sz.gov.cn/cn/xxgk/yw/index.html",             // 深圳要闻
  // ═══════ 其余 31省 + 27省会门户因动态渲染/访问限制暂未稳定核验，留空待后续补充 ═══════
  // 详见 docs/news-site-log.md
};

export const NEWS_SITE_REGIONS: RegionLinkNode[] = buildRegionTree(NEWS_SITE_URL_MAP);
