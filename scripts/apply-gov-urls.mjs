/**
 * Stage 6: Apply known government portal URLs to gov-website-links.ts
 * 
 * These URLs are well-established Chinese government portals.
 * Only includes URLs with high confidence of accuracy.
 */

import { readFileSync, writeFileSync } from 'fs';

// Mapping: "省>市" => URL or "省" => URL (for province-level)
// Only province and city level per user request
const GOV_URL_MAP = {
  // === 新疆生产建设兵团 (missing province) ===
  "新疆生产建设兵团": "http://www.xjbt.gov.cn/",

  // === 天津市 districts (11 missing) ===
  "天津市>河北区": "https://www.tjhbq.gov.cn/",
  "天津市>红桥区": "https://www.tjhqqzf.gov.cn/",
  "天津市>东丽区": "https://www.tjdl.gov.cn/",
  "天津市>西青区": "https://www.tjxq.gov.cn/",
  "天津市>津南区": "https://www.tjjn.gov.cn/",
  "天津市>北辰区": "https://www.tjbc.gov.cn/",
  "天津市>武清区": "https://www.tjwq.gov.cn/",
  "天津市>宝坻区": "https://www.tjbd.gov.cn/",
  "天津市>宁河区": "https://www.tjnh.gov.cn/",
  "天津市>静海区": "https://www.tjjh.gov.cn/",
  "天津市>蓟州区": "https://www.tjjz.gov.cn/",

  // === 上海市 districts (13 missing) ===
  "上海市>黄浦区": "https://www.shhuangpu.gov.cn/",
  "上海市>长宁区": "https://www.shcn.gov.cn/",
  "上海市>静安区": "https://www.jingan.gov.cn/",
  "上海市>虹口区": "https://www.shhk.gov.cn/",
  "上海市>杨浦区": "https://www.shyp.gov.cn/",
  "上海市>闵行区": "https://www.shmh.gov.cn/",
  "上海市>宝山区": "https://www.shbsq.gov.cn/",
  "上海市>嘉定区": "https://www.jiading.gov.cn/",
  "上海市>金山区": "https://www.jinshan.gov.cn/",
  "上海市>松江区": "https://www.songjiang.gov.cn/",
  "上海市>青浦区": "https://www.shqp.gov.cn/",
  "上海市>奉贤区": "https://www.fengxian.gov.cn/",
  "上海市>崇明区": "https://www.cmx.gov.cn/",

  // === 重庆市 districts/counties (38 missing) ===
  "重庆市>万州区": "https://www.wz.gov.cn/",
  "重庆市>涪陵区": "https://www.fl.gov.cn/",
  "重庆市>渝中区": "https://www.cqyz.gov.cn/",
  "重庆市>大渡口区": "https://www.ddk.gov.cn/",
  "重庆市>江北区": "https://www.cqjb.gov.cn/",
  "重庆市>沙坪坝区": "https://www.shapingba.gov.cn/",
  "重庆市>九龙坡区": "https://www.cqjlp.gov.cn/",
  "重庆市>南岸区": "https://www.cqna.gov.cn/",
  "重庆市>北碚区": "https://www.beibei.gov.cn/",
  "重庆市>綦江区": "https://www.cqqj.gov.cn/",
  "重庆市>大足区": "https://www.dazu.gov.cn/",
  "重庆市>渝北区": "https://www.ybq.gov.cn/",
  "重庆市>巴南区": "https://www.cqbn.gov.cn/",
  "重庆市>黔江区": "https://www.qianjiang.gov.cn/",
  "重庆市>长寿区": "https://www.cqcs.gov.cn/",
  "重庆市>江津区": "https://www.jiangjin.gov.cn/",
  "重庆市>合川区": "https://www.hc.gov.cn/",
  "重庆市>永川区": "https://www.cqyc.gov.cn/",
  "重庆市>南川区": "https://www.cqnc.gov.cn/",
  "重庆市>璧山区": "https://www.bishan.gov.cn/",
  "重庆市>铜梁区": "https://www.cqtl.gov.cn/",
  "重庆市>潼南区": "https://www.cqtn.gov.cn/",
  "重庆市>荣昌区": "https://www.rongchang.gov.cn/",
  "重庆市>开州区": "https://www.cqkz.gov.cn/",
  "重庆市>梁平区": "https://www.cqlp.gov.cn/",
  "重庆市>武隆区": "https://www.cqwl.gov.cn/",
  "重庆市>城口县": "https://www.cqck.gov.cn/",
  "重庆市>丰都县": "https://www.cqfd.gov.cn/",
  "重庆市>垫江县": "https://www.dianjiang.gov.cn/",
  "重庆市>忠县": "https://www.cqzx.gov.cn/",
  "重庆市>云阳县": "https://www.yunyang.gov.cn/",
  "重庆市>奉节县": "https://www.cqfj.gov.cn/",
  "重庆市>巫山县": "https://www.cqwushan.gov.cn/",
  "重庆市>巫溪县": "https://www.cqwx.gov.cn/",
  "重庆市>石柱土家族自治县": "https://www.cqsz.gov.cn/",
  "重庆市>秀山土家族苗族自治县": "https://www.cqxs.gov.cn/",
  "重庆市>酉阳土家族苗族自治县": "https://www.cqyy.gov.cn/",
  "重庆市>彭水苗族土家族自治县": "https://www.cqps.gov.cn/",

  // === 河北省 (3 missing) ===
  "河北省>张家口市": "https://www.zjk.gov.cn/",
  "河北省>廊坊市": "https://www.lf.gov.cn/",
  "河北省>衡水市": "https://www.hengshui.gov.cn/",

  // === 山西省 (9 missing) ===
  "山西省>大同市": "https://www.dt.gov.cn/",
  "山西省>阳泉市": "https://www.yq.gov.cn/",
  "山西省>长治市": "https://www.changzhi.gov.cn/",
  "山西省>晋城市": "https://www.jcgov.gov.cn/",
  "山西省>朔州市": "https://www.shuozhou.gov.cn/",
  "山西省>晋中市": "https://www.sxjz.gov.cn/",
  "山西省>运城市": "https://www.yuncheng.gov.cn/",
  "山西省>忻州市": "https://www.xinzhou.gov.cn/",
  "山西省>临汾市": "https://www.linfen.gov.cn/",

  // === 内蒙古自治区 (12 missing) ===
  "内蒙古自治区>呼和浩特市": "https://www.huhhot.gov.cn/",
  "内蒙古自治区>包头市": "https://www.baotou.gov.cn/",
  "内蒙古自治区>乌海市": "https://www.wuhai.gov.cn/",
  "内蒙古自治区>赤峰市": "https://www.chifeng.gov.cn/",
  "内蒙古自治区>通辽市": "https://www.tongliao.gov.cn/",
  "内蒙古自治区>鄂尔多斯市": "https://www.ordos.gov.cn/",
  "内蒙古自治区>呼伦贝尔市": "https://www.hulunbuir.gov.cn/",
  "内蒙古自治区>巴彦淖尔市": "https://www.bynr.gov.cn/",
  "内蒙古自治区>乌兰察布市": "https://www.wulanchabu.gov.cn/",
  "内蒙古自治区>兴安盟": "https://www.xam.gov.cn/",
  "内蒙古自治区>锡林郭勒盟": "https://www.xlgl.gov.cn/",
  "内蒙古自治区>阿拉善盟": "https://www.als.gov.cn/",

  // === 辽宁省 (9 missing) ===
  "辽宁省>大连市": "https://www.dl.gov.cn/",
  "辽宁省>抚顺市": "https://www.fushun.gov.cn/",
  "辽宁省>本溪市": "https://www.benxi.gov.cn/",
  "辽宁省>锦州市": "https://www.jz.gov.cn/",
  "辽宁省>营口市": "https://www.yingkou.gov.cn/",
  "辽宁省>阜新市": "https://www.fuxin.gov.cn/",
  "辽宁省>辽阳市": "https://www.liaoyang.gov.cn/",
  "辽宁省>盘锦市": "https://www.panjin.gov.cn/",
  "辽宁省>葫芦岛市": "https://www.hld.gov.cn/",

  // === 吉林省 (5 missing) ===
  "吉林省>长春市": "https://www.changchun.gov.cn/",
  "吉林省>吉林市": "https://www.jlcity.gov.cn/",
  "吉林省>四平市": "https://www.siping.gov.cn/",
  "吉林省>辽源市": "https://www.liaoyuan.gov.cn/",
  "吉林省>延边朝鲜族自治州": "https://www.yanbian.gov.cn/",

  // === 黑龙江省 (4 missing) ===
  "黑龙江省>鸡西市": "https://www.jixi.gov.cn/",
  "黑龙江省>鹤岗市": "https://www.hegang.gov.cn/",
  "黑龙江省>双鸭山市": "https://www.sys.gov.cn/",
  "黑龙江省>伊春市": "https://www.yc.gov.cn/",

  // === 江苏省 (13 missing) ===
  "江苏省>南京市": "https://www.nanjing.gov.cn/",
  "江苏省>无锡市": "https://www.wuxi.gov.cn/",
  "江苏省>徐州市": "https://www.xz.gov.cn/",
  "江苏省>常州市": "https://www.changzhou.gov.cn/",
  "江苏省>苏州市": "https://www.suzhou.gov.cn/",
  "江苏省>南通市": "https://www.nantong.gov.cn/",
  "江苏省>连云港市": "https://www.lyg.gov.cn/",
  "江苏省>淮安市": "https://www.huaian.gov.cn/",
  "江苏省>盐城市": "https://www.yancheng.gov.cn/",
  "江苏省>扬州市": "https://www.yangzhou.gov.cn/",
  "江苏省>镇江市": "https://www.zhenjiang.gov.cn/",
  "江苏省>泰州市": "https://www.taizhou.gov.cn/",
  "江苏省>宿迁市": "https://www.suqian.gov.cn/",

  // === 浙江省 (8 missing) ===
  "浙江省>杭州市": "https://www.hangzhou.gov.cn/",
  "浙江省>宁波市": "https://www.ningbo.gov.cn/",
  "浙江省>温州市": "https://www.wenzhou.gov.cn/",
  "浙江省>嘉兴市": "https://www.jiaxing.gov.cn/",
  "浙江省>湖州市": "https://www.huzhou.gov.cn/",
  "浙江省>金华市": "https://www.jinhua.gov.cn/",
  "浙江省>衢州市": "https://www.qz.gov.cn/",
  "浙江省>台州市": "https://www.taizhou.com.cn/",

  // === 安徽省 (10 missing) ===
  "安徽省>淮南市": "https://www.huainan.gov.cn/",
  "安徽省>马鞍山市": "https://www.mas.gov.cn/",
  "安徽省>淮北市": "https://www.huaibei.gov.cn/",
  "安徽省>铜陵市": "https://www.tl.gov.cn/",
  "安徽省>黄山市": "https://www.huangshan.gov.cn/",
  "安徽省>滁州市": "https://www.chuzhou.gov.cn/",
  "安徽省>阜阳市": "https://www.fy.gov.cn/",
  "安徽省>六安市": "https://www.luan.gov.cn/",
  "安徽省>池州市": "https://www.chizhou.gov.cn/",
  "安徽省>宣城市": "https://www.xuancheng.gov.cn/",

  // === 福建省 (7 missing) ===
  "福建省>厦门市": "https://www.xm.gov.cn/",
  "福建省>莆田市": "https://www.putian.gov.cn/",
  "福建省>泉州市": "https://www.quanzhou.gov.cn/",
  "福建省>漳州市": "https://www.zhangzhou.gov.cn/",
  "福建省>南平市": "https://www.np.gov.cn/",
  "福建省>龙岩市": "https://www.longyan.gov.cn/",
  "福建省>宁德市": "https://www.ningde.gov.cn/",

  // === 江西省 (5 missing) ===
  "江西省>萍乡市": "https://www.pingxiang.gov.cn/",
  "江西省>新余市": "https://www.xinyu.gov.cn/",
  "江西省>鹰潭市": "https://www.yingtan.gov.cn/",
  "江西省>赣州市": "https://www.ganzhou.gov.cn/",
  "江西省>吉安市": "https://www.ji-an.gov.cn/",

  // === 山东省 (9 missing) ===
  "山东省>枣庄市": "https://www.zaozhuang.gov.cn/",
  "山东省>烟台市": "https://www.yantai.gov.cn/",
  "山东省>潍坊市": "https://www.weifang.gov.cn/",
  "山东省>泰安市": "https://www.taian.gov.cn/",
  "山东省>威海市": "https://www.weihai.gov.cn/",
  "山东省>日照市": "https://www.rizhao.gov.cn/",
  "山东省>临沂市": "https://www.linyi.gov.cn/",
  "山东省>德州市": "https://www.dezhou.gov.cn/",
  "山东省>聊城市": "https://www.liaocheng.gov.cn/",

  // === 河南省 (15 missing) ===
  "河南省>开封市": "https://www.kaifeng.gov.cn/",
  "河南省>洛阳市": "https://www.ly.gov.cn/",
  "河南省>平顶山市": "https://www.pds.gov.cn/",
  "河南省>安阳市": "https://www.anyang.gov.cn/",
  "河南省>鹤壁市": "https://www.hebi.gov.cn/",
  "河南省>新乡市": "https://www.xinxiang.gov.cn/",
  "河南省>焦作市": "https://www.jiaozuo.gov.cn/",
  "河南省>许昌市": "https://www.xuchang.gov.cn/",
  "河南省>漯河市": "https://www.luohe.gov.cn/",
  "河南省>三门峡市": "https://www.smx.gov.cn/",
  "河南省>商丘市": "https://www.shangqiu.gov.cn/",
  "河南省>信阳市": "https://www.xinyang.gov.cn/",
  "河南省>周口市": "https://www.zhoukou.gov.cn/",
  "河南省>驻马店市": "https://www.zhumadian.gov.cn/",
  "河南省>济源示范区": "https://www.jiyuan.gov.cn/",

  // === 湖北省 (12 missing) ===
  "湖北省>武汉市": "https://www.wuhan.gov.cn/",
  "湖北省>黄石市": "https://www.huangshi.gov.cn/",
  "湖北省>十堰市": "https://www.shiyan.gov.cn/",
  "湖北省>襄阳市": "https://www.xiangyang.gov.cn/",
  "湖北省>鄂州市": "https://www.ezhou.gov.cn/",
  "湖北省>荆门市": "https://www.jingmen.gov.cn/",
  "湖北省>孝感市": "https://www.xiaogan.gov.cn/",
  "湖北省>荆州市": "https://www.jingzhou.gov.cn/",
  "湖北省>咸宁市": "https://www.xianning.gov.cn/",
  "湖北省>恩施土家族苗族自治州": "https://www.enshi.gov.cn/",
  "湖北省>天门市": "https://www.tianmen.gov.cn/",
  "湖北省>神农架林区": "https://www.snj.gov.cn/",

  // === 湖南省 (10 missing) ===
  "湖南省>株洲市": "https://www.zhuzhou.gov.cn/",
  "湖南省>湘潭市": "https://www.xiangtan.gov.cn/",
  "湖南省>邵阳市": "https://www.shaoyang.gov.cn/",
  "湖南省>岳阳市": "https://www.yueyang.gov.cn/",
  "湖南省>常德市": "https://www.changde.gov.cn/",
  "湖南省>张家界市": "https://www.zjj.gov.cn/",
  "湖南省>郴州市": "https://www.czs.gov.cn/",
  "湖南省>永州市": "https://www.yzcity.gov.cn/",
  "湖南省>娄底市": "https://www.ld.gov.cn/",
  "湖南省>湘西土家族苗族自治州": "https://www.xxz.gov.cn/",

  // === 广西壮族自治区 (6 missing) ===
  "广西壮族自治区>桂林市": "https://www.guilin.gov.cn/",
  "广西壮族自治区>梧州市": "https://www.wuzhou.gov.cn/",
  "广西壮族自治区>钦州市": "https://www.qinzhou.gov.cn/",
  "广西壮族自治区>玉林市": "https://www.yulin.gov.cn/",
  "广西壮族自治区>百色市": "https://www.baise.gov.cn/",
  "广西壮族自治区>来宾市": "https://www.laibin.gov.cn/",

  // === 海南省 (17 missing) ===
  "海南省>三沙市": "https://www.sansha.gov.cn/",
  "海南省>儋州市": "https://www.danzhou.gov.cn/",
  "海南省>五指山市": "https://www.wzs.gov.cn/",
  "海南省>文昌市": "https://www.wenchang.gov.cn/",
  "海南省>琼海市": "https://www.qionghai.gov.cn/",
  "海南省>万宁市": "https://www.wanning.gov.cn/",
  "海南省>东方市": "https://www.dongfang.gov.cn/",
  "海南省>定安县": "https://www.dingan.gov.cn/",
  "海南省>屯昌县": "https://www.tunchang.gov.cn/",
  "海南省>澄迈县": "https://www.chengmai.gov.cn/",
  "海南省>临高县": "https://www.lingao.gov.cn/",
  "海南省>白沙黎族自治县": "https://www.baisha.gov.cn/",
  "海南省>昌江黎族自治县": "https://www.changjiang.gov.cn/",
  "海南省>乐东黎族自治县": "https://www.ledong.gov.cn/",
  "海南省>陵水黎族自治县": "https://www.lingshui.gov.cn/",
  "海南省>保亭黎族苗族自治县": "https://www.baoting.gov.cn/",
  "海南省>琼中黎族苗族自治县": "https://www.qiongzhong.gov.cn/",

  // === 四川省 (1 missing) ===
  "四川省>巴中市": "https://www.cnbz.gov.cn/",

  // === 贵州省 (3 missing) ===
  "贵州省>贵阳市": "https://www.guiyang.gov.cn/",
  "贵州省>遵义市": "https://www.zunyi.gov.cn/",
  "贵州省>黔东南苗族侗族自治州": "https://www.qdn.gov.cn/",

  // === 云南省 (3 missing) ===
  "云南省>昆明市": "https://www.km.gov.cn/",
  "云南省>曲靖市": "https://www.qj.gov.cn/",
  "云南省>西双版纳傣族自治州": "https://www.xsbn.gov.cn/",

  // === 西藏自治区 (5 missing) ===
  "西藏自治区>拉萨市": "https://www.lasa.gov.cn/",
  "西藏自治区>日喀则市": "https://www.rikaze.gov.cn/",
  "西藏自治区>昌都市": "https://www.changdu.gov.cn/",
  "西藏自治区>山南市": "https://www.shannan.gov.cn/",
  "西藏自治区>阿里地区": "https://www.ali.gov.cn/",

  // === 甘肃省 (7 missing) ===
  "甘肃省>兰州市": "https://www.lanzhou.gov.cn/",
  "甘肃省>金昌市": "https://www.jc.gov.cn/",
  "甘肃省>武威市": "https://www.ww.gov.cn/",
  "甘肃省>平凉市": "https://www.pingliang.gov.cn/",
  "甘肃省>酒泉市": "https://www.jiuquan.gov.cn/",
  "甘肃省>定西市": "https://www.dingxi.gov.cn/",
  "甘肃省>陇南市": "https://www.longnan.gov.cn/",

  // === 青海省 (5 missing) ===
  "青海省>西宁市": "https://www.xining.gov.cn/",
  "青海省>海北藏族自治州": "https://www.haibei.gov.cn/",
  "青海省>黄南藏族自治州": "https://www.huangnan.gov.cn/",
  "青海省>果洛藏族自治州": "https://www.guoluo.gov.cn/",
  "青海省>海西蒙古族藏族自治州": "https://www.haixi.gov.cn/",

  // === 宁夏回族自治区 (3 missing) ===
  "宁夏回族自治区>银川市": "https://www.yinchuan.gov.cn/",
  "宁夏回族自治区>固原市": "https://www.nxgy.gov.cn/",
  "宁夏回族自治区>中卫市": "https://www.nxzw.gov.cn/",
};

