import dns from 'dns';

const domains = [
  // Haikou district alternatives
  'xiuying.haikou.gov.cn', 'longhua.haikou.gov.cn', 'ml.haikou.gov.cn',
  'xiuying.hainan.gov.cn', 'longhua.hainan.gov.cn', 'meilan.hainan.gov.cn',
  // Sanya
  'ht.sanya.gov.cn', 'jy.sanya.gov.cn',
  // County {pinyin}.hainan.gov.cn
  'wzs.hainan.gov.cn', 'wuzhishan.hainan.gov.cn',
  'wenchang.hainan.gov.cn',
  'qionghai.hainan.gov.cn',
  'wanning.hainan.gov.cn',
  'dongfang.hainan.gov.cn',
  'dingan.hainan.gov.cn',
  'tunchang.hainan.gov.cn',
  'chengmai.hainan.gov.cn',
  'lingao.hainan.gov.cn',
  'baisha.hainan.gov.cn',
  'changjiang.hainan.gov.cn',
  'ledong.hainan.gov.cn',
  'lingshui.hainan.gov.cn',
  'baoting.hainan.gov.cn',
  'qiongzhong.hainan.gov.cn',
  // Also try without www
  'wzs.gov.cn', 'wenchang.gov.cn', 'dongfang.gov.cn', 'dingan.gov.cn',
  // Haikou main page for district links
  'www.haikou.gov.cn',
  'haikou.hainan.gov.cn',
];

dns.setServers(['8.8.8.8']);

async function checkDNS(domain) {
  return new Promise((resolve) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) resolve({ domain, status: 'FAIL', error: err.code });
      else resolve({ domain, status: 'OK', ip: addresses[0] });
    });
  });
}

async function main() {
  const results = await Promise.all(domains.map(checkDNS));
  console.log('=== DNS Results ===');
  results.forEach(r => {
    const pad = r.domain.padEnd(35);
    if (r.status === 'OK') console.log(`  OK   ${pad} ${r.ip}`);
    else console.log(`  FAIL ${pad} ${r.error}`);
  });
  console.log('\n=== Alive domains ===');
  results.filter(r => r.status === 'OK').forEach(r => console.log(`  ${r.domain}`));
}

main();
