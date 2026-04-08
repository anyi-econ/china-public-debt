import http from 'http';
import https from 'https';

function probe(url, t=15000) {
  return new Promise(r => {
    const m = url.startsWith('https') ? https : http;
    const tm = setTimeout(() => r({url,code:0,len:0,title:'TIMEOUT'}), t);
    try {
      const q = m.get(url, {timeout:t, rejectUnauthorized:false, headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}}, res => {
        clearTimeout(tm);
        let b=''; res.setEncoding('utf8');
        res.on('data',d=>{if(b.length<15000) b+=d;});
        res.on('end',()=>r({url,code:res.statusCode,len:b.length,title:(b.match(/<title[^>]*>([^<]+)/i)||[])[1]||'',redir:res.headers.location||''}));
      });
      q.on('error', e => { clearTimeout(tm); r({url,code:-1,len:0,title:'ERR:'+e.code}); });
    } catch(e) { clearTimeout(tm); r({url,code:-2,len:0,title:'CATCH'}); }
  });
}

const counties = [
  ['碧江区','铜仁市','http://www.bijiang.gov.cn'],
  ['万山区','铜仁市','http://www.trws.gov.cn'],
  ['江口县','铜仁市','http://www.jiangkou.gov.cn'],
  ['玉屏侗族自治县','铜仁市','http://www.yuping.gov.cn'],
  ['石阡县','铜仁市','http://www.shiqian.gov.cn'],
  ['思南县','铜仁市','http://www.sinan.gov.cn'],
  ['印江土家族苗族自治县','铜仁市','http://www.yinjiang.gov.cn'],
  ['德江县','铜仁市','https://www.dejiang.gov.cn'],
  ['沿河土家族自治县','铜仁市','http://www.yanhe.gov.cn'],
  ['松桃苗族自治县','铜仁市','http://www.songtao.gov.cn'],
  ['兴义市','黔西南布依族苗族自治州','https://www.gzxy.gov.cn'],
  ['兴仁市','黔西南布依族苗族自治州','https://gzxr.gov.cn'],
  ['普安县','黔西南布依族苗族自治州','https://puan.gov.cn'],
  ['晴隆县','黔西南布依族苗族自治州','https://ql.qxn.gov.cn'],
  ['贞丰县','黔西南布依族苗族自治州','https://zhenfeng.gov.cn'],
  ['望谟县','黔西南布依族苗族自治州','https://wangmo.gov.cn'],
  ['册亨县','黔西南布依族苗族自治州','https://ceheng.gov.cn'],
  ['安龙县','黔西南布依族苗族自治州','https://anlong.gov.cn'],
  ['凯里市','黔东南苗族侗族自治州','https://www.qdnkaili.gov.cn'],
  ['黄平县','黔东南苗族侗族自治州','https://www.qdnhp.gov.cn'],
  ['施秉县','黔东南苗族侗族自治州','https://www.gzsb.gov.cn'],
  ['三穗县','黔东南苗族侗族自治州','https://www.gzsansui.gov.cn'],
  ['镇远县','黔东南苗族侗族自治州','https://www.qdnzhenyuan.gov.cn'],
  ['岑巩县','黔东南苗族侗族自治州','https://www.qdncengong.gov.cn'],
  ['天柱县','黔东南苗族侗族自治州','https://www.gz-tj.gov.cn'],
  ['锦屏县','黔东南苗族侗族自治州','https://www.qdnjp.gov.cn'],
  ['剑河县','黔东南苗族侗族自治州','https://www.qdnjianhe.gov.cn'],
  ['台江县','黔东南苗族侗族自治州','https://www.gztaijiang.gov.cn'],
  ['黎平县','黔东南苗族侗族自治州','https://www.qdnlp.gov.cn'],
  ['榕江县','黔东南苗族侗族自治州','https://www.rongjiang.gov.cn'],
  ['从江县','黔东南苗族侗族自治州','https://www.qdncongjiang.gov.cn'],
  ['雷山县','黔东南苗族侗族自治州','https://www.gzleishan.gov.cn'],
  ['麻江县','黔东南苗族侗族自治州','https://www.gzmajiang.gov.cn'],
  ['丹寨县','黔东南苗族侗族自治州','https://www.qdndz.gov.cn'],
  ['都匀市','黔南布依族苗族自治州','http://www.douyun.gov.cn'],
  ['福泉市','黔南布依族苗族自治州','http://www.fuquan.gov.cn'],
  ['荔波县','黔南布依族苗族自治州','http://www.libo.gov.cn'],
  ['贵定县','黔南布依族苗族自治州','http://www.guiding.gov.cn'],
  ['瓮安县','黔南布依族苗族自治州','http://www.wengan.gov.cn'],
  ['独山县','黔南布依族苗族自治州','http://www.dushan.gov.cn'],
  ['平塘县','黔南布依族苗族自治州','http://www.pingtang.gov.cn'],
  ['罗甸县','黔南布依族苗族自治州','http://www.luodian.gov.cn'],
  ['长顺县','黔南布依族苗族自治州','http://www.changshun.gov.cn'],
  ['龙里县','黔南布依族苗族自治州','http://www.longli.gov.cn'],
  ['惠水县','黔南布依族苗族自治州','http://www.huishui.gov.cn'],
  ['三都水族自治县','黔南布依族苗族自治州','http://www.sandu.gov.cn'],
];

