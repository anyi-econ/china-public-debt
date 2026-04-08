const http = require('http');
const https = require('https');
const fs = require('fs');

function probe(url, t) {
  t = t || 10000;
  return new Promise(function(resolve) {
    var mod = url.startsWith('https') ? https : http;
    var timer = setTimeout(function() { resolve({url:url,code:0,len:0,title:'TIMEOUT'}); }, t);
    try {
      var req = mod.get(url, {timeout:t, rejectUnauthorized:false, headers:{'User-Agent':'Mozilla/5.0'}}, function(res) {
        clearTimeout(timer);
        if ([301,302,303,307,308].indexOf(res.statusCode) >= 0) {
          var loc = res.headers.location || '';
          if (loc) {
            var u2;
            try { u2 = loc.startsWith('http') ? loc : new URL(loc, url).href; } catch(e) { resolve({url:url,code:res.statusCode,len:0,title:'BAD_REDIR'}); res.resume(); return; }
            var mod2 = u2.startsWith('https') ? https : http;
            var req2 = mod2.get(u2, {timeout:t, rejectUnauthorized:false, headers:{'User-Agent':'Mozilla/5.0'}}, function(res2) {
              var b = ''; res2.setEncoding('utf8');
              res2.on('data', function(d) { if (b.length < 30000) b += d; });
              res2.on('end', function() { resolve({url:u2,code:res2.statusCode,len:b.length,title:(b.match(/<title[^>]*>([^<]{0,200})/i)||[])[1]||''}); });
            });
            req2.on('error', function(e) { resolve({url:u2,code:-1,len:0,title:'ERR2:'+e.code}); });
          } else {
            resolve({url:url,code:res.statusCode,len:0,title:'REDIR_NO_LOC'});
          }
          res.resume();
          return;
        }
        var b = ''; res.setEncoding('utf8');
        res.on('data', function(d) { if (b.length < 30000) b += d; });
        res.on('end', function() { resolve({url:url,code:res.statusCode,len:b.length,title:(b.match(/<title[^>]*>([^<]{0,200})/i)||[])[1]||''}); });
      });
      req.on('error', function(e) { clearTimeout(timer); resolve({url:url,code:-1,len:0,title:'ERR:'+e.code}); });
    } catch(e) { clearTimeout(timer); resolve({url:url,code:-2,len:0,title:'CATCH:'+e.message}); }
  });
}

var suffixes = [
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

var counties = [
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

async function main() {
  var out = ['=== FISCAL PROBE v2 ==='];
  
  for (var c = 0; c < counties.length; c++) {
    var name = counties[c][0], city = counties[c][1], base = counties[c][2];
    var hits = [];
    
    for (var i = 0; i < suffixes.length; i += 7) {
      var batch = [];
      for (var j = i; j < Math.min(i+7, suffixes.length); j++) {
        batch.push(probe(base + suffixes[j], 8000).then((function(suf) {
          return function(r) { return {suf:suf, code:r.code, len:r.len, title:r.title, url:r.url}; };
        })(suffixes[j])));
      }
      var results = await Promise.all(batch);
      for (var k = 0; k < results.length; k++) {
        var r = results[k];
        if (r.code === 200 && r.len > 2000) {
          hits.push(r);
        }
      }
    }
    
    if (hits.length > 0) {
      for (var h = 0; h < hits.length; h++) {
        out.push('HIT|' + name + '|' + city + '|' + (hits[h].url || base + hits[h].suf) + '|len=' + hits[h].len + '|' + (hits[h].title||'').trim().substring(0,80));
      }
    } else {
      out.push('MISS|' + name + '|' + city + '|' + base);
    }
    process.stderr.write((c+1) + '/' + counties.length + ' ');
  }
  
  process.stderr.write('\n');
  var outPath = require('path').join(__dirname, '_gz4_fiscal_results.txt');
  fs.writeFileSync(outPath, out.join('\n'), 'utf8');
  console.log('DONE - wrote ' + out.length + ' lines to ' + outPath);
}

main().catch(function(e) { console.error('FATAL:', e.stack || e); process.exit(1); });
