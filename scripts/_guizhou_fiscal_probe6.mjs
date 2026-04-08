import https from 'https';
import http from 'http';
import fs from 'fs';

const paths = [
  '/zwgk/zdlygk/czyjs/',
  '/zwgk/zdlygk/czzj/',
  '/zwgk/zdlygk/czzj/czyjs/',
  '/zwgk/czzj/',
  '/zwgk/zfxxgk/fdzdgk/ysjs/',
  '/zwgk/zfxxgk/fdzdgknr/czyjs/',
  '/zwgk/zfxxgk/fdzdgknr/czzj/',
  '/zwgk/fdzdgknr/czzj/',
  '/zwgk/fdzdgknr/czyjs/',
  '/zwgk/xxgkml/jczwgk/czyjs/',
  '/zwgk/xxgkml/czyjs/',
  '/zwgk/xxgkml/czzj/',
  '/zwgk/zdlyxx/czyjs/',
  '/zwgk/zdlyxxgk/czysj/',
];

// Remaining counties: 黔东南 + 黔南 (not yet probed)
const counties = [
  { n:'凯里市', c:'黔东南', d:'www.qdnkaili.gov.cn' },
  { n:'黄平县', c:'黔东南', d:'www.qdnhp.gov.cn' },
  { n:'施秉县', c:'黔东南', d:'www.gzsb.gov.cn' },
  { n:'三穗县', c:'黔东南', d:'www.gzsansui.gov.cn' },
  { n:'镇远县', c:'黔东南', d:'www.qdnzhenyuan.gov.cn' },
  { n:'岑巩县', c:'黔东南', d:'www.qdncengong.gov.cn' },
  { n:'天柱县', c:'黔东南', d:'www.gz-tj.gov.cn' },
  { n:'锦屏县', c:'黔东南', d:'www.qdnjp.gov.cn' },
  { n:'剑河县', c:'黔东南', d:'www.qdnjianhe.gov.cn' },
  { n:'台江县', c:'黔东南', d:'www.gztaijiang.gov.cn' },
  { n:'黎平县', c:'黔东南', d:'www.qdnlp.gov.cn' },
  { n:'榕江县', c:'黔东南', d:'www.rongjiang.gov.cn' },
  { n:'从江县', c:'黔东南', d:'www.qdncongjiang.gov.cn' },
  { n:'雷山县', c:'黔东南', d:'www.gzleishan.gov.cn' },
  { n:'麻江县', c:'黔东南', d:'www.gzmajiang.gov.cn' },
  { n:'都匀市', c:'黔南', d:'www.douyun.gov.cn' },
  { n:'福泉市', c:'黔南', d:'www.fuquan.gov.cn' },
  { n:'荔波县', c:'黔南', d:'www.libo.gov.cn' },
  { n:'贵定县', c:'黔南', d:'www.guiding.gov.cn' },
  { n:'瓮安县', c:'黔南', d:'www.wengan.gov.cn' },
  { n:'独山县', c:'黔南', d:'www.dushan.gov.cn' },
  { n:'平塘县', c:'黔南', d:'www.pingtang.gov.cn' },
  { n:'罗甸县', c:'黔南', d:'www.luodian.gov.cn' },
  { n:'长顺县', c:'黔南', d:'www.changshun.gov.cn' },
  { n:'龙里县', c:'黔南', d:'www.longli.gov.cn' },
  { n:'惠水县', c:'黔南', d:'www.huishui.gov.cn' },
  { n:'三都县', c:'黔南', d:'www.sdshui.gov.cn' },
];

process.on('uncaughtException', (e) => { /* ignore */ });
process.on('unhandledRejection', (e) => { /* ignore */ });

function check(url) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(-2), 4000);
    try {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, { 
        timeout: 3500, 
        headers: { 'User-Agent': 'Mozilla/5.0' }, 
        rejectUnauthorized: false 
      }, res => {
        res.resume();
        res.on('end', () => { clearTimeout(timer); resolve(res.statusCode); });
        res.on('error', () => { clearTimeout(timer); resolve(-1); });
      });
      req.on('error', () => { clearTimeout(timer); resolve(-1); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); resolve(-2); });
    } catch(e) { clearTimeout(timer); resolve(-3); }
  });
}

async function main() {
  const lines = [];
  let found = 0;
  
  for (let ci = 0; ci < counties.length; ci++) {
    const county = counties[ci];
    const hits = [];
    
    try {
      // Test 7 paths at a time
      for (let b = 0; b < paths.length; b += 7) {
        const batch = paths.slice(b, b + 7);
        const results = await Promise.all(
          batch.map(p => check(`https://${county.d}${p}`))
        );
        for (let i = 0; i < batch.length; i++) {
          if (results[i] === 200) hits.push(`https://${county.d}${batch[i]}`);
        }
      }
      
      if (hits.length === 0) {
        // Try HTTP for first 7 paths
        const results = await Promise.all(
          paths.slice(0, 7).map(p => check(`http://${county.d}${p}`))
        );
        for (let i = 0; i < 7; i++) {
          if (results[i] === 200) hits.push(`http://${county.d}${paths[i]}`);
        }
      }
    } catch(e) {}
    
    if (hits.length > 0) {
      lines.push(`OK | ${county.c} | ${county.n} | ${hits.join(' ; ')}`);
      found++;
    } else {
      lines.push(`-- | ${county.c} | ${county.n} | NO MATCH`);
    }
    
    process.stderr.write(`[${ci+1}/${counties.length}] ${hits.length > 0 ? 'OK' : '--'} ${county.n}\n`);
    
    // Save partial results every 5
    if ((ci + 1) % 5 === 0 || ci === counties.length - 1) {
      fs.writeFileSync('scripts/_guizhou_probe6_results.txt', 
        lines.join('\n') + `\n\nFound: ${found} / ${ci+1}`, 'utf-8');
    }
  }
  
  console.log(`Done. Found: ${found} / ${counties.length}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
