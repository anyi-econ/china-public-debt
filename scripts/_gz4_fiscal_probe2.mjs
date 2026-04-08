import http from 'http';
import https from 'https';
import fs from 'fs';

function probe(url, t=10000) {
  return new Promise(r => {
    const m = url.startsWith('https') ? https : http;
    const tm = setTimeout(() => r({url,code:0,len:0,title:'TIMEOUT'}), t);
    try {
      const q = m.get(url, {timeout:t, rejectUnauthorized:false, headers:{'User-Agent':'Mozilla/5.0'}}, res => {
        clearTimeout(tm);
        if ([301,302,303,307,308].includes(res.statusCode)) {
          const loc = res.headers.location||'';
          // Follow one redirect
          if (loc) {
            const u2 = loc.startsWith('http') ? loc : new URL(loc, url).href;
            const m2 = u2.startsWith('https') ? https : http;
            const q2 = m2.get(u2, {timeout:t, rejectUnauthorized:false, headers:{'User-Agent':'Mozilla/5.0'}}, res2 => {
              let b=''; res2.setEncoding('utf8');
              res2.on('data',d=>{if(b.length<30000)b+=d});
              res2.on('end',()=>r({url:u2,code:res2.statusCode,len:b.length,title:(b.match(/<title[^>]*>([^<]{0,200})/i)||[])[1]||''}));
            });
            q2.on('error', e => r({url:u2,code:-1,len:0,title:'ERR2:'+e.code}));
          } else {
            r({url,code:res.statusCode,len:0,title:'REDIR_NO_LOC'});
          }
          res.resume();
          return;
        }
        let b=''; res.setEncoding('utf8');
        res.on('data',d=>{if(b.length<30000)b+=d});
        res.on('end',()=>r({url,code:res.statusCode,len:b.length,title:(b.match(/<title[^>]*>([^<]{0,200})/i)||[])[1]||''}));
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
  '/zwgk/zfxxgk/fdzdgknr/czyjsjsgjf/',
  '/zwgk/zfxxgk/fdzdgknr/czzj/',
  '/zwgk/xxgkml/zdlyxxgk/czsj/',
  '/xxgk/zdlyxxgk/czzj/',
  '/xxgk/zdlyxxgk/czyjsjsgjf/',
  '/zwgk/zfxxgkzl/fdzdgknr/czyjsjsgjf/',
  '/zwgk/zdlyxxgk/czyjsjsgjf/',
  '/zwgk/zdlygk/czyjsjsgjf/',
];

// Corrected domains based on DNS resolution
const counties = [
  ['碧江区','铜仁市','http://www.bjq.gov.cn'],
  ['万山区','铜仁市','http://www.trws.gov.cn'],
  ['江口县','铜仁市','http://www.jiangkou.gov.cn'],
  ['玉屏县','铜仁市','http://www.yuping.gov.cn'],
  ['石阡县','铜仁市','http://www.shiqian.gov.cn'],
  ['思南县','铜仁市','https://www.sinan.gov.cn'],
  ['印江县','铜仁市','http://www.yinjiang.gov.cn'],
  ['德江县','铜仁市','https://www.dejiang.gov.cn'],
  ['沿河县','铜仁市','http://www.yanhe.gov.cn'],
  ['松桃县','铜仁市','http://www.songtao.gov.cn'],
  ['兴义市','黔西南州','https://www.gzxy.gov.cn'],
  ['兴仁市','黔西南州','https://gzxr.gov.cn'],
  ['普安县','黔西南州','https://puan.gov.cn'],
  ['晴隆县','黔西南州','http://www.ql.gov.cn'],
  ['贞丰县','黔西南州','http://www.gzzf.gov.cn'],
  ['望谟县','黔西南州','http://www.gzwm.gov.cn'],
  ['册亨县','黔西南州','http://www.gzch.gov.cn'],
  ['安龙县','黔西南州','http://www.gzal.gov.cn'],
  ['凯里市','黔东南州','http://www.kaili.gov.cn'],
  ['黄平县','黔东南州','https://www.qdnhp.gov.cn'],
  ['施秉县','黔东南州','http://sb.qdn.gov.cn'],
  ['三穗县','黔东南州','http://ss.qdn.gov.cn'],
  ['镇远县','黔东南州','http://www.zhenyuan.gov.cn'],
  ['岑巩县','黔东南州','http://cg.qdn.gov.cn'],
  ['天柱县','黔东南州','http://www.tianzhu.gov.cn'],
  ['锦屏县','黔东南州','http://www.jinping.gov.cn'],
  ['剑河县','黔东南州','http://jh.qdn.gov.cn'],
  ['台江县','黔东南州','https://www.gztaijiang.gov.cn'],
  ['黎平县','黔东南州','http://lp.qdn.gov.cn'],
  ['榕江县','黔东南州','https://www.rongjiang.gov.cn'],
  ['从江县','黔东南州','http://www.congjiang.gov.cn'],
  ['雷山县','黔东南州','http://www.leishan.gov.cn'],
  ['麻江县','黔东南州','http://www.majiang.gov.cn'],
  ['丹寨县','黔东南州','https://www.qdndz.gov.cn'],
  ['都匀市','黔南州','http://www.duyun.gov.cn'],
  ['福泉市','黔南州','http://www.gzfuquan.gov.cn'],
  ['荔波县','黔南州','https://www.libo.gov.cn'],
  ['贵定县','黔南州','http://www.guiding.gov.cn'],
  ['瓮安县','黔南州','http://www.wengan.gov.cn'],
  ['独山县','黔南州','http://www.dushan.gov.cn'],
  ['平塘县','黔南州','http://www.gzpt.gov.cn'],
  ['罗甸县','黔南州','http://www.gzluodian.gov.cn'],
  ['长顺县','黔南州','http://www.gzcsx.gov.cn'],
  ['龙里县','黔南州','https://www.longli.gov.cn'],
  ['惠水县','黔南州','http://www.gzhs.gov.cn'],
  ['三都县','黔南州','https://www.sandu.gov.cn'],
];

const out = [];

async function run() {
  out.push('=== FISCAL PATH PROBE (corrected domains) ===');
  
  for (const [name, city, base] of counties) {
    const hits = [];
    for (let i = 0; i < suffixes.length; i += 7) {
      const batch = suffixes.slice(i, i+7).map(suf => 
        probe(base + suf, 8000).then(r => ({suf, ...r}))
      );
      const rs = await Promise.all(batch);
      for (const r of rs) {
        if (r.code === 200 && r.len > 2000) {
          hits.push({suf: r.suf, len: r.len, title: (r.title||'').trim().slice(0,80), url: r.url});
        }
      }
    }
    if (hits.length > 0) {
      for (const h of hits) {
        out.push(`HIT|${name}|${city}|${h.url}|len=${h.len}|${h.title}`);
      }
    } else {
      out.push(`MISS|${name}|${city}|${base}`);
    }
    process.stderr.write('.');
  }
  process.stderr.write('\n');
  
  fs.writeFileSync('scripts/_gz4_fiscal_results.txt', out.join('\n'), 'utf8');
  console.log('DONE - ' + out.length + ' lines');
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
