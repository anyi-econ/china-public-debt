import http from 'http';
import https from 'https';

function checkUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', d => { data += d; if (data.length > 5000) req.destroy(); });
      res.on('end', () => resolve({ url, status: res.statusCode, size: data.length, redirect: res.headers.location || '', snippet: data.substring(0, 300) }));
    });
    req.on('error', (e) => resolve({ url, status: 0, size: 0, error: e.code }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, size: 0, error: 'TIMEOUT' }); });
  });
}

// All 95 missing prefecture-level cities with candidate URLs
const cities = [
  // ═══ 吉林省 ═══
  { name: '吉林市', urls: ['http://czj.jlcity.gov.cn/', 'http://www.jlcity.gov.cn/szfxxgk/fdzdgknr/czxx/', 'http://www.jlcity.gov.cn/szfxxgk/fdzdgknr/czsjyjsgk/'] },
  { name: '四平市', urls: ['http://czj.siping.gov.cn/', 'http://www.siping.gov.cn/szfxxgk/fdzdgknr/czxx/', 'http://www.siping.gov.cn/szfxxgk/fdzdgknr/czsjyjsgk/'] },
  { name: '通化市', urls: ['http://czj.tonghua.gov.cn/', 'http://www.tonghua.gov.cn/szfxxgk/fdzdgknr/czxx/', 'http://www.tonghua.gov.cn/szfxxgk/fdzdgknr/czsjyjsgk/'] },
  { name: '白山市', urls: ['http://czj.baishan.gov.cn/', 'http://www.baishan.gov.cn/szfxxgk/fdzdgknr/czxx/', 'http://www.baishan.gov.cn/szfxxgk/fdzdgknr/czsjyjsgk/'] },
  { name: '松原市', urls: ['http://czj.songyuan.gov.cn/', 'http://www.songyuan.gov.cn/szfxxgk/fdzdgknr/czxx/', 'http://www.songyuan.gov.cn/szfxxgk/fdzdgknr/czsjyjsgk/'] },
  { name: '白城市', urls: ['http://czj.baicheng.gov.cn/', 'http://www.baicheng.gov.cn/szfxxgk/fdzdgknr/czxx/', 'http://www.baicheng.gov.cn/szfxxgk/fdzdgknr/czsjyjsgk/'] },
  // ═══ 黑龙江省 ═══
  { name: '鸡西市', urls: ['http://czj.jixi.gov.cn/', 'http://www.jixi.gov.cn/zwgk/czzj/', 'http://www.jixi.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '鹤岗市', urls: ['http://czj.hegang.gov.cn/', 'http://www.hegang.gov.cn/zwgk/czzj/', 'http://www.hegang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '双鸭山市', urls: ['http://czj.shuangyashan.gov.cn/', 'http://www.shuangyashan.gov.cn/zwgk/czzj/', 'http://www.shuangyashan.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '绥化市', urls: ['http://czj.suihua.gov.cn/', 'http://www.suihua.gov.cn/zwgk/czzj/', 'http://www.suihua.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  // ═══ 浙江省 ═══
  { name: '绍兴市', urls: ['http://czj.sx.gov.cn/', 'http://czj.shaoxing.gov.cn/', 'http://www.sx.gov.cn/col/col1229451683/index.html', 'http://www.shaoxing.gov.cn/szfxxgk/'] },
  { name: '丽水市', urls: ['http://czj.lishui.gov.cn/', 'http://czj.ls.gov.cn/', 'http://www.lishui.gov.cn/szfxxgk/', 'http://www.lishui.gov.cn/col/col1229383250/index.html'] },
  // ═══ 安徽省 ═══
  { name: '安庆市', urls: ['http://czj.anqing.gov.cn/', 'http://www.anqing.gov.cn/zwgk/czzj/', 'http://www.anqing.gov.cn/site/label/8888/'] },
  { name: '宿州市', urls: ['http://czj.suzhou.ah.gov.cn/', 'http://czj.sz.gov.cn/', 'http://www.ahsz.gov.cn/zwgk/czzj/', 'http://www.ahsz.gov.cn/site/label/8888/'] },
  // ═══ 江西省 ═══
  { name: '九江市', urls: ['http://czj.jiujiang.gov.cn/', 'http://www.jiujiang.gov.cn/zwgk/czzj/', 'http://www.jiujiang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '宜春市', urls: ['http://czj.yichun.gov.cn/', 'http://www.yichun.gov.cn/zwgk/czzj/', 'http://www.yichun.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '抚州市', urls: ['http://czj.fuzhou.jiangxi.gov.cn/', 'http://czj.jxfz.gov.cn/', 'http://www.jxfz.gov.cn/zwgk/czzj/', 'http://www.jxfz.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '上饶市', urls: ['http://czj.shangrao.gov.cn/', 'http://www.shangrao.gov.cn/zwgk/czzj/', 'http://www.shangrao.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  // ═══ 山东省 ═══
  { name: '枣庄市', urls: ['http://czj.zaozhuang.gov.cn/', 'https://czj.zaozhuang.gov.cn/', 'http://www.zaozhuang.gov.cn/zwgk/czzj/'] },
  { name: '东营市', urls: ['http://czj.dongying.gov.cn/', 'https://czj.dongying.gov.cn/', 'http://www.dongying.gov.cn/zwgk/czzj/'] },
  { name: '菏泽市', urls: ['http://czj.heze.gov.cn/', 'https://czj.heze.gov.cn/', 'http://www.heze.gov.cn/zwgk/czzj/'] },
  // ═══ 河南省 ═══
  { name: '郑州市', urls: ['http://czj.zhengzhou.gov.cn/', 'https://czj.zhengzhou.gov.cn/', 'http://www.zhengzhou.gov.cn/zwgk/czzj/', 'http://www.zhengzhou.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '安阳市', urls: ['http://czj.anyang.gov.cn/', 'https://czj.anyang.gov.cn/', 'http://www.anyang.gov.cn/zwgk/czzj/', 'http://www.anyang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '濮阳市', urls: ['http://czj.puyang.gov.cn/', 'https://czj.puyang.gov.cn/', 'http://www.puyang.gov.cn/zwgk/czzj/', 'http://www.puyang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '南阳市', urls: ['http://czj.nanyang.gov.cn/', 'https://czj.nanyang.gov.cn/', 'http://www.nanyang.gov.cn/zwgk/czzj/', 'http://www.nanyang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  // ═══ 湖北省 ═══
  { name: '宜昌市', urls: ['http://czj.yichang.gov.cn/', 'https://czj.yichang.gov.cn/', 'http://www.yichang.gov.cn/zwgk/czzj/', 'http://www.yichang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '黄冈市', urls: ['http://czj.huanggang.gov.cn/', 'https://czj.huanggang.gov.cn/', 'http://www.huanggang.gov.cn/zwgk/czzj/', 'http://www.huanggang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '随州市', urls: ['http://czj.suizhou.gov.cn/', 'https://czj.suizhou.gov.cn/', 'http://www.suizhou.gov.cn/zwgk/czzj/', 'http://www.suizhou.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '仙桃市', urls: ['http://czj.xiantao.gov.cn/', 'http://www.xiantao.gov.cn/zwgk/czzj/', 'http://www.xiantao.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '潜江市', urls: ['http://czj.qianjiang.gov.cn/', 'http://www.qianjiang.gov.cn/zwgk/czzj/', 'http://www.hbqj.gov.cn/zwgk/czzj/'] },
  { name: '天门市', urls: ['http://czj.tianmen.gov.cn/', 'http://www.tianmen.gov.cn/zwgk/czzj/', 'http://www.tianmen.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  // ═══ 湖南省 ═══
  { name: '衡阳市', urls: ['http://czj.hengyang.gov.cn/', 'https://czj.hengyang.gov.cn/', 'http://www.hengyang.gov.cn/zwgk/czzj/', 'http://www.hengyang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '益阳市', urls: ['http://czj.yiyang.gov.cn/', 'http://www.yiyang.gov.cn/zwgk/czzj/', 'http://www.yiyang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '郴州市', urls: ['http://czj.chenzhou.gov.cn/', 'http://www.czs.gov.cn/zwgk/czzj/', 'http://www.czs.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '永州市', urls: ['http://czj.yongzhou.gov.cn/', 'http://www.yzcity.gov.cn/zwgk/czzj/', 'http://www.yzcity.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '怀化市', urls: ['http://czj.huaihua.gov.cn/', 'http://www.huaihua.gov.cn/zwgk/czzj/', 'http://www.huaihua.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '娄底市', urls: ['http://czj.loudi.gov.cn/', 'http://www.loudi.gov.cn/zwgk/czzj/', 'http://www.loudi.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '湘西自治州', urls: ['http://czj.xxz.gov.cn/', 'http://www.xxz.gov.cn/zwgk/czzj/', 'http://www.xxz.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  // ═══ 广西壮族自治区 ═══
  { name: '南宁市', urls: ['http://czj.nanning.gov.cn/', 'https://czj.nanning.gov.cn/', 'http://www.nanning.gov.cn/zwgk/czzj/', 'http://www.nanning.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '柳州市', urls: ['http://czj.liuzhou.gov.cn/', 'https://czj.liuzhou.gov.cn/', 'http://www.liuzhou.gov.cn/zwgk/czzj/'] },
  { name: '北海市', urls: ['http://czj.beihai.gov.cn/', 'http://www.beihai.gov.cn/zwgk/czzj/', 'http://www.beihai.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '防城港市', urls: ['http://czj.fcgs.gov.cn/', 'http://www.fcgs.gov.cn/zwgk/czzj/', 'http://www.fcgs.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '贵港市', urls: ['http://czj.guigang.gov.cn/', 'http://www.gxgg.gov.cn/zwgk/czzj/', 'http://www.gxgg.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '贺州市', urls: ['http://czj.hezhou.gov.cn/', 'http://www.gxhz.gov.cn/zwgk/czzj/', 'http://www.gxhz.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '河池市', urls: ['http://czj.hechi.gov.cn/', 'http://www.hechi.gov.cn/zwgk/czzj/', 'http://www.hechi.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '来宾市', urls: ['http://czj.laibin.gov.cn/', 'http://www.laibin.gov.cn/zwgk/czzj/', 'http://www.laibin.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '崇左市', urls: ['http://czj.chongzuo.gov.cn/', 'http://www.chongzuo.gov.cn/zwgk/czzj/', 'http://www.chongzuo.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  // ═══ 海南省 ═══
  { name: '海口市', urls: ['http://czj.haikou.gov.cn/', 'https://czj.haikou.gov.cn/', 'http://www.haikou.gov.cn/zwgk/czzj/'] },
  { name: '三亚市', urls: ['http://czj.sanya.gov.cn/', 'http://www.sanya.gov.cn/zwgk/czzj/', 'http://www.sanya.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '三沙市', urls: ['http://www.sansha.gov.cn/zwgk/czzj/'] },
  { name: '儋州市', urls: ['http://czj.danzhou.gov.cn/', 'http://www.danzhou.gov.cn/zwgk/czzj/'] },
  { name: '五指山市', urls: ['http://www.wzs.gov.cn/zwgk/czzj/', 'http://www.wzs.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '文昌市', urls: ['http://www.wenchang.gov.cn/zwgk/czzj/', 'http://www.wenchang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '琼海市', urls: ['http://www.qionghai.gov.cn/zwgk/czzj/', 'http://www.qionghai.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '万宁市', urls: ['http://www.wanning.gov.cn/zwgk/czzj/', 'http://www.wanning.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '东方市', urls: ['http://www.dongfang.gov.cn/zwgk/czzj/', 'http://www.dongfang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  // ═══ 贵州省 ═══
  { name: '安顺市', urls: ['http://czj.anshun.gov.cn/', 'http://www.anshun.gov.cn/zwgk/czzj/', 'http://www.anshun.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '毕节市', urls: ['http://czj.bijie.gov.cn/', 'http://www.bijie.gov.cn/zwgk/czzj/', 'http://www.bijie.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '铜仁市', urls: ['http://czj.tongren.gov.cn/', 'http://www.tongren.gov.cn/zwgk/czzj/', 'http://www.tongren.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '黔西南州', urls: ['http://czj.qxn.gov.cn/', 'http://www.qxn.gov.cn/zwgk/czzj/', 'http://www.qxn.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '黔南州', urls: ['http://czj.qiannan.gov.cn/', 'http://www.qiannan.gov.cn/zwgk/czzj/', 'http://www.qiannan.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  // ═══ 云南省 ═══
  { name: '玉溪市', urls: ['http://czj.yuxi.gov.cn/', 'http://www.yuxi.gov.cn/zwgk/czzj/', 'http://www.yuxi.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '保山市', urls: ['http://czj.baoshan.gov.cn/', 'http://www.baoshan.gov.cn/zwgk/czzj/', 'http://www.baoshan.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '昭通市', urls: ['http://czj.zt.gov.cn/', 'http://www.zt.gov.cn/zwgk/czzj/', 'http://www.zhaotong.gov.cn/zwgk/czzj/'] },
  { name: '丽江市', urls: ['http://czj.lijiang.gov.cn/', 'http://www.lijiang.gov.cn/zwgk/czzj/', 'http://www.lijiang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '普洱市', urls: ['http://czj.puer.gov.cn/', 'http://www.puer.gov.cn/zwgk/czzj/', 'http://www.puer.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '临沧市', urls: ['http://czj.lincang.gov.cn/', 'http://www.lincang.gov.cn/zwgk/czzj/', 'http://www.lincang.gov.cn/szfxxgk/fdzdgknr/czxx/'] },
  { name: '楚雄州', urls: ['http://czj.chuxiong.gov.cn/', 'http://www.chuxiong.gov.cn/zwgk/czzj/'] },
  { name: '红河州', urls: ['http://czj.hh.gov.cn/', 'http://www.hh.gov.cn/zwgk/czzj/', 'http://www.honghe.gov.cn/zwgk/czzj/'] },
  { name: '西双版纳州', urls: ['http://czj.xsbn.gov.cn/', 'http://www.xsbn.gov.cn/zwgk/czzj/'] },
  { name: '大理州', urls: ['http://czj.dali.gov.cn/', 'http://www.dali.gov.cn/zwgk/czzj/'] },
  { name: '德宏州', urls: ['http://czj.dehong.gov.cn/', 'http://www.dehong.gov.cn/zwgk/czzj/'] },
  { name: '怒江州', urls: ['http://czj.nujiang.gov.cn/', 'http://www.nujiang.gov.cn/zwgk/czzj/'] },
  { name: '迪庆州', urls: ['http://czj.diqing.gov.cn/', 'http://www.diqing.gov.cn/zwgk/czzj/'] },
  // ═══ 西藏自治区 ═══
  { name: '林芝市', urls: ['http://czj.linzhi.gov.cn/', 'http://www.linzhi.gov.cn/zwgk/czzj/'] },
  { name: '那曲市', urls: ['http://czj.naqu.gov.cn/', 'http://www.naqu.gov.cn/zwgk/czzj/'] },
  // ═══ 甘肃省 ═══
  { name: '金昌市', urls: ['http://czj.jc.gov.cn/', 'http://czj.jinchang.gov.cn/', 'http://www.jinchang.gov.cn/zwgk/czzj/'] },
  { name: '白银市', urls: ['http://czj.baiyin.gov.cn/', 'http://www.baiyin.gov.cn/zwgk/czzj/'] },
  { name: '天水市', urls: ['http://czj.tianshui.gov.cn/', 'http://www.tianshui.gov.cn/zwgk/czzj/'] },
  { name: '武威市', urls: ['http://czj.wuwei.gov.cn/', 'http://www.wuwei.gov.cn/zwgk/czzj/'] },
  { name: '张掖市', urls: ['http://czj.zhangye.gov.cn/', 'http://www.zhangye.gov.cn/zwgk/czzj/'] },
  { name: '庆阳市', urls: ['http://czj.qingyang.gov.cn/', 'http://www.qingyang.gov.cn/zwgk/czzj/'] },
  { name: '陇南市', urls: ['http://czj.longnan.gov.cn/', 'http://www.longnan.gov.cn/zwgk/czzj/'] },
  { name: '临夏州', urls: ['http://czj.linxia.gov.cn/', 'http://www.linxia.gov.cn/zwgk/czzj/'] },
  { name: '甘南州', urls: ['http://czj.gannan.gov.cn/', 'http://www.gnzrmzf.gov.cn/zwgk/czzj/'] },
  // ═══ 青海省 ═══
  { name: '海东市', urls: ['http://czj.haidong.gov.cn/', 'http://www.haidong.gov.cn/zwgk/czzj/'] },
  { name: '海北州', urls: ['http://czj.haibei.gov.cn/', 'http://www.haibei.gov.cn/zwgk/czzj/'] },
  { name: '黄南州', urls: ['http://czj.huangnan.gov.cn/', 'http://www.huangnan.gov.cn/zwgk/czzj/'] },
  { name: '海南州', urls: ['http://czj.hainan.qh.gov.cn/', 'http://www.hainanzhou.gov.cn/zwgk/czzj/'] },
  { name: '果洛州', urls: ['http://czj.guoluo.gov.cn/', 'http://www.guoluo.gov.cn/zwgk/czzj/'] },
  { name: '玉树州', urls: ['http://czj.yushu.gov.cn/', 'http://www.yushuzhou.gov.cn/zwgk/czzj/'] },
  // ═══ 宁夏回族自治区 ═══
  { name: '石嘴山市', urls: ['http://czj.shizuishan.gov.cn/', 'https://czj.shizuishan.gov.cn/', 'http://www.shizuishan.gov.cn/zwgk/czzj/'] },
  { name: '吴忠市', urls: ['http://czj.wuzhong.gov.cn/', 'http://www.wuzhong.gov.cn/zwgk/czzj/', 'http://www.nxwz.gov.cn/zwgk/czzj/'] },
  { name: '固原市', urls: ['http://czj.guyuan.gov.cn/', 'http://www.nxgy.gov.cn/zwgk/czzj/'] },
  { name: '中卫市', urls: ['http://czj.zhongwei.gov.cn/', 'http://www.nxzw.gov.cn/zwgk/czzj/', 'http://www.zhongwei.gov.cn/zwgk/czzj/'] },
];

async function main() {
  console.log(`Checking ${cities.length} cities...`);
  const found = [];
  const notFound = [];

  for (let i = 0; i < cities.length; i += 5) {
    const batch = cities.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(async (city) => {
      for (const url of city.urls) {
        const r = await checkUrl(url);
        if (r.status === 200 && r.size > 500) {
          return { name: city.name, url, status: 'OK', size: r.size };
        }
        if (r.status >= 300 && r.status < 400 && r.redirect) {
          // Follow redirect once
          const r2 = await checkUrl(r.redirect.startsWith('http') ? r.redirect : new URL(r.redirect, url).href);
          if (r2.status === 200 && r2.size > 500) {
            return { name: city.name, url: r2.url, status: 'OK-REDIRECT', size: r2.size };
          }
        }
      }
      return { name: city.name, url: '', status: 'NOT-FOUND' };
    }));

    for (const r of batchResults) {
      if (r.status !== 'NOT-FOUND') {
        found.push(r);
        console.log(`✓ ${r.name}: ${r.url} (${r.size} bytes)`);
      } else {
        notFound.push(r);
        console.log(`✗ ${r.name}: not found`);
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Found: ${found.length}`);
  console.log(`Not found: ${notFound.length}`);
  console.log(`\n--- Found URLs ---`);
  for (const f of found) {
    console.log(`${f.name}: ${f.url}`);
  }
  console.log(`\n--- Not found ---`);
  for (const n of notFound) {
    console.log(n.name);
  }
}

main().catch(console.error);
