import fs from 'fs';

const URLS = {
  河南省: {
    开封市: "http://czj.kaifeng.gov.cn/",
    洛阳市: "https://cz.ly.gov.cn/",
    平顶山市: "http://czj.pds.gov.cn/",
    鹤壁市: "https://czj.hebi.gov.cn/",
    新乡市: "http://czj.xinxiang.gov.cn/",
    焦作市: "http://czj.jiaozuo.gov.cn/",
    许昌市: "https://czj.xuchang.gov.cn/",
    漯河市: "https://czj.luohe.gov.cn/",
    三门峡市: "http://czj.smx.gov.cn/",
    商丘市: "https://czj.shangqiu.gov.cn/",
    信阳市: "https://czj.xinyang.gov.cn/",
    周口市: "http://czj.zhoukou.gov.cn/",
    驻马店市: "http://czj.zhumadian.gov.cn/",
    济源示范区: "http://czj.jiyuan.gov.cn/",
  },
  湖北省: {
    黄石市: "http://czj.huangshi.gov.cn/",
    十堰市: "http://czj.shiyan.gov.cn/",
    襄阳市: "http://czj.xiangyang.gov.cn/",
    鄂州市: "https://czj.ezhou.gov.cn/",
    荆门市: "http://czj.jingmen.gov.cn/",
    孝感市: "https://czj.xiaogan.gov.cn/",
    荆州市: "http://czj.jingzhou.gov.cn/",
    咸宁市: "http://czj.xianning.gov.cn/",
    恩施土家族苗族自治州: "http://czj.enshi.gov.cn/",
  },
  湖南省: {
    株洲市: "http://czj.zhuzhou.gov.cn/",
    湘潭市: "http://cz.xiangtan.gov.cn/",
    邵阳市: "http://czj.shaoyang.gov.cn/",
    岳阳市: "https://czj.yueyang.gov.cn/",
    常德市: "https://czj.changde.gov.cn/",
    张家界市: "http://cz.zjj.gov.cn/",
  },
  广西壮族自治区: {
    桂林市: "http://czj.guilin.gov.cn/",
    梧州市: "http://czj.wuzhou.gov.cn/",
    钦州市: "http://czj.qinzhou.gov.cn/",
    玉林市: "http://czj.yulin.gov.cn/",
    百色市: "http://czj.baise.gov.cn/",
  },
  贵州省: {
    贵阳市: "https://czj.guiyang.gov.cn/",
    六盘水市: "https://www.lps.gov.cn/zwgk/czzj/",
    遵义市: "http://czj.zunyi.gov.cn/",
    黔东南苗族侗族自治州: "http://czj.qdn.gov.cn/",
  },
  云南省: {
    昆明市: "https://czj.km.gov.cn/",
    曲靖市: "https://czj.qj.gov.cn/",
    文山壮族苗族自治州: "https://www.ws.gov.cn/zwgk/czzj/",
  },
  西藏自治区: {
    拉萨市: "http://czj.lasa.gov.cn/",
    日喀则市: "http://czj.rikaze.gov.cn/",
    昌都市: "https://czj.changdu.gov.cn/",
    山南市: "http://czj.shannan.gov.cn/",
    阿里地区: "http://cz.al.gov.cn/",
  },
  甘肃省: {
    兰州市: "http://czj.lanzhou.gov.cn/",
    嘉峪关市: "https://www.jyg.gov.cn/zwgk/czzj/",
    平凉市: "https://czj.pingliang.gov.cn/",
    酒泉市: "https://czj.jiuquan.gov.cn/",
    定西市: "http://czj.dingxi.gov.cn/",
  },
  青海省: {
    西宁市: "http://czj.xining.gov.cn/",
    海西蒙古族藏族自治州: "https://czj.haixi.gov.cn/",
  },
  宁夏回族自治区: {
    银川市: "https://czj.yinchuan.gov.cn/",
  },
};

let content = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
let applied = 0;

for (const [prov, cities] of Object.entries(URLS)) {
  for (const [city, url] of Object.entries(cities)) {
    const pattern = `name: "${city}", url: ""`;
    if (content.includes(pattern)) {
      content = content.replace(pattern, `name: "${city}", url: "${url}"`);
      applied++;
      console.log(`  ✓ ${city}: ${url}`);
    } else {
      console.log(`  ✗ ${city}: pattern not found`);
    }
  }
}

fs.writeFileSync('data/fiscal-budget-links.ts', content);
console.log(`\nApplied ${applied} URLs`);
