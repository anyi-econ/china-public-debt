/**
 * 地区官媒导航数据
 *
 * 链接查找优先级：
 * 1. 省级党报数字版 / 电子报入口（如北京日报、浙江日报、南方日报）
 * 2. 若数字版入口不稳定，可暂用该地区党委机关报 / 省级主流官媒首页作为过渡
 * 3. 市县级入口逐步补充；优先覆盖省会城市、计划单列市与稳定的地市融媒体门户
 *
 * url 为空字符串表示暂未找到可稳定验证的官媒入口（前端显示灰色"待补充"）。
 */

import { buildRegionTree, type RegionUrlMap } from "./website-region-builder";
import type { RegionLinkNode } from "@/components/pages/website-region-nav";

type ProvinceLeaderCollectionUrls = {
  primary?: string;
  secondary?: string;
};

const AUTONOMOUS_REGIONS = new Set([
  "内蒙古自治区",
  "广西壮族自治区",
  "西藏自治区",
  "宁夏回族自治区",
  "新疆维吾尔自治区",
]);

const MUNICIPALITIES = new Set(["北京市", "天津市", "上海市", "重庆市"]);

const PROVINCE_LEADER_COLLECTION_URLS: Record<string, ProvinceLeaderCollectionUrls> = {
  "北京市": {
    primary: "https://www.beijing.gov.cn/gongkai/ldhd/swsj/",
    secondary: "https://www.beijing.gov.cn/gongkai/ldhd/sz/",
  },
  "江西省": {
    primary: "https://jiangxi.jxnews.com.cn/lead/yh/",
    secondary: "https://jiangxi.jxnews.com.cn/lead/yjc/",
  },
  "湖南省": {
    primary: "https://zt.voc.com.cn/portal/topic/special/id/225762",
    secondary: "https://zt.voc.com.cn/portal/topic/special/id/215841",
  },
  "广东省": {
    primary: "https://ld.southcn.com/hkm",
    secondary: "https://ld.southcn.com/node_c562c7dfd1",
  },
  "四川省": {
    secondary: "https://www.sc.gov.cn/10462/c105962s/zfld_list.shtml",
  },
};

function getLeaderTitles(regionName: string): [string, string] | null {
  if (["香港特别行政区", "澳门特别行政区", "台湾省"].includes(regionName)) {
    return null;
  }

  if (MUNICIPALITIES.has(regionName)) {
    return ["市委书记", "市长"];
  }

  if (AUTONOMOUS_REGIONS.has(regionName)) {
    return ["党委书记", "自治区主席"];
  }

  return ["省委书记", "省长"];
}

function attachProvinceLeaderCollections(nodes: RegionLinkNode[]): RegionLinkNode[] {
  return nodes.map((node) => {
    const titles = getLeaderTitles(node.name);
    if (!titles) {
      return node;
    }

    const urls = PROVINCE_LEADER_COLLECTION_URLS[node.name] ?? {};
    return {
      ...node,
      leaderCollections: [
        { label: titles[0], url: urls.primary ?? "" },
        { label: titles[1], url: urls.secondary ?? "" },
      ],
    };
  });
}

