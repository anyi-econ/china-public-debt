import http from 'http';
import https from 'https';

// Phase 1: Probe fiscal sub-paths on found domains
const foundDomains = [
  { name: '新华区', domain: 'xinhuaqu.gov.cn' },
  { name: '裕华区', domain: 'yuhuaqu.gov.cn' },
  { name: '鹿泉区', domain: 'sjzlq.gov.cn' },
  { name: '井陉县', domain: 'sjzjx.gov.cn' },
  { name: '深泽县', domain: 'shenze.gov.cn' },
  { name: '赞皇县', domain: 'zanhuang.gov.cn' },
  { name: '开平区', domain: 'tskaiping.gov.cn' },
  { name: '魏县', domain: 'weixian.gov.cn' },
  { name: '固安县', domain: 'guanxian.gov.cn' },
];

const fiscalPaths = [
  '/xxgk/czyjs.jsp', '/xxgk/czyjs.thtml', '/info/czyjs.jsp',
  '/ztzl/czyjs/', '/czyjs/', '/caiwuyujuesuan.html', '/yujuesuan.html',
  '/__sys_block__/czyjs.html', '/czyjsgk/', '/czj/', '/col/czyjs/',
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let body = '';
      res.on('data', c => { if (body.length < 50000) body += c; });
      res.on('end', () => resolve({ url, status: res.statusCode, location: res.headers.location, body }));
    });
    req.on('error', () => resolve({ url, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ url, ok: false }); });
  });
}

async function main() {
  console.log('=== Probing fiscal paths on found domains ===');
  for (const { name, domain } of foundDomains) {
    const results = [];
    for (const path of fiscalPaths) {
      const url = `http://www.${domain}${path}`;
      const r = await checkUrl(url);
      if (r.status && r.status < 400) {
        const hasFiscal = r.body && (r.body.includes('预算') || r.body.includes('决算') || r.body.includes('财政'));
        results.push({ path, status: r.status, hasFiscal });
      }
    }
    if (results.length > 0) {
      const fiscal = results.filter(r => r.hasFiscal);
      if (fiscal.length > 0) {
        console.log(`✓ ${name} (${domain}): ${fiscal.map(r => r.path).join(', ')}`);
      } else {
        console.log(`? ${name} (${domain}): pages found but no fiscal keywords: ${results.map(r => r.path).join(', ')}`);
      }
    } else {
      console.log(`✗ ${name} (${domain}): no fiscal paths found`);
    }
  }

  // Phase 2: Try more domain patterns for failed counties
  console.log('\n=== Trying more domain patterns ===');
  const extraGuesses = [
    { city: '石家庄', name: '长安区', domains: ['changanqu.gov.cn', 'sjzca.gov.cn', 'sjzchangan.gov.cn'] },
    { city: '石家庄', name: '井陉矿区', domains: ['jingxingkuangqu.gov.cn', 'jxkuangqu.gov.cn'] },
    { city: '石家庄', name: '藁城区', domains: ['gaochengqu.gov.cn', 'sjzgc.gov.cn'] },
    { city: '石家庄', name: '正定县', domains: ['zhengdingxian.gov.cn', 'sjzzd.gov.cn'] },
    { city: '石家庄', name: '高邑县', domains: ['sjzgy.gov.cn', 'gaoyixian.gov.cn'] },
    { city: '石家庄', name: '平山县', domains: ['sjzps.gov.cn', 'pingshanxian.gov.cn'] },
    { city: '唐山', name: '路南区', domains: ['tsln.gov.cn', 'tslunanqu.gov.cn'] },
    { city: '唐山', name: '丰南区', domains: ['fengnanqu.gov.cn', 'tsfn.gov.cn', 'tsfengnanqu.gov.cn'] },
    { city: '秦皇岛', name: '海港区', domains: ['haigangqu.gov.cn', 'qhdhaigangqu.gov.cn'] },
    { city: '秦皇岛', name: '抚宁区', domains: ['funingqu.gov.cn', 'qhdfuningqu.gov.cn'] },
    { city: '秦皇岛', name: '青龙满族自治县', domains: ['hbql.gov.cn', 'qhdql.gov.cn', 'chinaqinglong.gov.cn'] },
    { city: '秦皇岛', name: '昌黎县', domains: ['changlixian.gov.cn', 'qhdcl.gov.cn'] },
    { city: '邯郸', name: '丛台区', domains: ['congtaiqu.gov.cn', 'hdct.gov.cn'] },
    { city: '邯郸', name: '峰峰矿区', domains: ['fengfengkq.gov.cn', 'hdff.gov.cn'] },
    { city: '邯郸', name: '肥乡区', domains: ['hdfx.gov.cn', 'feixiangqu.gov.cn'] },
    { city: '邯郸', name: '永年区', domains: ['hdyn.gov.cn', 'yongnianqu.gov.cn'] },
    { city: '邯郸', name: '广平县', domains: ['hdgp.gov.cn', 'guangpingxian.gov.cn'] },
    { city: '邯郸', name: '曲周县', domains: ['hdqz.gov.cn', 'quzhouxian.gov.cn'] },
    { city: '廊坊', name: '大厂回族自治县', domains: ['dachanghz.gov.cn', 'lfdachang.gov.cn', 'dachangxian.gov.cn'] },
    { city: '衡水', name: '阜城县', domains: ['hsfucheng.gov.cn', 'fuchengxian.gov.cn'] },
  ];

  for (const county of extraGuesses) {
    const results = await Promise.all(county.domains.map(d => checkUrl(`http://www.${d}`)));
    const working = results.filter(r => r.status && (r.status < 400 || r.status === 301 || r.status === 302));
    if (working.length > 0) {
      const best = working[0];
      const loc = best.location ? ` -> ${best.location}` : '';
      console.log(`✓ ${county.city} ${county.name}: ${best.url} (${best.status}${loc})`);
    } else {
      console.log(`✗ ${county.city} ${county.name}: still not found`);
    }
  }
}

main();
