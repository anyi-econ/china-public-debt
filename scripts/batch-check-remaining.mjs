import http from 'http';
import https from 'https';

// ── helper ──
function fetch(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const opts = { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } };
    if (url.startsWith('https')) opts.rejectUnauthorized = false;
    try {
      const req = mod.get(url, opts, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          resolve({ ok: false, status: res.statusCode, redirect: res.headers.location });
          res.resume(); return;
        }
        if (res.statusCode >= 400) { resolve({ ok: false, status: res.statusCode }); res.resume(); return; }
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve({ ok: true, data, len: data.length }));
      });
      req.on('error', (e) => resolve({ ok: false, err: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, err: 'timeout' }); });
    } catch (e) { resolve({ ok: false, err: e.message }); }
  });
}

async function tryUrls(urls) {
  for (const url of urls) {
    const r = await fetch(url, 6000);
    if (r.ok && r.len > 500) return url;
    if (!r.ok && r.redirect) {
      const redir = r.redirect.startsWith('http') ? r.redirect : new URL(r.redirect, url).href;
      const r2 = await fetch(redir, 6000);
      if (r2.ok && r2.len > 500) return redir;
    }
  }
  return '';
}

// Generate candidate URLs for a city
function candidates(domains) {
  const urls = [];
  for (const d of domains) {
    urls.push(`http://czj.${d}.gov.cn/`);
    urls.push(`https://czj.${d}.gov.cn/`);
    urls.push(`http://czt.${d}.gov.cn/`);
    urls.push(`https://czt.${d}.gov.cn/`);
    urls.push(`http://cz.${d}.gov.cn/`);
    urls.push(`https://www.${d}.gov.cn/zwgk/czzj/`);
    urls.push(`http://www.${d}.gov.cn/zwgk/czzj/`);
  }
  return urls;
}

