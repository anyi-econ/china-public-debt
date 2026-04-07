// Phase 2: Try city-level and pattern-based fiscal URLs 
async function probe(url, timeout = 6000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ac.signal, redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(t);
    if (res.status >= 300 && res.status < 400) return { ok: false, status: res.status, redir: res.headers.get('location') };
    const text = await res.text();
    const hasFiscal = /预算|决算|预决算|财政预决算/.test(text);
    const isHome = /<title>[^<]*(首页|门户)[^<]*<\/title>/i.test(text);
    return { ok: res.status === 200 && hasFiscal && !isHome, status: res.status, len: text.length, hasFiscal, isHome };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, status: 0, error: e.message?.slice(0, 50) };
  }
}

async function main() {
  const results = {};
  
  // === DEZHOU: try czyjsgk.com pattern ===
  console.log('=== DEZHOU czyjsgk.com pattern ===');
  const dzCounties = [
    { name: 'NJ-宁津', pinyin: 'ningjin' },
    { name: 'QY-庆云', pinyin: 'qingyun' },
    { name: 'LYX-临邑', pinyin: 'linyi' },
    { name: 'QH-齐河', pinyin: 'qihe' },
    { name: 'PY-平原', pinyin: 'pingyuan' },
    { name: 'WC-武城', pinyin: 'wucheng' },
    { name: 'YC-禹城', pinyin: 'yucheng' },
    { name: 'LL-乐陵', pinyin: 'laoling' },
  ];
  for (const c of dzCounties) {
    const url = `http://${c.pinyin}.czyjsgk.com:5000/`;
    const r = await probe(url, 8000);
    console.log(`  ${c.name}: ${url} => ${JSON.stringify(r)}`);
    if (r.ok) results[c.name] = url;
  }
  
  // === DEZHOU: try dezhou.gov.cn city domain patterns ===
  console.log('\n=== DEZHOU city domain & county specific paths ===');
  const dzDomains = [
    { name: 'NJ-宁津', domain: 'sdningjin.gov.cn' },
    { name: 'QY-庆云', domain: 'qingyun.gov.cn' },
    { name: 'LYX-临邑', domain: 'linyixian.gov.cn' },
    { name: 'QH-齐河', domain: 'qihe.gov.cn' },
    { name: 'PY-平原', domain: 'zgpingyuan.gov.cn' },
    { name: 'WC-武城', domain: 'wucheng.gov.cn' },
    { name: 'YC-禹城', domain: 'yucheng.gov.cn' },
    { name: 'LL-乐陵', domain: 'laoling.gov.cn' },
  ];
  // Try specific paths on county domains
  const paths = ['/czyjsgk/', '/czyjs/', '/czxx/'];
  for (const c of dzDomains) {
    if (results[c.name]) continue;
    for (const p of paths) {
      const url = `http://www.${c.domain}${p}`;
      const r = await probe(url, 5000);
      if (r.ok) { console.log(`  ${c.name}: ${url} => HIT`); results[c.name] = url; break; }
    }
    if (!results[c.name]) console.log(`  ${c.name}: no path hits`);
  }
  
  // === LIAOCHENG: try liaocheng.gov.cn pattern (like 临清市) ===
  console.log('\n=== LIAOCHENG patterns ===');
  const lcCounties = [
    { name: 'DCF-东昌府', domain: 'dongchangfu.gov.cn', sub: 'dcf' },
    { name: 'CP-茌平', domain: 'chiping.gov.cn', sub: 'cp' },
    { name: 'YGu-阳谷', domain: 'yanggu.gov.cn', sub: 'yg' },
    { name: 'SX-莘县', domain: 'shenxian.gov.cn', sub: 'sx' },
    { name: 'DA-东阿', domain: 'donge.gov.cn', sub: 'da' },
    { name: 'GX-冠县', domain: 'guanxian.gov.cn', sub: 'gx' },
    { name: 'GT-高唐', domain: 'gaotang.gov.cn', sub: 'gt' },
  ];
  // First try city domain pattern
  for (const c of lcCounties) {
    const urls = [
      `http://www.liaocheng.gov.cn/zfxxgk/fdzdgknr/czyjs/${c.sub}/`,
      `http://www.${c.domain}/zfxxgk/fdzdgknr/czyjs/`,
      `http://www.${c.domain}/zwgk/czyjsgk/`,
      `http://www.${c.domain}/zwgk/czxx/`,
      `http://www.${c.domain}/${c.sub}czxx/`,
      `http://${c.sub}.czyjsgk.com:5000/`,
    ];
    let found = false;
    for (const url of urls) {
      const r = await probe(url, 5000);
      if (r.ok) { console.log(`  ${c.name}: ${url} => HIT`); results[c.name] = url; found = true; break; }
    }
    if (!found) console.log(`  ${c.name}: no hits`);
  }
  
  // === BINZHOU: try zfxxgk/web pattern ===
  console.log('\n=== BINZHOU patterns ===');
  const bzCounties = [
    { name: 'ZH-沾化', domain: 'zhanhua.gov.cn' },
    { name: 'HM-惠民', domain: 'huimin.gov.cn' },
    { name: 'YXin-阳信', domain: 'yangxin.gov.cn' },
    { name: 'WD-无棣', domain: 'wudi.gov.cn' },
    { name: 'BX-博兴', domain: 'boxing.gov.cn' },
    { name: 'ZP-邹平', domain: 'zouping.gov.cn' },
  ];
  for (const c of bzCounties) {
    const urls = [
      `http://www.${c.domain}/zfxxgk/web/#/page/czyjs`,
      `http://${c.domain}/zfxxgk/web/#/page/czyjs`,
      `http://www.${c.domain}/zfxxgk/fdzdgknr/czyjs/`,
      `http://www.${c.domain}/zwgk/czyjsgk/`,
      `http://www.${c.domain}/zwgk/czxx/`,
    ];
    let found = false;
    for (const url of urls) {
      const r = await probe(url, 5000);
      if (r.ok) { console.log(`  ${c.name}: ${url} => HIT`); results[c.name] = url; found = true; break; }
    }
    if (!found) console.log(`  ${c.name}: no hits`);
  }
  
  // === HEZE: try {abbr}czxx/ pattern ===
  console.log('\n=== HEZE patterns ===');
  const hzCounties = [
    { name: 'CaoX-曹县', domain: 'caoxian.gov.cn', sub: 'cx' },
    { name: 'ShanX-单县', domain: 'shanxian.gov.cn', sub: 'sxian' },
    { name: 'CW-成武', domain: 'chengwu.gov.cn', sub: 'cw' },
    { name: 'JY-巨野', domain: 'juye.gov.cn', sub: 'jy' },
    { name: 'DM-东明', domain: 'dongming.gov.cn', sub: 'dm' },
    // 郓城 - yuncheng.gov.cn is Shanxi! Need correct domain
    { name: 'YunC-郓城', domain: 'yunchengxian.gov.cn', sub: 'yc' },
  ];
  for (const c of hzCounties) {
    const urls = [
      `http://www.${c.domain}/${c.sub}czxx/`,
      `http://www.${c.domain}/czxx/`,
      `http://www.${c.domain}/zwgk/czyjsgk/`,
      `http://www.${c.domain}/zfxxgk/fdzdgknr/czyjs/`,
      `http://www.heze.gov.cn/zfxxgk/xqzfxxgk/${c.sub}czxx/`,
    ];
    let found = false;
    for (const url of urls) {
      const r = await probe(url, 5000);
      if (r.ok) { console.log(`  ${c.name}: ${url} => HIT`); results[c.name] = url; found = true; break; }
    }
    if (!found) console.log(`  ${c.name}: no hits`);
  }
  
  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  
  const fs = await import('fs');
  fs.writeFileSync('scripts/shandong-phase2-results.json', JSON.stringify(results, null, 2));
}

main();