const paths = [
  '/zwgk/xxgkml/zdlyxxgk/czxx/czyjsjsgjf/',
  '/zwgk/xxgkml/zdlygk/czzj/',
  '/zwgk/zdlygk/czzj/',
  '/zwgk/zdlygk/czyjs/',
  '/zwgk/zfxxgk/fdzdgknr/ysjs/',
  '/zwgk/zfxxgkzl/fdzdgknr/czyjsjsgjf/',
  '/zwgk/zfxxgkzl/fdzdgknr/ysjs/',
  '/xxgk/xxgkml/zdlygk/czzj/',
  '/xxgk/zdxxgk/czzj/',
  '/xxgk/xxgkml/zdlyxxgk/czxx/',
  '/zwgk/xxgkml/zdlyxxgk/czzj/',
  '/zwgk/xxgkml/zdlyxxgk/czyjs/',
  '/zwgk/xxgkml/jcgk/czxx/',
  '/zwgk/zdlyxxgk/czzj/',
  '/zwgk/qzfxxgkml/czyjsjsgjf/',
  '/zfxxgk/fdzdgknr/czyjsjsgjf/',
  '/zfxxgk/fdzdgknr/ysjs/',
  '/zwgk/xxgkml/zdlyxxgk/czxx/',
  '/xxgk/zdxxgk/czyjsjsgjf/',
  '/zwgk/zfxxgk/fdzdgknr/czyjsjsgjf/',
  '/zwgk/xxgkml/zdlyxxgk/czyjsjsgjf/',
];

async function run() {
  const results = [];
  
  // Process 5 counties at a time
  for (let i = 0; i < counties.length; i += 5) {
    const batch = counties.slice(i, i + 5);
    const batchPromises = batch.map(async ([name, city, base]) => {
      const found = [];
      const promises = paths.map(p => probe(base + p).then(r => {
        if (r.code === 200 && r.len > 2000) {
          found.push({ path: p, len: r.len, title: (r.title || '').trim().slice(0, 60) });
        }
      }));
      await Promise.all(promises);
      
      let govStatus = 'ok';
      if (found.length === 0) {
        const hp = await probe(base + '/');
        if (hp.code <= 0 || hp.code >= 400 || hp.len < 1000) {
          govStatus = 'unreachable';
        }
      }
      
      if (found.length > 0) {
        found.sort((a, b) => b.len - a.len);
        const best = found[0];
        console.log(`${name}|${city}|FOUND|${base}${best.path}|${best.title}|${found.length} paths`);
        results.push({ county: name, city, govUrl: base, govStatus: 'ok', fiscalUrl: base + best.path, fiscalStatus: 'ok', notes: `${found.length} fiscal paths found` });
      } else {
        console.log(`${name}|${city}|${govStatus === 'unreachable' ? 'UNREACHABLE' : 'NONE'}|${base}|no fiscal page found`);
        results.push({ county: name, city, govUrl: base, govStatus, fiscalUrl: '', fiscalStatus: govStatus === 'unreachable' ? 'gov_unreachable' : 'not_found', notes: '' });
      }
    });
    await Promise.all(batchPromises);
  }
  
  console.log('\n=== JSON RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
}

run().catch(e => console.error(e));
