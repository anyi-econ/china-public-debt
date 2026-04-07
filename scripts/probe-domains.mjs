import http from 'http';
import https from 'https';

// Remaining counties with guessed domains
const counties = [
  // 石家庄市
  { city: '石家庄', name: '长安区', domains: ['sjzchangan.gov.cn', 'changanjie.gov.cn'] },
  { city: '石家庄', name: '新华区', domains: ['sjzxinhua.gov.cn', 'xinhuaqu.gov.cn'] },
  { city: '石家庄', name: '井陉矿区', domains: ['jxkq.gov.cn', 'sjzjxkq.gov.cn'] },
  { city: '石家庄', name: '裕华区', domains: ['sjzyuhua.gov.cn', 'yuhuaqu.gov.cn'] },
  { city: '石家庄', name: '藁城区', domains: ['gaocheng.gov.cn', 'sjzgaocheng.gov.cn', 'gcq.gov.cn'] },
  { city: '石家庄', name: '鹿泉区', domains: ['luquan.gov.cn', 'sjzlq.gov.cn', 'luquanqu.gov.cn'] },
  { city: '石家庄', name: '井陉县', domains: ['jingxing.gov.cn', 'sjzjx.gov.cn', 'jingxingxian.gov.cn'] },
  { city: '石家庄', name: '正定县', domains: ['zhengding.gov.cn', 'sjzzd.gov.cn'] },
  { city: '石家庄', name: '高邑县', domains: ['gaoyi.gov.cn', 'gaoyixian.gov.cn'] },
  { city: '石家庄', name: '深泽县', domains: ['shenze.gov.cn', 'shenzexian.gov.cn'] },
  { city: '石家庄', name: '赞皇县', domains: ['zanhuang.gov.cn', 'zanhuangxian.gov.cn'] },
  { city: '石家庄', name: '平山县', domains: ['hbpingshan.gov.cn', 'sjzpingshan.gov.cn', 'pingshanxian.gov.cn'] },
  // 唐山市
  { city: '唐山', name: '路南区', domains: ['tslunan.gov.cn', 'lunanqu.gov.cn'] },
  { city: '唐山', name: '开平区', domains: ['tskaiping.gov.cn', 'kaipingqu.gov.cn'] },
  { city: '唐山', name: '丰南区', domains: ['fengnan.gov.cn', 'tsfengnan.gov.cn'] },
  // 秦皇岛市
  { city: '秦皇岛', name: '海港区', domains: ['haigang.gov.cn', 'haigangqu.gov.cn', 'qhdhaigang.gov.cn'] },
  { city: '秦皇岛', name: '抚宁区', domains: ['qhdfuning.gov.cn', 'funingqu.gov.cn'] },
  { city: '秦皇岛', name: '青龙满族自治县', domains: ['qinglong.gov.cn', 'hbqinglong.gov.cn', 'qinglongxian.gov.cn'] },
  { city: '秦皇岛', name: '昌黎县', domains: ['changli.gov.cn', 'changlixian.gov.cn'] },
  // 邯郸市
  { city: '邯郸', name: '丛台区', domains: ['congtai.gov.cn', 'congtaiqu.gov.cn', 'hdcongtai.gov.cn'] },
  { city: '邯郸', name: '峰峰矿区', domains: ['fengfeng.gov.cn', 'fengfengkuangqu.gov.cn', 'hdfengfeng.gov.cn'] },
  { city: '邯郸', name: '肥乡区', domains: ['feixiang.gov.cn', 'feixiangqu.gov.cn', 'hdfeixiang.gov.cn'] },
  { city: '邯郸', name: '永年区', domains: ['yongnian.gov.cn', 'yongnianqu.gov.cn', 'hdyongnian.gov.cn'] },
  { city: '邯郸', name: '广平县', domains: ['guangping.gov.cn', 'guangpingxian.gov.cn', 'hdguangping.gov.cn'] },
  { city: '邯郸', name: '魏县', domains: ['weixian.gov.cn', 'hdweixian.gov.cn', 'weixianhd.gov.cn'] },
  { city: '邯郸', name: '曲周县', domains: ['quzhou.gov.cn', 'quzhouxian.gov.cn', 'hdquzhou.gov.cn'] },
  // 廊坊市
  { city: '廊坊', name: '固安县', domains: ['guan.gov.cn', 'guanxian.gov.cn', 'lfguan.gov.cn'] },
  { city: '廊坊', name: '大厂回族自治县', domains: ['dachang.gov.cn', 'dachanghz.gov.cn', 'lfdachang.gov.cn'] },
  // 衡水市
  { city: '衡水', name: '阜城县', domains: ['fucheng.gov.cn', 'fuchengxian.gov.cn', 'hsfucheng.gov.cn'] },
  // 保定市
  { city: '保定', name: '顺平县', domains: ['shunping.gov.cn'] },
];

function checkDomain(domain) {
  return new Promise((resolve) => {
    const url = `http://www.${domain}`;
    const req = http.get(url, { timeout: 5000 }, (res) => {
      const location = res.headers.location || '';
      resolve({ domain, status: res.statusCode, location, ok: true });
    });
    req.on('error', () => resolve({ domain, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ domain, ok: false, timeout: true }); });
  });
}

async function main() {
  for (const county of counties) {
    const results = await Promise.all(county.domains.map(d => checkDomain(d)));
    const working = results.filter(r => r.ok && (r.status < 400 || r.status === 301 || r.status === 302));
    if (working.length > 0) {
      const best = working[0];
      const loc = best.location ? ` -> ${best.location}` : '';
      console.log(`✓ ${county.city} ${county.name}: ${best.domain} (${best.status}${loc})`);
    } else {
      console.log(`✗ ${county.city} ${county.name}: none worked (${county.domains.join(', ')})`);
    }
  }
}

main();
