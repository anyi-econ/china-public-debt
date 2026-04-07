// Phase 3: remaining counties with more pattern variations
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
    return { ok: false, status: 0 };
  }
}

async function tryUrls(name, urls) {
  for (const url of urls) {
    const r = await probe(url, 6000);
    if (r.ok) { console.log(`  ${name}: ${url} => HIT (${r.len}b)`); return url; }
  }
  console.log(`  ${name}: no hits`);
  return null;
}

async function main() {
  const results = {};
  
  // === LIAOCHENG remaining: 莘县, 高唐 ===
  console.log('=== LIAOCHENG remaining ===');
  results['SX'] = await tryUrls('莘县', [
    'http://shenxian.czyjsgk.com:5000/',
    'http://shen.czyjsgk.com:5000/',
    'http://shenx.czyjsgk.com:5000/',
    'http://www.shenxian.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'http://www.shenxian.gov.cn/zwgk/czxx/',
    'http://www.shenxian.gov.cn/sxczxx/',
    'http://www.liaocheng.gov.cn/zfxxgk/fdzdgknr/czyjs/',
  ]);
  results['GT'] = await tryUrls('高唐', [
    'http://gaotang.czyjsgk.com:5000/',
    'http://gao.czyjsgk.com:5000/',
    'http://www.gaotang.gov.cn/zfxxgk/fdzdgknr/czyjs/',
    'http://www.gaotang.gov.cn/zwgk/czxx/',
    'http://www.gaotang.gov.cn/gtczxx/',
  ]);
  
  // === BINZHOU: try various patterns ===
  console.log('\n=== BINZHOU ===');
  const bzCounties = [
    { name: 'ZH-沾化', domain: 'zhanhua.gov.cn', piny: ['zhanhua', 'zh'] },
    { name: 'HM-惠民', domain: 'huimin.gov.cn', piny: ['huimin', 'hm'] },
    { name: 'YXin-阳信', domain: 'yangxin.gov.cn', piny: ['yangxin', 'yx'] },
    { name: 'WD-无棣', domain: 'wudi.gov.cn', piny: ['wudi', 'wd'] },
    { name: 'BX-博兴', domain: 'boxing.gov.cn', piny: ['boxing', 'bx'] },
    { name: 'ZP-邹平', domain: 'zouping.gov.cn', piny: ['zouping', 'zp'] },
  ];
  for (const c of bzCounties) {
    const urls = [];
    // czyjsgk patterns
    for (const p of c.piny) urls.push(`http://${p}.czyjsgk.com:5000/`);
    // zfxxgk/web/czyjs (without hash) 
    urls.push(`http://www.${c.domain}/zfxxgk/web/`);
    urls.push(`http://www.${c.domain}/zfxxgk/web/index.html`);
    // Various paths
    urls.push(`http://www.${c.domain}/col/col_czyjs/index.html`);
    urls.push(`http://www.${c.domain}/zfxxgk/fdzdgknr/czyjs/`);
    urls.push(`http://www.${c.domain}/xxgk/czyjs/`);
    
    // Try binzhou city domain
    urls.push(`http://www.binzhou.gov.cn/zfxxgk/xqzfxxgk/${c.piny[1]}/czyjs/`);
    
    results[c.name] = await tryUrls(c.name, urls);
  }
  
  // === HEZE remaining: 曹县, 单县, 成武, 东明, 郓城 ===
  console.log('\n=== HEZE remaining ===');
  // Try different abbreviation patterns for czxx
  const hzRemaining = [
    { name: 'CaoX-曹县', domain: 'caoxian.gov.cn', abbrs: ['cx', 'caox', 'caoxian'] },
    { name: 'ShanX-单县', domain: 'shanxian.gov.cn', abbrs: ['dx', 'sx', 'shanx', 'shanxian'] },
    { name: 'CW-成武', domain: 'chengwu.gov.cn', abbrs: ['cw', 'chengwu'] },
    { name: 'DM-东明', domain: 'dongming.gov.cn', abbrs: ['dm', 'dongming'] },
  ];
  for (const c of hzRemaining) {
    const urls = [];
    for (const a of c.abbrs) {
      urls.push(`http://www.${c.domain}/${a}czxx/`);
    }
    urls.push(`http://www.${c.domain}/czxx/`);
    urls.push(`http://www.${c.domain}/zfxxgk/fdzdgknr/czyjs/`);
    urls.push(`http://www.${c.domain}/zwgk/czyjsgk/`);
    for (const a of c.abbrs) {
      urls.push(`http://${a}.czyjsgk.com:5000/`);
    }
    results[c.name] = await tryUrls(c.name, urls);
  }
  
  // 郓城 - find correct domain first
  console.log('\n=== 郓城 domain check ===');
  const ycDomains = ['yunchengxian.gov.cn', 'sdyuncheng.gov.cn', 'yuncheng.heze.gov.cn'];
  for (const d of ycDomains) {
    const r = await probe(`http://www.${d}/`, 5000);
    console.log(`  yuncheng try: www.${d} => status=${r.status} len=${r.len || 0}`);
  }
  // Also try heze.gov.cn pattern for 郓城
  const ycUrls = [
    'http://www.heze.gov.cn/zfxxgk/xqzfxxgk/ycx/',
    'http://yuncheng.czyjsgk.com:5000/',
    'http://yc.czyjsgk.com:5000/',
    'http://sdyc.czyjsgk.com:5000/',
  ];
  results['YunC-郓城'] = await tryUrls('郓城', ycUrls);
  
  console.log('\n=== ALL RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  
  const fs = await import('fs');
  fs.writeFileSync('scripts/shandong-phase3-results.json', JSON.stringify(results, null, 2));
}

main();