export const MEDIA_SITE_URL_MAP: RegionUrlMap = {
  "北京市": "https://bjrb.bjd.com.cn/", // 北京日报
  "天津市": "https://epaper.tianjinwe.com/", // 天津日报电子报
  "上海市": "https://www.shobserver.com/", // 解放日报 / 上观新闻
  "重庆市": "https://epaper.cqrb.cn/", // 重庆日报电子版
  "辽宁省": "https://epaper.lnd.com.cn/lnrbepaper/pc/layout/", // 辽宁日报电子版
  "辽宁省/沈阳市": "https://www.syd.com.cn/", // 沈阳网，站内含沈阳日报数字报入口
  "辽宁省/大连市": "https://www.runsky.com/", // 大连天健网，站内含读报纸/城市网盟入口
  "吉林省": "http://jlrbszb.dajilin.com/", // 吉林日报数字报
  "江苏省": "https://xh.xhby.net/", // 新华日报
  "江苏省/南京市": "https://www.longhoo.net/", // 龙虎网，南京报业系城市新闻门户
  "浙江省": "https://zjrb.zjol.com.cn/", // 浙江日报
  "浙江省/杭州市": "https://www.hangzhou.com.cn/", // 杭州网
  "浙江省/宁波市": "http://www.cnnb.com.cn/", // 中国宁波网，甬派传媒/宁波日报矩阵
  "福建省": "https://mag.fznews.com.cn/", // 福建日报电子版入口
  "福建省/厦门市": "https://epaper.xmrb.com/", // 厦门日报电子报
  "江西省": "https://epaper.jxxw.com.cn/", // 江西日报电子版入口
  "江西省/南昌市": "https://www.ncnews.com.cn/", // 南昌新闻网，集团媒体含南昌日报
  "山东省": "https://paper.dzwww.com/dzrb/", // 大众日报电子版入口
  "山东省/济南市": "https://www.e23.cn/", // 舜网，站内含数字报
  "山东省/青岛市": "https://www.qingdaonews.com/", // 青岛新闻网
  "河南省": "https://newpaper.dahe.cn/", // 河南日报报业集团电子版导航
  "河南省/郑州市": "https://zzrb.zynews.cn/", // 郑州日报数字报
  "湖北省": "https://epaper.hubeidaily.net/", // 湖北日报电子版入口
  "湖北省/武汉市": "https://www.cjn.cn/", // 长江网，站内含长江日报简介/数字报
  "湖南省": "https://epaper.voc.com.cn/hnrb/", // 湖南日报电子版
  "湖南省/长沙市": "https://cswb.icswb.com/", // 长沙晚报数字报
  "广东省": "https://epaper.nfnews.com/nfdaily/", // 南方日报电子版
  "广东省/广州市": "https://www.dayoo.com/", // 大洋网，广州日报大洋网
  "广东省/深圳市": "https://www.sznews.com/", // 深圳新闻网，站内含数字报
  "广西壮族自治区": "http://gxrb.gxrb.com.cn/", // 广西日报数字报刊
  "四川省": "https://epaper.scdaily.cn/", // 四川日报电子版
  "贵州省": "https://szb.eyesnews.cn/", // 贵州日报数字版入口
  "贵州省/贵阳市": "https://www.gywb.cn/", // 贵阳网 / 贵阳日报传媒矩阵
  "云南省": "https://yndaily.yunnan.cn/", // 云南日报电子版入口
  "云南省/昆明市": "https://www.kunming.cn/", // 昆明信息港
  "陕西省": "https://esb.sxdaily.com.cn/", // 陕西日报电子版入口
  "陕西省/西安市": "https://www.xiancn.com/", // 西安新闻网，站内含西安日报/西安晚报数字报
  "青海省": "http://epaper.tibet3.com/", // 青海日报电子版入口
  "甘肃省/兰州市": "https://www.lzbs.com.cn/", // 兰州新闻网，兰州日报社主办
  "海南省/海口市": "http://www.hkwb.net/", // 海口网，站内含海口日报数字报
  "宁夏回族自治区/银川市": "http://www.ycen.com.cn/", // 银川新闻网，银川市新闻传媒中心数字报刊
  "黑龙江省/哈尔滨市": "http://www.my399.com/", // 哈尔滨新闻网
  "河北省/石家庄市": "http://www.sjzdaily.com.cn/", // 石家庄新闻网
  "山西省/太原市": "https://www.tynews.com.cn/", // 太原新闻网
  "安徽省/合肥市": "http://www.hf365.com/", // 合肥在线
  "内蒙古自治区/呼和浩特市": "https://www.nmgnews.com.cn/", // 内蒙古新闻网，先作自治区主流党媒兜底
};

export const MEDIA_SITE_REGIONS: RegionLinkNode[] = attachProvinceLeaderCollections(
  buildRegionTree(MEDIA_SITE_URL_MAP),
);