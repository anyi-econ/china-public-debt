// Find 松原市 county links and fiscal URLs
import http from 'http';
import https from 'https';

const counties = [
  { name: '宁江区', domains: ['www.synjq.gov.cn', 'www.ningjiang.gov.cn', 'njq.jlsy.gov.cn'] },
  { name: '前郭尔罗斯蒙古族自治县', domains: ['www.qgos.gov.cn', 'www.qianguo.gov.cn', 'qg.jlsy.gov.cn', 'www.qgelsmzzzx.gov.cn'] },
  { name: '长岭县', domains: ['www.changling.gov.cn', 'www.jlcl.gov.cn', 'cl.jlsy.gov.cn'] },
  { name: '乾安县', domains: ['www.qianan.gov.cn', 'www.jlqa.gov.cn', 'qa.jlsy.gov.cn'] },
  { name: '扶余市', domains: ['www.jlfy.gov.cn', 'www.fuyu.gov.cn', 'fy.jlsy.gov.cn'] },
];

const fiscalPaths = [
  '/zwgk/zdlygk/czysjs/zfczyjs/',
  '/zwgk/zdlygk/czysjs/',
  '/zwgk/czyjsgk/',
  '/zfxxgk/fdzdgknr/czyjs/',
  '/zwgk/zdlyxxgk/czzj/',
  '/zwgk/czzj/',
  '/xxgk/fdzdgknr/czyjs/',
  '/zwgk/zfxxgkzdgz/czzj/',
];

function headCheck(url, timeout = 8000) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.request(url, { method: 'HEAD', timeout }, (res) => {
      resolve({ url, status: res.statusCode, location: res.headers.location });
    });
    req.on('error', () => resolve({ url, status: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0 }); });
    req.end();
  });
}

async function findCounty(county) {
  console.log(`\n=== ${county.name} ===`);
  
  // First find a working domain
  let workingDomain = null;
  for (const domain of county.domains) {
    for (const proto of ['https', 'http']) {
      const url = `${proto}://${domain}/`;
      const result = await headCheck(url, 6000);
      if (result.status >= 200 && result.status < 400) {
        console.log(`  ✓ ${url} → ${result.status}`);
        workingDomain = `${proto}://${domain}`;
        break;
      } else if (result.status >= 300 && result.status < 400 && result.location) {
        console.log(`  → ${url} → ${result.status} → ${result.location}`);
        workingDomain = `${proto}://${domain}`;
        break;
      }
    }
    if (workingDomain) break;
  }
  
  if (!workingDomain) {
    console.log(`  ✗ No working domain found`);
    return null;
  }
  
  // Try fiscal paths
  for (const path of fiscalPaths) {
    const url = `${workingDomain}${path}`;
    const result = await headCheck(url, 6000);
    if (result.status >= 200 && result.status < 400) {
      console.log(`  FISCAL: ${url} → ${result.status}`);
      return url;
    }
  }
  
  console.log(`  Domain found but no fiscal path: ${workingDomain}`);
  return workingDomain + '/';
}

async function main() {
  const results = [];
  for (const county of counties) {
    const url = await findCounty(county);
    results.push({ name: county.name, url: url || '' });
  }
  
  console.log('\n=== Results ===');
  for (const r of results) {
    console.log(`  ${r.name}: ${r.url || '(empty)'}`);
  }
}

main();
