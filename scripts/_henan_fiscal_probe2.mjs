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

const tests = [
  // 驻马店 - try zwgk/zfxxgk patterns (正阳县 pattern: zwgk/zfxxgk/fdzdgknr/czyjs/)
  ['西平县', 'https://www.xiping.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/'],
  ['西平县', 'https://www.xiping.gov.cn/zwgk/fdzdgknr/czyjs/'],
  ['上蔡县', 'https://www.shangcai.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/'],
  ['上蔡县', 'https://www.shangcai.gov.cn/zwgk/fdzdgknr/czyjs/'],
  ['平舆县', 'https://www.pingyu.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/'],
  ['平舆县', 'https://www.pingyu.gov.cn/zwgk/fdzdgknr/czyjs/'],
  ['确山县', 'https://www.queshan.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/'],
  ['确山县', 'https://www.queshan.gov.cn/zwgk/fdzdgknr/czyjs/'],
  ['泌阳县', 'https://www.biyang.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/'],
  ['泌阳县', 'https://www.biyang.gov.cn/zwgk/fdzdgknr/czyjs/'],
  ['汝南县', 'https://www.runan.gov.cn/zwgk/zfxxgk/fdzdgknr/czyjs/'],
  ['汝南县', 'https://www.runan.gov.cn/zwgk/fdzdgknr/czyjs/'],
  // 新乡 - test huojia pattern (htmls/caizhengyujuesuan)
  ['卫滨区', 'http://www.wbq.gov.cn/htmls/caizhengyujuesuan/list-1.html'],
  ['凤泉区', 'https://www.fengquan.gov.cn/htmls/caizhengyujuesuan/list-1.html'],
  ['延津县', 'http://yanjin.gov.cn/htmls/caizhengyujuesuan/list-1.html'],
  ['长垣市', 'http://www.changyuan.gov.cn/htmls/caizhengyujuesuan/list-1.html'],
  // 焦作 - section pages
  ['解放区', 'https://www.jfq.gov.cn/zwgk/zdlyzfxxgk/czzj/'],
  ['山阳区', 'https://www.syq.gov.cn/zwgk/zdlyzfxxgk/czzj/'],
  // 沁阳 specific
  ['沁阳市', 'https://www.qinyang.gov.cn/zwgk/czxx/czyjs/'],
  // 浉河区
  ['浉河区', 'https://www.shihe.gov.cn/zfxxgk/fdzdgknr/czgk/zfyjs/'],
  // 睢阳区
  ['睢阳区', 'https://www.suiyangqu.gov.cn/zwgk/fdzdgknr/czxx'],
  ['睢阳区', 'https://www.suiyangqu.gov.cn/zwgk/fdzdgknr/czyjs'],
  // 平桥区
  ['平桥区', 'https://www.xypingqiao.gov.cn/zfxxgk/fdzdgknr/czgk/'],
  ['平桥区', 'https://www.xypingqiao.gov.cn/zfxxgk/fdzdgknr/czyjs/'],
  // 商城县
  ['商城县', 'https://www.hnsc.gov.cn/zfxxgk/scxrmzfxxgkml/czzj'],
  // 潢川县
  ['潢川县', 'https://www.huangchuan.gov.cn/zfxxgk/fdzdgknr/czgk/'],
  // 西华县
  ['西华县', 'https://www.xihua.gov.cn/sitesources/xhxrmzf/page_pc/ztzl/czyjs/index.html'],
  // 郸城县
  ['郸城县', 'https://www.dancheng.gov.cn/sitesources/dcx/page_pc/zfxxgkpt/fdzdgknr/czzj/index.html'],
  // 禹州市
  ['禹州市', 'http://www.yuzhou.gov.cn/govxxgk/114110820057705430/openSubPage.html?specialurl=http://www.yuzhou.gov.cn/govxxgk/035002011001/govlist.html&righttitle=%E5%B9%B4%E5%BA%A6%E8%B4%A2%E6%94%BF%E9%A2%84%E5%86%B3%E7%AE%97'],
];

const titleRe = /<title[^>]*>([\s\S]*?)<\/title>/i;
const fiscalRe = /预决算|财政预决算|预算公开|决算公开|政府预算|政府决算|部门预算|部门决算/;
const yearBudgetRe = /\d{4}[\s\S]*?(?:预算|决算)/;

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
        const hasY = yearBudgetRe.test(data.body);
        console.log(`${hasF ? 'FISCAL' : hasY ? 'YEAR_MATCH' : 'NO_MATCH'} ${name} | ${url} | title="${title.substring(0,60)}" | len=${data.body.length}`);
      } else {
        console.log(`FAIL ${name} | ${url} | status=${data.status} | len=${data.body?.length || 0}`);
      }
    } catch(e) {
      console.log(`ERR ${name} | ${url} | ${e.message}`);
    }
  }
})();
