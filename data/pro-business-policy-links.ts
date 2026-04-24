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
 * url 为空表示暂未核验。详见 `docs/pro-business-policy-site-log.md`。
 */

import { buildRegionTree, type RegionUrlMap } from "./region-link-builder";
import type { RegionLinkNode } from "@/components/pages/region-link-nav";

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
  // ═══════ 其余 31省 + 27省会门户因动态渲染/访问限制暂未稳定核验，留空待后续补充 ═══════
  // 详见 docs/pro-business-policy-site-log.md
};

export const PRO_BUSINESS_REGIONS: RegionLinkNode[] = buildRegionTree(PRO_BUSINESS_URL_MAP);