// ═══════ PROVINCE DATA ═══════
const PROVINCES = {
  河南省: {
    郑州市: ['zhengzhou','zz'],
    开封市: ['kaifeng','kf'],
    洛阳市: ['luoyang','ly'],
    平顶山市: ['pds','pingdingshan'],
    安阳市: ['anyang','ay'],
    鹤壁市: ['hebi','hb'],
    新乡市: ['xinxiang','xx'],
    焦作市: ['jiaozuo','jz'],
    濮阳市: ['puyang','py'],
    许昌市: ['xuchang','xc'],
    漯河市: ['luohe','lh'],
    三门峡市: ['smx','sanmenxia'],
    南阳市: ['nanyang','ny'],
    商丘市: ['shangqiu','sq'],
    信阳市: ['xinyang','xy'],
    周口市: ['zhoukou','zk'],
    驻马店市: ['zmd','zhumadian'],
    济源示范区: ['jiyuan','jy'],
  },
  湖北省: {
    黄石市: ['huangshi','hs'],
    十堰市: ['shiyan','sy'],
    宜昌市: ['yichang','yc'],
    襄阳市: ['xiangyang','xf'],
    鄂州市: ['ezhou','ez'],
    荆门市: ['jingmen','jm'],
    孝感市: ['xiaogan','xg'],
    荆州市: ['jingzhou','jz'],
    黄冈市: ['huanggang','hg'],
    咸宁市: ['xianning','xn'],
    随州市: ['suizhou','sz'],
    恩施土家族苗族自治州: ['enshi','es'],
    仙桃市: ['xiantao','xt'],
    潜江市: ['qianjiang','qj'],
    天门市: ['tianmen','tm'],
    神农架林区: ['snj','shennongjia'],
  },
  湖南省: {
    株洲市: ['zhuzhou','zz'],
    湘潭市: ['xiangtan','xt'],
    衡阳市: ['hengyang','hy'],
    邵阳市: ['shaoyang','sy'],
    岳阳市: ['yueyang','yy'],
    常德市: ['changde','cd'],
    张家界市: ['zjj','zhangjiajie'],
    益阳市: ['yiyang','yy'],
    郴州市: ['chenzhou','cz'],
    永州市: ['yongzhou','yz'],
    怀化市: ['huaihua','hh'],
    娄底市: ['loudi','ld'],
    湘西土家族苗族自治州: ['xiangxi','xx'],
  },
  广西壮族自治区: {
    南宁市: ['nanning','nn'],
    柳州市: ['liuzhou','lz'],
    桂林市: ['guilin','gl'],
    梧州市: ['wuzhou','wz'],
    北海市: ['beihai','bh'],
    防城港市: ['fcg','fangchenggang'],
    钦州市: ['qinzhou','qz'],
    贵港市: ['guigang','gg'],
    玉林市: ['yulin','yl'],
    百色市: ['baise','bose','bs'],
    贺州市: ['hezhou','hz'],
    河池市: ['hechi','hc'],
    来宾市: ['laibin','lb'],
    崇左市: ['chongzuo','cz'],
  },
  海南省: {
    海口市: ['haikou','hk'],
    三亚市: ['sanya','sy'],
    三沙市: ['sansha'],
    儋州市: ['danzhou','dz'],
    五指山市: ['wzs','wuzhishan'],
    文昌市: ['wenchang','wc'],
    琼海市: ['qionghai','qh'],
    万宁市: ['wanning','wn'],
    东方市: ['dongfang','df'],
    定安县: ['dingan','da'],
    屯昌县: ['tunchang','tc'],
    澄迈县: ['chengmai','cm'],
    临高县: ['lingao','lg'],
    白沙黎族自治县: ['baisha','bs'],
    昌江黎族自治县: ['changjiang','cj'],
    乐东黎族自治县: ['ledong','ld'],
    陵水黎族自治县: ['lingshui','ls'],
    保亭黎族苗族自治县: ['baoting','bt'],
    琼中黎族苗族自治县: ['qiongzhong','qz'],
  },
  贵州省: {
    贵阳市: ['guiyang','gy'],
    六盘水市: ['lps','liupanshui'],
    遵义市: ['zunyi','zy'],
    安顺市: ['anshun','as'],
    毕节市: ['bijie','bj'],
    铜仁市: ['tongren','tr'],
    黔西南布依族苗族自治州: ['qxn','qianxinan'],
    黔东南苗族侗族自治州: ['qdn','qiandongnan'],
    黔南布依族苗族自治州: ['qn','qiannan'],
  },
  云南省: {
    昆明市: ['kunming','km'],
    曲靖市: ['qujing','qj'],
    玉溪市: ['yuxi','yx'],
    保山市: ['baoshan','bs'],
    昭通市: ['zhaotong','zt'],
    丽江市: ['lijiang','lj'],
    普洱市: ['puer','pe'],
    临沧市: ['lincang','lc'],
    楚雄彝族自治州: ['chuxiong','cx'],
    红河哈尼族彝族自治州: ['honghe','hh'],
    文山壮族苗族自治州: ['wenshan','ws'],
    西双版纳傣族自治州: ['xsbn','banna'],
    大理白族自治州: ['dali','dl'],
    德宏傣族景颇族自治州: ['dehong','dh'],
    怒江傈僳族自治州: ['nujiang','nj'],
    迪庆藏族自治州: ['diqing','dq'],
  },
  西藏自治区: {
    拉萨市: ['lasa','ls'],
    日喀则市: ['rikaze','rkz'],
    昌都市: ['changdu','cd'],
    林芝市: ['linzhi','lz'],
    山南市: ['shannan','sn'],
    那曲市: ['naqu','nq'],
    阿里地区: ['ali','al'],
  },
  甘肃省: {
    兰州市: ['lanzhou','lz'],
    嘉峪关市: ['jyg','jiayuguan'],
    金昌市: ['jinchang','jc'],
    白银市: ['baiyin','by'],
    天水市: ['tianshui','ts'],
    武威市: ['wuwei','ww'],
    张掖市: ['zhangye','zy'],
    平凉市: ['pingliang','pl'],
    酒泉市: ['jiuquan','jq'],
    庆阳市: ['qingyang','qy'],
    定西市: ['dingxi','dx'],
    陇南市: ['longnan','ln'],
    临夏回族自治州: ['linxia','lx'],
    甘南藏族自治州: ['gannan','gn'],
  },
  青海省: {
    西宁市: ['xining','xn'],
    海东市: ['haidong','hd'],
    海北藏族自治州: ['haibei','hb'],
    黄南藏族自治州: ['huangnan','hn'],
    海南藏族自治州: ['hainan'],
    果洛藏族自治州: ['guoluo','gl'],
    玉树藏族自治州: ['yushu','ys'],
    海西蒙古族藏族自治州: ['haixi','hx'],
  },
  宁夏回族自治区: {
    银川市: ['yinchuan','yc'],
    石嘴山市: ['szs','shizuishan'],
    吴忠市: ['wuzhong','wz'],
    固原市: ['guyuan','gy'],
    中卫市: ['zhongwei','zw'],
  },
};

async function main() {
  const results = {};
  let total = 0, found = 0;
  
  for (const [prov, cities] of Object.entries(PROVINCES)) {
    console.log(`\n=== ${prov} ===`);
    results[prov] = {};
    for (const [city, domains] of Object.entries(cities)) {
      total++;
      const urls = candidates(domains);
      const url = await tryUrls(urls);
      if (url) {
        found++;
        results[prov][city] = url;
        console.log(`  ✓ ${city} → ${url}`);
      } else {
        console.log(`  ✗ ${city}`);
      }
    }
  }
  
  console.log(`\n════════════════════════════════`);
  console.log(`Total: ${found}/${total} found`);
  console.log(`\n// Results for apply script:`);
  console.log(JSON.stringify(results, null, 2));
}

main();
