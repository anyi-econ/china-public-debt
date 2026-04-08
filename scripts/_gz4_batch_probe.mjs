import http from 'http';
import https from 'https';
import fs from 'fs';

function probe(url, t=12000) {
  return new Promise(r => {
    const m = url.startsWith('https') ? https : http;
    const tm = setTimeout(() => r({url,code:0,len:0,title:'TIMEOUT'}), t);
    try {
      const q = m.get(url, {timeout:t, rejectUnauthorized:false, headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}}, res => {
        clearTimeout(tm);
        if (res.statusCode === 301 || res.statusCode === 302) {
          r({url, code:res.statusCode, len:0, title:'', redir:res.headers.location||''});
          res.resume();
          return;
        }
        let b=''; res.setEncoding('utf8');
        res.on('data',d=>{if(b.length<20000)b+=d});
        res.on('end',()=>r({url,code:res.statusCode,len:b.length,title:(b.match(/<title[^>]*>([^<]{0,200})/i)||[])[1]||'',redir:res.headers.location||''}));
      });
      q.on('error', e => { clearTimeout(tm); r({url,code:-1,len:0,title:'ERR:'+e.code}); });
    } catch(e) { clearTimeout(tm); r({url,code:-2,len:0,title:'CATCH'}); }
  });
}

const suffixes = [
  '/zwgk/xxgkml/zdlyxxgk/czxx/',
  '/zwgk/xxgkml/zdlyxxgk/czxx/czyjsjsgjf/',
  '/zwgk/zdlygk/czzj/',
  '/zwgk/zfxxgk/fdzdgknr/ysjs/',
  '/zwgk/zfxxgkzl/fdzdgknr/ysjs/',
  '/zwgk/zfxxgkzl/fdzdgknr/czzj/',
  '/xxgk/xxgkml/zdlygk/czzj/',
  '/xxgk/zdxxgk/czzj/',
  '/xxgk/zdxxgk/czxx/',
  '/zwgk/zdlyxxgk/czzj/',
  '/zfxxgk/fdzdgknr/czyjssjsgjf/',
  '/zfxxgk/fdzdgknr/czsj/czzj/',
  '/zwgk/xxgkml/zdlyxxgk/czyjsjsgjf/',
  '/zwgk/xxgkml/jcxxgk/czyjsjsgjf/',
];

const counties = [
  ['碧江区','http://www.bijiang.gov.cn'],['万山区','http://www.trws.gov.cn'],
  ['江口县','http://www.jiangkou.gov.cn'],['玉屏县','http://www.yuping.gov.cn'],
  ['石阡县','http://www.shiqian.gov.cn'],['思南县','https://www.sinan.gov.cn'],
  ['印江县','http://www.yinjiang.gov.cn'],['德江县','https://www.dejiang.gov.cn'],
  ['沿河县','http://www.yanhe.gov.cn'],['松桃县','http://www.songtao.gov.cn'],
  ['兴义市','https://www.gzxy.gov.cn'],['兴仁市','https://gzxr.gov.cn'],
  ['普安县','https://puan.gov.cn'],['晴隆县','https://ql.qxn.gov.cn'],
  ['贞丰县','https://zhenfeng.gov.cn'],['望谟县','https://wangmo.gov.cn'],
  ['册亨县','https://ceheng.gov.cn'],['安龙县','https://anlong.gov.cn'],
  ['凯里市','https://www.qdnkaili.gov.cn'],['黄平县','https://www.qdnhp.gov.cn'],
  ['施秉县','https://www.gzsb.gov.cn'],['三穗县','https://www.gzsansui.gov.cn'],
  ['镇远县','https://www.qdnzhenyuan.gov.cn'],['岑巩县','https://www.qdncengong.gov.cn'],
  ['天柱县','https://www.gz-tj.gov.cn'],['锦屏县','https://www.qdnjp.gov.cn'],
  ['剑河县','https://www.qdnjianhe.gov.cn'],['台江县','https://www.gztaijiang.gov.cn'],
  ['黎平县','https://www.qdnlp.gov.cn'],['榕江县','https://www.rongjiang.gov.cn'],
  ['从江县','https://www.qdncongjiang.gov.cn'],['雷山县','https://www.gzleishan.gov.cn'],
  ['麻江县','https://www.gzmajiang.gov.cn'],['丹寨县','https://www.qdndz.gov.cn'],
  ['都匀市','http://www.douyun.gov.cn'],['福泉市','http://www.fuquan.gov.cn'],
  ['荔波县','http://www.libo.gov.cn'],['贵定县','http://www.guiding.gov.cn'],
  ['瓮安县','http://www.wengan.gov.cn'],['独山县','http://www.dushan.gov.cn'],
  ['平塘县','http://www.pingtang.gov.cn'],['罗甸县','http://www.luodian.gov.cn'],
  ['长顺县','http://www.changshun.gov.cn'],['龙里县','http://www.longli.gov.cn'],
  ['惠水县','http://www.huishui.gov.cn'],['三都县','http://www.sandu.gov.cn'],
];

const out = [];

async function run() {
  out.push('=== HOMEPAGE CHECK ===');
  for (const [name, base] of counties) {
    const r = await probe(base + '/');
    const s = r.code===200?'OK':
      (r.code===301||r.code===302)?'REDIR->'+r.redir:
      r.code===0?'TIMEOUT':'ERR:'+r.code+'/'+r.title;
    out.push(`${name}|${base}|${s}|${(r.title||'').trim().slice(0,60)}`);
    process.stderr.write('.');
  }
  process.stderr.write('\n');
  
  out.push('');
  out.push('=== FISCAL PATH PROBE ===');
  
  for (const [name, base] of counties) {
    const hits = [];
    // Run suffixes in parallel batches of 7
    for (let i = 0; i < suffixes.length; i += 7) {
      const batch = suffixes.slice(i, i+7).map(suf => 
        probe(base + suf, 8000).then(r => ({suf, ...r}))
      );
      const rs = await Promise.all(batch);
      for (const r of rs) {
        if (r.code === 200 && r.len > 2000) {
          hits.push({suf: r.suf, len: r.len, title: (r.title||'').trim().slice(0,80)});
        }
      }
    }
    if (hits.length > 0) {
      for (const h of hits) {
        out.push(`${name}|${base}${h.suf}|len=${h.len}|${h.title}`);
      }
    } else {
      out.push(`${name}|NO_MATCH`);
    }
    process.stderr.write('.');
  }
  process.stderr.write('\n');
  
  const outPath = 'scripts/_gz4_probe_results.txt';
  fs.writeFileSync(outPath, out.join('\n'), 'utf8');
  console.log('DONE - wrote ' + out.length + ' lines to ' + outPath);
}

run().catch(e => { console.error(e); process.exit(1); });
