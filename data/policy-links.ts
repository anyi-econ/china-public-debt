/**
 * 地区政策导航数据
 *
 * 链接查找优先级：
 * 1. 同一地区如同时存在"政策文件列表"与"找政策/政策检索/政策服务"，优先采用
 *    可检索、可筛选、面向政策查询的入口
 * 2. 可接受栏目：政策文件、政策法规、行政规范性文件、规范性文件、政府文件、
 *    找政策、政策查询、政策服务、政策库、政策文件库等
 * 3. 市级优先政府门户下的综合政策入口，其次才使用单一部门文件
 * 4. 不使用单篇文件、废止库、短期专题页
 *
 * url 为空表示暂未核验。详见 `docs/policy-site-log.md`。
 */

import { buildRegionTree, type RegionUrlMap } from "./region-link-builder";
import type { RegionLinkNode } from "@/components/pages/region-link-nav";

export const POLICY_URL_MAP: RegionUrlMap = {
  // ═══════ 已人工核验（v1 种子）═══════
  // —— 省级（直辖市/省/自治区）——
  // 北京市："找政策"（可检索，按 prompt 优先级高于普通文件列表）
  "北京市": "https://www.beijing.gov.cn/zhengce/zcdh?token=4260&adx=&asmzq=&type=1",
  // 重庆市政府文件（政府信息公开目录下省级政府文件）
  "重庆市": "https://www.cq.gov.cn/zwgk/zfxxgkml/szfwj/",
  // 辽宁省政府政策文件库（可检索）
  "辽宁省": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml",
  // 吉林省政策信息
  "吉林省": "https://www.jl.gov.cn/zcxx/",
  // 黑龙江省政府文件库（可检索）
  "黑龙江省": "https://www.hlj.gov.cn/hlj/c108371/zfxxgk_search.shtml",
  // 江苏省最新文件（省政府/省政府办公厅发文列表）
  "江苏省": "https://www.jiangsu.gov.cn/col/col84242/index.html",
  // —— 地/县级 ——
  "上海市/黄浦区": "https://www.shhuangpu.gov.cn/zw/009001/009001002/009001002003/009001002003001/specification.html",
  // 广州市政策文件库（支持主题/文号/发文机关检索）
  "广东省/广州市": "https://www.gz.gov.cn/gzzcwjk/index.html",
  // 深圳市规范性文件查询
  "广东省/深圳市": "https://www.sz.gov.cn/szsrmzfxxgk/zc/gfxwj/szfgfxwj/",
  // —— v3 扩充（省级）——
  "广东省": "http://www.gd.gov.cn/zwgk/wjk/",                                 // 省政府文件库
  "湖南省": "https://www.hunan.gov.cn/hnszf/xxgk/wjk/szfwj/wjk_glrb.html",    // 文件库—省政府文件
  "海南省": "https://www.hainan.gov.cn/hainan/zfwj/szfzcwj.shtml",            // 省政府政策文件
  "云南省": "https://www.yn.gov.cn/zwgk/zcwj/",                               // 政策文件
  "宁夏回族自治区": "https://www.nx.gov.cn/zwgk/qzfwj/",                      // 区政府文件
  "新疆维吾尔自治区": "https://www.xinjiang.gov.cn/xinjiang/zfl/zfxxgk_zhengce_list.shtml", // 政策
  // —— v4 扩充（省级：直辖市 + 福建）——
  "上海市": "https://www.shanghai.gov.cn/nw11494/index.html",                 // 市政府信息公开目录（含市政府规章/文件/规划纲要等）
  "福建省": "https://www.fujian.gov.cn/zwgk/zxwj/szfwj/",                     // 省政府文件
  // —— v3 扩充（省会/副省级城市）——
  "江西省/南昌市": "https://www.nc.gov.cn/ncszf/gfxwjtyfbpt/zcwjk.shtml",     // 政策文件库
  "湖北省/武汉市": "https://www.wuhan.gov.cn/zwgk/?channelid=26315",          // 政策
  "西藏自治区/拉萨市": "https://www.lasa.gov.cn/lasa/wjzl/common_list.shtml", // 文件资料
  "陕西省/西安市": "https://www.xa.gov.cn/gk/zcfg/",                          // 政策法规
  "宁夏回族自治区/银川市": "https://www.yinchuan.gov.cn/xxgk/zcwj/xzgfxwj/",  // 规范性文件
  "新疆维吾尔自治区/乌鲁木齐市": "https://www.wlmq.gov.cn/wlmqs/c119064/zfxxgk_list.shtml", // 政府文件
  "辽宁省/沈阳市": "https://www.shenyang.gov.cn/zwgk/zcwj/zfwj/",             // 政府文件
  // —— v4 扩充（省会/市级）——
  "福建省/福州市": "http://www.fuzhou.gov.cn/zwgk/zxwj/szfwj/",               // 市政府文件
  // ═══════ 其余地区因动态渲染/访问限制暂未稳定核验，留空待后续补充 ═══════
  // 详见 docs/policy-site-log.md
};

export const POLICY_REGIONS: RegionLinkNode[] = buildRegionTree(POLICY_URL_MAP);
