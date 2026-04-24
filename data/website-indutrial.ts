/**
 * 惠企政策导航数据
 *
 * 链接查找优先级：
 * 1. 专门的企业服务平台 / 政策兑现平台 / 惠企政策平台（最优先）
 * 2. 营商环境专题 / 涉企政策专栏 / "免申即享""政策直达"等入口
 * 3. 普通营商环境信息公开页（次选）
 * 4. 不使用单篇惠企文件、临时活动页、过期公告
 *
 * 惠企政策入口常常藏在"专题""营商环境""企业服务""政务服务"等栏目下，
 * 不要只看一级导航。
 *
 * url 为空表示暂未核验。详见 `docs/website-indutrial-log.md`。
 */

import { buildRegionTree, type RegionUrlMap } from "./website-region-builder";
import type { RegionLinkNode } from "@/components/pages/website-region-nav";

export const PRO_BUSINESS_URL_MAP: RegionUrlMap = {
  // ═══════ 已人工核验（v1 种子）═══════
  // —— 省级（直辖市/省/自治区）——
  // 北京市：政策兑现专区（企业政策直达平台）
  "北京市": "https://zhengce.beijing.gov.cn/#/home",
  // 上海市：营商环境信息公开（上海门户 jcsfbyshq 专题）
  "上海市": "https://www.shanghai.gov.cn/jcsfbyshq/index.html",
  // 重庆市：优化营商环境专题
  "重庆市": "https://www.cq.gov.cn/zt/yhyshj/",
  // 辽宁省：全面振兴—优化营商环境专题
  "辽宁省": "https://www.ln.gov.cn/web/qmzx/yhyshjzt/index.shtml",
  // —— 地/县级 ——
  // 上海黄浦：企业发展服务平台（通过"专题 → 优化营商环境"进入）
  "上海市/黄浦区": "https://zzcx.shhuangpu.gov.cn/?z9X4StVDmQw6=1777009092213#/",
  // 广州市：优化营商环境专题
  "广东省/广州市": "https://www.gz.gov.cn/ysgz/index.html",
  // —— v3 扩充（省级）——
  // 吉林省：优化营商环境专题
  "吉林省": "http://www.jl.gov.cn/szfzt/jlyhyshjjxs/index.html",
  // 黑龙江省：惠企利民政策问答专题
  "黑龙江省": "https://www.hlj.gov.cn/hlj/hqlmzcwd1118/zl_hqlmzc.shtml",
  // 湖南省：优化营商环境专栏
  "湖南省": "http://www.hunan.gov.cn/topic/yhyshj/index.html",
  // 广东省：粤企政策通（独立惠企政策平台）
  "广东省": "https://sqzc.gd.gov.cn/",
  // 西藏自治区：助企纾困专区（政务服务平台）
  "西藏自治区": "https://www.xzzwfw.gov.cn/helpEnterprises.shtml",
  // —— v3 扩充（省会/副省级城市）——
  // 南昌：优化营商环境专题
  "江西省/南昌市": "http://www.nc.gov.cn/yshj/index.shtml",
  // 济南：优化营商环境专题
  "山东省/济南市": "https://www.jinan.gov.cn/col/col1761/2025nzt/yhyshj/index.html",
  // 西安：西安政策通（独立政策平台，整合营商环境信息）
  "陕西省/西安市": "https://zwfw.xa.gov.cn/policy-web-new/#/",
  // ═══════ 其余地区因动态渲染/访问限制暂未稳定核验，留空待后续补充 ═══════
  // 详见 docs/website-indutrial-log.md
};

export const PRO_BUSINESS_REGIONS: RegionLinkNode[] = buildRegionTree(PRO_BUSINESS_URL_MAP);
