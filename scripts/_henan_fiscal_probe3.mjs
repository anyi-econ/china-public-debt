import https from 'https';
import http from 'http';

function fetchUrl(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve({ redirect: res.headers.location, status: res.statusCode });
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ body: Buffer.concat(chunks).toString('utf-8'), status: res.statusCode }));
    });
    req.on('error', e => reject(e));
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const titleRe = /<title[^>]*>([\s\S]*?)<\/title>/i;
const fiscalRe = /预决算|财政预决算|预算公开|决算公开|政府预算|政府决算|部门预算|部门决算/;

const tests = [
  // 平舆县 - try more patterns
  ['平舆县', 'https://www.pingyu.gov.cn/zwgk/zfxxgk/fdzdgknr/czxx/'],
  ['平舆县', 'https://www.pingyu.gov.cn/ztzl/jczwgkbzhgfh/ly/czyjsly/zfys/'],
  ['平舆县', 'https://www.pingyu.gov.cn/ztzl/yjsgk/'],
  // 汝南县 - more patterns
  ['汝南县', 'https://www.runan.gov.cn/zwgk/zfxxgk/fdzdgknr/czxx/'],
  ['汝南县', 'https://www.runan.gov.cn/ztzl/jczwgkbzhgfh/ly/czyjsly/zfys/'],
  ['汝南县', 'https://www.runan.gov.cn/ztzl/yjsgk/'],
  // 焦作 解放区/山阳区 - try czyjsly pattern
  ['解放区', 'https://www.jfq.gov.cn/ztzl/czyjsly/'],
  ['解放区', 'https://www.jfq.gov.cn/zwgk/czxx/'],
  ['解放区', 'https://www.jfq.gov.cn/ztzl/jczwgkbzhgfh/ly/czyjsly/'],
  ['山阳区', 'https://www.syq.gov.cn/ztzl/czyjsly/'],
  ['山阳区', 'https://www.syq.gov.cn/zwgk/czxx/'],
  ['山阳区', 'https://www.syq.gov.cn/ztzl/jczwgkbzhgfh/ly/czyjsly/'],
  // 新乡 remaining - try more patterns
  ['卫滨区', 'http://www.wbq.gov.cn/htmls/czyjs/list-1.html'],
  ['卫滨区', 'http://www.wbq.gov.cn/channels/czyjs.html'],
  ['卫滨区', 'http://www.wbq.gov.cn/gov_czyjsgk/czyjspt/index.html'],
  ['凤泉区', 'https://www.fengquan.gov.cn/htmls/czyjs/list-1.html'],
  ['凤泉区', 'https://www.fengquan.gov.cn/channels/czyjs.html'],
  ['延津县', 'https://yanjin.gov.cn/channels/czyjs.html'],
  ['延津县', 'https://yanjin.gov.cn/htmls/czyjs/list-1.html'],
  ['长垣市', 'http://www.changyuan.gov.cn/channels/czyjs.html'],
  ['长垣市', 'http://www.changyuan.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/'],
  // 睢阳区
  ['睢阳区', 'https://www.suiyangqu.gov.cn/zwgk/zdlyxxgk/czzj/'],
  ['睢阳区', 'https://www.suiyangqu.gov.cn/zwgk/fdzdgknr/czyjs/'],
  // 平桥区
  ['平桥区', 'https://www.xypingqiao.gov.cn/zfxxgk/fdzdgknr/czgk/zfyjs/'],
  ['平桥区', 'https://www.xypingqiao.gov.cn/zdlyxxgk/czzj/'],
  // 禹州市 - more patterns using xuchang许昌 pattern
  ['禹州市', 'http://www.yuzhou.gov.cn/govxxgk/yczx/ysjs/'],
  ['禹州市', 'http://www.yuzhou.gov.cn/zwgk/czxx/'],
  ['禹州市', 'http://www.yuzhou.gov.cn/zfxxgk/fdzdgknr/czxx/'],
  ['禹州市', 'http://www.yuzhou.gov.cn/govxxgk/035002011001/govlist.html'],
  // 西华县 retry
  ['西华县', 'https://www.xihua.gov.cn/sitesources/xhxrmzf/page_pc/zwgk/zdxxgk/czxx/'],
  ['西华县', 'https://www.xihua.gov.cn/sitesources/xhxrmzf/page_pc/yjsgk/'],
  // 郸城县 retry
  ['郸城县', 'http://www.dancheng.gov.cn/sitesources/dcx/page_pc/zfxxgkpt/fdzdgknr/czzj/index.html'],
  // try lingbao pattern for other smx counties
  ['灵宝市-verify', 'https://www.lingbao.gov.cn/16047/0000/subIndex-1.html'],
];

(async () => {
  for (const [name, url] of tests) {
    try {
      let data = await fetchUrl(url, 10000);
      if (data.redirect) {
        const rurl = data.redirect.startsWith('http') ? data.redirect : new URL(data.redirect, url).href;
        try { data = await fetchUrl(rurl, 10000); } catch { console.log(`ERR_REDIR ${name} | ${url}`); continue; }
      }
      if (data.status === 200 && data.body && data.body.length > 500) {
        const title = (data.body.match(titleRe)?.[1] || '').trim();
        const hasF = fiscalRe.test(data.body);
        console.log(`${hasF ? 'FISCAL' : 'NO_MATCH'} ${name} | ${url} | title="${title.substring(0,60)}" | len=${data.body.length}`);
      } else {
        console.log(`FAIL ${name} | ${url} | status=${data.status} | len=${data.body?.length || 0}`);
      }
    } catch(e) {
      console.log(`ERR ${name} | ${url} | ${e.message}`);
    }
  }
})();
