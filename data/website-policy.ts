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
 * url 为空表示暂未核验。详见 `docs/website-policy-log.md`。
 */

import { buildRegionTree, type RegionUrlMap } from "./website-region-builder";
import type { RegionLinkNode } from "@/components/pages/website-region-nav";

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
  // —— v5 扩充（基于政府官网下钻：5 个并行 subagent + fetch_webpage）——
  // 省级（11 个）
  "天津市": "https://www.tj.gov.cn/zwgk/zcwjk/",                              // 政策文件库（可检索）Tier A
  "河北省": "https://www.hebei.gov.cn/columns/49f13cc2-db03-4d0c-b4fe-2f3f659d3b6e/index.html", // 政策（政府文件列表）Tier B
  "山西省": "https://www.shanxi.gov.cn/zcwjk/",                               // 政策文件省级服务平台 Tier A
  "浙江省": "https://www.zj.gov.cn/col/col1544911/index.html",                // 法规文件 Tier B
  "安徽省": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771",           // "我要找政策" Tier A
  "江西省": "http://xzgfxwjk.jiangxi.gov.cn/",                                // 省级规章规范性文件发布平台 Tier A
  "河南省": "https://www.henan.gov.cn/zwgk/fgwj/szfl/",                       // 省政府令 Tier B
  "广西壮族自治区": "http://www.gxzf.gov.cn/zfwj/",                           // 政府文件 Tier B
  "西藏自治区": "https://www.xizang.gov.cn/zwgk/xxfb/zfwj/",                  // 政府文件 Tier B
  "贵州省": "https://www.guizhou.gov.cn/ztzl/zcwjk/",                         // 政策文件库 Tier A
  "陕西省": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/",                       // 省政府政策文件库（可检索）Tier A
  // 省会 / 副省级（15 个）
  "河北省/石家庄市": "https://www.sjz.gov.cn/columns/3ec31d57-6be5-4350-ad03-6e5801a534eb/index.html", // 政策文件库 Tier A
  "山西省/太原市": "https://www.taiyuan.gov.cn/gfxwj2.html",                  // 规范性文件 Tier B
  "内蒙古自治区/呼和浩特市": "http://www.huhhot.gov.cn/zfxxgknew/fdzdgknr/?gk=3&cid=15493", // 政府文件 Tier B
  "黑龙江省/哈尔滨市": "https://www.harbin.gov.cn/haerbin/zcwjk/heb_zcwjk.shtml", // 政策文件库 Tier A
  "江苏省/南京市": "https://www.nanjing.gov.cn/xxgkn/szgfxwj/index.html",     // 行政规范性文件库 Tier A
  "浙江省/杭州市": "http://www.hangzhou.gov.cn/col/col1229417972/index.html", // 杭州市规范性文件数据库 Tier A
  "安徽省/合肥市": "https://www.hefei.gov.cn/zwgk/publicColumn/hfszcwjk/index.html", // 市级政策文件库 Tier A
  "山东省/济南市": "https://www.jinan.gov.cn/col/col85285/index.html",        // 政府规章 Tier B（避开 API 端点）
  "河南省/郑州市": "https://public.zhengzhou.gov.cn/?a=dir&h=1&p=D0104X",     // 政府文件（信息公开平台目录）Tier C
  "湖南省/长沙市": "http://www.changsha.gov.cn/zfxxgk/zfwjk/srmzf/",          // 行政规范性文件库 Tier A
  "广西壮族自治区/南宁市": "https://www.nanning.gov.cn/zwgk/fdzdgknr/zcwj/zfwj/", // 政府文件 Tier B
  "海南省/海口市": "http://www.haikou.gov.cn/xxgk/szfbjxxgk/zcfg/",           // 政策文件 Tier B
  "云南省/昆明市": "https://www.km.gov.cn/zfxxgk/zcwj/",                      // 政策文件 Tier B
  "甘肃省/兰州市": "https://www.lanzhou.gov.cn/col/col15333/index.html",      // 政策文件 Tier B
  "青海省/西宁市": "https://www.xining.gov.cn/zwgk/fdzdgknr/zcwj/szfwj_35/",  // 市政府文件 Tier B
  // ═══════ 仍未稳定核验：山东省、湖北省、四川省、甘肃省、青海省、内蒙古自治区（省级） ═══════
  // 仍未稳定核验：吉林省/长春市、四川省/成都市、贵州省/贵阳市
  // 详见 docs/website-policy-log.md

  // ═══════ v6 自动探测扩充 ═══════
  // 通过 scripts/website_management/probe-policy.ts 抓取政府门户首页 → 抽取 <a>
  // 链接 → 关键词打分 → 列表页校验 → 同源 host 过滤；只保留 score≥55、命中列表
  // 标志、且托管于本级或下级 *.gov.cn 子域的候选。详见 docs/website-policy-log.md。
  // 注：本批次为机器筛选 + 启发式校验，未做人工逐条审阅；个别条目可能落在二级
  // 栏目而非政策文件库主入口（如 score=55 的"政策文件"链接），后续如需精化可
  // 在 lowConf / rejected 列表中针对性补充。