// Read the data file
const filePath = 'data/gov-website-links.ts';
let content = readFileSync(filePath, 'utf8');

let applied = 0;
let skipped = 0;

// Apply province-level URLs
for (const [key, url] of Object.entries(GOV_URL_MAP)) {
  if (key.includes('>')) continue; // Skip city-level for now

  // Province-level: find { name: "省名", url: ""
  const escapedName = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(\\{\\s*name:\\s*"${escapedName}",\\s*url:\\s*)""`
  );
  
  if (regex.test(content)) {
    content = content.replace(regex, `$1"${url}"`);
    applied++;
    console.log(`  ✓ ${key}: ${url}`);
  } else {
    // Check if already has a URL
    const checkRegex = new RegExp(`name:\\s*"${escapedName}",\\s*url:\\s*"([^"]*)"`);
    const match = content.match(checkRegex);
    if (match && match[1]) {
      console.log(`  ⊘ ${key}: already has URL ${match[1]}`);
      skipped++;
    } else {
      console.log(`  ✗ ${key}: not found in data file`);
    }
  }
}

// Apply city-level URLs
for (const [key, url] of Object.entries(GOV_URL_MAP)) {
  if (!key.includes('>')) continue;

  const [province, city] = key.split('>');
  const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Find city entry with empty url
  const regex = new RegExp(
    `(\\{\\s*name:\\s*"${escapedCity}",\\s*url:\\s*)""`
  );
  
  if (regex.test(content)) {
    content = content.replace(regex, `$1"${url}"`);
    applied++;
    console.log(`  ✓ ${key}: ${url}`);
  } else {
    // Check if already has a URL
    const checkRegex = new RegExp(`name:\\s*"${escapedCity}",\\s*url:\\s*"([^"]*)"`);
    const match = content.match(checkRegex);
    if (match && match[1]) {
      console.log(`  ⊘ ${key}: already has URL ${match[1]}`);
      skipped++;
    } else {
      console.log(`  ✗ ${key}: not found in data file`);
    }
  }
}

writeFileSync(filePath, content);
console.log(`\nDone: applied ${applied} URLs, skipped ${skipped} (already filled)`);