// —— v6 扩充（基于 probe-policy.ts 自动探测 + 列表页校验）——
  "安徽省/安庆市/桐城市": "https://www.tongcheng.gov.cn/tztc/zcfg/index.html", // 政策文件 (score=55)
  "安徽省/池州市": "https://www.chizhou.gov.cn/PolicyContent/", // 政策文件库 (score=100)
  "安徽省/池州市/贵池区": "http://www.chizhou.gov.cn/PolicyContent/", // 政策文件库 (score=100)
  "安徽省/池州市/青阳县": "https://www.ahqy.gov.cn/XxgkPolicy/showList/650/page_1.html?dataType=xzgfxwj", // 政策文件 (score=55)
  "安徽省/滁州市/定远县": "http://www.dingyuan.gov.cn/public/column/161054643?type=4&catId=170001861&action=list&nav=3", // 政策文件 (score=55)
  "安徽省/滁州市/明光市": "http://www.mingguang.gov.cn/public/column/161054376?type=4&catId=170001861&action=list", // 政策文件 (score=55)
  "安徽省/阜阳市/颍泉区": "https://www.yingquan.gov.cn/PolicyContent/", // 政策文件库 (score=100)
  "安徽省/阜阳市/颍州区": "https://www.yingzhou.gov.cn/PolicyContent/search/?keyword=&policyType=3", // 政策文件库 (score=100)
  "安徽省/合肥市/瑶海区": "https://www.hfyaohai.gov.cn/public/column/13741?type=4&catId=7002931&action=list", // 政策文件 (score=55)
  "安徽省/淮南市/八公山区": "https://www.bagongshan.gov.cn/public/column/118322662?type=4&catId=159560314&action=list", // 政策文件 (score=55)
  "安徽省/淮南市/田家庵区": "https://www.tja.gov.cn/public/column/118322653?type=4&catId=159426414&action=list&isParent=true", // 政策文件 (score=55)
  "安徽省/淮南市/谢家集区": "https://www.xiejiaji.gov.cn/public/column/118322650?type=4&catId=159456436&action=list&isParent=true", // 政策文件 (score=55)
  "安徽省/宿州市/砀山县": "https://www.dangshan.gov.cn/public/column/6628921?type=4&catId=24349009&action=list&nav=3", // 政策文件 (score=55)
  "安徽省/铜陵市/枞阳县": "https://www.zongyang.gov.cn/openness/PolicyContent/", // 枞阳县政策文件库 (score=100)
  "安徽省/铜陵市/铜官区": "https://www.tltg.gov.cn/tgqrmzf/zcwj/pc/list.html", // 政策文件 (score=55)
  "安徽省/宣城市": "https://www.xuancheng.gov.cn/Special/showList/443/page_1.html", // 政策文件库 (score=100)
  "安徽省/宣城市/宁国市": "http://www.ningguo.gov.cn/PolicyContent/search", // 政策文件 (score=55)
  "北京市/昌平区": "https://www.bjchp.gov.cn/cpqzf/xxgk2671/zcwj/index.html", // 政策文件 (score=55)
  "北京市/大兴区": "http://www.bjdx.gov.cn/bjsdxqrmzf/zwfw/zfwj67/index.html", // 我要找政策 (score=100)
  "北京市/东城区": "https://www.bjdch.gov.cn/zwgk/zcwj2024/gfxwj24/index.html", // 规范性文件 (score=80)
  "北京市/房山区": "http://www.bjfsh.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "北京市/怀柔区": "https://www.bjhr.gov.cn/zwgk/zcwj/gfxwj/", // 规范性文件 (score=80)
  "北京市/石景山区": "https://www.bjsjs.gov.cn/gongkai/zcwjk/", // 政策文件 (score=55)
  "北京市/西城区": "https://www.bjxch.gov.cn/xxgk/gfxwj/zfgfxwj.html", // 政府规范性文件 (score=80)
  "北京市/延庆区": "http://www.bjyq.gov.cn/yanqing/zwgk/zcwj91/index.shtml", // 政策文件 (score=55)
  "重庆市/梁平区": "http://www.cqlp.gov.cn/zwgk_178/zcwj/qtwj/", // 政策文件 (score=55)
  "重庆市/沙坪坝区": "https://www.cqspb.gov.cn/zwgk_235/zfxxgkpt/zcwjk/", // 政策文件库 (score=100)
  "重庆市/秀山土家族苗族自治县": "http://www.cqxs.gov.cn/zwgk_207/zfxxgkml/zcwj_176365/", // 政策文件 (score=55)
  "重庆市/渝中区": "https://www.cqyz.gov.cn/zwgk_229/zcwj/", // 政策文件库 (score=100)
  "福建省/南平市/光泽县": "http://www.guangze.gov.cn/cms/html/gzxrmzf/documentquickquery/1907991430.html", // 政策文件库 (score=100)
  "福建省/南平市/建瓯市": "https://www.jo.gov.cn/cms/html/joszfwz/documentquickquery/1601692574.html", // 政策文件库 (score=100)
  "福建省/南平市/松溪县": "http://www.songxi.gov.cn/cms/html/sxxrmzf/documentquickquery/235741292.html", // 政策文件库 (score=100)
  "福建省/宁德市/福鼎市": "http://www.fuding.gov.cn/zcwjk/", // 政策文件库 (score=100)
  "福建省/宁德市/柘荣县": "http://www.zherong.gov.cn/zwgk/zcwj/", // 规范性文件 (score=80)
  "福建省/三明市": "http://www.sm.gov.cn/zw/zcwjk/", // 政策文件库 (score=100)
  "福建省/三明市/宁化县": "http://www.fjnh.gov.cn/xxgk/flfg/", // 政策文件 (score=55)
  "甘肃省/定西市": "http://www.dingxi.gov.cn/col/col15863/index.html", // --> 政策文件 (score=55)
  "甘肃省/定西市/陇西县": "http://www.cnlongxi.gov.cn/col/col9558/index.html?number=LX04", // --> 政策文件 (score=55)
  "甘肃省/定西市/渭源县": "https://www.cnwy.gov.cn/col/col941/index.html?number=E001", // --> 政策文件 (score=55)
  "甘肃省/金昌市/金川区": "http://www.jinchuan.gov.cn/zfxxgk/zc/qjwj/jqzbf/index.html", // 区政府文件 (score=60)
  "甘肃省/临夏回族自治州/广河县": "https://www.ghx.gov.cn/ghx/zfxxgk/zfwj/gfxwj/art/2025/art_ca976555783b4889ba7b878208216056.html", // 什么是规范性文件？ (score=80)
  "甘肃省/临夏回族自治州/临夏市": "https://www.lxs.gov.cn/lxs/zwgk/zc/agwwzfl/lsff/index.html", // 政策文件 (score=55)
  "甘肃省/陇南市/徽县": "https://www.gshxzf.gov.cn/zfxxgk/public/column/32129260?type=4&catId=142202557&action=list", // 政策文件 (score=55)
  "甘肃省/平凉市/灵台县": "https://www.lingtai.gov.cn/zfxxgk/fdzdgknr/lzyj/zcwj/index.html", // 政策文件 (score=55)
  "甘肃省/庆阳市": "https://zgqingyang.gov.cn/gk/zfxxgk/zcwjk", // 政策文件库 (score=100)
  "甘肃省/庆阳市/华池县": "https://www.hcx.gov.cn/xxgk/zcwjk/hzgfxwj", // 行政规范性文件 (score=80)
  "甘肃省/庆阳市/宁县": "https://www.ningxian.gov.cn/zwgk/zcwjk", // 政策文件库 (score=100)
  "甘肃省/庆阳市/西峰区": "https://www.gsxf.gov.cn/xxgk/zcwjk", // 政策文件库 (score=100)
  "甘肃省/天水市/清水县": "https://www.tsqs.gov.cn/zfxxgk/zcwj/qzfwj.htm", // 政策文件 (score=55)
  "甘肃省/武威市/民勤县": "http://www.minqin.gov.cn/col/col4083/index.html", // 政策文件 (score=55)
  "广东省/广州市/番禺区": "http://www.panyu.gov.cn/zwgk/zcwj/fzqzfwj/index.html", // 番禺区政府文件 (score=60)
  "广东省/广州市/海珠区": "https://www.haizhu.gov.cn/hzdt/hzyw/hzzc/index.html", // 海珠区政策文件库 (score=100)
  "广东省/河源市": "http://www.heyuan.gov.cn/zwgk/szfwj/index.html", // 市政府文件 (score=60)
  "广东省/河源市/东源县": "http://www.gddongyuan.gov.cn/dyzw/zwwj/gfxwj/index.html", // 规范性文件 (score=80)
  "广东省/河源市/源城区": "http://www.gdyc.gov.cn/zwgk/ztlm/gfxwj/index.html", // 规范性文件 (score=80)
  "广东省/惠州市/惠城区": "http://www.hcq.gov.cn/zwgk/zcwjk/", // 政策文件 (score=55)
  "广东省/惠州市/惠东县": "http://www.huidong.gov.cn/hdxwz/zwgk/gzwj/gfxwj/index.html", // 县政府规范性文件 (score=80)
  "广东省/惠州市/龙门县": "http://www.longmen.gov.cn/lmxrmzfmhwz/zwgk/zcwjk/xzfgfxwj/", // 政策文件库 (score=100)
  "广东省/江门市/恩平市": "http://www.enping.gov.cn/zwgk/fggw", // 规范性文件统一发布平台 (score=80)
  "广东省/江门市/开平市": "http://www.kaiping.gov.cn/kpszfw/zwgk/fggw/gfxwj/index.html", // 规范性文件 (score=80)
  "广东省/揭阳市/惠来县": "http://www.huilai.gov.cn/zwgk/zcwj/index.html", // 政策文件 (score=55)
  "广东省/茂名市/高州市": "http://www.gaozhou.gov.cn/zwgk/fggw/index.html", // 市政府文件 (score=60)
  "广东省/茂名市/信宜市": "http://www.xinyi.gov.cn/zwgk/szfwj/index.html", // 市政府文件 (score=60)
  "广东省/梅州市/丰顺县": "https://www.fengshun.gov.cn/zwgk/fggw/gfxwj/index.html", // 规范性文件 (score=80)
  "广东省/梅州市/蕉岭县": "https://www.jiaoling.gov.cn/zwgk/fggw/xzfwj/index.html", // 县政府文件 (score=60)
  "广东省/梅州市/平远县": "https://www.pingyuan.gov.cn/zwgk/zcwj/xzfwj/index.html", // 县政府文件 (score=60)
  "广东省/梅州市/五华县": "https://www.wuhua.gov.cn/xxgk/fggw/xzfbgfxwj/index.html", // 县政府（办）规范性文件 (score=80)
  "广东省/清远市/佛冈县": "http://www.fogang.gov.cn/zwgk/gfxwj/index.html", // 规范性文件 (score=80)
  "广东省/清远市/连南瑶族自治县": "http://www.liannan.gov.cn/zwgk/gfxwj/index.html", // 规范性文件 (score=80)
  "广东省/汕头市/潮阳区": "http://www.gdcy.gov.cn/cy/zwgk/gfxwj/gfxwjj/", // 规范性文件 (score=80)
  "广东省/汕尾市/城区": "http://www.swchengqu.gov.cn/swchengqu/zwgk/0200/0201/index.html", // 规范性文件 (score=80)
  "广东省/韶关市/曲江区": "http://www.qujiang.gov.cn/zwgk/zfwj/index.html", // 政策文件 (score=55)
  "广东省/韶关市/新丰县": "https://www.xinfeng.gov.cn/zwgk/zcfg/zcwj/index.html", // 政策文件 (score=55)
  "广东省/湛江市/赤坎区": "https://www.chikan.gov.cn/ckqzfw/xxgk/qzfxxgk/qtwj/index.html", // 政策文件 (score=55)
  "广东省/湛江市/麻章区": "http://www.zjmazhang.gov.cn/xxgk/zcwj/index.html", // 政策文件 (score=55)
  "广东省/湛江市/坡头区": "http://www.ptq.gov.cn/xxgk/zcfk/zcwj/index.html", // 政策文件 (score=55)
  "广东省/肇庆市/封开县": "https://www.fengkai.gov.cn/zwgk/zfwj/index.html", // 县政府文件 (score=60)
  "广东省/珠海市/香洲区": "https://www.zhxz.gov.cn/xxgk/fggw/gfxwj/index.html", // 规范性文件 (score=80)
  "广西壮族自治区/桂林市/灌阳县": "http://www.guanyang.gov.cn/zfxxgk/fdzdgknr/jcxxgk/zcwjk/xzfwj/", // 县政府文件 (score=60)
  "广西壮族自治区/贺州市/钟山县": "http://www.gxzs.gov.cn/xxgk/zfxxgk/jcxxgk/zcwj/xzfwj/", // 县政府文件 (score=60)
  "广西壮族自治区/来宾市/忻城县": "http://www.gxxc.gov.cn/zfxxgk/fdzdgknr/zfwj_1/gfxwj/", // 规范性文件 (score=80)
  "广西壮族自治区/南宁市/兴宁区": "http://www.nnxn.gov.cn/xxgk/zcwj/", // 政策文件政策文件 (score=55)
  "广西壮族自治区/钦州市": "http://www.qinzhou.gov.cn/zfxxgk/zcwj/xzgfxwj/", // 行政规范性文件 (score=80)
  "广西壮族自治区/玉林市/陆川县": "http://www.luchuan.gov.cn/xxgk/fdgk/wjzl/zcfg/", // 行政规范性文件 (score=80)
  "贵州省/安顺市/西秀区": "http://www.xixiu.gov.cn/web2023/ztzl/rdzt/zczqyqyzzc/index.html", // 政策找企业 企业找政策 (score=100)
  "贵州省/毕节市/金沙县": "http://www.gzjinsha.gov.cn/xxgk/zxgk/zfgb/2025ndsq/xzfwj/", // 【县政府文件】 (score=60)
  "贵州省/六盘水市/钟山区": "http://www.gzzs.gov.cn/zfxxgk/fdzdgknr/zcwj_5635175/zfgw/zsf/", // 政策文件 (score=55)
  "贵州省/黔东南苗族侗族自治州/三穗县": "https://www.gzss.gov.cn/zwgk/xxgkml/jcgk/zcwj/", // 政策文件 (score=55)
  "贵州省/黔东南苗族侗族自治州/天柱县": "https://www.tianzhu.gov.cn/zwgk/zfxxgk/fdzdgknr/zcwj/", // 政策文件 (score=55)
  "贵州省/黔南布依族苗族自治州/荔波县": "http://www.libo.gov.cn/zwgk/xxgkml/jcxxgk/zcwj/gfxwj/", // 规范性文件 (score=80)
  "贵州省/黔南布依族苗族自治州/三都水族自治县": "https://www.sandu.gov.cn/zwgk/xxgkml/jcxxgk/zcwj/zfwj/", // 县政府文件 (score=60)
  "海南省/昌江黎族自治县": "http://changjiang.hainan.gov.cn/changjiang/0500/zcwj.shtml", // 政策文件 (score=55)
  "海南省/定安县": "http://dingan.hainan.gov.cn/xxgk/zcwj/", // 政策文件 (score=55)
  "海南省/东方市": "http://dongfang.hainan.gov.cn/xxgk/0500/", // 政策文件 (score=55)
  "海南省/海口市/龙华区": "https://lhqzf.haikou.gov.cn/xxgk/zcwj_7363/", // 政策文件 (score=55)
  "海南省/海口市/美兰区": "https://mlqzf.haikou.gov.cn/xgk/zcwj/", // 政策文件 (score=55)
  "海南省/海口市/琼山区": "http://qsqzf.haikou.gov.cn/hksqsqzf/zcwj/list_s.shtml", // 政策文件 (score=55)
  "海南省/乐东黎族自治县": "http://ledong.hainan.gov.cn/ledong/0500/zcwj.shtml", // 政策文件 (score=55)
  "海南省/临高县": "https://lingao.hainan.gov.cn/zwgk_32990/zfwj/", // 政策文件 (score=55)
  "海南省/陵水黎族自治县": "http://lingshui.hainan.gov.cn/xxgk_57512/0500/", // 政策文件 (score=55)
  "海南省/琼海市": "https://qionghai.hainan.gov.cn/xxgk/zfwj/", // 政策文件 (score=55)
  "海南省/琼中黎族苗族自治县": "http://qiongzhong.hainan.gov.cn/xxgk/0500/", // 政策文件 (score=55)
  "海南省/三亚市": "https://www.sanya.gov.cn/sanyasite/zcwjxx/zcwj.shtml", // 政策文件 (score=55)
  "海南省/三亚市/海棠区": "http://ht.sanya.gov.cn/htqsite/zcwjxx/zcwj.shtml", // 政策文件 (score=55)
  "海南省/三亚市/吉阳区": "https://jy.sanya.gov.cn/jyqsite/zcwjxx/zcwj.shtml", // 政策文件 (score=55)
  "海南省/三亚市/天涯区": "http://ty.sanya.gov.cn/tyqsite/zcwjxx/zcwj.shtml", // 政策文件 (score=55)
  "海南省/三亚市/崖州区": "https://yz.sanya.gov.cn/yzqsite/zcwjxx/zcwj.shtml", // 政策文件 (score=55)
  "海南省/屯昌县": "https://tunchang.hainan.gov.cn/tunchang/zfxxgk/zcwj/", // 政策文件 (score=55)
  "海南省/万宁市": "https://wanning.hainan.gov.cn/xxgk/0500/", // 政策文件 (score=55)
  "海南省/文昌市": "http://wenchang.hainan.gov.cn/wenchang/0500/wczcwj.shtml", // 政策文件 (score=55)
  "河北省/保定市": "https://www.baoding.gov.cn/zwgkdoclist-888888717-888888001-list.html", // 法规和规范性文件 (score=80)
  "河北省/保定市/高阳县": "http://www.gaoyang.gov.cn/news.asp?lb=11", // 政策文件 (score=55)
  "河北省/保定市/涞水县": "https://www.laishui.gov.cn/index.php?m=content&c=index&a=lists&catid=271", // 行政规范性文件 (score=80)
  "河北省/保定市/曲阳县": "http://www.quyang.gov.cn/c/zhengce.html", // 政策文件 (score=55)
  "河北省/保定市/容城县": "https://info.hbrc.gov.cn/news/53.html", // 政策文件 (score=55)
  "河北省/沧州市/河间市": "https://www.hejian.gov.cn/hejian/c100272/listDisplaySelf.shtml", // 政策文件 (score=55)
  "河北省/沧州市/孟村回族自治县": "https://www.mengcun.gov.cn/mengcun/c101151/listDisplaySon.shtml", // 政策文件 (score=55)
  "河北省/沧州市/肃宁县": "https://www.suning.gov.cn/suning/c101088/listDisplaySelf.shtml", // 政策文件 (score=55)
  "河北省/沧州市/吴桥县": "http://www.wuqiao.gov.cn/wuqiao/c101109/listDisplaySelf.shtml", // 政策文件 (score=55)
  "河北省/沧州市/盐山县": "https://www.chinayanshan.gov.cn/chinayanshan/c101130/listDisplaySelf.shtml", // 政策文件 (score=55)
  "河北省/承德市/丰宁满族自治县": "http://www.fengning.gov.cn/col/col4506/index.html?number=C20006C00006", // 规范性文件 (score=80)
  "河北省/承德市/隆化县": "http://www.hebeilonghua.gov.cn/col/col3611/index.html", // 政策文件 (score=55)
  "河北省/承德市/平泉市": "https://www.pingquan.gov.cn/col/col5423/index.html?number=C30006C00006", // 规范性文件 (score=80)
  "河北省/承德市/双滦区": "http://www.slq.gov.cn/col/col3826/index.html?number=SL0006C00004", // 政策文件 (score=55)
  "河北省/承德市/双桥区": "https://www.sqq.gov.cn/col/col6523/index.html?number=SQ0006C00006", // 规范性文件 (score=80)
  "河北省/承德市/围场满族蒙古族自治县": "https://www.weichang.gov.cn/col/col3080/index.html?number=WC0001A00001", // 政策和规范性文件 (score=80)
  "河北省/承德市/兴隆县": "http://www.hbxl.gov.cn/col/col7085/index.html?number=XL0006C00004", // 政策和规范性文件 (score=80)
  "河北省/邯郸市/广平县": "http://www.gpx.gov.cn/gfxwj/", // 规范性文件 (score=80)
  "河北省/衡水市/阜城县": "http://www.hbfcx.gov.cn/col/col774/index.html", // 政策文件 (score=55)
  "河北省/廊坊市/霸州市": "http://www.bazhou.gov.cn/zwgk/bzszcwj", // 霸州市政策文件 (score=55)
  "河北省/廊坊市/三河市": "http://www.san-he.gov.cn/content/list?cid=223", // 政策文件 (score=55)
  "河北省/石家庄市/晋州市": "http://www.jzs.gov.cn/columns/68f63391-3fec-4765-8115-8be92315dfb2/index.html", // 政策文件 (score=55)
  "河北省/石家庄市/灵寿县": "http://www.lingshou.gov.cn/columns/c96b952f-1e2b-471f-a707-cbc118e3c050/index.html", // 政策文件 (score=55)
  "河北省/石家庄市/鹿泉区": "http://www.sjzlq.gov.cn/columns/6891ab6e-f72a-4f48-ad49-e4740399cafb/index.html", // 规范性文件 (score=80)
  "河北省/石家庄市/桥西区": "http://www.sjzqx.gov.cn/columns/d31d05ac-2bf7-4e13-b08c-99cc47fbccc9/index.html", // 区政府文件 (score=60)
  "河北省/石家庄市/无极县": "http://www.wuji.gov.cn/columns/65855283-5f99-4978-9f27-45fc8350ddc7/index.html", // 政策文件 (score=55)
  "河北省/石家庄市/长安区": "http://www.sjzca.gov.cn/columns/cc689e9f-16c9-4518-ae4f-9848a983f9a7/index.html", // 规范性文件 (score=80)
  "河北省/唐山市/曹妃甸区": "https://www.caofeidian.gov.cn/caofeidian/cfdqtzcwj/index.html", // 政策文件 (score=55)
  "河北省/唐山市/开平区": "http://www.tskaiping.gov.cn/tskp/tskaipingzhengfuwenjian/index.html", // 政策文件 (score=55)
  "河北省/唐山市/路南区": "http://www.lunan.gov.cn/lunanqu/tslunanquzhengfuwenjian/index.html", // 政策文件 (score=55)
  "河北省/唐山市/迁安市": "http://www.qianan.gov.cn/channel/list/87.html", // 政策文件 (score=55)
  "河北省/唐山市/玉田县": "https://www.yutian.gov.cn/yutian/tsyutianxiazhengfuwenjian/index.html", // 政策文件 (score=55)
  "河北省/唐山市/遵化市": "http://www.zunhua.gov.cn/zunhua/tszunhuashizhengfuwenjian/index.html", // 政策文件 (score=55)
  "河北省/邢台市/临西县": "https://www.linxi.gov.cn/channel/list/16.html", // 政策文件 (score=55)
  "河北省/邢台市/内丘县": "http://www.hbnq.gov.cn/channelList/11051.html", // 政策文件 (score=55)
  "河北省/邢台市/宁晋县": "http://www.ningjin.gov.cn/channel/list/12.html", // 政策文件 (score=55)
  "河北省/邢台市/新河县": "http://www.xinhe.gov.cn/xxgk/list/lm_zc.jsp?pid=84", // 政策文件 (score=55)
  "河北省/邢台市/信都区": "http://www.xinduqu.gov.cn/xxgk/list/lm_zc.jsp?pid=84", // 政策文件 (score=55)
  "河北省/张家口市": "https://www.zjk.gov.cn/xxgk/list/lm_zc.thtml?pid=74", // 政策文件 (score=55)
  "河北省/张家口市/赤城县": "http://www.ccx.gov.cn/channel/list/86.html", // 政策文件 (score=55)
  "河北省/张家口市/崇礼区": "http://www.zjkcl.gov.cn/channel/list/8.html", // 政策文件 (score=55)
  "河北省/张家口市/沽源县": "http://www.zjkgy.gov.cn/channel/list/23.html", // 政策文件 (score=55)
  "河北省/张家口市/怀来县": "http://www.huailai.gov.cn/channel/list/24.html", // 政策文件 (score=55)
  "河北省/张家口市/康保县": "http://www.zjkkb.gov.cn/channel/list/8.html", // 政策文件 (score=55)
  "河北省/张家口市/桥西区": "http://www.zjkqxq.gov.cn/channel/list/24.html", // 政策文件 (score=55)
  "河北省/张家口市/尚义县": "http://www.zjksy.gov.cn/channel/list/116.html", // 政策文件 (score=55)
  "河北省/张家口市/蔚县": "http://www.zjkyx.gov.cn/channel/list/84.html", // 行政规范性文件 (score=80)
  "河北省/张家口市/宣化区": "http://www.zjkxuanhua.gov.cn/channelList/10844.html", // 政策文件 (score=55)
  "河北省/张家口市/张北县": "http://www.zjkzb.gov.cn/channel/list/8.html", // 政策文件 (score=55)
  "河北省/张家口市/涿鹿县": "http://www.zjkzl.gov.cn/channel/list/269.html", // 政策文件 (score=55)
  "河南省/安阳市/安阳县": "https://www.ayx.gov.cn/zwgk/gfxwj/", // 政策文件 (score=55)
  "河南省/焦作市/修武县": "http://www.xiuwu.gov.cn/zfxxgk/zc/xzgfxwj", // 规范性文件 (score=80)
  "河南省/焦作市/中站区": "http://www.jzzzq.gov.cn/zwgk/xzgfxwj", // 行政规范性文件 (score=80)
  "河南省/开封市/鼓楼区": "http://www.gulou.gov.cn/kfsglqwz/c00189/pc/list.html", // 行政规范性文件 (score=80)
  "河南省/开封市/兰考县": "http://www.lankao.gov.cn/kfslkxwz/c01011/pc/list.html", // 政策文件 (score=55)
  "河南省/开封市/龙亭区": "http://www.longting.gov.cn/ltq/c00586/pc/list.html", // 行政规范性文件 (score=80)
  "河南省/开封市/杞县": "https://www.zgqx.gov.cn/qx/c01011/pc/list.html", // 政策文件 (score=55)
  "河南省/开封市/顺河回族区": "https://www.shunhequ.gov.cn/kfsshhzqwz/c00189/pc/list.html", // 行政规范性文件 (score=80)
  "河南省/开封市/通许县": "https://www.txzf.gov.cn/kfstxxwz/c01011/pc/list.html", // 政策文件 (score=55)
  "河南省/开封市/尉氏县": "http://www.wschina.gov.cn/kfswsxwz/c01011/pc/list.html", // 政策文件 (score=55)
  "河南省/开封市/祥符区": "https://www.xiangfuqu.gov.cn/kfsxfqwz/c01011/pc/list.html", // 政策文件 (score=55)
  "河南省/开封市/禹王台区": "http://www.yuwangtai.gov.cn/kfsywtqwz/c01011/pc/list.html", // 政策文件 (score=55)
  "河南省/南阳市/南召县": "https://www.nanzhao.gov.cn/zwgk/zc/xzgfxwj", // 行政规范性文件 (score=80)
  "河南省/南阳市/唐河县": "https://www.tanghe.gov.cn/zwgk/xzgfxwj/", // 行政规范性文件 (score=80)
  "河南省/南阳市/宛城区": "https://www.wancheng.gov.cn/zfxxgkpt/zc/", // 行政规范性文件 (score=80)
  "河南省/南阳市/新野县": "https://www.xinye.gov.cn/zwgk/zcjj/zcwj/", // 政策文件 (score=55)
  "河南省/濮阳市/台前县": "http://www.taiqian.gov.cn/xxgk/list.asp?class=1413", // 行政规范性文件 (score=80)
  "河南省/三门峡市": "https://www.smx.gov.cn/4498/0000/zhengfuxinxi-1.html", // 政策文件 (score=55)
  "河南省/三门峡市/灵宝市": "http://www.lingbao.gov.cn/16016/0000/zhengfuxinxi-1.html", // 政策文件 (score=55)
  "河南省/三门峡市/陕州区": "https://www.shanzhou.gov.cn/18017/0000/xinxi-1.html", // 政策文件 (score=55)
  "河南省/新乡市": "https://www.xinxiang.gov.cn/zwgk/ztzl/zcwjk/index.html", // 政策文件 (score=55)
  "河南省/新乡市/红旗区": "http://www.hqq.gov.cn/Normative", // 行政规范性文件 (score=80)
  "河南省/信阳市/淮滨县": "http://www.huaibin.gov.cn/zfxxgkpt/zc", // 政策文件 (score=55)
  "河南省/信阳市/罗山县": "http://www.luoshan.gov.cn/zfxxgkptlj/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "河南省/信阳市/息县": "http://www.xixian.gov.cn/zwgk/zcwj/xzgfxwj/xxyxwjj/", // 政策文件 (score=55)
  "河南省/周口市/沈丘县": "https://www.shenqiu.gov.cn/zwgk/list.asp?speid=35", // 政策文件 (score=55)
  "河南省/驻马店市/确山县": "http://www.queshan.gov.cn/zwgk/zfxxgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "河南省/驻马店市/汝南县": "http://www.runan.gov.cn/zwgk/zfxxgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "河南省/驻马店市/上蔡县": "http://www.shangcai.gov.cn/zwgk/zfxxgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "河南省/驻马店市/新蔡县": "https://www.xincai.gov.cn/zwgk/zfxxgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "河南省/驻马店市/正阳县": "http://www.zhengyang.gov.cn/zwgk/zfxxgk/zc/qtwj/", // 政策文件 (score=55)
  "黑龙江省/哈尔滨市/巴彦县": "http://www.bayan.gov.cn/hebbyx/xszfwj/zc.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/哈尔滨市/平房区": "http://www.hrbpf.gov.cn/pfq/c110074/list3.shtml", // 规范性文件 (score=80)
  "黑龙江省/哈尔滨市/尚志市": "http://www.shangzhi.gov.cn/szsrmzf/c100381/xxgklist_zhengce.shtml", // 政策文件 (score=55)
  "黑龙江省/哈尔滨市/香坊区": "http://www.hrbxf.gov.cn/xiangfangqu/c277/type_list.shtml", // 规范性文件 (score=80)
  "黑龙江省/鸡西市/鸡东县": "https://www.jidong.gov.cn/jdx/d3c24dd1131a4d6d98a91fac78787323/zfxxgk.shtml", // 规范性文件 (score=80)
  "黑龙江省/佳木斯市/抚远市": "http://www.hljfy.gov.cn/fys/c101367/zfxxgk_zclist.shtml", // 规范性文件 (score=80)
  "黑龙江省/佳木斯市/富锦市": "http://www.fujin.gov.cn/fjs/c101566/zfxxgk_zclist.shtml", // 规范性文件 (score=80)
  "黑龙江省/佳木斯市/桦川县": "https://www.huachuan.gov.cn/hcx/c100026/zfxxgk_zclist.shtml", // 规范性文件 (score=80)
  "黑龙江省/佳木斯市/桦南县": "https://www.huanan.gov.cn/hnx/c100047/zfxxgk_zclist.shtml", // 规范性文件 (score=80)
  "黑龙江省/佳木斯市/郊区": "https://www.jmsjqzf.gov.cn/jq/c100037/zfxxgk_zclist.shtml", // 规范性文件 (score=80)
  "黑龙江省/佳木斯市/前进区": "https://www.jmsqjq.gov.cn/qjq/c100036/zfxxgk_zclist.shtml", // 规范性文件 (score=80)
  "黑龙江省/佳木斯市/汤原县": "https://www.tangyuan.gov.cn/tyx/c101900/zfxxgk_zclist.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/佳木斯市/同江市": "https://www.tongjiang.gov.cn/tjs/c100014/zfxxgk_zclist.shtml", // 规范性文件 (score=80)
  "黑龙江省/佳木斯市/向阳区": "https://www.xyq.gov.cn/xyq/c100007/zfxxgk_zclist.shtml", // 规范性文件 (score=80)
  "黑龙江省/牡丹江市/爱民区": "https://www.aimin.gov.cn/mdjamqrmzf/c102532/zfxxgk_zclist.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/牡丹江市/东安区": "https://www.donganqu.gov.cn/mdjdaqrmzf/c102974/zfxxgk_list.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/牡丹江市/东宁市": "https://www.dongning.gov.cn/mdjdnsrmzf/c102683/zfxxgk_zclist.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/牡丹江市/海林市": "https://www.hailin.gov.cn/mdjhlsrmzf/xxzgfxwj/zfxxgk_zclist.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/牡丹江市/林口县": "https://www.linkou.gov.cn/mdjlkxrmzf/xzgfxwj408_LK/zfxxgk_zclist.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/牡丹江市/绥芬河市": "https://www.suifenhe.gov.cn/sfh/c101853/zfxxgk_zclist.shtml", // 市政府行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市/昂昂溪区": "http://www.aax.gov.cn/aax/c102284/zfxxgk_list.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市/拜泉县": "http://www.baiquan.gov.cn/baiquan/c101127/zfxxgk_zclist.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市/富裕县": "http://www.fuyu.gov.cn/fuyu/c101280/zfxxgk_zclist.shtml", // 政策文件库 (score=100)
  "黑龙江省/齐齐哈尔市/甘南县": "http://www.gannan.gov.cn/gannan/c100265/zfxxgk_zclist.shtml", // 政策文件库 (score=100)
  "黑龙江省/齐齐哈尔市/建华区": "http://www.jhq.gov.cn/jhq/c100498/zfxxgk_list.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市/克东县": "http://www.kedong.gov.cn/kedong/c100883/zfxxgk_zclist.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市/克山县": "http://www.keshan.gov.cn/keshan/c100264/zfxxgk_zclist.shtml", // 政策文件库 (score=100)
  "黑龙江省/齐齐哈尔市/龙江县": "http://www.ljxrmzfw.gov.cn/ljx/c101622/zfxxgk_zclist.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市/龙沙区": "http://www.qqhrlsq.gov.cn/lsq/c100731/zfxxgk_list.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市/讷河市": "http://www.nehe.gov.cn/nehe/c100498/zfxxgk_zclist.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市/依安县": "http://www.hljyian.gov.cn/yian/c101437/zfxxgk_zclist.shtml", // 政策文件库 (score=100)
  "黑龙江省/双鸭山市/集贤县": "http://www.jixian.gov.cn/jx/529/xxgk_list.shtml", // 规范性文件 (score=80)
  "黑龙江省/双鸭山市/饶河县": "http://www.raohe.gov.cn/rh/24248/xxgk_list.shtml", // 政策文件 (score=55)
  "黑龙江省/绥化市/庆安县": "https://www.hljqingan.gov.cn/qa/gfxwj/zfxxgklby.shtml", // 规范性文件 (score=80)
  "黑龙江省/绥化市/望奎县": "https://www.hlwangkui.gov.cn/wk/gfxwj/zfxxgk.shtml", // 规范性文件 (score=80)
  "湖北省/黄冈市": "https://www.hg.gov.cn/zwgk/public/column/6636765?type=4&catId=7025201&action=list&nav=3", // 政策文件 (score=55)
  "湖北省/黄冈市/红安县": "http://www.hazf.gov.cn/zwgk/public/column/6636844?type=4&catId=7035689&action=list", // 规范性文件 (score=80)
  "湖北省/黄冈市/麻城市": "http://www.macheng.gov.cn/zwgk/public/column/6636847?type=4&catId=7025330&action=list", // 政策文件 (score=55)
  "湖北省/黄冈市/蕲春县": "http://www.qichun.gov.cn/zwgk/public/column/6636852?type=4&catId=7027079&action=list", // 规范性文件 (score=80)
  "湖北省/黄冈市/浠水县": "http://www.xishui.gov.cn/zwgk/public/column/6636610?type=4&catId=7025333&action=list&nav=0", // 政策文件 (score=55)
  "湖北省/荆州市": "https://zwgk.jingzhou.gov.cn/normative_index.shtml?area=351&column=318", // 规范性文件 (score=80)
  "湖北省/荆州市/公安县": "http://zwgk.gongan.gov.cn/list.shtml?column_id=31719", // 政策文件 (score=55)
  "湖北省/十堰市/丹江口市": "http://www.djk.gov.cn/xxgk/zc/gfxwj/", // 规范性文件 (score=80)
  "湖北省/十堰市/房县": "http://www.fangxian.gov.cn/xxgk/zc/zfbwj/", // 规范性文件 (score=80)
  "湖北省/十堰市/张湾区": "http://www.zhangwan.gov.cn/xxgk/zc/zfwj/", // 规范性文件 (score=80)
  "湖北省/咸宁市/通城县": "http://www.zgtc.gov.cn/xxgk/zc/zfwj/", // 规范性文件 (score=80)
  "湖北省/襄阳市/老河口市": "http://www.lhk.gov.cn/gwgg/gfxwj/", // 规范性文件 (score=80)
  "湖北省/襄阳市/襄城区": "http://www.xyxcq.gov.cn/zwgk/zc/xcqgfxwj/", // 规范性文件 (score=80)
  "湖北省/襄阳市/枣阳市": "http://www.zyzf.gov.cn/zwgk/zc/zfwj/", // 规范性文件 (score=80)
  "湖南省/衡阳市": "https://www.hengyang.gov.cn/xxgk/fgwj/gfxwj/index.html", // 政策文件 (score=55)
  "湖南省/衡阳市/衡山县": "https://www.hengshan.gov.cn/zcwj/gfxwj/index.html", // 政策文件库 (score=100)
  "湖南省/衡阳市/衡阳县": "http://www.hyx.gov.cn/zwgk/fdzdgknr/zchgfxwj/index.html", // 政策文件 (score=55)
  "湖南省/衡阳市/石鼓区": "http://www.hysgq.gov.cn/xxgk/fgwj/gfxwj/index.html", // 规范性文件 (score=80)
  "湖南省/怀化市/通道侗族自治县": "https://www.tongdao.gov.cn/tongdao/c101154/zfxxgkMultiList.shtml", // 政策文件 (score=55)
  "湖南省/邵阳市/北塔区": "https://www.beita.gov.cn/beita/dfxfg/list_wjyj.shtml", // 规范性文件 (score=80)
  "湖南省/永州市/道县": "http://www.dx.gov.cn/dx/zcwjk/zcwjk.shtml", // 政策文件库 (score=100)
  "湖南省/永州市/东安县": "http://www.da.gov.cn/da/zcwjk/zcwjk.shtml", // 政策文件库 (score=100)
  "湖南省/永州市/江华瑶族自治县": "http://www.jh.gov.cn/jh/zcwjk/zcwjk.shtml", // 政策文件库 (score=100)
  "湖南省/永州市/江永县": "http://www.jiangyong.gov.cn/jiangyong/zcwjk/zcwjk.shtml", // 政策文件库 (score=100)
  "湖南省/永州市/零陵区": "http://www.cnll.gov.cn/cnll/zcfg/zcwjk.shtml", // 区规范性文件库 (score=80)
  "湖南省/永州市/宁远县": "http://www.nyx.gov.cn/nyx/zcwjk/zcwjk.shtml", // 政策文件 (score=55)
  "湖南省/长沙市/开福区": "http://www.kaifu.gov.cn/zfxxgk/fdzdgknr/zcwj/", // 政策文件 (score=55)
  "湖南省/长沙市/浏阳市": "http://www.liuyang.gov.cn/zwgk/zfxxgk/fdzdgknr/zcwj/", // 政策文件 (score=55)
  "湖南省/株洲市/攸县": "http://www.hnyx.gov.cn/c24643/index.html", // 规范性文件 (score=80)
  "吉林省/白山市/临江市": "http://www.linjiang.gov.cn/ztzl/xzgfxwj/", // 行政规范性文件 (score=80)
  "江苏省/常州市": "https://www.changzhou.gov.cn/page_wjk", // 政策文件库 (score=100)
  "江苏省/常州市/溧阳市": "https://www.liyang.gov.cn/class/HFLDAALF", // 政策文件库 (score=100)
  "江苏省/常州市/武进区": "https://www.wj.gov.cn/class/DHLAQAEJ", // 政策文件库 (score=100)
  "江苏省/常州市/新北区": "https://www.cznd.gov.cn/class/OEHEPDCJ", // 政策文件库 (score=100)
  "江苏省/常州市/钟楼区": "https://www.zhonglou.gov.cn/class/CMPCPQFB", // 政策文件库 (score=100)
  "江苏省/连云港市": "http://www.lyg.gov.cn/zglygzfmhwz/szfjbgtwj/szfjbgtwj.html", // 省政府文件 (score=60)
  "江苏省/连云港市/连云区": "http://www.lianyun.gov.cn/lyq/szfwj/szfwj.html", // 省政府文件 (score=60)
  "江苏省/南通市/海安市": "https://www.haian.gov.cn/hasrmzf/szfwj/szfwj.html", // 市政府文件 (score=60)
  "江苏省/南通市/通州区": "http://www.tongzhou.gov.cn/tzqrmzf/zfwjjjd/zfwjjjd.html", // 政策文件 (score=55)
  "江苏省/苏州市/常熟市": "http://www.changshu.gov.cn/zgcs/c100442/list.shtml", // 规范性文件征求意见 (score=80)
  "江苏省/苏州市/虎丘区": "http://www.snd.gov.cn/hqqrmzf/zcwj/nav_list.shtml", // 政策文件 (score=55)
  "江苏省/宿迁市/宿城区": "http://www.sqsc.gov.cn/scq/qzfwj/xxgk_list.shtml", // 区政府文件 (score=60)
  "江苏省/宿迁市/宿豫区": "http://www.suyu.gov.cn/suyu/zcwj/xxgk_list2.shtml", // 政策文件 (score=55)
  "江苏省/盐城市/盐都区": "https://www.yandu.gov.cn/col/col30545/index.html", // 政策文件 (score=55)
  "江苏省/镇江市": "https://www.zhenjiang.gov.cn/zhenjiang/xzgfxwj/xxgk_xzfglist.shtml", // 行政规范性文件 (score=80)
  "江苏省/镇江市/丹徒区": "http://www.dantu.gov.cn/dantu/qzfwjn/xxgkpt_list.shtml", // 区政府文件 (score=60)
  "江苏省/镇江市/润州区": "http://www.runzhou.gov.cn/runzhou/qzfwj/xxgk_list.shtml", // 区政府文件 (score=60)
  "江西省/抚州市/崇仁县": "http://www.jxcr.gov.cn/col/col21083/index.html?number=J00002J00001", // 政策文件 (score=55)
  "江西省/抚州市/广昌县": "http://www.jxgc.gov.cn/col/col2662/index.html?number=H00002", // 其他政策文件 (score=55)
  "江西省/赣州市/安远县": "http://www.ay.gov.cn/ayxxxgk/xxgkzfwj/xxgk_list.shtml", // 政策文件 (score=55)
  "江西省/赣州市/大余县": "http://www.jxdy.gov.cn/dyxxxgk/xzfwj/xxgk_list.shtml", // 政策文件 (score=55)
  "江西省/赣州市/会昌县": "http://www.huichang.gov.cn/hcxxxgk/hc2871/xxgk_list.shtml", // 政策文件 (score=55)
  "江西省/赣州市/龙南市": "http://www.jxln.gov.cn/lnxxxgk/gfxwjn/xxgk_list.shtml", // 规范性文件 (score=80)
  "江西省/赣州市/南康区": "http://www.nkjx.gov.cn/nkqxxgk/c129277/xxgk_list.shtml", // 政策文件 (score=55)
  "江西省/赣州市/宁都县": "http://www.ningdu.gov.cn/ndxxxgk/c100077/xxgk_list.shtml", // 政策文件 (score=55)
  "江西省/赣州市/上犹县": "http://www.shangyou.gov.cn/syxxxgk/c114142/xxgk_list.shtml", // 政策文件 (score=55)
  "江西省/赣州市/寻乌县": "http://www.xunwu.gov.cn/xwxxxgk/xw8180/xxgk_list.shtml", // 规范性文件库 (score=80)
  "江西省/赣州市/章贡区": "https://www.zgq.gov.cn/zgqxxgk/c108334/xxgk_list.shtml", // 规范性文件 (score=80)
  "江西省/九江市": "https://www.jiujiang.gov.cn/fdzdxxgk/01/00/guifanxinwenjian/", // 规范性文件 (score=80)
  "江西省/九江市/柴桑区": "http://www.chaisang.gov.cn/zwgk/zfxxgk/fdzdgknr/fgzc/gfxwjd/", // 规范性文件 (score=80)
  "江西省/九江市/都昌县": "http://www.duchang.gov.cn/fdzdxxgk/01/00/gfxwj/", // 规范性文件 (score=80)
  "江西省/九江市/湖口县": "http://www.hukou.gov.cn/zw/zfxxgkzl/fdzdgknr/fgzc/zcwj_1/", // 政策文件 (score=55)
  "江西省/九江市/彭泽县": "http://www.pengze.gov.cn/zw/03/zc/03/", // 彭泽县规范性文件库 (score=80)
  "江西省/九江市/武宁县": "https://www.wuning.gov.cn/xzfxxgk/fgzc/gfxwj/gfxwj/", // 规范性文件 (score=80)
  "江西省/九江市/修水县": "http://www.xiushui.gov.cn/fdzdxxgk/01/00/zlgkzcgfxwj/", // 规范性文件 (score=80)
  "江西省/九江市/永修县": "http://www.yongxiu.gov.cn/zwgkx/01_298277/fgzc/zcwj/xzfbwj/", // 政策文件 (score=55)
  "江西省/南昌市/进贤县": "https://jxx.nc.gov.cn/jxxrmzf/gfxwj/xxgk_list.shtml", // 规范性文件 (score=80)
  "江西省/南昌市/青山湖区": "https://ncqsh.nc.gov.cn/ncqsh/gfxwj/xxgk_list.shtml", // 规范性文件 (score=80)
  "江西省/南昌市/新建区": "https://xjq.nc.gov.cn/xjqrmzf/qzfbgswj/xxgk_list.shtml", // 政策文件 (score=55)
  "江西省/上饶市/广信区": "http://www.srx.gov.cn/srx/qzfwj/gxzwgk_xxgklists.shtml", // 政策文件 (score=55)
  "江西省/上饶市/横峰县": "http://www.hfzf.gov.cn/hfzf/lxxd/202506/759c175d35904d1aa31085f565adc3ae.shtml", // 政策文件 (score=55)
  "江西省/上饶市/婺源县": "http://www.jxwy.gov.cn/jxwy/fgwj/wyzwgk_xxgklists.shtml", // 政策文件 (score=55)
  "江西省/宜春市/铜鼓县": "http://www.tonggu.gov.cn/tgxrmzf/gfxwj/pc/list.html", // 政策文件库 (score=100)
  "江西省/鹰潭市/贵溪市": "http://www.guixi.gov.cn/col/col19545/index.html?number=G10000G00002G00000&vc_xxgkarea=Y01000", // 政策文件 (score=55)
  "江西省/鹰潭市/月湖区": "http://www.yuehu.gov.cn/col/col4742/index.html?vc_xxgkarea=Y03001&number=A10002A10001", // 政策文件 (score=55)
  "辽宁省/本溪市/桓仁满族自治县": "http://www.hr.gov.cn/zsyz/yhzc", // 政策文件 (score=55)
  "辽宁省/抚顺市/顺城区": "http://www.fssc.gov.cn/list_wj.asp?s=188", // 规范性文件 (score=80)
  "辽宁省/沈阳市/辽中区": "http://www.liaozhong.gov.cn/zwgk/fdzdgknr/zfwj/", // 政策文件 (score=55)
  "辽宁省/沈阳市/铁西区": "http://www.tiexi.gov.cn/zwxxgk/fdzdgknr/zfwj/", // 政策文件 (score=55)
  "内蒙古自治区/包头市": "https://www.baotou.gov.cn/zfxxgk/fdzdgknr/fd_zcwj/", // 政策文件 (score=55)
  "内蒙古自治区/包头市/白云鄂博矿区": "http://www.byeb.gov.cn/zcwj/index.html", // 政策文件 (score=55)
  "内蒙古自治区/包头市/石拐区": "http://www.shiguai.gov.cn/zfxxgk/fdzdgknr/zfwj/", // 政策文件 (score=55)
  "内蒙古自治区/鄂尔多斯市/达拉特旗": "http://www.dlt.gov.cn/dltinfo_zyk/xxgk2015b/xxgkml2/3698/3749/3750/", // 政策文件 (score=55)
  "内蒙古自治区/鄂尔多斯市/杭锦旗": "http://www.hjq.gov.cn/hjqxxgkml/hjqxxgkmu_44357/qq_hjzc_1437/qq_hjzc_0389/", // 政策文件 (score=55)
  "内蒙古自治区/鄂尔多斯市/康巴什区": "https://www.kbs.gov.cn/kbsxxgkml/qtwj/", // 政策文件 (score=55)
  "内蒙古自治区/鄂尔多斯市/乌审旗": "http://www.wsq.gov.cn/zw/zfwjx/", // 政策文件 (score=55)
  "内蒙古自治区/鄂尔多斯市/伊金霍洛旗": "http://www.yjhl.gov.cn/yqxxgk_zyk/", // 政策文件 (score=55)
  "内蒙古自治区/鄂尔多斯市/准格尔旗": "http://www.zge.gov.cn/xxgk_zge/zxxgfwj/", // 行政规范性文件 (score=80)
  "内蒙古自治区/呼伦贝尔市/阿荣旗": "http://www.arq.gov.cn/OpennessContent/showList/784/34502/page_1.html", // 规范性文件 (score=80)
  "内蒙古自治区/呼伦贝尔市/鄂温克族自治旗": "https://www.ewenke.gov.cn/OpennessContent/showList/483/10100/page_1.html", // 规范性文件 (score=80)
  "内蒙古自治区/呼伦贝尔市/根河市": "https://www.genhe.gov.cn/OpennessContent/showList/706/32873/page_1.html", // 市政府文件 (score=60)
  "内蒙古自治区/呼伦贝尔市/满洲里市": "http://www.manzhouli.gov.cn/OpennessContent/showList/645/32763/page_1.html", // 规范性文件 (score=80)
  "内蒙古自治区/呼伦贝尔市/莫力达瓦达斡尔族自治旗": "https://www.mldw.gov.cn/OpennessContent/showList/292/14854/page_1.html", // 规范性文件 (score=80)
  "内蒙古自治区/呼伦贝尔市/新巴尔虎右旗": "http://www.xbehyq.gov.cn/OpennessContent/showList/638/29476/page_1.html", // 规范性文件 (score=80)
  "内蒙古自治区/呼伦贝尔市/扎赉诺尔区": "http://www.zhalainuoer.gov.cn/OpennessContent/showList/992/36195/page_1.html", // 规范性文件 (score=80)
  "内蒙古自治区/乌兰察布市/丰镇市": "https://www.fengzhen.gov.cn/gfxwj/index.html", // 行政规范性文件 (score=80)
  "内蒙古自治区/乌兰察布市/凉城县": "http://www.liangcheng.gov.cn/gfxwj/index.html", // 行政规范性文件 (score=80)
  "内蒙古自治区/乌兰察布市/商都县": "http://www.shangdu.gov.cn/gfxwj/index.html", // 行政规范性文件 (score=80)
  "内蒙古自治区/乌兰察布市/四子王旗": "https://www.szwq.gov.cn/gfxwj/index.html", // 行政规范性文件 (score=80)
  "内蒙古自治区/乌兰察布市/兴和县": "https://www.xinghe.gov.cn/gfxwj//", // 行政规范性文件 (score=80)
  "内蒙古自治区/锡林郭勒盟": "https://www.xlgl.gov.cn/xlgl/zw/xsxxgk/fdzdgknr/zcwj/index.html", // 政策文件 (score=55)
  "宁夏回族自治区/固原市": "https://www.nxgy.gov.cn/zwgk/zcwj/gfxwj_58562/", // 规范性文件 (score=80)
  "宁夏回族自治区/固原市/西吉县": "https://www.nxxj.gov.cn/xxgk_13648/zfwj/gfxwj/", // 行政规范性文件 (score=80)
  "宁夏回族自治区/固原市/原州区": "http://www.yzh.gov.cn/xxgk_13314/zc/gfxwj/", // 规范性文件 (score=80)
  "宁夏回族自治区/石嘴山市": "https://www.shizuishan.gov.cn/zwgk/zc/gfxwj/", // 规范性文件 (score=80)
  "宁夏回族自治区/石嘴山市/大武口区": "http://www.dwk.gov.cn/xxgk/zfxxgkml/wj/gfxwj/", // 规范性文件 (score=80)
  "宁夏回族自治区/石嘴山市/平罗县": "http://www.pingluo.gov.cn/xxgk/zfxxgkml/wj/xzgfxwj/", // 行政规范性文件 (score=80)
  "宁夏回族自治区/吴忠市/红寺堡区": "https://www.hongsibu.gov.cn/xxgk/zc/gfxwj/", // 规范性文件 (score=80)
  "宁夏回族自治区/吴忠市/利通区": "http://www.ltq.gov.cn/zwgk/zfxxgkml/zfwj/gfxwj/", // 行政规范性文件 (score=80)
  "宁夏回族自治区/吴忠市/同心县": "https://www.tongxin.gov.cn/zwgk/zfxxgkml/zfwj/gfxwjk_1/", // 规范性文件 (score=80)
  "宁夏回族自治区/银川市/贺兰县": "http://www.nxhl.gov.cn/xxgk_7799/xxgkml/zfwk/xzbwj/", // 县政府文件 (score=60)
  "宁夏回族自治区/银川市/金凤区": "http://www.ycjinfeng.gov.cn/xxgk/zc/xzgfxwj/", // 规范性文件 (score=80)
  "宁夏回族自治区/银川市/灵武市": "http://www.nxlw.gov.cn/zwgk/zfbmzsjgxxgk/lwszfb/xxgkml_29024/xzgfxwj/", // 规范性文件 (score=80)
  "宁夏回族自治区/银川市/兴庆区": "http://www.xqq.gov.cn/zwgk/zc/xzgfxwj/index.html", // 规范性文件 (score=80)
  "宁夏回族自治区/银川市/永宁县": "http://www.nxyn.gov.cn/zwgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "宁夏回族自治区/中卫市/沙坡头区": "https://www.spt.gov.cn/xxgk/qzfwj/xzfgxwj/", // 行政规范性文件 (score=80)
  "宁夏回族自治区/中卫市/中宁县": "https://www.znzf.gov.cn/xxgk/zc/zcfg/", // 规范性文件 (score=80)
  "青海省/海北藏族自治州/海晏县": "http://www.haiyanxian.gov.cn/public/column/6617021?type=4&catId=6722981&action=list&nav=3", // 规范性文件 (score=80)
  "青海省/海北藏族自治州/祁连县": "http://www.qilian.gov.cn/public/column/6617001?type=4&catId=6722531&action=list&nav=3", // 县政府文件 (score=60)
  "青海省/海东市/平安区": "https://www.pinganqu.gov.cn/public/xzgfxwj/index.html", // 行政规范性文件 (score=80)
  "青海省/海南藏族自治州": "https://www.hainanzhou.gov.cn/zwgk/fdzdgknr/zcwj", // 政策文件 (score=55)
  "青海省/海南藏族自治州/共和县": "https://www.gonghe.gov.cn/zwgk/agwzlfl", // 政策文件 (score=55)
  "青海省/海南藏族自治州/贵德县": "https://www.guide.gov.cn/zwgk/zc", // 政策文件 (score=55)
  "青海省/海西蒙古族藏族自治州/格尔木市": "https://www.geermu.gov.cn/zfgk?columnId=40288af66ae23daa016ae393f096000a", // 市政府文件 (score=60)
  "青海省/海西蒙古族藏族自治州/乌兰县": "http://www.wulanxian.gov.cn/zwgk/fgwj/xzfwj.htm", // 县政府文件 (score=60)
  "青海省/玉树藏族自治州/治多县": "http://www.zhiduo.gov.cn/html/848/list.html", // 政策文件 (score=55)
  "山东省/德州市": "http://www.dezhou.gov.cn/n1403/n38391604/n59392514/index.html", // 政策文件 (score=55)
  "山东省/东营市/垦利区": "http://www.kenli.gov.cn/col/col239700/index.html?vc_xxgkarea=11370521004511115Y&number=KL051103", // 区政府文件 (score=60)
  "山东省/菏泽市/定陶区": "http://www.dingtao.gov.cn/dtzcwjk/?catas=1569655061443907584", // 规范性文件 (score=80)
  "山东省/济南市/济阳区": "https://www.jiyang.gov.cn/gongkai/channel_6389ae153759918282644cca/", // 政策文件发布平台 (score=55)
  "山东省/济南市/历城区": "http://www.licheng.gov.cn/gongkai/channel_63899ccd3759918282629980/", // 政策文件 (score=55)
  "山东省/济南市/平阴县": "http://www.pingyin.gov.cn/gongkai/channel_6389a4073759918282638b5f/?topSearch=1", // 政策文件 (score=55)
  "山东省/济南市/章丘区": "http://www.jnzq.gov.cn/gongkai/channel_6389aee73759918282646510/", // 政策文件 (score=55)
  "山东省/济宁市": "https://www.jining.gov.cn/col/col33381/index.html?vc_xxgkarea=11370800004312466C-ZF&number=B0303&jh=263", // 规范性文件 (score=80)
  "山东省/济宁市/汶上县": "http://www.wenshang.gov.cn/col/col61940/index.html?vc_xxgkarea=1137083000433565XHA&number=A0002101&jh=263", // 政策文件 (score=55)
  "山东省/济宁市/兖州区": "http://www.yanzhou.gov.cn/col/col36647/index.html?vc_xxgkarea=jnsyzq&number=YZQA0312&jh=263", // 区政府文件 (score=60)
  "山东省/聊城市/东阿县": "http://www.sdde.gov.cn/channel_d_daxrmzf_28b/", // 政策文件 (score=55)
  "山东省/聊城市/东昌府区": "http://www.dongchangfu.gov.cn/channel_x_0.0_11971/", // 政策文件 (score=55)
  "山东省/聊城市/临清市": "http://www.linqing.gov.cn/channel_j_lqsrmzfmhwz_14b/", // 政策文件 (score=55)
  "山东省/聊城市/莘县": "http://www.sdsx.gov.cn/channel_x_0_6735/", // 政策文件 (score=55)
  "山东省/临沂市/罗庄区": "http://www.luozhuang.gov.cn/xzfxxgk/fdzdgknr/jcgk/zcwjjzfbpt.htm", // 政策文件 (score=55)
  "山东省/青岛市": "http://www.qingdao.gov.cn/zwgk/zdgk/fgwj/zcwj/szfgw/", // 政策文件 (score=55)
  "山东省/青岛市/城阳区": "http://www.chengyang.gov.cn/zfxxgk/fdzdgknr/zfwj/gfxwj/", // 规范性文件 (score=80)
  "山东省/青岛市/即墨区": "http://www.jimo.gov.cn/public/search/zcwj.shtml", // 我要找政策 (score=100)
  "山东省/青岛市/崂山区": "http://www.laoshan.gov.cn/zfxxgk/qzfxxgk/fdzdgk/zcwj/gfxwj/gfx/", // 规范性文件 (score=80)
  "山东省/潍坊市": "https://www.weifang.gov.cn/xxgk/xzgfwjk/", // 规范性文件 (score=80)
  "山东省/烟台市/海阳市": "https://www.haiyang.gov.cn/col/col100770/index.html?vc_xxgkarea=113706000042603877U&number=D10006", // 政策文件库 (score=100)
  "山东省/烟台市/莱阳市": "https://www.laiyang.gov.cn/col/col44163/index.html", // 政策文件库 (score=100)
  "山东省/烟台市/招远市": "https://www.zhaoyuan.gov.cn/col/col52281/index.html", // 政策文件库 (score=100)
  "山东省/枣庄市/滕州市": "http://www.tengzhou.gov.cn/xzwgk/szfwj_189_1/index.html", // 省政府文件 (score=60)
  "山西省/大同市": "https://www.dt.gov.cn/dtszf/zcwjk/zcwjsou.shtml", // 政策文件库 (score=100)
  "山西省/大同市/平城区": "http://www.pingcheng.gov.cn/pcqrmzfz/zfwj/wjlist.shtml", // 区政府文件 (score=60)
  "山西省/晋城市/高平市": "https://www.sxgp.gov.cn/xwzx_358/szfwj_1327/", // 省政府文件 (score=60)
  "山西省/晋城市/沁水县": "http://xxgk.qinshui.gov.cn/qsxrmzf/fdzdgknr/fgwj/gfxwj_12/", // 规范性文件 (score=80)
  "山西省/晋中市/和顺县": "http://www.heshun.gov.cn/zwgk/fdzdgknr/zfwjgk", // 政策文件 (score=55)
  "山西省/临汾市/大宁县": "http://www.daning.gov.cn/zfxxgk/zcwj/szfwj/", // 省政府文件 (score=60)
  "山西省/临汾市/汾西县": "http://www.fenxi.gov.cn/zfxxgk/zcwj/xzfwj/", // 县政府文件 (score=60)
  "山西省/临汾市/古县": "http://www.guxian.gov.cn/zfxxgk/zcwj/xzfwj/", // 县政府文件 (score=60)
  "山西省/临汾市/洪洞县": "http://www.hongtong.gov.cn/zfxxgk/zcwj/szfwj/", // 省政府文件 (score=60)
  "山西省/临汾市/蒲县": "http://www.puxian.gov.cn/zfxxgk/zcwj/xzfwj/", // 县政府文件 (score=60)
  "山西省/临汾市/曲沃县": "http://www.quwo.gov.cn/zfxxgk/zcwj/xzfwj/", // 县政府文件 (score=60)
  "山西省/临汾市/隰县": "http://www.sxxx.gov.cn/zfxxgk/zcwj/xzfwj/", // 县政府文件 (score=60)
  "山西省/临汾市/乡宁县": "http://www.xiangning.gov.cn/zfxxgk/zcwj/xzfwj/", // 县政府文件 (score=60)
  "山西省/临汾市/尧都区": "http://www.yaodu.gov.cn/zfxxgk/zcwj/qzfwj/", // 区政府文件 (score=60)
  "山西省/临汾市/翼城县": "http://www.yicheng.gov.cn/zfxxgk/zcwj/szfwj/", // 省政府文件 (score=60)
  "山西省/吕梁市/汾阳市": "http://www.fenyang.gov.cn/fyszw/zwgk/gfx/", // 规范性文件 (score=80)
  "山西省/吕梁市/交口县": "http://www.jiaokou.gov.cn/zwgk/zfwj/wj/gfxwj/", // 规范性文件 (score=80)
  "山西省/吕梁市/文水县": "http://www.wenshui.gov.cn/wsxzw/xxgk/gfxwj/", // 规范性文件 (score=80)
  "山西省/吕梁市/兴县": "http://www.sxxingxian.gov.cn/xxzwx/zwgk/zfwj/", // 县政府文件 (score=60)
  "山西省/朔州市/朔城区": "http://www.szscq.gov.cn/plzfxxgk_17218/fdzdgknr/xzgfxwj/", // 行政规范性文件 (score=80)
  "山西省/太原市/晋源区": "https://www.jinyuan.gov.cn/zcwj.html", // 政策文件 (score=55)
  "山西省/太原市/小店区": "https://www.tyxd.gov.cn/zcwj.html?chan=12548", // 政策文件 (score=55)
  "山西省/太原市/阳曲县": "https://www.sxyangqu.gov.cn/zcwjjjd.html?chan=8709", // 政策文件 (score=55)
  "山西省/忻州市/保德县": "http://www.baode.gov.cn/bdxzw/zwgk/wj/szfwj_6332/", // 市政府文件 (score=60)
  "山西省/阳泉市/盂县": "https://www.sxyx.gov.cn/zwgk/zfxxgkml/xzfwj/", // 县政府文件 (score=60)
  "山西省/运城市/稷山县": "http://www.jishan.gov.cn/zfxxgk/fdzdgknr/zcwj/zfwj/index.shtml", // 县政府文件 (score=60)
  "山西省/运城市/绛县": "http://www.jiangxian.gov.cn/zfxxgk/zcwj/gfxwj/index.shtml", // 规范性文件 (score=80)
  "山西省/运城市/临猗县": "http://www.sxly.gov.cn/zfxxgk/zcfgyjd/index.shtml", // 政策文件 (score=55)
  "山西省/运城市/闻喜县": "http://www.wenxi.gov.cn/zfxxgk/wjjjd/zcfg/index.shtml", // 县政府文件 (score=60)
  "山西省/运城市/新绛县": "http://www.jiangzhou.gov.cn/zfxxgk/zcwj/index.shtml", // 政策文件 (score=55)
  "山西省/运城市/盐湖区": "http://www.yanhu.gov.cn/zfxxgk/zfwj/index.shtml", // 政策文件 (score=55)
  "山西省/运城市/垣曲县": "http://www.yuanqu.gov.cn/zfxxgk/zfwj/index.shtml", // 政策文件 (score=55)
  "山西省/长治市": "https://www.changzhi.gov.cn/xxgkml/zfxxgkml/czsrmzf/zbwj_235747/gfxwj_3395/", // 规范性文件 (score=80)
  "山西省/长治市/壶关县": "http://www.huguan.gov.cn/hgxgk/zfxxgk/zfxxgkml/zcwjk/", // 政策文件库 (score=100)
  "山西省/长治市/黎城县": "http://www.sxlc.gov.cn/lczw/zfxxgk/zfxxgkml/zfwj/gfxwj/", // 规范性文件 (score=80)
  "山西省/长治市/平顺县": "http://www.pingshun.gov.cn/psxxgk/zfxxgk/zfxxgkml/yfxz/xzzf_236485/", // 县级行政规范性文件 (score=80)
  "山西省/长治市/沁县": "http://www.qinxian.gov.cn/qxxgk/zfxxgk/zfxxgkml/gfxwj/", // 规范性文件 (score=80)
  "山西省/长治市/沁源县": "http://www.qinyuan.gov.cn/qyxxgk/zfxxgk/zfxxgkml/yt_yfxz/", // 政策文件库 (score=100)
  "山西省/长治市/上党区": "http://www.shangdangqu.gov.cn/czxgk/zfxxgk/chnlnull/chnl1013/chnl1029/", // 规范性文件 (score=80)
  "山西省/长治市/屯留区": "http://www.tunliu.gov.cn/tlzw/zwgk/zfxxgkml/jjcxxgk/zbwj/", // 政策文件 (score=55)
  "山西省/长治市/襄垣县": "http://www.xiangyuan.gov.cn/xyzwgk/zfxxgk/zfxxgkml/gfxwj/", // 规范性文件 (score=80)
  "陕西省/安康市": "https://so.ankang.gov.cn/norm/library/s", // 政策文件库 (score=100)
  "陕西省/安康市/镇坪县": "https://www.zhp.gov.cn/govsub/publicinfo/category-8281.html", // 规范性文件 (score=80)
  "陕西省/安康市/紫阳县": "https://www.zyx.gov.cn/Node-91374.html", // 规范性文件 (score=80)
  "陕西省/宝鸡市/渭滨区": "http://www.weibin.gov.cn/col15477/col15480/col15484/", // 政策文件库 (score=100)
  "陕西省/汉中市/城固县": "http://www.chenggu.gov.cn/cgxzf/zwgk/xxgknr/zcwj/gk_n_zcwj.shtml", // 政策文件 (score=55)
  "陕西省/汉中市/佛坪县": "http://www.foping.gov.cn/fpxzf/xzfwj/wj_list.shtml", // 政策文件 (score=55)
  "陕西省/汉中市/汉台区": "http://www.htq.gov.cn/hzshtqzf/zwgk/zcwj/gk_n_zcwj.shtml", // 政策文件 (score=55)
  "陕西省/汉中市/留坝县": "http://www.liuba.gov.cn/lbxzf/xzfwj/wj_list.shtml", // 县政府文件 (score=60)
  "陕西省/渭南市/白水县": "http://www.baishui.gov.cn/zfxxgk/zcwj/hzgfxwj/1.html", // 政策文件 (score=55)
  "陕西省/渭南市/大荔县": "http://www.dalisn.gov.cn/zfxxgk/zcwj/xzfwj/1.html", // 政策文件 (score=55)
  "陕西省/渭南市/富平县": "http://www.fuping.gov.cn/zfxxgk/zcwj/xzfwj/1.html", // 县政府文件 (score=60)
  "陕西省/渭南市/临渭区": "http://www.linwei.gov.cn/zfxxgk/fdzdgknr/zcwj/qzfwj/1.html", // 政策文件 (score=55)
  "陕西省/渭南市/蒲城县": "http://www.pucheng.gov.cn/zfxxgk/zcwj/gfxwj/1.html", // 行政规范性文件 (score=80)
  "陕西省/渭南市/潼关县": "http://www.tongguan.gov.cn/zfxxgk/zc/zcwj/xzf/1.html", // 政策文件 (score=55)
  "陕西省/西安市/灞桥区": "http://www.baqiao.gov.cn/zwgk/zc/zfwj/gfxwj/1991423953254031362.html", // 现行有效规范性文件目录 (score=80)
  "陕西省/西安市/新城区": "http://www.xincheng.gov.cn/zwgk/zdxxgk/jcgk/zcwj/qzfbwj/1.html", // 政策文件 (score=55)
  "陕西省/西安市/长安区": "http://www.changanqu.gov.cn/zwgk/xxgkml/jcgk/jchgk/zfwj/qzfwj/1.html", // 区政府文件 (score=60)
  "陕西省/西安市/周至县": "http://www.zhouzhi.gov.cn/xxgk/fdzdgknr/zcwj/xzfwj/1.html", // 政策文件 (score=55)
  "陕西省/咸阳市": "http://www.xianyang.gov.cn/zfxxgk/zcwj/", // 政策文件 (score=55)
  "陕西省/咸阳市/彬州市": "https://www.snbinzhou.gov.cn/zwgk/fdzdgknr/zvwj/", // 政策文件 (score=55)
  "陕西省/咸阳市/三原县": "https://www.snsanyuan.gov.cn/zfxxgk/fdzdgknr/zfwj/xzfwj/", // 县政府文件 (score=60)
  "陕西省/咸阳市/长武县": "http://www.changwu.gov.cn/zfxxgk/fdzdgk/zcwj/gfxwj/", // 规范性文件 (score=80)
  "陕西省/延安市/洛川县": "https://www.lcx.gov.cn/zfxxgk/fdzdgknr/zfwj/gfxwj/1.html", // 行政规范性文件 (score=80)
  "陕西省/延安市/子长市": "https://www.zichang.gov.cn/zfxxgk/fdzdgknr/zfwj/shizfwj/1.html", // 市政府文件 (score=60)
  "陕西省/榆林市": "https://www.yl.gov.cn/zwgk/zc/qtwj/", // 文件 政策文件 (score=55)
  "陕西省/榆林市/定边县": "http://www.dingbian.gov.cn/zfxxgk/fdzdgknr/gfxwj/", // 规范性文件 (score=80)
  "陕西省/榆林市/横山区": "http://www.hszf.gov.cn/xxgk/fdzdgknr/zcwj/qzfwj/", // 区政府文件 (score=60)
  "陕西省/榆林市/米脂县": "http://www.mizhi.gov.cn/zwgk/fdzdgknr/zfwj/gfxwj/", // 规范性文件 (score=80)
  "上海市/嘉定区": "https://www.jiading.gov.cn/publicity/jcgk/zdgkwj/gfxwj", // 规范性文件 (score=80)
  "四川省/阿坝藏族羌族自治州/红原县": "http://www.hongyuan.gov.cn/hyxrmzf/c101817/nav_list.shtml", // 行政规范性文件 (score=80)
  "四川省/阿坝藏族羌族自治州/马尔康市": "https://www.maerkang.gov.cn/maerkang/c106289/nav_list.shtml", // 行政规范性文件 (score=80)
  "四川省/阿坝藏族羌族自治州/壤塘县": "http://www.rangtang.gov.cn/xtxrmzf/c101447/nav_list.shtml", // 行政规范性文件 (score=80)
  "四川省/阿坝藏族羌族自治州/汶川县": "http://www.wenchuan.gov.cn/wcxrmzf/c104659/nav_list.shtml", // 行政规范性文件 (score=80)
  "四川省/巴中市/巴州区": "http://www.bzqzf.gov.cn/public/column/6597391?type=4&action=list&nav=2&sub=0&catId=6715691", // 政策文件 (score=55)
  "四川省/巴中市/恩阳区": "http://www.scey.gov.cn/public/column/6599971?type=4&catId=6716251&action=list", // 政策文件 (score=55)
  "四川省/巴中市/南江县": "http://www.scnj.gov.cn/public/column/6598671?type=4&catId=6715691&action=list", // 政策文件 (score=55)
  "四川省/巴中市/平昌县": "http://www.scpc.gov.cn/public/column/6601841?type=4&action=list&nav=2&sub=0&catId=6715691", // 政策文件 (score=55)
  "四川省/巴中市/通江县": "http://www.tjxzf.gov.cn/public/column/6601171?type=4&action=list&nav=2&sub=0&catId=6715691&isDetail=true", // 政策文件 (score=55)
  "四川省/达州市/达川区": "http://www.dachuan.gov.cn/xxgk-list-xzgfxwj.html", // 行政规范性文件 (score=80)
  "四川省/达州市/开江县": "http://www.kaijiang.gov.cn/xxgk-list-xzgfxwj111.html", // 行政规范性文件 (score=80)
  "四川省/达州市/渠县": "http://www.quxian.gov.cn/xxgk-list-xzgfxwj.html", // 行政规范性文件 (score=80)
  "四川省/达州市/通川区": "http://www.tchuan.gov.cn/xxgk-list-xzgfxwj.html", // 行政规范性文件 (score=80)
  "四川省/达州市/万源市": "http://www.wanyuan.gov.cn/xxgk-list-xzgfxwj.html", // 行政规范性文件 (score=80)
  "四川省/甘孜藏族自治州": "http://www.gzz.gov.cn/zcqtwj", // 甘孜州政策文件库 (score=100)
  "四川省/广安市": "https://www.guang-an.gov.cn/gasrmzfw/c02514/pc/list.html", // 广安市政策文件库 (score=100)
  "四川省/广安市/广安区": "https://www.guanganqu.gov.cn/gaqrmzf/zcwjkfz/pc/list.html", // 政策文件库 (score=100)
  "四川省/广安市/邻水县": "https://www.scls.gov.cn/lsxrmzf/zcwjkfz/pc/list.html", // 政策文件库 (score=100)
  "四川省/广安市/前锋区": "https://www.qf.gov.cn/qfqrmzf/zcwjkfz/pc/list.html", // 政策文件库 (score=100)
  "四川省/凉山彝族自治州/木里藏族自治县": "http://www.muli.gov.cn/zfxxgk/zc/gfxwj1/index.html", // 行政规范性文件 (score=80)
  "四川省/凉山彝族自治州/越西县": "http://www.scyx.gov.cn/xxgk/zfxxgknr/zcwj_30729/gfxwj1/", // 行政规范性文件 (score=80)
  "四川省/泸州市": "http://www.luzhou.gov.cn/zw/zcwjs/szfwj", // 泸州市政策文件 (score=55)
  "四川省/泸州市/合江县": "http://www.hejiang.gov.cn/gk/zc/gfxwj2", // 规范性文件 (score=80)
  "四川省/泸州市/泸县": "http://www.luxian.gov.cn/zwgk/zc/gfxwj", // 规范性文件 (score=80)
  "四川省/泸州市/叙永县": "https://www.xuyong.gov.cn/zwgk/zc/zfwj", // 政策文件 (score=55)
  "四川省/眉山市": "https://www.ms.gov.cn/zfxxgk/z__c/gfxwj.htm", // 行政规范性文件 (score=80)
  "四川省/攀枝花市/仁和区": "http://www.screnhe.gov.cn/zwgk/jbxxgk/zcfg/gfxwj/index.shtml", // 行政规范性文件 (score=80)
  "四川省/攀枝花市/盐边县": "http://www.scyanbian.gov.cn/zwgk/fggw/xzfwj/index.shtml", // 行政规范性文件 (score=80)
  "四川省/遂宁市/安居区": "http://www.scanju.gov.cn/gongkai/kuozhan/10461.html", // 安居区规范性文件 (score=80)
  "四川省/遂宁市/船山区": "http://www.chuanshan.gov.cn/gongkai/kuozhan/10403.html", // 规范性文件 (score=80)
  "四川省/遂宁市/大英县": "http://www.daying.gov.cn/gongkai/kuozhan/10033.html", // 规范性文件 (score=80)
  "四川省/遂宁市/蓬溪县": "http://www.pengxi.gov.cn/gongkai/kuozhan/10469.html", // 规范性文件 (score=80)
  "四川省/自贡市/大安区": "http://www.zgda.gov.cn/daqrmzf/xzgfx655/pc/list.html", // 规范性文件 (score=80)
  "四川省/自贡市/富顺县": "http://www.fsxzf.gov.cn/fsxrmzf/xzgfx3134/pc/list.html", // 规范性文件 (score=80)
  "四川省/自贡市/贡井区": "http://www.gj.gov.cn/gjqrmzf/xzgfx487/pc/list.html", // 规范性文件 (score=80)
  "四川省/自贡市/荣县": "http://www.rongzhou.gov.cn/rxrmzf/xzgfx1459/pc/list.html", // 规范性文件 (score=80)
  "四川省/自贡市/沿滩区": "http://www.zgyt.gov.cn/ytqrmzf/xzgfx2241/pc/list.html", // 规范性文件 (score=80)
  "四川省/自贡市/自流井区": "http://www.zlj.gov.cn/zljqrmzf/xzgfx/pc/list.html", // 规范性文件 (score=80)
  "天津市/北辰区": "https://www.tjbc.gov.cn/zwgk/zcwj/", // 政策文件 (score=55)
  "天津市/滨海新区": "https://www.tjbh.gov.cn/government/channels/11098.html", // 政策文件 (score=55)
  "天津市/蓟州区": "https://www.tjjz.gov.cn/zwgk/zcwj/index_21667.html", // 政策文件 (score=55)
  "天津市/静海区": "http://www.tjjh.gov.cn/jhqzf/zwgk_28985/zcwj/", // 政策文件 (score=55)
  "天津市/南开区": "https://www.tjnk.gov.cn/NKQZF/ZWGK5712/zcwj/qjwj/qzf_1/", // 区政府文件 (score=60)
  "西藏自治区/阿里地区/措勤县": "https://cuoqinxian.gov.cn/zfxxgk/zcwj.htm", // 政策文件 (score=55)
  "西藏自治区/拉萨市/堆龙德庆区": "https://www.dldqq.gov.cn/dldqqrmzf/gfxwj/zfxxgk_list.shtml", // 规范性文件 (score=80)
  "西藏自治区/拉萨市/林周县": "https://www.linzhouxian.gov.cn/lzxrmzf/wjzl/common_list.shtml", // 规范性文件等资料 (score=80)
  "西藏自治区/那曲市/安多县": "http://www.nqadx.gov.cn/adxrmzf/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/那曲市/巴青县": "http://www.nqbqx.gov.cn/nqbqx/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/那曲市/班戈县": "http://www.nqbgx.gov.cn/nqbgx/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/那曲市/比如县": "http://www.nqbrx.gov.cn/nqbrx/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/那曲市/嘉黎县": "http://www.nqjlx.gov.cn/nqjlx/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/那曲市/尼玛县": "http://www.nqnmx.gov.cn/nqnmx/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/那曲市/色尼区": "http://www.nqsnq.gov.cn/nqsnq/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/那曲市/申扎县": "http://www.nqszx.gov.cn/nqszx/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/那曲市/双湖县": "http://www.nqshx.gov.cn/nqshx/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/那曲市/索县": "http://www.nqsx.gov.cn/nqsx/zcwj/xxgk_list.shtml", // 政策文件 (score=55)
  "西藏自治区/日喀则市/昂仁县": "http://www.arx.gov.cn/public-policy.thtml?id=11783", // 政策文件 (score=55)
  "西藏自治区/日喀则市/白朗县": "http://www.blx.gov.cn/public-policy.thtml?id=11579", // 政策文件 (score=55)
  "西藏自治区/日喀则市/定结县": "http://www.djx.gov.cn/public-policy.thtml?id=12194", // 政策文件 (score=55)
  "西藏自治区/日喀则市/定日县": "http://www.drx.gov.cn/public-policy.thtml?id=14311", // 政策文件 (score=55)
  "西藏自治区/日喀则市/岗巴县": "http://www.gbx.gov.cn/public-policy.thtml?id=12407", // 政策文件 (score=55)
  "西藏自治区/日喀则市/吉隆县": "http://www.jilong.gov.cn/public-policy.thtml?id=12713", // 政策文件 (score=55)
  "西藏自治区/日喀则市/江孜县": "http://www.jiangzi.gov.cn/public-policy.thtml?id=15085", // 政策文件 (score=55)
  "西藏自治区/日喀则市/康马县": "http://www.kmx.gov.cn/public-policy.thtml?id=12611", // 政策文件 (score=55)
  "西藏自治区/日喀则市/拉孜县": "http://www.lazi.gov.cn/public-policy.thtml?id=12918", // 政策文件 (score=55)
  "西藏自治区/日喀则市/南木林县": "http://www.nmlx.gov.cn/public-policy.thtml?id=11885", // 政策文件 (score=55)
  "西藏自治区/日喀则市/聂拉木县": "http://www.nlmx.gov.cn/public-policy.thtml?id=11681", // 政策文件 (score=55)
  "西藏自治区/日喀则市/仁布县": "http://www.renbu.gov.cn/public-policy.thtml?id=12296", // 政策文件 (score=55)
  "西藏自治区/日喀则市/萨嘎县": "http://www.sgx.gov.cn/public-policy.thtml?id=12509", // 政策文件 (score=55)
  "西藏自治区/日喀则市/萨迦县": "http://www.sj.gov.cn/public-policy.thtml?id=11991", // 政策文件 (score=55)
  "西藏自治区/日喀则市/谢通门县": "http://www.xietongmen.gov.cn/public-policy.thtml?id=12093", // 政策文件 (score=55)
  "西藏自治区/日喀则市/亚东县": "http://www.ydx.gov.cn/public-policy.thtml?id=11466", // 政策文件 (score=55)
  "西藏自治区/日喀则市/仲巴县": "http://www.zbx.gov.cn/public-policy.thtml?id=12816", // 政策文件 (score=55)
  "新疆维吾尔自治区/昌吉回族自治州": "https://www.cj.gov.cn/p1/zfbwj.html", // 政策文件 (score=55)
  "新疆维吾尔自治区/昌吉回族自治州/昌吉市": "https://www.cjs.gov.cn/info/iList.jsp?node_id=GKcjszf&cat_id=33910&tm_id=2619&q=zc&w=gfxwj", // 规范性文件 (score=80)
  "新疆维吾尔自治区/和田地区/和田市": "https://www.hts.gov.cn/xinxigongkai/guifanxingwenjian/", // 规范性文件 (score=80)
  "新疆维吾尔自治区/和田地区/和田县": "http://www.htx.gov.cn/htx/gfxwj/xzgfxwhk.shtml", // 规范性文件 (score=80)
  "新疆维吾尔自治区/和田地区/洛浦县": "https://www.xjlpx.gov.cn/api/redirect.php?aid=72", // 国务院政策文件库 (score=100)
  "新疆维吾尔自治区/和田地区/墨玉县": "http://www.myx.gov.cn/myxrmzf/c123720/zfxxgk_list.shtml", // 行政规范性文件 (score=80)
  "新疆维吾尔自治区/喀什地区/麦盖提县": "http://www.mgt.gov.cn/mgtx/gfxwjml/gfxwj.shtml", // 规范性文件目录 (score=80)
  "新疆维吾尔自治区/喀什地区/莎车县": "http://www.shache.gov.cn/scx/c108011/gfxwj.shtml", // 规范性文件 (score=80)
  "新疆维吾尔自治区/喀什地区/岳普湖县": "http://www.yph.gov.cn/yphx/c108219/zcxwj.shtml", // 政策文件 (score=55)
  "新疆维吾尔自治区/喀什地区/泽普县": "http://www.xjzp.gov.cn/zpx/c106967/zcxwj.shtml", // 政策文件 (score=55)
  "新疆维吾尔自治区/克拉玛依市/克拉玛依区": "http://www.klmyq.gov.cn/klmyq/zcwj/olist.shtml", // 政策文件 (score=55)
  "新疆维吾尔自治区/克孜勒苏柯尔克孜自治州/阿图什市": "https://www.xjats.gov.cn/xjats/c103432/list.shtml", // 市政府文件 (score=60)
  "新疆维吾尔自治区/塔城地区": "https://www.xjtc.gov.cn/zfxxgk/qwfb/zcfg21", // 规范性文件 (score=80)
  "新疆维吾尔自治区/塔城地区/沙湾市": "https://www.xjsw.gov.cn/xxgk/zc/gfxwj", // 规范性文件 (score=80)
  "新疆维吾尔自治区/塔城地区/托里县": "http://www.xjtl.gov.cn/zfxxgk/zc/gfxwj", // 行政规范性文件 (score=80)
  "新疆维吾尔自治区/塔城地区/裕民县": "http://www.xjym.gov.cn/zwgk/zc/gfxwj", // 规范性文件 (score=80)
  "新疆维吾尔自治区/吐鲁番市": "https://www.tlf.gov.cn/tlfs/c106239/zfxxgk_zc.shtml", // 市政府文件 (score=60)
  "新疆维吾尔自治区/吐鲁番市/鄯善县": "http://www.xjss.gov.cn/ssx/c106121/list.shtml", // 规范性文件 (score=80)
  "新疆维吾尔自治区/吐鲁番市/托克逊县": "http://www.tkx.gov.cn/tkxx/c106496/zfxxgk_list.shtml", // 政策文件 (score=55)
  "新疆维吾尔自治区/乌鲁木齐市/天山区": "http://www.xjtsq.gov.cn/wswj.htm", // 市政府文件 (score=60)
  "新疆维吾尔自治区/乌鲁木齐市/头屯河区": "http://www.uetd.gov.cn/jjjskfq/c119908/zfxxgk_gknrz.shtml", // 规范性文件 (score=80)
  "新疆维吾尔自治区/乌鲁木齐市/新市区": "http://www.uhdz.gov.cn/zfxxgk/zc/gfxwj1", // 规范性文件 (score=80)
  "新疆维吾尔自治区/新疆生产建设兵团": "http://www.xjbt.gov.cn/tszx/dzzw/zcwj/", // 政策文件 (score=55)
  "新疆维吾尔自治区/新疆生产建设兵团/昆玉市": "https://www.btdsss.gov.cn/zwgk/zcwj/", // 政策文件 (score=55)
  "新疆维吾尔自治区/伊犁哈萨克自治州": "https://www.xjyl.gov.cn/xjylz/c112883/zfxxgk_gfxwjk.shtml", // 规范性文件 (score=80)
  "新疆维吾尔自治区/伊犁哈萨克自治州/霍尔果斯市": "http://www.xjhegs.gov.cn/xjhegs/c114470/xzgfxwhk.shtml", // 行政规范性文件 (score=80)
  "云南省/保山市/龙陵县": "https://www.longling.gov.cn/zcwjkrk.htm", // 政策文件库 (score=100)
  "云南省/保山市/隆阳区": "http://www.longyang.gov.cn/zcwjkrk.htm", // 政策文件库 (score=100)
  "云南省/保山市/施甸县": "https://www.shidian.gov.cn/zcwjkrk.htm", // 政策文件库 (score=100)
  "云南省/保山市/腾冲市": "https://www.tengchong.gov.cn/zwgk1/zfxxgkpt/zcwj/xzgfxwj.htm", // 政策文件库 (score=100)
  "云南省/楚雄彝族自治州": "http://www.chuxiong.gov.cn/ss/zcwjkss.htm", // 政策文件库 (score=100)
  "云南省/楚雄彝族自治州/姚安县": "http://www.yaoan.gov.cn/zfxxgk/zcwj/xzgfxwjk.htm", // 规章及规范性文件 (score=80)
  "云南省/大理白族自治州": "http://www.dali.gov.cn/dlzrmzf/xxgkml/c105889/pc/list.html", // 政策文件 (score=55)
  "云南省/大理白族自治州/大理市": "https://www.yndali.gov.cn/dlsrmzf/c106678/pc/list.html", // 政策文件 (score=55)
  "云南省/大理白族自治州/洱源县": "http://www.eryuan.gov.cn/eyxrmzf/c105670/pc/list.html", // 规范性文件 (score=80)
  "云南省/大理白族自治州/弥渡县": "http://www.midu.gov.cn/mdxrmzf/c102482/pc/list.html", // 县政府文件 (score=60)
  "云南省/大理白族自治州/巍山彝族回族自治县": "https://www.dlweishan.gov.cn/wsxrmzf/c106873/pc/list.html", // 行政规范性文件 (score=80)
  "云南省/大理白族自治州/祥云县": "http://www.xiangyun.gov.cn/xyxrmzf/c106009/pc/list.html", // 政策文件 (score=55)
  "云南省/大理白族自治州/云龙县": "http://www.ylx.gov.cn/ylxrmzf/c105699/pc/list.html", // 行政规范性文件 (score=80)
  "云南省/德宏傣族景颇族自治州": "https://www.dh.gov.cn/Web/publice/_M228_5A6QYP7448FB83434FB5496184_1.htm", // 规范性文件 (score=80)
  "云南省/德宏傣族景颇族自治州/梁河县": "https://www.dhlh.gov.cn/Web/publice/_M12_4QWSDWW8CE3E8D9EBC2847E2B8_1.htm", // 政策文件 (score=55)
  "云南省/德宏傣族景颇族自治州/陇川县": "http://www.dhlc.gov.cn/Web/publice/_M12_4QWSDWW8CE3E8D9EBC2847E2B8_1.htm", // 政策文件 (score=55)
  "云南省/德宏傣族景颇族自治州/芒市": "https://www.dhms.gov.cn/Web/publice/_M12_4QWSDWW8CE3E8D9EBC2847E2B8_1.htm40C328B712043F9B0_1.htm", // 政策文件 (score=55)
  "云南省/德宏傣族景颇族自治州/瑞丽市": "http://www.rl.gov.cn/Web/publice/_M10_4QWSCL20640C328B712043F9B0_1.htm", // 政策文件 (score=55)
  "云南省/德宏傣族景颇族自治州/盈江县": "https://www.dhyj.gov.cn/Web/publice/_M12_4QWSDWW8CE3E8D9EBC2847E2B8_1.htm", // 政策文件 (score=55)
  "云南省/迪庆藏族自治州/德钦县": "http://www.deqin.gov.cn/zfxxgk_deqin/zhengcewenjian/zcwj", // 政策文件 (score=55)
  "云南省/迪庆藏族自治州/维西傈僳族自治县": "http://www.weixi.gov.cn/zfxxgk_weixi/zhengcewenjian/zcwj", // 政策文件 (score=55)
  "云南省/迪庆藏族自治州/香格里拉市": "http://www.xianggelila.gov.cn/zfxxgk_xglls/zhengcewenjian/zcwj", // 政策文件 (score=55)
  "云南省/红河哈尼族彝族自治州/个旧市": "https://www.hhgj.gov.cn/zfxxgk/zcwj/xzgfxwj/rmzf.htm", // 政策文件 (score=55)
  "云南省/红河哈尼族彝族自治州/河口瑶族自治县": "http://www.hhhk.gov.cn/zfxxgk/zcwj/xzgfxwj/rmzf.htm", // 政策文件 (score=55)
  "云南省/红河哈尼族彝族自治州/红河县": "https://www.hhx.gov.cn/zfxxgk/zcwj/xzgfxwj.htm", // 政策文件 (score=55)
  "云南省/红河哈尼族彝族自治州/建水县": "http://www.hhjs.gov.cn/zfxxgk/zcwj/xzgfxwj/rmzf.htm", // 政策文件 (score=55)
  "云南省/红河哈尼族彝族自治州/开远市": "https://www.hhky.gov.cn/zfxxgk/zcwj/xzgfxwj/rmzf.htm", // 政策文件 (score=55)
  "云南省/红河哈尼族彝族自治州/泸西县": "https://www.hhlx.gov.cn/zfxxgk/zcwj/xzgfxwj/rmzf.htm", // 政策文件 (score=55)
  "云南省/红河哈尼族彝族自治州/绿春县": "https://www.hhlc.gov.cn/zfxxgk/zcwj/qtwj/lzf.htm", // 政策文件 (score=55)
  "云南省/红河哈尼族彝族自治州/蒙自市": "https://www.hhmz.gov.cn/zfxxgk1/zcwj/xzgfxwj/rmzf.htm", // 政策文件 (score=55)
  "云南省/红河哈尼族彝族自治州/弥勒市": "https://www.hhml.gov.cn/zfxxgk1/zcwj1/xzgfxwj/rmzf.htm", // 政策文件库 (score=100)
  "云南省/昆明市/呈贡区": "http://www.kmcg.gov.cn/zfxxgk/zcwj/", // 政策文件 (score=55)
  "云南省/昆明市/东川区": "http://www.kmdc.gov.cn/zfxxgk/zcwj/", // 政策文件 (score=55)
  "云南省/昆明市/富民县": "http://www.kmfm.gov.cn/zfxxgk/zcwj/", // 政策文件 (score=55)
  "云南省/昆明市/官渡区": "http://www.kmgd.gov.cn/zfxxgk/zcwj/gfxwj/", // 政策文件 (score=55)
  "云南省/昆明市/禄劝彝族苗族自治县": "http://www.kmlq.gov.cn/zfxxgkml2/zfwj/", // 政策文件 (score=55)
  "云南省/昆明市/盘龙区": "http://www.kmpl.gov.cn/zfxxgk/zcwj/", // 政策文件 (score=55)
  "云南省/昆明市/石林彝族自治县": "http://www.kmsl.gov.cn/zfxxgk/zcwj/gfxwj/", // 行政规范性文件 (score=80)
  "云南省/昆明市/西山区": "http://www.kmxs.gov.cn/zfxxgk/zcwj/gfxwj/", // 行政规范性文件 (score=80)
  "云南省/昆明市/寻甸回族彝族自治县": "http://www.kmxd.gov.cn/zfxxgkml/zcwj/", // 政策文件 (score=55)
  "云南省/丽江市/古城区": "http://www.ljgucheng.gov.cn/xljgcq/c101531/zfxxgk_nrz.shtml", // 政策文件 (score=55)
  "云南省/丽江市/永胜县": "http://www.ynljys.gov.cn/xljsysx/c100035/zfxxgk_nrz.shtml", // 政策文件 (score=55)
  "云南省/丽江市/玉龙纳西族自治县": "https://www.yulong.gov.cn/xljylx/c102140/zfxxgk_nrz.shtml", // 政策文件 (score=55)
  "云南省/普洱市/江城哈尼族彝族自治县": "https://www.jcx.gov.cn/zwgk/xxgk1/zcwj/xzgfxwj.htm", // 规范性文件 (score=80)
  "云南省/普洱市/景东彝族自治县": "http://www.jingdong.gov.cn/zfxxgk/zcwjhzc/zfwj.htm", // 政策文件库 (score=100)
  "云南省/普洱市/景谷傣族彝族自治县": "https://www.jinggu.gov.cn/zfxxgk1/gfxwj1/szfwj.htm", // 省政府文件 (score=60)
  "云南省/普洱市/孟连傣族拉祜族佤族自治县": "https://www.menglian.gov.cn/zfxxgk/zcwj/zfwj/mzf.htm", // 政策文件 (score=55)
  "云南省/普洱市/墨江哈尼族自治县": "http://www.mojiang.gov.cn/zfxxgk/zcwj.htm", // 政策文件 (score=55)
  "云南省/普洱市/西盟佤族自治县": "https://www.ximeng.gov.cn/bmml/P005_xm/P005_xm_zfwj.htm", // 县政府文件 (score=60)
  "云南省/普洱市/镇沅彝族哈尼族拉祜族自治县": "https://pezhenyuan.gov.cn/zwgk/zfxxgk1/zcwj.htm", // 政策文件库 (score=100)
  "云南省/曲靖市": "https://www.qj.gov.cn/html/zfwj/gfxwj/", // 规范性文件库 (score=80)
  "云南省/曲靖市/宣威市": "http://www.xw.gov.cn/gov/public/special/1gz.html", // 政策文件 (score=55)
  "云南省/文山壮族苗族自治州": "http://www.ynws.gov.cn/wszzf/zcwj101/pc/list.html", // 我要找政策... (score=100)
  "云南省/文山壮族苗族自治州/马关县": "http://www.ynmg.gov.cn/mgxrmzfw/xzgfxwj/pc/list.html", // 政策文件 (score=55)
  "云南省/西双版纳傣族自治州/景洪市": "http://www.jhs.gov.cn/1045.news.list.dhtml", // 政策文件 (score=55)
  "云南省/玉溪市/澄江市": "https://www.yncj.gov.cn/yxgovfront/newPolicy.jspx?path=cjxzfxxgk&type=standard&pageNo=1", // 政策文件 (score=55)
  "云南省/昭通市": "https://www.zt.gov.cn/channels/3125.html", // 政策文件 (score=55)
  "云南省/昭通市/大关县": "https://www.daguan.gov.cn/channels/3298.html", // 政策文件 (score=55)
  "云南省/昭通市/水富市": "https://www.sfs.gov.cn/channels/5836.html", // 政策文件 (score=55)
  "云南省/昭通市/绥江县": "https://www.suijiang.gov.cn/channels/4977.html", // 政策文件 (score=55)
  "云南省/昭通市/盐津县": "https://www.ztyj.gov.cn/channels/6082.html", // 政策文件 (score=55)
  "云南省/昭通市/彝良县": "https://www.cnyl.gov.cn/channels/4732.html", // 政策文件 (score=55)
  "云南省/昭通市/镇雄县": "http://www.zx.gov.cn/channels/5428.html", // 政策文件 (score=55)
  "浙江省/杭州市/滨江区": "http://www.hhtz.gov.cn/col/col1229055813/index.html", // 规范性文件 (score=80)
  "浙江省/杭州市/淳安县": "http://www.qdh.gov.cn/col/col12290510741/index.html?number=B001", // 县政府文件 (score=60)
  "浙江省/杭州市/富阳区": "http://www.fuyang.gov.cn/col/col1229051927/index.html", // 规范性文件 (score=80)
  "浙江省/杭州市/钱塘区": "https://www.qiantang.gov.cn/col/col1229607386/index.html#reloaded", // 区政府规范性文件| (score=80)
  "浙江省/杭州市/萧山区": "https://www.xiaoshan.gov.cn/col/col1229293107/index.html", // 行政规范性文件 >> (score=80)
  "浙江省/湖州市/安吉县": "https://www.anji.gov.cn/col/col1229518623/index.html?number=0-C001-003", // 规范性文件 (score=80)
  "浙江省/金华市/金东区": "https://www.jindong.gov.cn/col/col1229318839/index.html", // 区规范性文件 (score=80)
  "浙江省/金华市/浦江县": "http://www.pj.gov.cn/col/col1229196496/index.html?number=B001-03", // 行政规范性文件 (score=80)
  "浙江省/金华市/永康市": "https://www.yk.gov.cn/col/col1229188275/index.html", // 行政规范性文件 (score=80)
  "浙江省/丽水市/庆元县": "http://www.zjqy.gov.cn/col/col1229428777/index.html", // 规范性文件 (score=80)
  "浙江省/宁波市/北仑区": "http://www.bl.gov.cn/col/col1229054207/index.html?number=BL02-07-01", // 区规范性文件 (score=80)
  "浙江省/绍兴市/新昌县": "http://www.zjxc.gov.cn/col/col1229786737/index.html", // 县政府行政规范性文件 (score=80)
  "浙江省/台州市/椒江区": "https://www.jj.gov.cn/col/col1229458129/index.html", // 区政府、区府办规范性文件 (score=80)
  "浙江省/台州市/路桥区": "https://www.luqiao.gov.cn/col/col1229486965/index.html", // 区政府文件 (score=60)
  "浙江省/台州市/三门县": "https://www.sanmen.gov.cn/col/col1229683188/index.html?number=", // 行政规范性文件 (score=80)
  "浙江省/温州市/洞头区": "http://www.dongtou.gov.cn/col/col1229153943/index.html", // 政策文件 (score=55)
  "浙江省/温州市/龙港市": "http://www.zjlg.gov.cn/col/col1229153541/index.html", // 政策文件 (score=55)
  "浙江省/温州市/瓯海区": "http://www.ouhai.gov.cn/col/col1229153941/index.html", // 政策文件 (score=55)
  "浙江省/温州市/平阳县": "http://www.zjpy.gov.cn/col/col1229519550/index.html", // 政策文件 (score=55)
  "浙江省/温州市/永嘉县": "https://www.yj.gov.cn/col/col1229154638/index.html", // 规范性文件 (score=80)
  "浙江省/舟山市": "https://www.zhoushan.gov.cn/col/col1229028957/index.html", // 行政规范性文件 (score=80)
  "浙江省/舟山市/定海区": "https://www.dinghai.gov.cn/col/col1229670515/index.html", // 行政规范性文件 (score=80)
  "浙江省/舟山市/嵊泗县": "https://www.shengsi.gov.cn/col/col1229107459/index.html", // 规范性文件 (score=80)

  // —— v7 扩充（放宽列表页校验 + 浏览器请求头复探）——
  "安徽省/安庆市/怀宁县": "https://www.ahhn.gov.cn/public/column/2000000951?type=4&action=list&nav=3&sub=&catId=6718111", // 规范性文件 (score=80)
  "安徽省/蚌埠市": "https://www.bengbu.gov.cn/zfxxgk/zwgk/zcwjkzs/index.html?columnId=21981", // 政策文件库 (score=100)
  "安徽省/蚌埠市/固镇县": "https://www.guzhen.gov.cn/zfxxgk/site/tpl/8010?organId=29641&catId=18179383", // 规范性文件 (score=80)
  "安徽省/阜阳市/界首市": "https://www.ahjs.gov.cn/PolicyContent/", // 政策文件库 (score=100)
  "安徽省/阜阳市/太和县": "https://www.taihe.gov.cn/PolicyContent/", // 政策文件库 (score=100)
  "安徽省/阜阳市/颍东区": "https://www.yd.gov.cn/PolicyContent/", // 政策文件库 (score=100)
  "安徽省/阜阳市/颍上县": "https://www.ahys.gov.cn/PolicyContent/", // 政策文件库 (score=100)
  "安徽省/淮南市": "https://www.huainan.gov.cn/public/column/6596035?type=4&catId=146621818&action=list&isParent=false", // 规范性文件发布 (score=80)
  "安徽省/黄山市": "https://www.huangshan.gov.cn/zwgk/site/tpl/4780", // 我要找政策 (score=100)
  "安徽省/黄山市/屯溪区": "https://www.ahtxq.gov.cn/zwgk/public/applyQuery/4784", // 我要找政策 (score=100)
  "安徽省/六安市": "https://www.luan.gov.cn/xxgk/ztzl/zcwjk/index.html", // 政策文件库 (score=100)
  "安徽省/六安市/叶集区": "https://www.ahyeji.gov.cn/xxgk/ztzl/zcwjk/index.html", // 政策文件库 (score=100)
  "安徽省/六安市/裕安区": "https://www.yuan.gov.cn/xxgk/zcwjk/index.html", // 政策文件库 (score=100)
  "安徽省/宿州市": "https://www.ahsz.gov.cn/zwgk/ztzl/zcwjk/index.html", // 政策文件库 (score=100)
  "安徽省/铜陵市": "https://www.tl.gov.cn/openness/PolicyContent/", // 政策文件库 (score=100)
  "安徽省/铜陵市/郊区": "https://www.tljq.gov.cn/openness/PolicyContent/", // 郊区政策文件库 (score=100)
  "安徽省/铜陵市/义安区": "https://www.ahtlyaq.gov.cn/openness/PolicyContent/", // 政策文件库 (score=100)
  "安徽省/宣城市/泾县": "https://www.ahjx.gov.cn/PolicyContent/", // 政策文件库 (score=100)
  "北京市/丰台区": "http://www.bjft.gov.cn/so/zck/", // 丰台区政策文件库 (score=100)
  "北京市/海淀区": "https://zyk.bjhd.gov.cn/zwdt/zcml/", // 查找政策 (score=100)
  "重庆市/巴南区": "https://www.cqbn.gov.cn/zwgk_252/zfxxgkml/zcwjk/", // 巴南区政策文件库 (score=100)
  "重庆市/北碚区": "https://www.beibei.gov.cn/zwgk_239/zfxxgkml/zcwjk/", // 政策文件库 (score=100)
  "重庆市/大足区": "https://www.dazu.gov.cn/zwgk_175/zfxxgkml01/zcwj_121774/xzgfxwjk/gfxwj/", // 规范性文件 (score=80)
  "重庆市/丰都县": "https://www.cqfd.gov.cn/zwgk_200/xzgfxwjk/", // 县级规范性文件 (score=80)
  "重庆市/奉节县": "https://www.cqfj.gov.cn/zwgk_168/zfxxgkmls/zcwj/xzgfxwj/", // 行政规范性文件 (score=80)
  "重庆市/涪陵区": "https://www.fl.gov.cn/zfxxgk_206/zw_szfwj/", // 市政府文件 (score=60)
  "重庆市/江津区": "https://www.jiangjin.gov.cn/zwgk_180/zfxxgkml/zcwjk/", // 政策文件库 (score=100)
  "重庆市/九龙坡区": "https://www.cqjlp.gov.cn/zwgk_251/zcwj/", // 政策文件 (score=55)
  "重庆市/开州区": "https://www.cqkz.gov.cn/zwgk_238/zfxxgkml/zcwj/bmjzgfxwj/", // 行政规范性文件 (score=80)
  "重庆市/南岸区": "https://www.cqna.gov.cn/zwgk_254/zfxxgkml/zcwj/xzgfxwjk/", // 规范性文件 (score=80)
  "重庆市/南川区": "http://www.cqnc.gov.cn/zwgk_197/qtwj/qxzfgfxwj/", // 区政府规范性文件 (score=80)
  "重庆市/彭水苗族土家族自治县": "http://www.psx.gov.cn/zwgk_174/wjsearch.html", // 政策文件库 (score=100)
  "重庆市/綦江区": "https://www.cqqj.gov.cn/zwgk_159/zfxxgkml/zcwj/xzgfxwj/", // 行政规范性文件 (score=80)
  "重庆市/黔江区": "https://www.qianjiang.gov.cn/zwgk_210/zfxxgkml/zcwj_qzf/gfxwj/", // 行政规范性文件 (score=80)
  "重庆市/荣昌区": "https://www.rongchang.gov.cn/zwgk_264/zcwj/xzgfxwj/list.html", // 区政府规范性文件 (score=80)
  "重庆市/铜梁区": "https://www.cqstl.gov.cn/zcwjk/xzgfxwjygk/", // 行政规范性文件预公开 (score=80)
  "重庆市/潼南区": "https://www.cqtn.gov.cn/zwgk_184/zcwj_tnqzf/xzgfxwj_ml/xzgfxwj/", // 区政府规范性文件 (score=80)
  "重庆市/万州区": "https://www.wz.gov.cn/zwgk_266/zfxxgkml_3393/zcwj_147297/xzgfxwjk/", // 行政规范性文件 (score=80)
  "重庆市/巫山县": "http://www.cqws.gov.cn/zwgk_258/zfxxgkml_154818/zcwj/", // 县政府文件 (score=60)
  "重庆市/巫溪县": "http://www.cqwx.gov.cn/zwgk_224/zfxxgkml/zcwjk/", // 政策文件库 (score=100)
  "重庆市/酉阳土家族苗族自治县": "https://www.youyang.gov.cn/zwgk_236/zfxxgkml01/zcwj/xzgfxwj/cdindex.html", // 行政规范性文件 (score=80)
  "重庆市/忠县": "http://www.zhongxian.gov.cn/zwgk_156/zfxxgkml/zcwj/xzgfxwj/", // 行政规范性文件 (score=80)
  "福建省/福州市/福清市": "https://www.fuqing.gov.cn/xjwz/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/福州市/鼓楼区": "https://www.gl.gov.cn/xjwz/zwgkml/zcwjk/", // 政策文件库 (score=100)
  "福建省/福州市/晋安区": "http://www.fzja.gov.cn/xjwz/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/福州市/马尾区": "https://www.mawei.gov.cn/xjwz/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/福州市/闽侯县": "https://www.minhou.gov.cn/xjwz/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/福州市/闽清县": "https://www.fzmq.gov.cn/xjwz/zwgk/zfwj/", // 政府文件 (score=40)
  "福建省/福州市/平潭县": "https://www.pingtan.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/福州市/台江区": "https://www.taijiang.gov.cn/xjwz/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/福州市/长乐区": "http://www.fzcl.gov.cn/xjwz/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/龙岩市": "http://www.longyan.gov.cn/gk/zcwjk/", // 政策文件库 (score=100)
  "福建省/龙岩市/连城县": "http://www.fjlylc.gov.cn/xxgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/龙岩市/上杭县": "http://www.shanghang.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/龙岩市/武平县": "http://www.wp.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/龙岩市/新罗区": "http://www.fjxinluo.gov.cn/xxgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/龙岩市/永定区": "http://www.yongding.gov.cn/xxgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/龙岩市/漳平市": "http://www.zp.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/龙岩市/长汀县": "http://www.changting.gov.cn/xxgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/南平市": "https://www.np.gov.cn/cms/html/npszf/documentquickquery/822088335.html", // 政策文件库 (score=100)
  "福建省/南平市/建阳区": "https://www.fjjy.gov.cn/cms/html/jyqrmzf/documentquickquery/527451566.html", // 政策文件库 (score=100)
  "福建省/南平市/浦城县": "https://www.pc.gov.cn/cms/html/pcxrmzf/documentquickquery/961338524.html", // 政策文件库 (score=100)
  "福建省/南平市/邵武市": "http://www.shaowu.gov.cn/cms/html/swsrmzf/documentquickquery/1354333869.html", // 政策文件库 (score=100)
  "福建省/南平市/顺昌县": "https://www.fjsc.gov.cn/cms/html/scxrmzf/documentquickquery/745895423.html", // 政策文件库 (score=100)
  "福建省/南平市/武夷山市": "https://www.wys.gov.cn/cms/html/wyssrmzf/documentquickquery/1034376597.html", // 政策文件库 (score=100)
  "福建省/南平市/延平区": "https://www.ypzf.gov.cn/cms/html/npsypqrmzf/documentquickquery/674363726.html", // 政策文件库 (score=100)
  "福建省/南平市/政和县": "http://www.zhenghe.gov.cn/cms/html/zhxrmzf/documentquickquery/513824696.html", // 政策文件库 (score=100)
  "福建省/宁德市": "https://www.ningde.gov.cn/zcwjk/", // 政策文件库 (score=100)
  "福建省/宁德市/福安市": "http://www.fjfa.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/宁德市/古田县": "http://www.gutian.gov.cn/zcwjk/", // 政策文件库 (score=100)
  "福建省/宁德市/蕉城区": "http://www.jiaocheng.gov.cn/zcwjk/", // 政策文件库 (score=100)
  "福建省/宁德市/屏南县": "https://www.pingnan.gov.cn/zcwjk/", // 政策文件库 (score=100)
  "福建省/宁德市/寿宁县": "https://www.fjsn.gov.cn/zwgk/zfxxgk/xzgfxwj/", // 政策文件库 (score=100)
  "福建省/宁德市/霞浦县": "http://www.xiapu.gov.cn/zcwjk/", // 政策文件库 (score=100)
  "福建省/宁德市/周宁县": "http://www.zhouning.gov.cn/zcwjk/", // 政策文件库 (score=100)
  "福建省/莆田市": "https://www.putian.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/莆田市/城厢区": "https://www.chengxiang.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/莆田市/涵江区": "https://www.pthj.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/莆田市/荔城区": "https://www.ptlc.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/莆田市/仙游县": "http://www.xianyou.gov.cn/xxgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/莆田市/秀屿区": "http://www.ptxy.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/泉州市/安溪县": "https://www.fjax.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/泉州市/德化县": "http://www.dehua.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/泉州市/丰泽区": "https://www.qzfz.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/泉州市/惠安县": "https://www.huian.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/泉州市/洛江区": "https://www.qzlj.gov.cn/so/zck/", // 政策文件库 (score=100)
  "福建省/泉州市/南安市": "https://www.nanan.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/泉州市/泉港区": "https://www.qg.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/泉州市/石狮市": "https://www.shishi.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/泉州市/永春县": "http://www.fjyc.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/三明市/大田县": "http://www.datian.gov.cn/xxgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/三明市/将乐县": "http://www.jiangle.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/三明市/清流县": "http://www.fjql.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/三明市/三元区": "http://www.smsy.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/三明市/永安市": "http://www.ya.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/厦门市": "https://www.xm.gov.cn/zwgk/zcwjk/", // 政策文件库(AI阅读) (score=100)
  "福建省/厦门市/海沧区": "https://www.haicang.gov.cn/xx/zfxxgkzl/zc/zcwjk/", // 政策文件库 (score=100)
  "福建省/厦门市/湖里区": "http://www.huli.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/厦门市/集美区": "https://www.jimei.gov.cn/xxgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/厦门市/思明区": "http://www.siming.gov.cn/xxgk/zcwjk/", // 政策文件库 (score=100)
  "福建省/厦门市/同安区": "http://www.xmta.gov.cn/zc/zcwjk/", // 政策文件库 (score=100)
  "福建省/厦门市/翔安区": "http://www.xiangan.gov.cn/zwgk/zdxxgk/fgwj/gfxwj/", // 规范性文件 (score=80)
  "福建省/漳州市": "https://www.zhangzhou.gov.cn/cms/html/zzsrmzf/zcwjkws/index.html", // 政策文件库 (score=100)
  "福建省/漳州市/东山县": "http://www.dongshandao.gov.cn/cms/html/dsxrmzf/zcwjk/index.html", // 政策文件库 (score=100)
  "福建省/漳州市/华安县": "http://www.huaan.gov.cn/cms/html/haxrmzf/zfwj/index.html", // 政府文件 (score=40)
  "福建省/漳州市/龙海区": "http://www.longhai.gov.cn/cms/html/lhqrmzf/zfwj/index.html", // 政府文件 (score=40)
  "福建省/漳州市/龙文区": "http://www.lwq.gov.cn/cms/html/lwqrmzf/zfwj/index.html", // 政府文件 (score=40)
  "福建省/漳州市/南靖县": "http://www.fjnj.gov.cn/cms/html/njxrmzf/zfwj/index.html", // 政府文件 (score=40)
  "福建省/漳州市/平和县": "http://www.pinghe.gov.cn/cms/html/phxrmzf/zcwjk/index.html", // 政策文件库 (score=100)
  "福建省/漳州市/芗城区": "http://www.xc.gov.cn/cms/html/xcqrmzf/zfwj/index.html", // 政府文件 (score=40)
  "福建省/漳州市/云霄县": "http://www.yunxiao.gov.cn/cms/html/yxxrmzf/zfwj/index.html", // 政府文件 (score=40)
  "福建省/漳州市/诏安县": "http://www.zhaoan.gov.cn/cms/html/zaxrmzf/zfwj/index.html", // 政府文件 (score=40)
  "甘肃省/白银市/靖远县": "https://www.jingyuan.gov.cn/zfxxgk/fdzdgknr/lzyj/gfxwj/index.html", // 规范性文件 (score=80)
  "甘肃省/甘南藏族自治州/迭部县": "http://www.tewo.gov.cn/zfxxgk/zc/zfwj.htm", // 政府文件 (score=40)
  "甘肃省/甘南藏族自治州/碌曲县": "http://www.luqu.gov.cn/zfxxgk/zc/zfwj.htm", // 政府文件 (score=40)
  "甘肃省/甘南藏族自治州/玛曲县": "http://www.maqu.gov.cn/zfxxgk/zc/zfwj.htm", // 政府文件 (score=40)
  "甘肃省/甘南藏族自治州/夏河县": "http://www.xiahe.gov.cn/zfxxgk/zc/zfwj.htm", // 政府文件 (score=40)
  "甘肃省/庆阳市/合水县": "https://www.hsxzf.gov.cn/xxgk/zcwjk/zcwj/zfwj", // 政府文件 (score=40)
  "甘肃省/庆阳市/庆城县": "https://www.chinaqingcheng.gov.cn/ztzl/spypaq/zcfg", // 政策法规 (score=45)
  "甘肃省/庆阳市/镇原县": "https://www.gszy.gov.cn/xxgk/zcwjk/zcwj1/zcwj", // 政府文件 (score=40)
  "甘肃省/庆阳市/正宁县": "https://www.zninfo.gov.cn/zwgk/zcwjk/zcwj/zfwj2zfbgs", // 政府文件 (score=40)
  "甘肃省/天水市/甘谷县": "http://www.gangu.gov.cn/zfxxgk/zfwj/gzfwj.htm", // 政府文件 (score=40)
  "甘肃省/天水市/秦安县": "http://www.qinan.gov.cn/zfxxgk/zcwj.htm", // 政府文件 (score=40)
  "甘肃省/张掖市": "http://www.zhangye.gov.cn/zyszfxxgk/zfwj_5652/zfwj/", // 政策文件 (score=55)
  "广东省/潮州市/潮安区": "https://www.chaoan.gov.cn/zwgk/zfwj/index.html", // 政府文件 (score=40)
  "广东省/潮州市/饶平县": "https://www.raoping.gov.cn/zwgk/zfwj/index.html", // 政府文件 (score=40)
  "广东省/潮州市/湘桥区": "https://www.xiangqiao.gov.cn/zwgk/zfwj/index.html", // 政府文件 (score=40)
  "广东省/佛山市/南海区": "http://www.nanhai.gov.cn/fsnhq/zwgk/fggw/gfxwj/index.html", // 规范性文件 (score=80)
  "广东省/佛山市/顺德区": "http://www.shunde.gov.cn/sdqrmzf/zwgk/fggw/gfxwj/index.html", // 规范性文件 (score=80)
  "广东省/广州市/从化区": "http://www.conghua.gov.cn/zwgk/zcfg/qfwj/index.html", // 政策法规 (score=45)
  "广东省/广州市/越秀区": "http://www.yuexiu.gov.cn/zwgk/zfwj/index.html", // 政府文件 (score=40)
  "广东省/河源市/和平县": "http://www.heping.gov.cn/gkmlpt/search?type=standardSearch", // 规范性文件 (score=80)
  "广东省/河源市/连平县": "http://www.lianping.gov.cn/gkmlpt/policy#1076", // 规范性文件 (score=80)
  "广东省/河源市/紫金县": "http://www.zijin.gov.cn/zw/zcfg/index.html", // 政策法规 (score=45)
  "广东省/惠州市": "http://www.huizhou.gov.cn/zwgk/zcwjk/index.html", // 政策文件 (score=55)
  "广东省/惠州市/博罗县": "http://www.boluo.gov.cn/zwgk/gzwj/gfxwj/index.html", // 政策文件库 (score=100)
  "广东省/江门市": "http://www.jiangmen.gov.cn/gkmlpt/search?type=standardSearch", // 规范性文件库 (score=80)
  "广东省/江门市/鹤山市": "http://www.heshan.gov.cn/gkmlpt/search?type=standardSearch", // 规范性文件 (score=80)
  "广东省/江门市/江海区": "http://www.jianghai.gov.cn/gkmlpt/policy#5968", // 规范性文件统一发布平台 (score=80)
  "广东省/江门市/蓬江区": "http://www.pjq.gov.cn/gkmlpt/policy#5241", // 规范性文件统一发布平台 (score=80)
  "广东省/江门市/台山市": "http://www.cnts.gov.cn/gkmlpt/search?type=standardSearch", // 规范性文件库 (score=80)
  "广东省/江门市/新会区": "http://www.xinhui.gov.cn/zwgk/zfgkml/gfxpt", // 规范性文件库 (score=80)
  "广东省/茂名市": "http://www.maoming.gov.cn/gkmlpt/policy#16901", // 市政府规范性文件 (score=80)
  "广东省/茂名市/茂南区": "http://www.maonan.gov.cn/zwgk/zcfg/index.html", // 政策法规 (score=45)
  "广东省/梅州市/梅县区": "https://www.gdmx.gov.cn/zwgk/zfwj", // 区政府文件 (score=60)
  "广东省/清远市/清新区": "https://www.qingxin.gov.cn/zwgk/zfwj/index.html", // 政府文件 (score=40)
  "广东省/汕头市/南澳县": "http://www.nanao.gov.cn/gkmlpt/policy#30", // 规范性文件 (score=80)
  "广东省/汕尾市": "http://www.shanwei.gov.cn/shanwei/zwgk/jcxx/zcfg/index.html", // 政策法规 (score=45)
  "广东省/汕尾市/陆丰市": "https://www.lufengshi.gov.cn/swlufeng/zwgk/zcfg/index.html", // 政策法规 (score=45)
  "广东省/韶关市/仁化县": "http://www.sgrh.gov.cn/zwgk/zcfg/index.html", // 政策法规 (score=45)
  "广东省/韶关市/武江区": "http://www.sgwjq.gov.cn/gkmlpt/search?type=standardSearch", // 规范性文件 (score=80)
  "广东省/韶关市/浈江区": "https://www.sgzj.gov.cn/sgzjbgs/gkmlpt/search?type=standardSearch", // 规范性文件 (score=80)
  "广东省/深圳市/宝安区": "https://www.baoan.gov.cn/xxgk/fgk/index.html?category=68453", // 区规范性文件 (score=80)
  "广东省/深圳市/龙岗区": "https://www.lg.gov.cn/xxgk/ztzl/zcwjk/", // 政策文件库 (score=100)
  "广东省/深圳市/龙华区": "https://www.szlhq.gov.cn/xxgk/zcfg/qgfxwj/qgfxwj_129575/index.html", // 规范性文件 (score=80)
  "广东省/深圳市/罗湖区": "https://www.szlh.gov.cn/zcwjk/index.html", // 政策文件库 (score=100)
  "广东省/深圳市/南山区": "https://www.szns.gov.cn/gkmlpt/search?type=standardSearch", // 规范性文件查询 (score=80)
  "广东省/深圳市/坪山区": "https://www.szpsq.gov.cn/zwgk/gfxwjtycxpt/index.html", // 规范性文件统一查询平台 (score=80)
  "广东省/深圳市/盐田区": "https://www.yantian.gov.cn/apps/queryplatform/index.html", // 规范性文件查询 (score=80)
  "广东省/云浮市": "https://www.yunfu.gov.cn/gkmlpt/search?type=standardSearch", // 规范性文件 (score=80)
  "广东省/云浮市/罗定市": "https://www.luoding.gov.cn/ldsrmzf/zwgk/zcfg/index.html", // 政策法规 (score=45)
  "广东省/云浮市/新兴县": "http://www.xinxing.gov.cn/xxxrmzf/zwgk/zfwj/index.html", // 政府文件 (score=40)
  "广东省/云浮市/郁南县": "http://www.gdyunan.gov.cn/ynxrmzf/zwgk/xxgkmlxt/zcfg/index.html", // 政策法规 (score=45)
  "广东省/云浮市/云城区": "http://www.yfyunchengqu.gov.cn/ycqrmzf/jcxxgk/zfwj/index.html", // 政府文件 (score=40)
  "广东省/湛江市": "https://www.zhanjiang.gov.cn/zfwj/index.html", // 政府文件 (score=40)
  "广东省/湛江市/雷州市": "http://www.leizhou.gov.cn/gkmlpt/search?type=standardSearch", // 规范性文件 (score=80)
  "广东省/湛江市/廉江市": "http://www.lianjiang.gov.cn/zwgk/zfwj", // 政府文件 (score=40)
  "广东省/湛江市/吴川市": "https://www.gdwc.gov.cn/bmzz/wcsrmzfw/zwgk/zfgb/zfwj/index.html", // 政府文件 (score=40)
  "广东省/湛江市/霞山区": "http://www.zjxs.gov.cn/zwgk/zcwj/index.html", // 政府文件 (score=40)
  "广东省/肇庆市": "https://www.zhaoqing.gov.cn/xxgk/zcwjk/index.html", // 政策文件库 (score=100)
  "广东省/肇庆市/德庆县": "https://www.gddq.gov.cn/zwgk/zfwj/index.html", // 政府文件 (score=40)
  "广东省/肇庆市/端州区": "https://www.zqdz.gov.cn/zwgk/zfwj/qfwj/index.html", // 政府文件 (score=40)
  "广东省/肇庆市/广宁县": "http://www.gdgn.gov.cn/gkmlpt/search?type=standardSearch", // 规范性文件 (score=80)
  "广东省/肇庆市/四会市": "https://www.sihui.gov.cn/zwgk/zfwj/zfwj/index.html", // 政府文件 (score=40)
  "广东省/珠海市": "https://www.zhuhai.gov.cn/zw/fggw/gfxwj/index.html", // 规范性文件 (score=80)
  "广西壮族自治区/百色市": "http://www.baise.gov.cn/zwgk/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/百色市/靖西市": "http://www.jingxi.gov.cn/xxgk/fdzdgkmr/jcxxgk/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/百色市/乐业县": "http://www.leye.gov.cn/xxgk/zfwj/", // 政策文件 (score=55)
  "广西壮族自治区/百色市/田林县": "http://www.tianlin.gov.cn/xxgk/zfxxgkzl/fdzdgknr/jbxx/wjzl/zfwj/", // 政府文件 (score=40)
  "广西壮族自治区/百色市/田阳区": "http://www.gxty.gov.cn/zfxxgk/fdzdgknr_1_1_1/zfwj/xfwj/", // 政府文件 (score=40)
  "广西壮族自治区/北海市": "http://www.beihai.gov.cn/zfxxgk/zc/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/北海市/海城区": "http://www.bhhc.gov.cn/zfxxgk/zcwj_4/", // 政策文件库 (score=100)
  "广西壮族自治区/北海市/银海区": "http://www.yinhai.gov.cn/zfxxgk/zcwj/", // 政策文件库 (score=100)
  "广西壮族自治区/防城港市": "https://www.fcgs.gov.cn/zfxxgk/zcwj/xzgfxwj/", // 规范性文件库 (score=80)
  "广西壮族自治区/防城港市/东兴市": "http://www.dxzf.gov.cn/zwgk/fdzdgknr_1/gfxwj/", // 政策文件查询 (score=55)
  "广西壮族自治区/防城港市/防城区": "http://www.fcq.gov.cn/xxgk/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/防城港市/上思县": "http://www.shangsi.gov.cn/zfxxgkzl/zfwj/", // 规范性文件 (score=80)
  "广西壮族自治区/贵港市/港南区": "http://www.gggn.gov.cn/xxgk/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/贵港市/覃塘区": "http://www.ggqt.gov.cn/xxgk/zfwj/", // 政策文件 (score=55)
  "广西壮族自治区/桂林市": "https://www.guilin.gov.cn/zfxxgk/zc/zcwjk/", // 政策文件 (score=55)
  "广西壮族自治区/桂林市/恭城瑶族自治县": "http://www.gongcheng.gov.cn/zfxxgk/fdzdgknr/jcxxgk/zcwjk/", // 政策文件 (score=55)
  "广西壮族自治区/桂林市/临桂区": "http://www.lingui.gov.cn/zfxxgk/zc/zcwjk/zfwj/", // 政府文件 (score=40)
  "广西壮族自治区/桂林市/龙胜各族自治县": "http://www.glls.gov.cn/zfxxgk/fdzdgknr/jcxxgk/zcwjk/", // 政策文件库 (score=100)
  "广西壮族自治区/桂林市/七星区": "http://www.glqx.gov.cn/zfxxgk/fdzdgknr/jcxxgk/zcwjk/zfwj/", // 政府文件 (score=40)
  "广西壮族自治区/桂林市/雁山区": "http://www.glyszf.gov.cn/zfxxgk/zc/zcwjk/", // 政策文件库 (score=100)
  "广西壮族自治区/桂林市/永福县": "http://www.yfzf.gov.cn/zfxxgk/zc/zcwjk/zfwj/", // 政府文件 (score=40)
  "广西壮族自治区/桂林市/资源县": "http://www.ziyuan.gov.cn/zfxxgk/fdzdgknr/jcxxgk/zcwjk/", // 政策文件 (score=55)
  "广西壮族自治区/河池市": "http://www.hechi.gov.cn/zfxxgk/zfwj/", // 政策文件库 (score=100)
  "广西壮族自治区/河池市/大化瑶族自治县": "http://www.gxdh.gov.cn/xxgk/zfwj/", // 政策文件 (score=55)
  "广西壮族自治区/河池市/东兰县": "http://www.donglan.gov.cn/xxgk/zcwj/zfwj/", // 政策文件库 (score=100)
  "广西壮族自治区/河池市/凤山县": "http://www.gxfsx.gov.cn/xxgk/fdzdgknr/jcxxgk/gfxwj/gzwj/", // 政府文件 (score=40)
  "广西壮族自治区/河池市/环江毛南族自治县": "http://www.hjzf.gov.cn/xxgk/zfwj/", // 政策文件 (score=55)
  "广西壮族自治区/河池市/金城江区": "http://www.jcj.gov.cn/xxgk/zfwj/zfwj_5465/", // 政府文件 (score=40)
  "广西壮族自治区/河池市/南丹县": "http://www.gxnd.gov.cn/xxgk/zfwj/", // 政策文件 (score=55)
  "广西壮族自治区/贺州市/八步区": "http://www.gxbabu.gov.cn/zwgk_81325/zwxxgkzl_1/zhengce/zffwj/", // 政策文件 (score=55)
  "广西壮族自治区/贺州市/平桂区": "http://www.pinggui.gov.cn/xxgk/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/来宾市/合山市": "http://www.heshanshi.gov.cn/xxgk/zcwj/", // 政策文件库 (score=100)
  "广西壮族自治区/来宾市/兴宾区": "http://www.xingbin.gov.cn/zfxxgk_1/zcwj/index.shtml", // 政策文件 (score=55)
  "广西壮族自治区/柳州市": "https://www.liuzhou.gov.cn/zwgk/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/柳州市/柳江区": "http://www.liujiang.gov.cn/xxgk/zc/jzg/", // 行政规范性文件 (score=80)
  "广西壮族自治区/柳州市/柳南区": "http://www.liunan.gov.cn/xxgk/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/柳州市/鹿寨县": "http://www.luzhai.gov.cn/xxgk/zfwj/lzflzg/index.shtml", // 行政规范性文件 (score=80)
  "广西壮族自治区/柳州市/融安县": "http://www.rongan.gov.cn/xxgk/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/柳州市/鱼峰区": "http://www.yfq.gov.cn/zwgk/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/南宁市/良庆区": "http://www.liangqing.gov.cn/xxgk/fdzdgk/jcxxgk/zfwj/", // 政策文件查询 (score=55)
  "广西壮族自治区/南宁市/上林县": "http://www.shanglin.gov.cn/gk/xxgkml/jcxxgk/gfxwj/xzgfxwj/", // 政策文件 (score=55)
  "广西壮族自治区/钦州市/钦南区": "http://www.gxqn.gov.cn/zfxxgk/zcwj2/jcgkgfxwj/", // 行政规范性文件 (score=80)
  "广西壮族自治区/梧州市": "https://www.wuzhou.gov.cn/zfxxgk_2/fdzdgknr/wjzl/zfwj/", // 政策文件库 (score=100)
  "广西壮族自治区/梧州市/蒙山县": "http://www.gxms.gov.cn/xxgk/zfxxgkzl/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/梧州市/万秀区": "http://www.wzwxq.gov.cn/xxgk/gkbz/fdzdgknr/gfxwjk/", // 规范性文件库 (score=80)
  "广西壮族自治区/梧州市/长洲区": "http://www.wzczq.gov.cn/wjk/index.shtml?allKeyword=&typeKey=2&&title=&doc=&fwdw=&fwzh=&fwnf=", // 行政规范性文件库 (score=80)
  "广西壮族自治区/玉林市": "http://www.yulin.gov.cn/zcwj/", // 政策文件 (score=55)
  "广西壮族自治区/玉林市/北流市": "http://www.beiliu.gov.cn/zfxxgk_1/wjzl/zfwj/", // 政策文件 (score=55)
  "广西壮族自治区/玉林市/容县": "http://www.rxzf.gov.cn/xxgk/zfxxgkzl/xxgkml_1/wjzl/zcfg/", // --> 政策法规 (score=45)
  "广西壮族自治区/玉林市/兴业县": "http://www.xingye.gov.cn/zfxxgk/xxgkml/wjzl/zfwj/", // 政策文件 (score=55)
  "贵州省/安顺市/普定县": "https://www.aspd.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/毕节市/织金县": "http://www.gzzhijin.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/贵阳市": "https://www.guiyang.gov.cn/zwgk/zfxxgks/fdzdgknr/lzyj/gfxwj/szfgfxwj/", // 市政府文件 (score=60)
  "贵州省/贵阳市/修文县": "http://www.xiuwen.gov.cn/ztzl_5667680/rdzt/gzhgfxwjsjk/", // 行政规范性文件库 (score=80)
  "贵州省/六盘水市/盘州市": "https://www.panzhou.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/六盘水市/水城区": "http://www.shuicheng.gov.cn/newsite/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/黔东南苗族侗族自治州/从江县": "https://www.congjiang.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/黔东南苗族侗族自治州/锦屏县": "https://www.jinping.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/黔东南苗族侗族自治州/雷山县": "http://www.leishan.gov.cn/zwgk/gzhgfxwjsjk/", // 规范性文件数据库 (score=80)
  "贵州省/黔东南苗族侗族自治州/台江县": "https://www.gztaijiang.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/黔东南苗族侗族自治州/镇远县": "http://www.zygov.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/黔南布依族苗族自治州": "http://www.qiannan.gov.cn/ztzl/gzhgfxwjsjk_0263/gzsjk/index.html", // 规范性文件数据库 (score=80)
  "贵州省/黔南布依族苗族自治州/福泉市": "https://www.gzfuquan.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/黔南布依族苗族自治州/瓮安县": "http://www.wengan.gov.cn/gk/zcwj/", // 政策文件 (score=55)
  "贵州省/黔西南布依族苗族自治州": "https://www.qxn.gov.cn/ztzl/gzhgfxwjsjk/gfxsjwjk/", // 规章和规范性文件库 (score=80)
  "贵州省/黔西南布依族苗族自治州/安龙县": "https://www.gzal.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "贵州省/黔西南布依族苗族自治州/晴隆县": "https://www.gzql.gov.cn/zwgk/xxgkml/jcxxgk/zcwj/gfxwjql/", // 规范性文件清理 (score=80)
  "贵州省/铜仁市/碧江区": "https://www.bjq.gov.cn/zwgk/xzgfxwjk/", // 行政规范性文件库 (score=80)
  "贵州省/遵义市": "https://www.zunyi.gov.cn/zwgk/zfwj/", // 政策文件 (score=55)
  "贵州省/遵义市/道真仡佬族苗族自治县": "http://www.gzdaozhen.gov.cn/xxgk/xxgkml/jcgk/zcfg/zfwj/index.html", // 政策法规 (score=45)
  "贵州省/遵义市/仁怀市": "https://www.rh.gov.cn/zwgk/gzhgfxwjk/", // 规章和规范性文件库 (score=80)
  "贵州省/遵义市/务川仡佬族苗族自治县": "https://www.gzwuchuan.gov.cn/zwgk/gzhgfxwjsjk/", // 规章和规范性文件数据库 (score=80)
  "海南省/儋州市": "https://www.danzhou.gov.cn/xxgk/zfwj/", // 政策文件 (score=55)
  "河北省/邯郸市": "https://www.hd.gov.cn/hdzfxxgk/zfwj/", // 政府文件 (score=40)
  "河北省/邯郸市/复兴区": "http://www.hdfx.gov.cn/fxqxxgk/zfwj/", // 政府文件 (score=40)
  "河北省/邯郸市/馆陶县": "http://www.guantao.gov.cn/zwgk/zfxxgk/zc/zfwj/", // 政府文件 (score=40)
  "河北省/邯郸市/临漳县": "http://www.linzhang.gov.cn/lzxxxgk/zfwj/", // 政府文件 (score=40)
  "河北省/廊坊市": "https://www.lf.gov.cn/Category_171/Index.aspx", // 规范性文件草案征集 (score=80)
  "河北省/邢台市": "http://info.xingtai.gov.cn/channel/list/100.html", // 规范性文件 (score=80)
  "河南省/济源示范区": "https://www.jiyuan.gov.cn/zwgk/zcwjk/", // 政府文件 (score=40)
  "河南省/焦作市/博爱县": "http://www.boai.gov.cn/zfxxgk/xxgkml/zfwj/", // 政府文件 (score=40)
  "河南省/焦作市/孟州市": "https://www.mengzhou.gov.cn/zfxxgk/zc/xzgfxwj", // 政府文件 (score=40)
  "河南省/焦作市/温县": "http://www.wenxian.gov.cn/zwgk/zfwj", // 政府文件 (score=40)
  "河南省/洛阳市/嵩县": "https://www.hnsongxian.gov.cn/zfxxgk/zfwj", // 政府文件 (score=40)
  "河南省/洛阳市/偃师区": "https://www.yanshi.gov.cn/ztzl/syxfztzl/jczwgk/zcwj", // 政府文件 (score=40)
  "河南省/南阳市/桐柏县": "https://www.tongbai.gov.cn/zwgk/zcjd/zcwj/", // 政策文件 (score=55)
  "河南省/南阳市/淅川县": "https://www.xichuan.gov.cn/zfxxgk/zc/xzgfxwj/zfxzgfxwj/", // 政府文件 (score=40)
  "河南省/南阳市/镇平县": "https://www.zhenping.gov.cn/ztlm/xzgfxwjk/", // 规范性文件 (score=80)
  "河南省/平顶山市/宝丰县": "https://www.baofeng.gov.cn/channels/32564.html", // 行政规范性文件 (score=80)
  "河南省/平顶山市/卫东区": "https://www.weidong.gov.cn/channels/32577.html", // 规范性文件 (score=80)
  "河南省/平顶山市/新华区": "https://www.xinhuaqu.gov.cn/channels/32822.html", // 规范性文件 (score=80)
  "河南省/平顶山市/湛河区": "https://www.zhq.gov.cn/channels/33066.html", // 规范性文件 (score=80)
  "河南省/濮阳市/华龙区": "http://www.pyhualong.gov.cn/zwgk/fgwj/bjzcwj/", // 政府文件 (score=40)
  "河南省/信阳市/潢川县": "http://www.huangchuan.gov.cn/zfxxgk/zcwj/", // 政府文件 (score=40)
  "河南省/信阳市/平桥区": "http://www.xypingqiao.gov.cn/zfxxgk/zc/zfwj", // 政府文件 (score=40)
  "河南省/许昌市/鄢陵县": "http://www.yanling.gov.cn/govxxgk/114110240057660135/openSubPage.html?specialurl=/govxxgk/114110240057660135/category/032/032002/032002004/govlist.html&righttitle=%E6%B3%95%E8%A7%84%E6%96%87%E4%BB%B6", // 规范性文件 (score=80)
  "河南省/周口市/川汇区": "https://www.chuanhui.gov.cn/sitesources/chq/page_pc/zwgk/jcxxgk/zfwj/gfxwj/index.html", // 规范性文件 (score=80)
  "河南省/驻马店市/驿城区": "http://www.zmdycq.gov.cn/zwgk/zfxxgk/fdzdgknr/zfwj/yzwj/", // 政府文件 (score=40)
  "黑龙江省/大兴安岭地区/呼中区": "http://www.huzhong.gov.cn/huzhong/c100417/zfxxgk_list.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/哈尔滨市/木兰县": "https://www.mulan.gov.cn/hebmlx/xzgfxwj/tzy_xj.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/哈尔滨市/五常市": "http://www.hljwch.gov.cn/hebwcs/zfwj/lby.shtml", // 政府文件 (score=40)
  "黑龙江省/鹤岗市/萝北县": "http://www.luobei.gov.cn/luobeixianrenminzhengfu/4fc0f4717f5a4d829271fcc9a7e9d1f9/ns_zwgk.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/鹤岗市/兴山区": "http://www.hgxs.gov.cn/xingshanqurenminzhengfu/70ce5815096c4c33ba9cf6cb842acc63/ns_zwgk.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/牡丹江市/穆棱市": "https://www.muling.gov.cn/mdjmlsrmzf/c103203/redirect.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/牡丹江市/西安区": "https://www.mdjxa.gov.cn/mdjxaqrmzf/c102429/redirect.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市": "https://www.qqhr.gov.cn/hlj-policy/#/index", // 政策文件库 (score=100)
  "黑龙江省/齐齐哈尔市/富拉尔基区": "http://www.flej.gov.cn/flej/c101899/redirect_firstChannel.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/齐齐哈尔市/梅里斯达斡尔族区": "http://www.mls.gov.cn/mls/c102575/redirect_firstChannel.shtml", // 政策文件库 (score=100)
  "黑龙江省/齐齐哈尔市/碾子山区": "http://www.nzs.gov.cn/nzsq/c102363/redirect_firstChannel.shtml", // 行政规范性文件 (score=80)
  "黑龙江省/绥化市/北林区": "https://www.hljbeilin.gov.cn/bl/qzfwj/zfxxgk.shtml", // 政府文件 (score=40)
  "湖北省/鄂州市/鄂城区": "https://www.echeng.gov.cn/ecqxxgk/zc/zcwj/202602/t20260203_749452.html", // 行政规范性文件情况说明 (score=80)
  "湖北省/鄂州市/梁子湖区": "https://www.liangzh.gov.cn/lzhxxgk/zc/zcwj/202601/t20260108_744054.html", // 行政规范性文件情况说明 (score=80)
  "湖北省/恩施土家族苗族自治州": "http://www.enshi.gov.cn/fw/znwdk/zcwj.html", // 政策文件库 (score=100)
  "湖北省/恩施土家族苗族自治州/恩施市": "http://www.es.gov.cn/xxgk/zc/zcwj/", // 政策文件 (score=55)
  "湖北省/恩施土家族苗族自治州/建始县": "http://www.hbjs.gov.cn/xxgk/zc/zcwj/", // 政策文件 (score=55)
  "湖北省/恩施土家族苗族自治州/来凤县": "http://www.laifeng.gov.cn/xxgk/zc/zcwj/", // 政策文件 (score=55)
  "湖北省/恩施土家族苗族自治州/利川市": "http://www.lichuan.gov.cn/xxgk/zc/zcwj/", // 政策文件 (score=55)
  "湖北省/恩施土家族苗族自治州/宣恩县": "http://www.xe.gov.cn/xxgk/zc/zcwj/", // 政策文件 (score=55)
  "湖北省/黄冈市/黄梅县": "http://www.hm.gov.cn/zwgk/public/column/6636010?type=4&catId=7031014&action=list", // 规范性文件 (score=80)
  "湖北省/黄石市": "https://www.huangshi.gov.cn/xxxgk/2020_zc/2020_gfxwj/", // 规范性文件 (score=80)
  "湖北省/黄石市/大冶市": "http://www.huangshi.gov.cn/xxxgk/2020_zc/2020_gfxwj/", // 规范性文件 (score=80)
  "湖北省/黄石市/西塞山区": "https://www.xisaishan.gov.cn/xxgk/2020_zc/zfwj/", // 规范性文件 (score=80)
  "湖北省/荆门市": "https://www.jingmen.gov.cn/col/col26014/index.html", // 我要找政策 (score=100)
  "湖北省/潜江市": "http://www.hbqj.gov.cn/xwzx/ztbd/zcwjk/index.html", // 规范性文件库 (score=80)
  "湖北省/十堰市/郧阳区": "http://yunyang.shiyan.gov.cn/xxgkxi/zc/zfwj/202603/t20260304_4906027.shtml", // 暂未最新规范性文件 (score=80)
  "湖北省/随州市/曾都区": "http://www.zengdu.gov.cn/zwgk/zc/zfwj/", // 规范性文件 (score=80)
  "湖北省/随州市/广水市": "http://www.guangshui.gov.cn/zwgk/zc/zfbwj_9827/", // 规范性文件 (score=80)
  "湖北省/天门市": "https://www.tianmen.gov.cn/zwgk/zc/zcfg/", // 规范性文件 (score=80)
  "湖北省/武汉市/洪山区": "https://www.hongshan.gov.cn/xxgk/zc/qt/qzfwj/", // 政策文件 (score=55)
  "湖北省/武汉市/江岸区": "https://www.jiangan.gov.cn/jaxxw/zfxxgk/zc_41333/gfxwj/", // 规范性文件 (score=80)
  "湖北省/武汉市/硚口区": "https://www.qiaokou.gov.cn/hdjl/zccx/zcwj/", // 政策文件库 (score=100)
  "湖北省/咸宁市": "http://www.xianning.gov.cn/zcwjk/", // 政策文件库 (score=100)
  "湖北省/孝感市": "http://www.xiaogan.gov.cn/c/www/gfxwj.jhtml", // 政策文件 (score=55)
  "湖北省/宜昌市": "http://www.yichang.gov.cn/list-61891-1.html", // 规范性文件库 (score=80)
  "湖南省/衡阳市/常宁市": "http://www.hnchangning.gov.cn/zwgk/szfxxgkml/gfxwj/index.html", // 规范性文件 (score=80)
  "湖南省/衡阳市/衡南县": "http://www.hengnan.gov.cn/zwgk/zcwj/index.html", // 政策文件 (score=55)
  "湖南省/衡阳市/珠晖区": "http://www.hyzhq.gov.cn/zwgk/qzfxxgkml/zcwj/index.html", // 政策文件 (score=55)
  "湖南省/怀化市/靖州苗族侗族自治县": "https://www.jzx.gov.cn/jzx/c137345/zcwjk.shtml", // 规范性文件库 (score=80)
  "湖南省/怀化市/溆浦县": "http://www.xp.gov.cn/xp/c110138/zcwjk.shtml", // 政策文件 (score=55)
  "湖南省/永州市/新田县": "http://www.xt.gov.cn/xt/gfxwj/zcwjk.shtml", // 政策法规 (score=45)
  "湖南省/长沙市/天心区": "http://www.tianxin.gov.cn/zwgk8/xxgkml9/lzyj/gfxwjxt72/gfxwjgl/202604/t20260402_12351190.html", // 规范性文件动态效力报告 (score=80)
  "湖南省/长沙市/雨花区": "http://www.yuhua.gov.cn/zwgk97/jcxxgk/zcwj/gfxwjxt/", // 规范性文件 (score=80)
  "吉林省/白城市/洮南市": "http://www.taonan.gov.cn/xxgk/zfwj/", // 政府文件 (score=40)
  "吉林省/白城市/通榆县": "http://tongyu.gov.cn/zwgk/zcfg/", // 政策法规 (score=45)
  "吉林省/白山市/抚松县": "http://www.fusong.gov.cn/zwgk/zcwj/", // 政府文件 (score=40)
  "吉林省/白山市/浑江区": "http://www.hunjiang.gov.cn/zw/zfwj/", // 政府文件 (score=40)
  "吉林省/白山市/靖宇县": "http://jyx.cbs.gov.cn/zwgk/zfwj/", // 政府文件 (score=40)
  "吉林省/吉林市/昌邑区": "http://www.jlscy.gov.cn/xwfb/zfwj/", // 政府文件 (score=40)
  "吉林省/吉林市/丰满区": "http://www.jlfm.gov.cn/xxgk/zdxxgk/zcfg/", // 政府文件 (score=40)
  "吉林省/辽源市/东辽县": "http://www.dongliao.gov.cn/xxgk/zwxxgkfl/zfwj/", // 政府文件 (score=40)
  "吉林省/辽源市/龙山区": "http://www.jllyls.gov.cn/xxgk/zfxxgkfl/zfwj/", // 政府文件 (score=40)
  "吉林省/辽源市/西安区": "http://www.lyxa.gov.cn/xxgk/zwxxgkfl/zfwj/", // 政府文件 (score=40)
  "吉林省/四平市/梨树县": "http://www.lishu.gov.cn/zw/zfwj/", // 政府文件 (score=40)
  "吉林省/通化市/梅河口市": "http://www.mhk.gov.cn/xqxz/zfwj/", // 政策文件 (score=55)
  "吉林省/延边朝鲜族自治州/安图县": "http://www.antu.gov.cn/zw_2292/zcfg/", // 政策法规 (score=45)
  "吉林省/延边朝鲜族自治州/敦化市": "http://www.dunhua.gov.cn/zw_2131/zfwj/", // 政府文件 (score=40)
  "吉林省/延边朝鲜族自治州/和龙市": "http://www.helong.gov.cn/zw_2395/zcfg/", // 政策法规 (score=45)
  "吉林省/延边朝鲜族自治州/龙井市": "http://www.longjing.gov.cn/zw/wj/fgwj/", // 政策法规 (score=45)
  "吉林省/延边朝鲜族自治州/汪清县": "http://www.wangqing.gov.cn/zwgk_1972/zfwj/", // 政府文件 (score=40)
  "吉林省/长春市/公主岭市": "http://www.gongzhuling.gov.cn/zw/jcxxgk/zfwj/", // 政府文件 (score=40)
  "吉林省/长春市/绿园区": "http://www.luyuan.gov.cn/zwgk/wgk/jcgk/gfxwj/", // 政策文件 (score=55)
  "江苏省/常州市/金坛区": "https://www.jintan.gov.cn/class/IKJJACAL?furl=gfxwj&t=1", // 规范性文件 (score=80)
  "江苏省/淮安市": "https://www.huaian.gov.cn/cmsweb/zwgk/zcwj/s.html", // 淮安市政策文件库 (score=100)
  "江苏省/淮安市/淮安区": "http://www.zghaq.gov.cn/cmsweb/zwgk/haq/index.html?type=2&rdeptid=0000000065316fb40165326056f601d4&topic=2697", // 规范性文件 (score=80)
  "江苏省/南通市": "https://www.nantong.gov.cn/ntsrmzf/szfwj/szfwj.html", // 政府文件 (score=40)
  "江苏省/南通市/海门区": "https://www.haimen.gov.cn/hmsrmzf/zfwj/zfwj.html", // 政策法规 (score=45)
  "江苏省/南通市/如东县": "https://www.rudong.gov.cn/rdxrmzf/xzfwj/xzfwj.html", // 政府文件 (score=40)
  "江苏省/苏州市": "https://www.suzhou.gov.cn/szsrmzf/qszcwjk/zcwjk.shtml", // 全市政策文件库 (score=100)
  "江苏省/苏州市/太仓市": "http://www.taicang.gov.cn/taicang/zcwjk/zcwjk.shtml", // 政策文件库 (score=100)
  "江苏省/苏州市/吴江区": "https://www.wujiang.gov.cn/zgwj/wjzcwj/zcwjk.shtml", // 政策文件库 (score=100)
  "江苏省/苏州市/张家港市": "http://www.zjg.gov.cn/zjg/zcwjk/wjk.shtml", // 政策文件库 (score=100)
  "江苏省/宿迁市": "https://www.suqian.gov.cn/zcwjk/index.shtml", // 政策文件库 (score=100)
  "江苏省/泰州市/高港区": "https://www.cmc.gov.cn/fzlm/zcwj/index.html", // 政策文件库 (score=100)
  "江苏省/泰州市/靖江市": "https://www.jingjiang.gov.cn/xxgk/fdzdgknr/fggw/szfwj/index.html", // 市政府文件 (score=60)
  "江苏省/泰州市/泰兴市": "http://www.taixing.gov.cn/zwgk/xxgk/fggw/szfwj/index.html", // 市政府文件 (score=60)
  "江苏省/无锡市/滨湖区": "https://www.wxbh.gov.cn/zfxxgk/sqzfxxgkml_1/fgwjjjd/index.shtml", // 政策文件库 (score=100)
  "江苏省/徐州市": "https://www.xz.gov.cn/dynamic/zwgk/govInfoPubright.html?categorynum=003001002", // 规范性文件 (score=80)
  "江苏省/扬州市/宝应县": "https://baoying.yangzhou.gov.cn/zfxxgk/fdzdgknr/zfwj/xzfwj/index.html", // 县政府文件 (score=60)
  "江苏省/扬州市/广陵区": "http://www.yzglq.gov.cn/zfxxgk/fdzdgknr/qzfwj/index.html", // 区政府文件 (score=60)
  "江西省/赣州市/全南县": "http://www.quannan.gov.cn/qnxxxgk/zcwj/xxgk_list.shtml", // 政府文件 (score=40)
  "江西省/吉安市": "https://www.jian.gov.cn/xxgk-list-faguiwenjian.html", // 政策文件库 (score=100)
  "江西省/南昌市/安义县": "https://anyi.nc.gov.cn/ayxzf/xzfwj/xxgk_list.shtml", // 政府文件 (score=40)
  "江西省/南昌市/红谷滩区": "http://hgt.nc.gov.cn/hgtqrmzf/zwgk/government.shtml?/hgtqrmzf/gfxwjfb/bmxxgk_list.shtml", // 规范性文件 (score=80)
  "江西省/宜春市/丰城市": "https://www.jxfc.gov.cn/fcsrmzf/gfxwj/pc/list.html", // 规范性文件 (score=80)
  "江西省/宜春市/上高县": "http://www.shanggao.gov.cn/sgxrmzf/zcwj/pc/list.html", // 政策文件 (score=55)
  "江西省/宜春市/万载县": "http://www.wanzai.gov.cn/wzxrmzf/zfwj/pc/list.html", // 政策文件 (score=55)
  "江西省/宜春市/宜丰县": "http://www.jxyf.gov.cn/yfxrmzf/zhengce/pc/list.html", // 政策文件 (score=55)
  "江西省/宜春市/袁州区": "http://www.yzq.gov.cn/yzqrmzf/zcwj/pc/list.html", // 政策文件 (score=55)
  "辽宁省/本溪市/本溪满族自治县": "http://www.bx.gov.cn/publicity/xzfxx/lzyj/szfwj", // 政府文件 (score=40)
  "辽宁省/本溪市/明山区": "http://www.mingshan.gov.cn/publicity/qzfxx/zfwj", // 政府文件 (score=40)
  "辽宁省/本溪市/南芬区": "http://www.nanfen.gov.cn/publicity/qzfxx/zfwj", // 政府文件 (score=40)
  "辽宁省/本溪市/溪湖区": "http://www.xihu.gov.cn/publicity/zdxxgz/lzyj/zfwj", // 政府文件 (score=40)
  "辽宁省/葫芦岛市": "https://www.hld.gov.cn/zcwjk/", // 政策文件库 (score=100)
  "辽宁省/葫芦岛市/兴城市": "https://www.zg-xc.gov.cn/xxgk/zfxxgk/fdzdgknr/zfwj/", // 政策文件 (score=55)
  "辽宁省/锦州市": "https://www.jz.gov.cn/zwgk/fdzdgknr/lzyj1/szfwj.htm", // 政府文件 (score=40)
  "辽宁省/锦州市/黑山县": "http://www.heishan.gov.cn/zwgk/fdzdgknr/lzyj/zfwj.htm", // 政府文件 (score=40)
  "辽宁省/沈阳市/浑南区": "http://www.hunnan.gov.cn/zwgk/fdzdgknr/zfwj/", // 政府文件 (score=40)
  "辽宁省/沈阳市/康平县": "http://www.kangping.gov.cn/zwgk/fdzdgknr/zfwj/", // 政府文件 (score=40)
  "辽宁省/沈阳市/沈北新区": "http://www.nsy.gov.cn/zwgk/fdzdgknr/zfwj/", // [政府文件] (score=40)
  "辽宁省/沈阳市/苏家屯区": "http://www.sjtq.gov.cn/zwgk/fdzdgknr/zfwj/sszfwj/", // 政府文件 (score=40)
  "辽宁省/沈阳市/新民市": "https://www.xinmin.gov.cn/zwgk/fdzdgknr/zfwj/", // 政府文件 (score=40)
  "辽宁省/营口市/鲅鱼圈区": "http://www.ykdz.gov.cn/govpub/govGuidePub.html?categorynum=003001002004&lm=cate7", // 行政规范性文件 (score=80)
  "辽宁省/营口市/大石桥市": "http://www.dsq.gov.cn/govpub/govGuidePub.html?categorynum=003001007009&lm=cate7", // 行政规范性文件 (score=80)
  "辽宁省/营口市/盖州市": "http://www.gaizhou.gov.cn/govpub/govGuidePub.html?categorynum=003001007&lm=cate7", // 行政规范性文件 (score=80)
  "辽宁省/营口市/老边区": "http://www.laobian.gov.cn/govpub/govGuidePub.html?categorynum=003001007007&lm=cate7", // 行政规范性文件 (score=80)
  "辽宁省/营口市/西市区": "http://www.ykxs.gov.cn/govpub/govGuidePub.html?categorynum=008&lm=cate7", // 行政规范性文件 (score=80)
  "辽宁省/营口市/站前区": "http://www.ykzq.gov.cn/govpub/govGuidePub.html?categorynum=007&lm=cate7", // 行政规范性文件 (score=80)
  "内蒙古自治区": "https://www.nmg.gov.cn/nmg_zcwjk/", // 全区政策文件库 (score=100)
  "内蒙古自治区/巴彦淖尔市/乌拉特前旗": "http://www.wltqq.gov.cn/zfxxgk/fdzdgknrwltqq/zfwj/", // 政府文件 (score=40)
  "内蒙古自治区/巴彦淖尔市/五原县": "http://www.wuyuan.gov.cn/zfwj/index.html", // 政府文件 (score=40)
  "内蒙古自治区/包头市/固阳县": "https://www.guyang.gov.cn/zwgk/zfxxgk/fdzdgknr/zfwj/", // 政府文件 (score=40)
  "内蒙古自治区/包头市/土默特右旗": "http://www.tmtyq.gov.cn/zfxxgk/fdzdgknr/zfwj/", // 政策文件 (score=55)
  "内蒙古自治区/赤峰市/敖汉旗": "https://www.ahq.gov.cn/dzgk/zfxxgk/fdzdgknr/?gk=3&cid=10607", // 规范性文件 (score=80)
  "内蒙古自治区/赤峰市/巴林右旗": "http://www.blyq.gov.cn/zwgk/xxgkzl/zfxxgknr/?gk=3&cid=8225", // 规范性文件 (score=80)
  "内蒙古自治区/赤峰市/红山区": "http://www.hongshanqu.gov.cn/zwgk/xxgkzl/fdzdgknr/?gk=3&cid=4122", // 规范性文件 (score=80)
  "内蒙古自治区/鄂尔多斯市/东胜区": "https://www.ds.gov.cn/dsxxgknew/zfwj", // 政府文件 (score=40)
  "内蒙古自治区/鄂尔多斯市/鄂托克旗": "http://www.eq.gov.cn/zwgk/zfwj/", // 政府文件 (score=40)
  "内蒙古自治区/呼和浩特市/土默特左旗": "http://www.tmtzq.gov.cn/xzgfxwjtz/index.html", // 规范性文件库 (score=80)
  "内蒙古自治区/通辽市": "https://www.tongliao.gov.cn/policy-find/#/FindPolicy", // 查找政策 (score=100)
  "内蒙古自治区/乌海市": "https://www.wuhai.gov.cn/wuhai/xxgk4/zfxxgkzl/805465/838638/index.html", // 行政规范性文件 (score=80)
  "内蒙古自治区/乌兰察布市": "https://www.wulanchabu.gov.cn/AIFileLibrary/", // 政策文件库 (score=100)
  "内蒙古自治区/乌兰察布市/察哈尔右翼后旗": "http://www.cyhq.gov.cn/zfwj//", // 政府文件 (score=40)
  "内蒙古自治区/乌兰察布市/察哈尔右翼前旗": "http://www.cyqq.gov.cn/zfwj/", // 政府文件 (score=40)
  "内蒙古自治区/乌兰察布市/察哈尔右翼中旗": "http://www.cyzq.gov.cn/zfwj/index.html", // 政府文件 (score=40)
  "内蒙古自治区/乌兰察布市/集宁区": "http://www.jnq.gov.cn/zfwj//", // 政府文件 (score=40)
  "内蒙古自治区/乌兰察布市/卓资县": "https://www.zhuozi.gov.cn/zfwj/index.html", // 政府文件 (score=40)
  "内蒙古自治区/锡林郭勒盟/阿巴嘎旗": "https://www.abg.gov.cn/abg/zwgk/zfxxgk/fdzdgknr/zcfg/zfwj/index.html", // 政府文件 (score=40)
  "内蒙古自治区/锡林郭勒盟/东乌珠穆沁旗": "https://www.dwq.gov.cn/dwq/zwgk/zfxxgkzl/fdzdgknr/zfwj/index.html", // 政府文件 (score=40)
  "内蒙古自治区/锡林郭勒盟/多伦县": "https://www.dlx.gov.cn/dlx/zwgk/zfxxgk/fdzdgknr/zfwj/index.html", // 政府文件 (score=40)
  "内蒙古自治区/锡林郭勒盟/苏尼特左旗": "https://www.sntzq.gov.cn/sntzq/zfxxgk/zfxxgkzl/fdzdgknr/zcfg1/zfwj/index.html", // 政府文件 (score=40)
  "内蒙古自治区/锡林郭勒盟/太仆寺旗": "https://www.tpsq.gov.cn/tpsq/zwgk/zfxxgk/fdzdgknr/zfwj/index.html", // 政府文件 (score=40)
  "内蒙古自治区/锡林郭勒盟/西乌珠穆沁旗": "https://www.xwq.gov.cn/xwzmqq/zwgk/zfxxgkzl/fdzdgknr/gfxwj40/zfwj/index.html", // 政府文件 (score=40)
  "内蒙古自治区/锡林郭勒盟/锡林浩特市": "http://www.xilinhaote.gov.cn/xilinhaote/zwgk/zfxxgkzl/fdzdgknr/zcfg/index.html", // 政策法规 (score=45)
  "内蒙古自治区/锡林郭勒盟/正蓝旗": "https://www.zlq.gov.cn/zlq/zwgk/zfxxgkzl/fdzdgknr/zcwj/zfwj/index.shtml", // 政府文件 (score=40)
  "宁夏回族自治区/固原市/泾源县": "https://www.nxjy.gov.cn/ztml/zcwjk/index.html", // 政策文件库 (score=100)
  "宁夏回族自治区/固原市/隆德县": "http://www.nxld.gov.cn/rdzt/zcwjk/", // 政策文件库 (score=100)
  "宁夏回族自治区/吴忠市": "https://www.wuzhong.gov.cn/xxgk/gz/bfgfxwj/", // 规范性文件 (score=80)
  "宁夏回族自治区/吴忠市/青铜峡市": "https://www.qtx.gov.cn/xxgk/zfxxgkml/fzzf/xzgfxwj/wjk.html", // 规范性文件库 (score=80)
  "宁夏回族自治区/银川市/西夏区": "http://www.ycxixia.gov.cn/zwgk/gkmenu/zcfg/", // 政策法规 (score=45)
  "宁夏回族自治区/中卫市": "https://www.nxzw.gov.cn/zwgk/zc/gfxwj/", // 规范性文件 (score=80)
  "青海省/海东市/互助土族自治县": "http://www.huzhu.gov.cn/zfxxgk/fdzdgknr/zfwj.htm", // 政府文件 (score=40)
  "青海省/海东市/乐都区": "https://www.ledu.gov.cn/html/fagui/zhengce.html", // 政策文件 (score=55)
  "青海省/海南藏族自治州/贵南县": "https://www.guinan.gov.cn/zwgk/zc/agwzlfl/zfwj", // 政府文件 (score=40)
  "青海省/西宁市/城北区": "https://www.xncb.gov.cn/html/public/zfwj.html", // 政府文件 (score=40)
  "青海省/西宁市/城东区": "http://www.xncd.gov.cn/html/public/zfwj.html", // 政府文件 (score=40)
  "山东省/滨州市": "http://www.binzhou.gov.cn/zwgk/zcwjk", // 政策文件 (score=55)
  "山东省/德州市/德城区": "http://www.decheng.gov.cn/governmentAffairs/index.html#/policyDocumentList?county=%E5%BE%B7%E5%9F%8E%E5%8C%BA&publisher=&policyType=4", // 行政规范性文件 (score=80)
  "山东省/德州市/乐陵市": "http://www.laoling.gov.cn/governmentAffairs/index.html#/policyDocumentZone?county=%E4%B9%90%E9%99%B5%E5%B8%82&publisher=", // 规范性文件 (score=80)
  "山东省/德州市/武城县": "http://www.wucheng.gov.cn/governmentAffairs/#/administrativeNorms?county=%E6%AD%A6%E5%9F%8E%E5%8E%BF&publisher=", // 行政规范性文件 (score=80)
  "山东省/德州市/禹城市": "http://www.yuchengshi.gov.cn/governmentAffairs/#/governmentSelect?county=%E7%A6%B9%E5%9F%8E%E5%B8%82&publisher=", // 政策文件库 (score=100)
  "山东省/菏泽市": "http://www.heze.gov.cn/gfxwj/", // 规范性文件 (score=80)
  "山东省/菏泽市/曹县": "http://www.caoxian.gov.cn/cxwjk/", // 规范性文件 (score=80)
  "山东省/菏泽市/巨野县": "http://www.juye.gov.cn/jywjknew/", // 政策文件库 (score=100)
  "山东省/菏泽市/郓城县": "http://www.cnyc.gov.cn/ycwjkx/?catas=1569655061443907584", // 规范性文件 (score=80)
  "山东省/临沂市/莒南县": "http://www.junan.gov.cn/gk/zfxxgk/fdzdgknr/lzyj/zcwj.htm", // 政府文件 (score=40)
  "山东省/临沂市/兰山区": "http://lyls.gov.cn/gk2/ztzl1/zck/fwdx/qy.htm", // 找政策 (score=100)
  "山东省/临沂市/临沭县": "http://www.linshu.gov.cn/gk/zfxxgk/fdzdgknr/lzyj/zcwj/zfwj.htm", // 政府文件 (score=40)
  "山东省/临沂市/蒙阴县": "http://www.mengyin.gov.cn/gk/zfxxgk/fdzdgknr/lzyj/zcwj.htm", // 政府文件 (score=40)
  "山东省/泰安市": "https://www.taian.gov.cn/col/col351906/index.html", // 行政规范性文件 (score=80)
  "山东省/威海市": "https://www.weihai.gov.cn/so/zcwjk/s?tabShow=sxswj&siteCode=3710000028_zck&L3=%E3%80%90%E6%96%87%E4%BB%B6%E5%BA%93%E3%80%91%E5%B8%82%E6%94%BF%E5%BA%9C%E8%A7%84%E8%8C%83%E6%80%A7%E6%96%87%E4%BB%B6&qt=", // 规范性文件 (score=80)
  "山东省/潍坊市/奎文区": "http://www.kuiwen.gov.cn/kwq/kwwjk/?catas=w1569655061443907584", // 规范性文件 (score=80)
  "山东省/潍坊市/寿光市": "http://www.shouguang.gov.cn/zwgk/XXGK/ZFWJ/zcwjfb/", // 政策文件 (score=55)
  "山东省/烟台市/栖霞市": "https://www.sdqixia.gov.cn/col/col100778/index.html?vc_xxgkarea=113706860042344370A&number=F10005A10002", // 行政规范性文件 (score=80)
  "山东省/烟台市/芝罘区": "https://www.zhifu.gov.cn/col/col100823/index.html", // 规范性文件 (score=80)
  "山东省/枣庄市/台儿庄区": "http://www.tez.gov.cn/zwgk/zwgkzt/zfwj/index.html", // 政策文件 (score=55)
  "山东省/枣庄市/薛城区": "http://www.xuecheng.gov.cn/zwgk/zwgkzt/zcwj/", // 政策文件 (score=55)
  "山西省/晋城市/城区": "http://www.jccq.gov.cn/zwgk/zfwj/", // 政府文件 (score=40)
  "山西省/晋中市": "https://www.sxjz.gov.cn/zwgk/fdzdgknr/zfwj", // 政府文件 (score=40)
  "山西省/晋中市/介休市": "http://www.jiexiu.gov.cn/zwgk/fdzdgknr/zfwj/zfwj2zfbgs", // 政府文件 (score=40)
  "山西省/晋中市/榆次区": "http://www.yuci.gov.cn/zwgk/fdzdgknr/zfwj/qzfwj", // 政府文件 (score=40)
  "山西省/临汾市": "https://www.linfen.gov.cn/wj/szfwj_70775/", // 市政府文件 (score=60)
  "山西省/临汾市/安泽县": "http://www.anze.gov.cn/zfxxgk/zcwj/szfwj/", // 省政府文件 (score=60)
  "山西省/临汾市/浮山县": "http://www.fushan.gov.cn/zfxxgk/zcwj/szfwj/", // 省政府文件 (score=60)
  "山西省/临汾市/侯马市": "http://www.houma.gov.cn/zfxxgk/zcwj/szfwj/", // 省政府文件 (score=60)
  "山西省/临汾市/霍州市": "http://www.huozhou.gov.cn/zfxxgk/zcwj/szfwj/", // 省政府文件 (score=60)
  "山西省/临汾市/襄汾县": "http://www.xiangfen.gov.cn/zfxxgk/zcwj/szfwj_3205/", // 市政府文件 (score=60)
  "山西省/临汾市/永和县": "http://www.sxyh.gov.cn/zfxxgk/zcwj/szfwj/", // 省政府文件 (score=60)
  "山西省/吕梁市": "http://www.lvliang.gov.cn/llxxgk/zfxxgk/xxgkml/zcwj_21555/", // 规范性文件 (score=80)
  "山西省/吕梁市/方山县": "http://www.fangshan.gov.cn/xxgk/zfwj/", // 政府文件 (score=40)
  "山西省/吕梁市/交城县": "http://www.sx-jc.gov.cn/jcxzw/xxgk/gfxwj/", // 规范性文件 (score=80)
  "山西省/吕梁市/临县": "http://www.linxian.gov.cn/lxxxgk/lxgkzl/lxgkml/zfwj/lxzfwj/", // 政府文件 (score=40)
  "山西省/吕梁市/石楼县": "https://www.sxshilou.gov.cn/gwgk/gfxwj/", // 规范性文件 (score=80)
  "山西省/吕梁市/孝义市": "https://www.xiaoyi.gov.cn/xxgk/fdzdgknr/gfxwj/", // 规范性文件 (score=80)
  "山西省/吕梁市/中阳县": "https://www.sxzhongyang.gov.cn/xxgk/gfxwj/", // 规范性文件 (score=80)
  "山西省/朔州市": "http://shuozhou.gov.cn/index_5070.shtml", // 全市政策文件库 (score=100)
  "山西省/朔州市/怀仁市": "http://www.zghr.gov.cn/xxgk/zfwj/hzf/", // 政府文件 (score=40)
  "山西省/朔州市/平鲁区": "http://www.szpinglu.gov.cn/xxgk/zwxx/zfwj/", // 政府文件 (score=40)
  "山西省/朔州市/山阴县": "http://www.shanyin.gov.cn/xxgk/zfgb/", // 政策文件库 (score=100)
  "山西省/朔州市/应县": "http://www.yingxian.gov.cn/zwgk/xxgkml/zfwj/", // 政府文件 (score=40)
  "山西省/太原市/清徐县": "https://www.qx.gov.cn/zfwj.html", // 政府文件 (score=40)
  "山西省/太原市/迎泽区": "https://www.yingze.gov.cn/zcfg.html", // 政策法规 (score=45)
  "山西省/忻州市/代县": "http://www.daixian.gov.cn/dxzw/zwgk/zfwj/", // 政府文件 (score=40)
  "山西省/忻州市/定襄县": "http://www.dingxiang.gov.cn/dxxzw/zwgk/wj/xzfwj/", // 政府文件 (score=40)
  "山西省/忻州市/偏关县": "http://www.pianguan.gov.cn/pgxzw/zwgk/zfwj/", // 政府文件 (score=40)
  "山西省/阳泉市": "http://www.yq.gov.cn/index_6892.shtml", // 政策文件库 (score=100)
  "山西省/阳泉市/平定县": "http://xxgk.pd.gov.cn/fdzdgknr/lzyj/xzfwj/", // 政府文件 (score=40)
  "山西省/运城市": "https://www.yuncheng.gov.cn/zwgk_1/xxgkml/zfwj/index.shtml", // 政府文件 (score=40)
  "山西省/运城市/河津市": "http://www.sxhj.gov.cn/zfxxgk/zfwj/zfwj/index.shtml", // 政府文件 (score=40)
  "山西省/运城市/平陆县": "http://www.pinglu.gov.cn/zfxxgk/zcwj/wjjjd/index.shtml", // 政府文件 (score=40)
  "山西省/运城市/万荣县": "http://www.wanrong.gov.cn/zfxxgk/zcwj/zfwj/index.shtml", // 政府文件 (score=40)
  "山西省/长治市/潞城区": "https://www.lc.gov.cn/lcxxgk/xxgkml/jbxxgk/zfwj/", // 政府文件 (score=40)
  "山西省/长治市/武乡县": "http://www.wuxiang.gov.cn/zwgk/zfxxgk/zfxxgkml/wjgk/zfwj/", // 政府文件 (score=40)
  "山西省/长治市/长子县": "https://www.zhangzi.gov.cn/zzxxgk/zfxxgk/zfxxgkml/sjjh_287387/gfxwj/", // 规范性文件 (score=80)
  "陕西省/宝鸡市": "http://www.baoji.gov.cn/col9816/col17241/col9989/", // 行政规范性文件 (score=80)
  "陕西省/宝鸡市/凤翔区": "http://www.fengxiang.gov.cn/col10348/col10351/col10352/szfwj/", // 省政府文件 (score=60)
  "陕西省/汉中市": "http://www.hanzhong.gov.cn/hzszf/zwgk/zfwj/zcwjk.shtml", // 市级政策文件库 (score=100)
  "陕西省/汉中市/勉县": "http://www.mianxian.gov.cn/mxzf/xxgk/fgwj/zfwj/wj_list.shtml", // 政府文件 (score=40)
  "陕西省/汉中市/西乡县": "http://www.snxx.gov.cn/xxxzf/xxzwgk/xxgknr/zfwj/gk_n_zfwj.shtml", // 政府文件 (score=40)
  "陕西省/汉中市/洋县": "http://www.yangxian.gov.cn/yxzf/yxzwgk/zfwj/gk_n_zfwj.shtml", // 政府文件 (score=40)
  "陕西省/商洛市": "http://www.shangluo.gov.cn/js/zcwjk.htm", // 政策文件库 (score=100)
  "陕西省/商洛市/丹凤县": "http://www.danfeng.gov.cn/zfxxgk1/zc/zfwj.htm", // 政府文件 (score=40)
  "陕西省/铜川市/宜君县": "http://www.yijun.gov.cn/resources/site/154/html/yjzc/gfxwj/index.html", // 规范性文件 (score=80)
  "陕西省/渭南市/澄城县": "http://www.chengcheng.gov.cn/zfxxgk/zc/zfwj/1.html", // 政府文件 (score=40)
  "陕西省/渭南市/合阳县": "http://www.heyang.gov.cn/zfxxgk/zc/zfwj/hzf/1.html", // 政府文件 (score=40)
  "陕西省/西安市/碑林区": "http://www.beilin.gov.cn/publish/wjk.html?keywords=%E8%A5%BF%E5%AE%89%E5%B8%82%E7%A2%91%E6%9E%97%E5%8C%BA&tab=wenjian&siteId=1244468153191239681", // 政策文件库 (score=100)
  "陕西省/西安市/高陵区": "http://www.gaoling.gov.cn/zwgk/qzfxxgkml/zfwj/qzfwj/1.html", // 政府文件 (score=40)
  "陕西省/西安市/未央区": "http://www.weiyang.gov.cn/publish/wjk.html?keywords=%E8%A5%BF%E5%AE%89%E5%B8%82%E6%9C%AA%E5%A4%AE%E5%8C%BA", // 查找政策 (score=100)
  "陕西省/西安市/阎良区": "http://www.yanliang.gov.cn/publish/wjk.html?keywords=%E8%A5%BF%E5%AE%89%E5%B8%82%E9%98%8E%E8%89%AF%E5%8C%BA&amp;tab=wenjian&amp;siteId=f533bb3a-2dff-4455-bed3-fe8f7e93", // 政策文件库 (score=100)
  "陕西省/西安市/雁塔区": "http://www.yanta.gov.cn/publish/wjk.html?keywords=%E8%A5%BF%E5%AE%89%E5%B8%82%E9%9B%81%E5%A1%94%E5%8C%BA&tab=wenjian&siteId=530b7193-f408-4452-a2e8-56fc2e37", // 政策文件库 (score=100)
  "陕西省/咸阳市/泾阳县": "https://www.snjingyang.gov.cn/zfxxgk/fdzdgknr/zcwj/szfwj/", // 陕西省政府文件公开 (score=60)
  "陕西省/咸阳市/礼泉县": "https://www.liquan.gov.cn/zfxxgk/fdzdgknr/zfwj/szfwj/", // 省政府文件 (score=60)
  "陕西省/咸阳市/秦都区": "https://www.snqindu.gov.cn/zfxxgk/fdzdgknr/zfwj/zfbwj/", // 政府文件 (score=40)
  "陕西省/咸阳市/渭城区": "https://www.weic.gov.cn/zfxxgk/fdzdgknr/zcwj/zfwj/", // 政府文件 (score=40)
  "陕西省/咸阳市/永寿县": "http://www.yongshou.gov.cn/zfxxgk/zcwj/", // 政府文件 (score=40)
  "陕西省/延安市/安塞区": "https://www.ansai.gov.cn/zfxxgk/fdzdgknr/zfwj/qzfwj/1.html", // 区政府文件 (score=60)
  "陕西省/延安市/宝塔区": "https://www.baotaqu.gov.cn/gfxwjk/", // 行政规范性文件库 (score=80)
  "陕西省/延安市/富县": "https://www.fuxian.gov.cn/gfxwjk/", // 行政规范性文件库 (score=80)
  "陕西省/延安市/甘泉县": "https://www.ganquanxian.gov.cn/zfxxgk/zfwj/gfxwj/1.html", // 行政规范性文件库 (score=80)
  "陕西省/延安市/黄陵县": "https://www.huangling.gov.cn/gfxwjk/", // 行政规范性文件库 (score=80)
  "陕西省/延安市/黄龙县": "https://www.hlx.gov.cn/gfxwjk/", // 行政规范性文件库 (score=80)
  "陕西省/延安市/吴起县": "https://www.wqx.gov.cn/gfxwjk/", // 行政规范性文件库 (score=80)
  "陕西省/延安市/延川县": "https://www.yanchuan.gov.cn/gfxwjk/", // 行政规范性文件库 (score=80)
  "陕西省/延安市/延长县": "https://www.yanchangxian.gov.cn/gfxwjk/", // 行政规范性文件库 (score=80)
  "陕西省/延安市/宜川县": "https://www.ycx.gov.cn/gfxwjk/", // 行政规范性文件库 (score=80)
  "陕西省/延安市/志丹县": "https://www.zhidan.gov.cn/gfxwjk/", // 行政规范性文件库 (score=80)
  "陕西省/榆林市/绥德县": "http://www.sxsd.gov.cn/zfxxgk/fdzdgknr/zcfg/", // 政策法规 (score=45)
  "陕西省/榆林市/吴堡县": "http://www.wubu.gov.cn/zwgk/fdzdgknr/zfwj/zffw/", // 政府文件 (score=40)
  "陕西省/榆林市/榆阳区": "https://www.yuyang.gov.cn/zfxxgk/fdzdgknr/zcfg/", // 政策法规 (score=45)
  "上海市/虹口区": "https://www.shhk.gov.cn/hkxxgk/zdgknr/policydoc.html", // 政策文件 (score=55)
  "上海市/静安区": "https://www.jingan.gov.cn/dynamic/info-year.html?param=xzgfxwj", // 行政规范性文件 (score=80)
  "上海市/长宁区": "http://zwgk.shcn.gov.cn/xxgk/zcwj-zfxxgk/index.html", // 政策文件 (score=55)
  "四川省": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // 【省政策文件库】 (score=100)
  "四川省/阿坝藏族羌族自治州": "http://www.abazhou.gov.cn/abazhou/zcwjk/zcwjk.shtml", // 找政策 (score=100)
  "四川省/甘孜藏族自治州/巴塘县": "http://www.batang.gov.cn/qtwj1", // 巴塘县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/白玉县": "http://www.baiyu.gov.cn/qtwj1", // 白玉县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/丹巴县": "http://www.danba.gov.cn/qtwj1", // 丹巴县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/道孚县": "http://www.gzdf.gov.cn/qtwj1", // 道孚县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/稻城县": "http://www.daocheng.gov.cn/qtwj1", // 稻城县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/得荣县": "http://www.gzdr.gov.cn/qtwj1", // 得荣县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/德格县": "http://www.dege.gov.cn/qtwj", // 德格县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/甘孜县": "http://www.ganzi.gov.cn/qtwj1", // 甘孜县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/九龙县": "http://www.scjl.gov.cn/qtwj1", // 九龙县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/康定市": "http://www.kangding.gov.cn/qtwj1", // 康定市政策文件库 (score=100)
  "四川省/甘孜藏族自治州/理塘县": "http://www.gzlt.gov.cn/qtwj1", // 理塘县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/泸定县": "http://www.luding.gov.cn/qtwj1", // 泸定县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/炉霍县": "http://www.luhuo.gov.cn/qtwj1", // 炉霍县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/色达县": "http://www.gzzsdxrmzf.gov.cn/qtwj1", // 色达县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/石渠县": "http://www.shiqu.gov.cn/qtwj1", // 石渠县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/乡城县": "http://www.xcx.gov.cn/qtwj1", // 乡城县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/新龙县": "http://www.gzxl.gov.cn/qtwj1", // 新龙县政策文件库 (score=100)
  "四川省/甘孜藏族自治州/雅江县": "http://www.yajiang.gov.cn/qtwj1", // 雅江县政策文件库 (score=100)
  "四川省/泸州市/纳溪区": "http://www.naxi.gov.cn/zw/zc/zfwj/zcwj", // 政府文件 (score=40)
  "四川省/绵阳市": "http://www.my.gov.cn/mysrmzf/c100061/xxgk_list.shtml", // 行政规范性文件 (score=80)
  "四川省/绵阳市/江油市": "http://www.jiangyou.gov.cn/jysrmzf/xzgfxwj/xxgk_list.shtml", // 江油市政策文件 (score=55)
  "四川省/绵阳市/盐亭县": "http://www.yanting.gov.cn/yanting/c118384/xxgk_list.shtml", // 行政规范性文件 (score=80)
  "四川省/绵阳市/梓潼县": "http://www.zitong.gov.cn/ztxrmzf/c100097/xxgk_list.shtml", // 行政规范性文件 (score=80)
  "四川省/南充市": "https://www.nanchong.gov.cn/zwgk/zc/FileSearch.html", // 南充市政策文件库 (score=100)
  "四川省/南充市/嘉陵区": "https://www.jialing.gov.cn/zwgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "四川省/南充市/阆中市": "https://www.langzhong.gov.cn/zwgk/zc/xzgfxwj_2735/", // 行政规范性文件 (score=80)
  "四川省/南充市/南部县": "https://www.scnanbu.gov.cn/zwgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "四川省/南充市/蓬安县": "https://www.pengan.gov.cn/zwgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "四川省/南充市/顺庆区": "https://www.shunqing.gov.cn/zwgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "四川省/南充市/西充县": "https://www.xichong.gov.cn/zwgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "四川省/南充市/仪陇县": "https://www.yilong.gov.cn/zwgk/zc/xzgfxwj/", // 行政规范性文件 (score=80)
  "四川省/内江市/东兴区": "https://www.scnjdx.gov.cn/dxq/newqtwj/zfxxgk_zcwjk.shtml", // 东兴区政策文件库 (score=100)
  "四川省/内江市/隆昌市": "https://www.longchang.gov.cn/lcs/qtwj/zfxxgk_zcwjk.shtml", // 市政策文件库 (score=100)
  "四川省/内江市/威远县": "https://www.weiyuan.gov.cn/wyx/newqtwj/zfxxgk_zcwjk.shtml", // 威远县政策文件库 (score=100)
  "四川省/内江市/资中县": "https://www.zizhong.gov.cn/zzx/qtwj/zfxxgk_zcwjk.shtml", // 县政策文件库 (score=100)
  "四川省/遂宁市/射洪市": "http://www.shehong.gov.cn/zfxxgk/zhengce.html", // 政策文件库 (score=100)
  "四川省/宜宾市": "http://www.yibin.gov.cn/xxgk/zcfg/", // 政策文件库 (score=100)
  "天津市/东丽区": "https://www.tjdl.gov.cn/gongkai/zxwj/", // 东丽区政策文件库 (score=100)
  "天津市/和平区": "https://www.tjhp.gov.cn/zw/zcwjk/", // 政策文件库 (score=100)
  "天津市/河东区": "https://www.tjhd.gov.cn/zwgk/zcwj/bdwwj/", // 政策文件 (score=55)
  "天津市/河西区": "https://www.tjhx.gov.cn/zwgk/zfgfxwj/", // 行政规范性文件 (score=80)
  "天津市/红桥区": "https://www.tjhq.gov.cn/zwgk/xzgfxwj/", // 行政规范性文件 (score=80)
  "天津市/宁河区": "https://www.tjnh.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "天津市/西青区": "https://www.tjxq.gov.cn/zwgk/zcwjk/", // 政策文件库 (score=100)
  "西藏自治区/阿里地区": "https://www.al.gov.cn/gk/zcwenjiank.htm", // 政策文件库 (score=100)
  "西藏自治区/阿里地区/革吉县": "https://geji.gov.cn/zfxxgk/zfwj.htm", // 政府文件 (score=40)
  "西藏自治区/阿里地区/普兰县": "https://www.pulan.gov.cn/zwgk/zfwj.htm", // 政府文件 (score=40)
  "西藏自治区/阿里地区/日土县": "https://rituxian.gov.cn/zwgk/zfwj.htm", // 政府文件 (score=40)
  "西藏自治区/阿里地区/札达县": "https://zhada.gov.cn/zfxxgk/zfwj.htm", // 政府文件 (score=40)
  "西藏自治区/日喀则市": "http://www.rikaze.gov.cn/info-public-xzgfxwjk-list-single.thtml?id=15559", // 行政规范性文件 (score=80)
  "新疆维吾尔自治区/阿克苏地区/沙雅县": "http://www.xjsy.gov.cn/zwgk/fgwj/zcfg/index.html", // 政策法规 (score=45)
  "新疆维吾尔自治区/博尔塔拉蒙古自治州": "https://www.xjboz.gov.cn/zwgk/zfxxgk/zc/zzzwj/zfwj.htm", // 政府文件 (score=40)
  "新疆维吾尔自治区/博尔塔拉蒙古自治州/阿拉山口市": "http://www.alsk.gov.cn/zwgk/zc/zfwj.htm", // 政府文件 (score=40)
  "新疆维吾尔自治区/博尔塔拉蒙古自治州/精河县": "https://www.xjjh.gov.cn/zwgk/zfxxgk/zc/jhxwj/zfwj.htm", // 政府文件 (score=40)
  "新疆维吾尔自治区/昌吉回族自治州/呼图壁县": "http://www.htb.gov.cn/p222/xzgfxwj.html", // 行政规范性文件 (score=80)
  "新疆维吾尔自治区/昌吉回族自治州/吉木萨尔县": "https://www.jmser.gov.cn/p192/xzgfxwj.html", // 政策文件 (score=55)
  "新疆维吾尔自治区/昌吉回族自治州/木垒哈萨克自治县": "https://www.mlx.gov.cn/p212/gfxwj.html", // 行政规范性文件 (score=80)
  "新疆维吾尔自治区/昌吉回族自治州/奇台县": "http://www.xjqt.gov.cn/p232/xzgfxwj.html", // 政府规范性文件 (score=80)
  "新疆维吾尔自治区/克拉玛依市": "https://www.klmy.gov.cn/klmys/szfxzgfxwj/zfxxgk.shtml", // 市政府行政规范性文件 (score=80)
  "新疆维吾尔自治区/克拉玛依市/独山子区": "http://www.dsz.gov.cn/dsz/xzgfxwj/zfxxgk.shtml", // 行政规范性文件 (score=80)
  "新疆维吾尔自治区/塔城地区/和布克赛尔蒙古自治县": "http://www.xjhbk.gov.cn/xjhbk/zfwj/zfxxgk_xxgkzd.shtml", // 政府文件 (score=40)
  "云南省/保山市": "https://www.baoshan.gov.cn/zcwjkrk.htm", // 政策文件库 (score=100)
  "云南省/保山市/昌宁县": "http://www.yncn.gov.cn/zcwjkrk.htm", // 政策文件库 (score=100)
  "云南省/楚雄彝族自治州/楚雄市": "http://www.cxs.gov.cn/zfxxgk/fdzdgknr/zfwj.htm", // 政府文件 (score=40)
  "云南省/楚雄彝族自治州/大姚县": "http://www.dayao.gov.cn/zfxxgk/fdzdgknr/zcwj/qtwj.htm", // 政府文件 (score=40)
  "云南省/楚雄彝族自治州/元谋县": "https://www.yncxym.gov.cn/zfxxgk/fdzdgknr/lzyj/zfwj.htm", // 政府文件 (score=40)
  "云南省/迪庆藏族自治州": "http://www.diqing.gov.cn/zfxxgk_dqzzf/zhengcewenjian/gfxwjgk/xxgfxwj/xxgfxwjk", // 规范性文件库 (score=80)
  "云南省/红河哈尼族彝族自治州": "http://www.hh.gov.cn/zcwjk.htm", // 政策文件库 (score=100)
  "云南省/昆明市/宜良县": "http://www.kmyl.gov.cn/zfxxgk/zcwj/", // 政府文件 (score=40)
  "云南省/临沧市": "http://lincang.gov.cn/zfxxgk_lcs/xxgfxwj.html", // 规范性文件库 (score=80)
  "云南省/曲靖市/陆良县": "https://www.luliang.gov.cn/gov/library/files/94.html", // 规范性文件 (score=80)
  "云南省/曲靖市/马龙区": "http://www.malong.gov.cn/gov/public/standard/files/gfxwj.html", // 行政规范性文件 (score=80)
  "云南省/文山壮族苗族自治州/广南县": "http://www.yngn.gov.cn/gnxrmzf/zcwj/pc/list.html", // 政策文件 (score=55)
  "浙江省/杭州市/建德市": "http://www.jiande.gov.cn/jrobotfront/search.do?websiteid=330182000000000&searchid=198&pg=&p=1&tpl=2600&cateid=905&total=336&year=&fbjg=&wh=&validate=&servicetype=&iswebapply=&q=&keywordone=&filenumber=&fbjgone=&begin=&end=&cussort=2", // 行政规范性文件库 (score=80)
  "浙江省/湖州市/长兴县": "https://www.zjcx.gov.cn/col/col1229518369/fdzdgknr/zcwj/index.html", // 政策文件 (score=55)
  "浙江省/嘉兴市/海盐县": "https://www.haiyan.gov.cn/col/col1229406117/index.html", // 行政规范性文件 (score=80)
  "浙江省/嘉兴市/平湖市": "http://www.pinghu.gov.cn/col/col1229395932/index.html", // 行政规范性文件 (score=80)
  "浙江省/金华市/兰溪市": "https://www.lanxi.gov.cn/col/col1229204102/index.html", // 规范性文件 (score=80)
  "浙江省/金华市/武义县": "https://www.zjwy.gov.cn/col/col1229558372/index.html", // 规范性文件 (score=80)
  "浙江省/丽水市": "https://www.lishui.gov.cn/col/col1229822996/index.html", // 丽水市规范性文件数据库 (score=80)
  "浙江省/丽水市/莲都区": "https://www.liandu.gov.cn/col/col1229430187/index.html", // 行政规范性文件 (score=80)
  // —— v7 手工补录省级 / 省会（候选已验证，但 listLooks 因 JS 渲染或 query-only URL 未触发）——
  "山东省": "https://www.shandong.gov.cn/col/col320658/index.html", // 政策文件（手工补录）
  "湖北省": "https://www.hubei.gov.cn/zfwj/list1.shtml", // 省政府文件（用户手工补录，WAF 拒抓）
  "甘肃省": "https://www.gansu.gov.cn/gsszf/c100055/xxgk_zc.shtml", // 省政府政策文件（用户手工补录，WAF 拒抓）
  "吉林省/长春市": "http://zwgk.changchun.gov.cn/?stit=%E9%95%BF%E5%BA%9C%E5%8F%91&num=4", // 市政府文件 (score=60, query-only URL)
  // —— v8 跨域复用：子级网站把政策库链回母级，直接复用母级条目 ——
  "安徽省/安庆市/望江县": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771", // shared from "安徽省"
  "安徽省/蚌埠市/蚌山区": "https://www.bengbu.gov.cn/zfxxgk/zwgk/zcwjkzs/index.html?columnId=21981", // shared from "安徽省/蚌埠市"
  "安徽省/蚌埠市/淮上区": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771", // shared from "安徽省"
  "安徽省/蚌埠市/五河县": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771", // shared from "安徽省"
  "安徽省/蚌埠市/禹会区": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771", // shared from "安徽省"
  "安徽省/淮南市/潘集区": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771", // shared from "安徽省"
  "安徽省/马鞍山市/博望区": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771", // shared from "安徽省"
  "安徽省/马鞍山市/当涂县": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771", // shared from "安徽省"
  "安徽省/马鞍山市/含山县": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771", // shared from "安徽省"
  "安徽省/马鞍山市/花山区": "https://www.ah.gov.cn/site/tpl/4931?activeId=6784771", // shared from "安徽省"
  "北京市/门头沟区": "https://www.beijing.gov.cn/zhengce/zcdh?token=4260&adx=&asmzq=&type=1", // shared from "北京市"
  "北京市/顺义区": "https://www.beijing.gov.cn/zhengce/zcdh?token=4260&adx=&asmzq=&type=1", // shared from "北京市"
  "北京市/通州区": "https://www.beijing.gov.cn/zhengce/zcdh?token=4260&adx=&asmzq=&type=1", // shared from "北京市"
  "重庆市/合川区": "https://www.cq.gov.cn/zwgk/zfxxgkml/szfwj/", // shared from "重庆市"
  "重庆市/石柱土家族自治县": "https://www.cq.gov.cn/zwgk/zfxxgkml/szfwj/", // shared from "重庆市"
  "重庆市/武隆区": "https://www.cq.gov.cn/zwgk/zfxxgkml/szfwj/", // shared from "重庆市"
  "重庆市/永川区": "https://www.cq.gov.cn/zwgk/zfxxgkml/szfwj/", // shared from "重庆市"
  "重庆市/云阳县": "https://www.cq.gov.cn/zwgk/zfxxgkml/szfwj/", // shared from "重庆市"
  "福建省/福州市/仓山区": "http://www.fuzhou.gov.cn/zwgk/zxwj/szfwj/", // shared from "福建省/福州市"
  "甘肃省/陇南市/两当县": "https://www.gansu.gov.cn/gsszf/c100055/xxgk_zc.shtml", // shared from "甘肃省"
  "广东省/广州市/黄埔区": "https://www.gz.gov.cn/gzzcwjk/index.html", // shared from "广东省/广州市"
  "广东省/阳江市": "http://www.gd.gov.cn/zwgk/wjk/", // shared from "广东省"
  "广西壮族自治区/北海市/合浦县": "http://www.gxzf.gov.cn/zfwj/", // shared from "广西壮族自治区"
  "广西壮族自治区/河池市/宜州区": "http://www.hechi.gov.cn/zfxxgk/zfwj/", // shared from "广西壮族自治区/河池市"
  "贵州省/安顺市": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/安顺市/关岭布依族苗族自治县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/安顺市/平坝区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/安顺市/镇宁布依族苗族自治县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/安顺市/紫云苗族布依族自治县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/毕节市": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/毕节市/大方县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/毕节市/赫章县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/贵阳市/白云区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/贵阳市/观山湖区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/贵阳市/花溪区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/贵阳市/开阳县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/贵阳市/南明区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/贵阳市/清镇市": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/贵阳市/乌当区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/贵阳市/息烽县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/贵阳市/云岩区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/六盘水市": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔东南苗族侗族自治州": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔东南苗族侗族自治州/岑巩县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔东南苗族侗族自治州/黄平县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔东南苗族侗族自治州/剑河县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔东南苗族侗族自治州/凯里市": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔东南苗族侗族自治州/黎平县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔东南苗族侗族自治州/麻江县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔东南苗族侗族自治州/榕江县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔南布依族苗族自治州/都匀市": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔南布依族苗族自治州/贵定县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔南布依族苗族自治州/惠水县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔南布依族苗族自治州/龙里县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔南布依族苗族自治州/罗甸县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔南布依族苗族自治州/长顺县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔西南布依族苗族自治州/册亨县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔西南布依族苗族自治州/普安县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔西南布依族苗族自治州/望谟县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔西南布依族苗族自治州/兴义市": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/黔西南布依族苗族自治州/贞丰县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/铜仁市/德江县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/铜仁市/江口县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/铜仁市/石阡县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/铜仁市/思南县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/铜仁市/万山区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/铜仁市/印江土家族苗族自治县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/铜仁市/玉屏侗族自治县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/遵义市/播州区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/遵义市/凤冈县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/遵义市/红花岗区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/遵义市/汇川区": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/遵义市/绥阳县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/遵义市/桐梓县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/遵义市/习水县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/遵义市/余庆县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "贵州省/遵义市/正安县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省"
  "海南省/海口市/秀英区": "https://www.hainan.gov.cn/hainan/zfwj/szfzcwj.shtml", // shared from "海南省"
  "海南省/三沙市": "https://www.hainan.gov.cn/hainan/zfwj/szfzcwj.shtml", // shared from "海南省"
  "河北省/廊坊市/永清县": "https://www.hebei.gov.cn/columns/49f13cc2-db03-4d0c-b4fe-2f3f659d3b6e/index.html", // shared from "河北省"
  "河北省/石家庄市/藁城区": "https://www.sjz.gov.cn/columns/3ec31d57-6be5-4350-ad03-6e5801a534eb/index.html", // shared from "河北省/石家庄市"
  "河南省/三门峡市/湖滨区": "https://www.smx.gov.cn/4498/0000/zhengfuxinxi-1.html", // shared from "河南省/三门峡市"
  "河南省/新乡市/长垣市": "https://www.henan.gov.cn/zwgk/fgwj/szfl/", // shared from "河南省"
  "湖北省/恩施土家族苗族自治州/巴东县": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/恩施土家族苗族自治州/鹤峰县": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/黄冈市/黄州区": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/荆州市/洪湖市": "https://zwgk.jingzhou.gov.cn/normative_index.shtml?area=351&column=318", // shared from "湖北省/荆州市"
  "湖北省/荆州市/监利市": "https://zwgk.jingzhou.gov.cn/normative_index.shtml?area=351&column=318", // shared from "湖北省/荆州市"
  "湖北省/荆州市/江陵县": "https://zwgk.jingzhou.gov.cn/normative_index.shtml?area=351&column=318", // shared from "湖北省/荆州市"
  "湖北省/荆州市/沙市区": "https://zwgk.jingzhou.gov.cn/normative_index.shtml?area=351&column=318", // shared from "湖北省/荆州市"
  "湖北省/荆州市/松滋市": "https://zwgk.jingzhou.gov.cn/normative_index.shtml?area=351&column=318", // shared from "湖北省/荆州市"
  "湖北省/十堰市": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/武汉市/汉南区": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/咸宁市/通山县": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/宜昌市/当阳市": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/宜昌市/点军区": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/宜昌市/五峰土家族自治县": "http://www.yichang.gov.cn/list-61891-1.html", // shared from "湖北省/宜昌市"
  "湖北省/宜昌市/伍家岗区": "http://www.yichang.gov.cn/list-61891-1.html", // shared from "湖北省/宜昌市"
  "湖北省/宜昌市/西陵区": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/宜昌市/猇亭区": "http://www.yichang.gov.cn/list-61891-1.html", // shared from "湖北省/宜昌市"
  "湖北省/宜昌市/兴山县": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/宜昌市/夷陵区": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/宜昌市/宜都市": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/宜昌市/远安县": "http://www.yichang.gov.cn/list-61891-1.html", // shared from "湖北省/宜昌市"
  "湖北省/宜昌市/长阳土家族自治县": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/宜昌市/枝江市": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省"
  "湖北省/宜昌市/秭归县": "http://www.yichang.gov.cn/list-61891-1.html", // shared from "湖北省/宜昌市"
  "吉林省/长春市/南关区": "http://zwgk.changchun.gov.cn/?stit=%E9%95%BF%E5%BA%9C%E5%8F%91&num=4", // shared from "吉林省/长春市"
  "江苏省/常州市/天宁区": "https://www.changzhou.gov.cn/page_wjk", // shared from "江苏省/常州市"
  "江苏省/淮安市/盱眙县": "https://www.jiangsu.gov.cn/col/col84242/index.html", // shared from "江苏省"
  "江苏省/苏州市/吴中区": "https://www.suzhou.gov.cn/szsrmzf/qszcwjk/zcwjk.shtml", // shared from "江苏省/苏州市"
  "江西省/九江市/庐山市": "https://www.jiujiang.gov.cn/fdzdxxgk/01/00/guifanxinwenjian/", // shared from "江西省/九江市"
  "辽宁省/本溪市/平山区": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/朝阳市": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/朝阳市/北票市": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/朝阳市/朝阳县": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/朝阳市/建平县": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/朝阳市/喀喇沁左翼蒙古族自治县": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/朝阳市/凌源市": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/朝阳市/龙城区": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/抚顺市": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/抚顺市/抚顺县": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/抚顺市/清原满族自治县": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/抚顺市/望花区": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/抚顺市/新抚区": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/沈阳市/法库县": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "辽宁省/沈阳市/和平区": "https://www.ln.gov.cn/web/lnszcwjk/index.shtml", // shared from "辽宁省"
  "内蒙古自治区/赤峰市": "https://www.nmg.gov.cn/nmg_zcwjk/", // shared from "内蒙古自治区"
  "内蒙古自治区/通辽市/霍林郭勒市": "https://www.tongliao.gov.cn/policy-find/#/FindPolicy", // shared from "内蒙古自治区/通辽市"
  "内蒙古自治区/通辽市/开鲁县": "https://www.tongliao.gov.cn/policy-find/#/FindPolicy", // shared from "内蒙古自治区/通辽市"
  "内蒙古自治区/通辽市/科尔沁区": "https://www.tongliao.gov.cn/policy-find/#/FindPolicy", // shared from "内蒙古自治区/通辽市"
  "内蒙古自治区/通辽市/科尔沁左翼后旗": "https://www.tongliao.gov.cn/policy-find/#/FindPolicy", // shared from "内蒙古自治区/通辽市"
  "内蒙古自治区/通辽市/科尔沁左翼中旗": "https://www.tongliao.gov.cn/policy-find/#/FindPolicy", // shared from "内蒙古自治区/通辽市"
  "内蒙古自治区/通辽市/库伦旗": "https://www.tongliao.gov.cn/policy-find/#/FindPolicy", // shared from "内蒙古自治区/通辽市"
  "内蒙古自治区/通辽市/奈曼旗": "https://www.tongliao.gov.cn/policy-find/#/FindPolicy", // shared from "内蒙古自治区/通辽市"
  "内蒙古自治区/通辽市/扎鲁特旗": "https://www.tongliao.gov.cn/policy-find/#/FindPolicy", // shared from "内蒙古自治区/通辽市"
  "内蒙古自治区/乌兰察布市/化德县": "https://www.wulanchabu.gov.cn/AIFileLibrary/", // shared from "内蒙古自治区/乌兰察布市"
  "宁夏回族自治区/中卫市/海原县": "https://www.nxzw.gov.cn/zwgk/zc/gfxwj/", // shared from "宁夏回族自治区/中卫市"
  "山东省/济南市/长清区": "https://www.shandong.gov.cn/col/col320658/index.html", // shared from "山东省"
  "山东省/青岛市/黄岛区": "https://www.shandong.gov.cn/col/col320658/index.html", // shared from "山东省"
  "山东省/青岛市/胶州市": "https://www.shandong.gov.cn/col/col320658/index.html", // shared from "山东省"
  "山东省/青岛市/莱西市": "http://www.qingdao.gov.cn/zwgk/zdgk/fgwj/zcwj/szfgw/", // shared from "山东省/青岛市"
  "山东省/潍坊市/安丘市": "https://www.shandong.gov.cn/col/col320658/index.html", // shared from "山东省"
  "山东省/潍坊市/昌邑市": "https://www.shandong.gov.cn/col/col320658/index.html", // shared from "山东省"
  "山东省/潍坊市/诸城市": "https://www.shandong.gov.cn/col/col320658/index.html", // shared from "山东省"
  "山西省/大同市/广灵县": "https://www.dt.gov.cn/dtszf/zcwjk/zcwjsou.shtml", // shared from "山西省/大同市"
  "山西省/大同市/云冈区": "https://www.dt.gov.cn/dtszf/zcwjk/zcwjsou.shtml", // shared from "山西省/大同市"
  "山西省/临汾市/吉县": "https://www.shanxi.gov.cn/zcwjk/", // shared from "山西省"
  "陕西省/安康市/白河县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/安康市/汉滨区": "https://so.ankang.gov.cn/norm/library/s", // shared from "陕西省/安康市"
  "陕西省/安康市/宁陕县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/安康市/平利县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/安康市/石泉县": "https://so.ankang.gov.cn/norm/library/s", // shared from "陕西省/安康市"
  "陕西省/宝鸡市/凤县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/宝鸡市/陇县": "http://www.baoji.gov.cn/col9816/col17241/col9989/", // shared from "陕西省/宝鸡市"
  "陕西省/宝鸡市/眉县": "http://www.baoji.gov.cn/col9816/col17241/col9989/", // shared from "陕西省/宝鸡市"
  "陕西省/宝鸡市/岐山县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/宝鸡市/千阳县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/汉中市/略阳县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/汉中市/宁强县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/商洛市/山阳县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/商洛市/镇安县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/咸阳市/乾县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/咸阳市/武功县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/咸阳市/兴平市": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/咸阳市/杨陵区": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/榆林市/府谷县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/榆林市/靖边县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "陕西省/榆林市/清涧县": "https://www.shaanxi.gov.cn/zfxxgk/zcwjk/", // shared from "陕西省"
  "四川省/阿坝藏族羌族自治州/阿坝县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/阿坝藏族羌族自治州/黑水县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/阿坝藏族羌族自治州/金川县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/阿坝藏族羌族自治州/九寨沟县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/阿坝藏族羌族自治州/理县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/阿坝藏族羌族自治州/茂县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/阿坝藏族羌族自治州/若尔盖县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/阿坝藏族羌族自治州/松潘县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/阿坝藏族羌族自治州/小金县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/达州市": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/达州市/宣汉县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/广安市/华蓥市": "https://www.guang-an.gov.cn/gasrmzfw/c02514/pc/list.html", // shared from "四川省/广安市"
  "四川省/乐山市": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/凉山彝族自治州/德昌县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/凉山彝族自治州/会东县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/凉山彝族自治州/金阳县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/凉山彝族自治州/喜德县": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/泸州市/古蔺县": "http://www.luzhou.gov.cn/zw/zcwjs/szfwj", // shared from "四川省/泸州市"
  "四川省/泸州市/龙马潭区": "http://www.luzhou.gov.cn/zw/zcwjs/szfwj", // shared from "四川省/泸州市"
  "四川省/眉山市/东坡区": "https://www.ms.gov.cn/zfxxgk/z__c/gfxwj.htm", // shared from "四川省/眉山市"
  "四川省/眉山市/洪雅县": "https://www.ms.gov.cn/zfxxgk/z__c/gfxwj.htm", // shared from "四川省/眉山市"
  "四川省/眉山市/彭山区": "https://www.ms.gov.cn/zfxxgk/z__c/gfxwj.htm", // shared from "四川省/眉山市"
  "四川省/绵阳市/北川羌族自治县": "http://www.my.gov.cn/mysrmzf/c100061/xxgk_list.shtml", // shared from "四川省/绵阳市"
  "四川省/绵阳市/三台县": "http://www.my.gov.cn/mysrmzf/c100061/xxgk_list.shtml", // shared from "四川省/绵阳市"
  "四川省/绵阳市/游仙区": "http://www.my.gov.cn/mysrmzf/c100061/xxgk_list.shtml", // shared from "四川省/绵阳市"
  "四川省/内江市": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "四川省/遂宁市": "https://www.sc.gov.cn/10462/scszcwjkss/scszcwjkss.shtml", // shared from "四川省"
  "浙江省/嘉兴市": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/嘉兴市/海宁市": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/嘉兴市/南湖区": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/嘉兴市/桐乡市": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/金华市/婺城区": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/丽水市/缙云县": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/丽水市/青田县": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/丽水市/松阳县": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/宁波市": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/宁波市/海曙区": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/宁波市/宁海县": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/宁波市/象山县": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/宁波市/镇海区": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/衢州市/柯城区": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/绍兴市/上虞区": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/绍兴市/嵊州市": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/绍兴市/越城区": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/温州市/龙湾区": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/温州市/泰顺县": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/温州市/文成县": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  "浙江省/舟山市/普陀区": "https://www.zj.gov.cn/col/col1544911/index.html", // shared from "浙江省"
  // —— v8 扩充（Playwright SPA 渲染后探测）——
  "安徽省/滁州市": "https://www.chuzhou.gov.cn/czzcwjk/", // 政策文件库 (score=100, pw)
  "安徽省/滁州市/来安县": "https://www.laian.gov.cn/public/applyQuery/161747282?organId=3194303&isForGFXWJ=1", // 政策文件 (score=55, pw)
  "安徽省/滁州市/琅琊区": "https://www.lyq.gov.cn/public/applyQuery/161747282?organId=3194300&isForGFXWJ=1", // 政策文件 (score=55, pw)
  "安徽省/淮北市": "https://www.huaibei.gov.cn/zwgk/hbszcwjk/index.html", // 政策文件库 (score=100, pw)
  "安徽省/淮北市/濉溪县": "https://www.sxx.gov.cn/zwgk/zcwjk/index.html", // 政策文件库 (score=100, pw)
  "安徽省/六安市/霍邱县": "https://www.huoqiu.gov.cn/xxgk/zcwjk/index.html", // 政策文件库 (score=100, pw)
  "安徽省/六安市/金安区": "https://www.ja.gov.cn/xxgkai/zcwjk/index.html", // 政策文件库 (score=100, pw)
  "安徽省/六安市/舒城县": "https://www.shucheng.gov.cn/zwzx/ztzl/ztzl/zcwjku/index.html", // 政策文件库 (score=100, pw)
  "安徽省/宿州市/灵璧县": "https://www.lingbi.gov.cn/public/column/6628291?type=4&catId=60742351&action=list", // 政策文件 (score=55, pw)
  "安徽省/芜湖市": "https://www.wuhu.gov.cn/openness/szfzwgkzt/zcwjk/index.html", // 政策文件库 (score=100, pw)
  "安徽省/芜湖市/繁昌区": "https://www.fanchang.gov.cn/wuhu/site/tpl/6782691", // 政策文件库 (score=100, pw)
  "安徽省/芜湖市/镜湖区": "https://www.whjhq.gov.cn/wuhu/site/tpl/6782821", // 政策文件库 (score=100, pw)
  "安徽省/芜湖市/鸠江区": "https://www.jjq.gov.cn/wuhu/site/tpl/6782811", // 鸠江区政策文件库 (score=100, pw)
  "安徽省/芜湖市/湾沚区": "https://www.wanzhi.gov.cn/wuhu/site/tpl/6782751", // 政策文件库 (score=100, pw)
  "安徽省/芜湖市/无为市": "https://www.ww.gov.cn/wuhu/site/tpl/6782801", // 政策文件库 (score=100, pw)
  "安徽省/芜湖市/弋江区": "https://www.yjq.gov.cn/wuhu/site/tpl/6782791", // 政策文件库 (score=100, pw)
  "北京市/密云区": "https://www.bjmy.gov.cn/zwgk/zcwj/", // 政策文件 (score=55, pw)
  "福建省/福州市/连江县": "https://www.fzlj.gov.cn/xjwz/zwgk/zfxxgkzl/xrmzfgzbm_11124/ljxrmzf/gkml/", // 县政府文件 (score=60, pw)
  "福建省/三明市/沙县区": "https://www.fjsx.gov.cn/zfxxgkzl/zfxxgkml/", // 区政府文件 (score=60, pw)
  "福建省/漳州市/长泰区": "https://www.changtai.gov.cn/cms/html/ctxrmzf/zcwjk/index.html", // 政策文件库 (score=100, pw)
  "甘肃省/张掖市/甘州区": "http://gsgz.gov.cn/gzzfxxgk/zfwj_6041/", // 区政府文件 (score=60, pw)
  "广东省/广州市/花都区": "https://www.huadu.gov.cn/xxgk/zcwj/zfwj/index.html", // 政府文件 (score=40, pw)
  "广东省/广州市/天河区": "http://www.thnet.gov.cn/gkmlpt/policy", // 政策文件 (score=55, pw)
  "广东省/揭阳市/揭西县": "http://www.jiexi.gov.cn/jyjxbgs/gkmlpt/index#9796", // 政策文件 (score=55, pw)
  "广东省/梅州市": "https://www.meizhou.gov.cn/zwgk/fggw/sgzgfxwj/index.html", // 市政府（办）规范性文件 (score=80, pw)
  "广东省/韶关市": "https://www.sg.gov.cn/zw/zcfg/index.html", // 政策法规 (score=45, pw)
  "广东省/韶关市/南雄市": "https://www.gdnx.gov.cn/zwgk/zfxxgk/szfwj/index.html", // 政策文件 (score=55, pw)
  "广东省/深圳市/福田区": "https://www.szft.gov.cn/xxgk/zwgk/zcfg/index.html", // 政策法规 (score=45, pw)
  "广东省/阳江市/阳西县": "http://www.yangxi.gov.cn/gk/zfwj/index.html", // 政府文件 (score=40, pw)
  "广东省/肇庆市/怀集县": "https://www.huaiji.gov.cn/gkmlpt/policy", // 政策文件 (score=55, pw)
  "广西壮族自治区/防城港市/港口区": "http://www.gkq.gov.cn/hd/ldxx/tGovMsgBox_157830249715.shtml?metadataId=157830249715", // 政策文件类栏目 (score=55, pw)
  "广西壮族自治区/南宁市/隆安县": "http://www.lax.gov.cn/lagk/xxgkml/zcwj/zfwj/", // 政府文件 (score=40, pw)
  "广西壮族自治区/南宁市/邕宁区": "http://www.yongning.gov.cn/xxgk/fdzdgk/jcxxgk/wjzl/", // 政策文件 (score=55, pw)
  "广西壮族自治区/梧州市/龙圩区": "http://www.wzlxq.gov.cn/lwhd/ldxx/tGovMsgBox_157830243605.shtml?metadataId=157830243605", // 政策文件 (score=55, pw)
  "贵州省/毕节市/黔西市": "http://www.gzqianxi.gov.cn/ztzl2022/gzhgfxwjsjk_5816900_1/gfxwjsjk_5816901/qxxrmzfzfbgs/index.html", // 规范性文件 (score=80, pw)
  "海南省/澄迈县": "http://chengmai.hainan.gov.cn/chengmai/zfwj/list.shtml", // 政策文件 (score=55, pw)
  "河北省/衡水市/故城县": "http://www.gucheng.gov.cn/col/col9990/index.html", // 政策文件 (score=55, pw)
  "河北省/衡水市/武邑县": "http://www.wuyi.gov.cn/col/col8197/index.html", // 政策文件 (score=55, pw)
  "河北省/唐山市/滦南县": "https://www.luannan.gov.cn/OpennessContent/showList/2/171/page_1.html", // 政策文件 (score=55, pw)
  "河南省/安阳市/滑县": "https://www.hnhx.gov.cn/portal/zwgk/gfxwj/A000208index_1.htm", // 规范性文件 (score=80, pw)
  "河南省/三门峡市/义马市": "https://www.yima.gov.cn/14501/0000/jczwgkList1-1.html", // 政策文件 (score=55, pw)
  "河南省/新乡市/牧野区": "http://www.xxmyq.gov.cn/sitesources/myqzf/page_pc/xxgk/xxgkml/zcwj/index.html", // 政策文件 (score=55, pw)
  "河南省/信阳市/商城县": "https://www.hnsc.gov.cn/zfxxgk/scxrmzfxxgkml/zcfg/szbwj/", // 政策文件 (score=55, pw)
  "河南省/周口市/淮阳区": "https://www.hyzww.gov.cn/sitesources/hyq/page_pc/zwgk/jcxxgk/zfwj/", // 政府文件 (score=40, pw)
  "河南省/周口市/鹿邑县": "https://www.luyi.gov.cn/portal/zwgk/zfwj/A000202index_1.htm", // 政策文件 (score=55, pw)
  "河南省/周口市/西华县": "https://www.xihua.gov.cn/sitesources/xhxrmzf/page_pc/zwgk/zfwj/index.html", // 政府文件 (score=40, pw)
  "黑龙江省/牡丹江市/宁安市": "https://www.ningan.gov.cn/nasrmzf/c104589/redirect_firstChannel.shtml", // 政策文件 (score=55, pw)
  "湖北省/鄂州市": "http://www.ezhou.gov.cn/gk/zcwjkcs/", // 规范性文件库 (score=80, pw)
  "湖北省/武汉市/青山区": "https://www.qingshan.gov.cn/zfxxgk/zc/qtzdgkwj/zfwj/", // 政府文件 (score=40, pw)
  "江苏省/连云港市/海州区": "http://www.lyghz.gov.cn/lyghzqrmzf/zfwj/zfwj.html", // 政府文件 (score=40, pw)
  "江苏省/无锡市/锡山区": "https://www.jsxishan.gov.cn/zfxxgk/sqzfxxgkml/fgwjjjd/qzfbgswj/index.shtml", // 政策文件 (score=55, pw)
  "辽宁省/盘锦市/大洼区": "http://www.dawa.gov.cn/12475/", // 政策文件 (score=55, pw)
  "辽宁省/盘锦市/双台子区": "https://www.stq.gov.cn/12990/", // 区政府文件 (score=60, pw)
  "内蒙古自治区/赤峰市/松山区": "http://www.ssq.gov.cn/zwgk/jbxxgk/zfxxgknr/?gk=3", // 政策文件 (score=55, pw)
  "内蒙古自治区/锡林郭勒盟/二连浩特市": "https://www.elht.gov.cn/zwgk/zfxxgk/fdzdgknr/?gk=3&cid=1359", // 政策文件 (score=55, pw)
  "山东省/济南市/商河县": "http://www.shanghe.gov.cn/gongkai/channel_63899f40375991828262f909/", // 养老服务政策文件 (score=55, pw)
  "山东省/聊城市/高唐县": "http://www.gaotang.gov.cn/channel_x_0.0_6187/", // 政策文件 (score=55, pw)
  "山东省/威海市/荣成市": "http://www.rongcheng.gov.cn/col/col104004/index.html", // 市政府文件 (score=60, pw)
  "山东省/威海市/乳山市": "http://www.rushan.gov.cn/col/col130956/index.html", // 政策文件 (score=55, pw)
  "山西省/晋城市/阳城县": "https://www.yczf.gov.cn/zwgk/zfwj/", // 政府文件 (score=40, pw)
  "上海市/青浦区": "https://www.shqp.gov.cn/shqp/zwgk/gfxwj/", // 规范性文件 (score=80, pw)
  "上海市/杨浦区": "https://www.shyp.gov.cn/subscribe/html/zdgkgwk", // 政策文件 (score=55, pw)
  "新疆维吾尔自治区/巴音郭楞蒙古自治州/和硕县": "https://www.hoxut.gov.cn/xjhsx/c115036/jump_column.shtml", // 政策文件 (score=55, pw)
  "新疆维吾尔自治区/昌吉回族自治州/玛纳斯县": "https://www.mns.gov.cn/p202/zfwj.html", // 政府文件 (score=40, pw)
  "新疆维吾尔自治区/新疆生产建设兵团/双河市": "http://www.xjshs.gov.cn/xxgk-list-zhengcewenjianyqUohX.html", // 政策文件 (score=55, pw)
  "云南省/大理白族自治州/鹤庆县": "http://www.heqing.gov.cn/hqxrmzf/c106496/pc/list.html", // 政策文件 (score=55, pw)
  "云南省/大理白族自治州/剑川县": "http://www.jianchuan.gov.cn/jcxrmzf/c107102/pc/list.html", // 政策文件 (score=55, pw)
  "云南省/大理白族自治州/永平县": "http://www.ypx.gov.cn/ypxrmzf/c20003/pc/list.html", // 政策文件 (score=55, pw)
  "云南省/临沧市/沧源佤族自治县": "https://www.cangyuan.gov.cn/zfxxgk_cyx/zfwj.html", // 政策文件 (score=55, pw)
  "云南省/临沧市/凤庆县": "https://www.ynfq.gov.cn/zfxxgk_fqx/xxgfxwj.html", // 规范性文件 (score=80, pw)
  "云南省/临沧市/临翔区": "https://www.ynlx.gov.cn/zfxxgk_lxq/zfwj.html", // 政策文件 (score=55, pw)
  "云南省/临沧市/永德县": "https://www.yongde.gov.cn/zfxxgk_ydx/zfwj.html", // 政策文件 (score=55, pw)
  "云南省/临沧市/镇康县": "https://www.ynzk.gov.cn/zfxxgk_zkx/xxgfxwj.html", // 规范性文件 (score=80, pw)
  // —— v8.b 跨域复用（Playwright 探测发现链接回母级，复用母级 URL）——
  "贵州省/铜仁市/松桃苗族自治县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省" (pw, 省政府文件 score=60)
  "贵州省/铜仁市/沿河土家族自治县": "https://www.guizhou.gov.cn/ztzl/zcwjk/", // shared from "贵州省" (pw, 省政府文件 score=60)
  "湖北省/咸宁市/赤壁市": "https://www.hubei.gov.cn/zfwj/list1.shtml", // shared from "湖北省" (pw, 湖北省法规规章规范性文件数据库 score=80)
};

export const POLICY_REGIONS: RegionLinkNode[] = buildRegionTree(POLICY_URL_MAP);
