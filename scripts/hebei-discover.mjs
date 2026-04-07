/**
 * Hebei Missing URL Discovery — sequential, robust, no crashes.
 * Tries domain guesses + fiscal sub-paths for each empty entry.
 */

import https from "https";
import http from "http";

const TIMEOUT = 8000;

const FISCAL_SUBPATHS = [
  "/__sys_block__/czyjs.html",
  "/czyjs/",
  "/czyjs.html",
  "/czysindex.html",
  "/xxgk/czyjs.jsp",
  "/ztzl/czyjs/",
  "/ztlm/czyjs/",
  "/zwgk/czyjszl/",
  "/zwgk/czzj/",
  "/zwgk/czxx/",
  "/zfxxgk/fdzdgknr/czyjs/",
  "/zfxxgk/fdzdgknr/czyjsgk/",
  "/yjs",
  "/plugin/zfyjs",
  "/cms/index/czyjs.html",
  "/list-czwyjszl.html",
  "/publicity/qzfxx/czyjs/",
  "/yusuan/",
  "/caizhengyujuesuangongkai/",
  "/zhengfuyusuan.html",
];

// Tangshan-specific CMS patterns (for Tangshan counties that use tangshan.gov.cn CMS style)
const TANGSHAN_SUBPATHS = [
  "/czyjss/index.html",
  "/yjsgk/index.html",
  "/tsczxx/index.html",
];

// Cangzhou-specific CMS patterns
const CANGZHOU_SUBPATHS = [
  "/YuJueSuan.shtml",
  "/czyjs/YuJueSuan.shtml",
  "/czysjs/listDisplaySon.shtml",
  "/czyjs/newslist_czyjs.shtml",
  "/czyjsgkzl/YuJueSuan.shtml",
];

function scoreFiscalContent(html) {
  let score = 0;
  const checks = [
    [/预决算公开/g, 5],
    [/预算公开/g, 3],
    [/决算公开/g, 3],
    [/一般公共预算/g, 3],
    [/政府性基金预算/g, 3],
    [/部门预算/g, 2],
    [/部门决算/g, 2],
    [/政府预算/g, 2],
    [/政府决算/g, 2],
    [/财政预决算/g, 5],
    [/预算信息公开/g, 4],
  ];
  for (const [regex, pts] of checks) {
    const m = html.match(regex);
    if (m) score += m.length * pts;
  }
  return score;
}

function fetchUrl(url) {
  return new Promise((resolve) => {
    let resolved = false;
    const done = (val) => { if (!resolved) { resolved = true; clearTimeout(timer); resolve(val); } };
    const timer = setTimeout(() => done({ error: "TIMEOUT" }), TIMEOUT);
    try {
      const mod = url.startsWith("https") ? https : http;
      const req = mod.get(url, {
        timeout: TIMEOUT,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "zh-CN,zh;q=0.9",
        },
        rejectUnauthorized: false,
      }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          res.resume(); // drain the response
          const loc = res.headers.location;
          if (loc) {
            let rUrl = loc;
            if (rUrl.startsWith("/")) {
              try { const u = new URL(url); rUrl = `${u.protocol}//${u.host}${rUrl}`; } catch { done({ error: "BAD_REDIRECT" }); return; }
            }
            const mod2 = rUrl.startsWith("https") ? https : http;
            const r2 = mod2.get(rUrl, {
              timeout: TIMEOUT,
              headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html", "Accept-Language": "zh-CN,zh;q=0.9" },
              rejectUnauthorized: false,
            }, (res2) => {
              let body = "";
              res2.setEncoding("utf-8");
              res2.on("data", d => { body += d; if (body.length > 200000) res2.destroy(); });
              res2.on("end", () => done({ status: res2.statusCode, body, url: rUrl }));
              res2.on("error", () => done({ status: res2.statusCode, body, url: rUrl }));
            });
            r2.on("error", () => done({ error: "REDIRECT_ERR" }));
            r2.on("timeout", () => { r2.destroy(); done({ error: "TIMEOUT" }); });
          } else { done({ status: res.statusCode, body: "", url }); }
          return;
        }
        if (res.statusCode !== 200) { res.resume(); done({ status: res.statusCode, body: "", url }); return; }
        let body = "";
        res.setEncoding("utf-8");
        res.on("data", d => { body += d; if (body.length > 200000) res.destroy(); });
        res.on("end", () => done({ status: 200, body, url }));
        res.on("error", () => done({ status: 200, body, url }));
      });
      req.on("error", () => done({ error: "CONN_ERR" }));
      req.on("timeout", () => { req.destroy(); });
    } catch (e) {
      done({ error: e.message });
    }
  });
}

function extractFiscalLinks(html, baseUrl) {
  const links = [];
  const re = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1], text = m[2].replace(/<[^>]+>/g, "").trim();
    if (/预[算决]|财政|czyjs|czyjsgk|czyjszl|czzj|czxx|YuJueSuan|yjsgk|预决算/.test(text + href)) {
      let full = href;
      if (href.startsWith("/")) {
        try { const u = new URL(baseUrl); full = `${u.protocol}//${u.host}${href}`; } catch { continue; }
      } else if (!href.startsWith("http")) continue;
      if (/mof\.gov\.cn|www\.gov\.cn|hebei\.gov\.cn|hbzwfw|javascript/i.test(full)) continue;
      links.push({ url: full, text });
    }
  }
  return links;
}

const ENTRIES = [
  // ── City-level missing ──
  { city: "河北省", name: "保定市", guesses: [
    "https://czj.baoding.gov.cn/", "http://czj.baoding.gov.cn/",
    "https://www.baoding.gov.cn/zwgk/czzj/", "https://www.baoding.gov.cn/zwgk/czyjszl/",
  ]},
  { city: "河北省", name: "秦皇岛市", guesses: [
    "https://czj.qhd.gov.cn/", "http://czj.qhd.gov.cn/",
    "https://www.qhd.gov.cn/zwgk/czzj/", "https://www.qhd.gov.cn/zwgk/czyjszl/",
    "http://www.qhd.gov.cn/col/col4280/index.html",
  ]},
  // ── 石家庄 (21 empty) ──
  { city: "石家庄市", name: "长安区", guesses: ["http://www.sjzca.gov.cn/", "https://www.sjzca.gov.cn/"] },
  { city: "石家庄市", name: "桥西区", guesses: ["http://www.sjzqx.gov.cn/", "https://www.sjzqx.gov.cn/"] },
  { city: "石家庄市", name: "新华区", guesses: ["http://www.sjzxhq.gov.cn/", "https://www.sjzxhq.gov.cn/"] },
  { city: "石家庄市", name: "井陉矿区", guesses: ["http://www.jxkq.gov.cn/", "http://www.sjzjxkq.gov.cn/"] },
  { city: "石家庄市", name: "裕华区", guesses: ["http://www.sjzyh.gov.cn/", "http://www.sjzyuhua.gov.cn/"] },
  { city: "石家庄市", name: "藁城区", guesses: ["http://www.gaocheng.gov.cn/", "https://www.gaocheng.gov.cn/"] },
  { city: "石家庄市", name: "鹿泉区", guesses: ["http://www.luquan.gov.cn/", "https://www.luquan.gov.cn/"] },
  { city: "石家庄市", name: "栾城区", guesses: ["http://www.luancheng.gov.cn/", "https://www.luancheng.gov.cn/"] },
  { city: "石家庄市", name: "井陉县", guesses: ["http://www.jingxing.gov.cn/", "https://www.jingxing.gov.cn/"] },
  { city: "石家庄市", name: "正定县", guesses: ["http://www.zhengding.gov.cn/", "https://www.zhengding.gov.cn/"] },
  { city: "石家庄市", name: "行唐县", guesses: ["http://www.xingtang.gov.cn/", "https://www.xingtang.gov.cn/"] },
  { city: "石家庄市", name: "灵寿县", guesses: ["http://www.lingshou.gov.cn/"] },
  { city: "石家庄市", name: "高邑县", guesses: ["http://www.gaoyi.gov.cn/"] },
  { city: "石家庄市", name: "深泽县", guesses: ["http://www.shenze.gov.cn/"] },
  { city: "石家庄市", name: "赞皇县", guesses: ["http://www.zanhuang.gov.cn/"] },
  { city: "石家庄市", name: "无极县", guesses: ["http://www.wuji.gov.cn/"] },
  { city: "石家庄市", name: "元氏县", guesses: ["http://www.yuanshi.gov.cn/"] },
  { city: "石家庄市", name: "赵县", guesses: ["http://www.zhaoxian.gov.cn/"] },
  { city: "石家庄市", name: "辛集市", guesses: ["http://www.xinji.gov.cn/", "https://www.xinji.gov.cn/"] },
  { city: "石家庄市", name: "晋州市", guesses: ["http://www.jinzhou.gov.cn/", "http://www.sjzjinzhou.gov.cn/"] },
  { city: "石家庄市", name: "新乐市", guesses: ["http://www.xinle.gov.cn/"] },
  // ── 唐山 (8 empty) ──
  { city: "唐山市", name: "路南区", guesses: ["http://www.tsln.gov.cn/", "https://www.tsln.gov.cn/"] },
  { city: "唐山市", name: "古冶区", guesses: ["http://www.guye.gov.cn/", "https://www.guye.gov.cn/"] },
  { city: "唐山市", name: "开平区", guesses: ["http://www.tskp.gov.cn/", "https://www.tskp.gov.cn/"] },
  { city: "唐山市", name: "丰南区", guesses: ["http://www.fengnan.gov.cn/", "https://www.fengnan.gov.cn/"] },
  { city: "唐山市", name: "丰润区", guesses: ["http://www.fengrun.gov.cn/", "https://www.fengrun.gov.cn/"] },
  { city: "唐山市", name: "遵化市", guesses: ["http://www.zunhua.gov.cn/", "https://www.zunhua.gov.cn/"] },
  { city: "唐山市", name: "迁安市", guesses: ["http://www.qianan.gov.cn/", "https://www.qianan.gov.cn/"] },
  { city: "唐山市", name: "滦州市", guesses: ["http://www.luanzhou.gov.cn/", "https://www.luanzhou.gov.cn/"] },
  // ── 秦皇岛 (6 empty) ──
  { city: "秦皇岛市", name: "海港区", guesses: ["http://hgq.qhd.gov.cn/", "http://www.hgq.gov.cn/"] },
  { city: "秦皇岛市", name: "山海关区", guesses: ["http://www.shanhaiguan.gov.cn/", "https://www.shanhaiguan.gov.cn/"] },
  { city: "秦皇岛市", name: "抚宁区", guesses: ["http://www.funing.gov.cn/", "http://www.qhdfn.gov.cn/"] },
  { city: "秦皇岛市", name: "青龙满族自治县", guesses: ["http://www.qinglong.gov.cn/", "http://www.hbqinglong.gov.cn/"] },
  { city: "秦皇岛市", name: "昌黎县", guesses: ["http://www.changli.gov.cn/", "https://www.changli.gov.cn/"] },
  { city: "秦皇岛市", name: "卢龙县", guesses: ["http://www.lulong.gov.cn/", "https://www.lulong.gov.cn/"] },
  // ── 邯郸 (7 empty) ──
  { city: "邯郸市", name: "丛台区", guesses: ["http://www.congtai.gov.cn/"] },
  { city: "邯郸市", name: "峰峰矿区", guesses: ["http://www.fengfeng.gov.cn/"] },
  { city: "邯郸市", name: "肥乡区", guesses: ["http://www.feixiang.gov.cn/"] },
  { city: "邯郸市", name: "永年区", guesses: ["http://www.yongnian.gov.cn/"] },
  { city: "邯郸市", name: "成安县", guesses: ["http://www.chengan.gov.cn/"] },
  { city: "邯郸市", name: "广平县", guesses: ["http://www.guangping.gov.cn/"] },
  { city: "邯郸市", name: "魏县", guesses: ["http://www.hbweixian.gov.cn/", "http://www.hdweixian.gov.cn/"] },
  { city: "邯郸市", name: "曲周县", guesses: ["http://www.hdquzhou.gov.cn/", "http://www.quzhou.gov.cn/"] },
  // ── 邢台 (7 empty) ──
  { city: "邢台市", name: "信都区", guesses: ["http://www.xindu.gov.cn/", "http://www.xtxd.gov.cn/", "http://www.xtxindu.gov.cn/"] },
  { city: "邢台市", name: "内丘县", guesses: ["http://www.neiqiu.gov.cn/"] },
  { city: "邢台市", name: "柏乡县", guesses: ["http://www.baixiang.gov.cn/"] },
  { city: "邢台市", name: "新河县", guesses: ["http://www.xinhe.gov.cn/", "http://www.hbxinhe.gov.cn/"] },
  { city: "邢台市", name: "广宗县", guesses: ["http://www.guangzong.gov.cn/"] },
  { city: "邢台市", name: "清河县", guesses: ["http://www.qinghe.gov.cn/", "http://www.hbqinghe.gov.cn/"] },
  { city: "邢台市", name: "沙河市", guesses: ["http://www.shahe.gov.cn/"] },
  // ── 保定 (9 empty) ──
  { city: "保定市", name: "清苑区", guesses: ["http://www.bdqy.gov.cn/", "http://www.bdqingyuan.gov.cn/", "http://www.qingyuan.gov.cn/"] },
  { city: "保定市", name: "阜平县", guesses: ["http://www.hbfuping.gov.cn/", "http://www.bdfuping.gov.cn/", "http://www.fuping.gov.cn/"] },
  { city: "保定市", name: "定兴县", guesses: ["http://www.dingxing.gov.cn/"] },
  { city: "保定市", name: "容城县", guesses: ["http://www.bdrongcheng.gov.cn/", "http://www.rongchengxian.gov.cn/", "http://www.rongcheng.gov.cn/"] },
  { city: "保定市", name: "安新县", guesses: ["http://www.anxin.gov.cn/"] },
  { city: "保定市", name: "易县", guesses: ["http://www.yixian.gov.cn/", "http://www.hbyixian.gov.cn/"] },
  { city: "保定市", name: "顺平县", guesses: ["http://www.shunping.gov.cn/"] },
  { city: "保定市", name: "博野县", guesses: ["http://www.boye.gov.cn/"] },
  { city: "保定市", name: "定州市", guesses: ["http://www.dingzhou.gov.cn/", "https://www.dingzhou.gov.cn/"] },
  // ── 张家口 (14 empty) ──
  { city: "张家口市", name: "桥西区", guesses: ["http://www.zjkqx.gov.cn/"] },
  { city: "张家口市", name: "宣化区", guesses: ["http://www.xuanhua.gov.cn/", "https://www.xuanhua.gov.cn/"] },
  { city: "张家口市", name: "下花园区", guesses: ["http://www.xiahuayuan.gov.cn/"] },
  { city: "张家口市", name: "万全区", guesses: ["http://www.wanquan.gov.cn/"] },
  { city: "张家口市", name: "崇礼区", guesses: ["http://www.chongli.gov.cn/"] },
  { city: "张家口市", name: "张北县", guesses: ["http://www.zhangbei.gov.cn/"] },
  { city: "张家口市", name: "康保县", guesses: ["http://www.kangbao.gov.cn/"] },
  { city: "张家口市", name: "沽源县", guesses: ["http://www.hbguyuan.gov.cn/", "http://www.guyuan.gov.cn/"] },
  { city: "张家口市", name: "尚义县", guesses: ["http://www.shangyi.gov.cn/"] },
  { city: "张家口市", name: "蔚县", guesses: ["http://www.yuxian.gov.cn/"] },
  { city: "张家口市", name: "阳原县", guesses: ["http://www.yangyuan.gov.cn/"] },
  { city: "张家口市", name: "怀安县", guesses: ["http://www.zjkhuaian.gov.cn/", "http://www.hbhuaian.gov.cn/"] },
  { city: "张家口市", name: "涿鹿县", guesses: ["http://www.zhuolu.gov.cn/"] },
  { city: "张家口市", name: "赤城县", guesses: ["http://www.chicheng.gov.cn/"] },
  // ── 承德 (5 empty) ──
  { city: "承德市", name: "双桥区", guesses: ["http://www.sqq.gov.cn/", "http://sqq.chengde.gov.cn/", "https://www.sqq.gov.cn/"] },
  { city: "承德市", name: "双滦区", guesses: ["http://www.slq.gov.cn/", "http://slq.chengde.gov.cn/", "https://www.slq.gov.cn/"] },
  { city: "承德市", name: "兴隆县", guesses: ["http://www.hbxl.gov.cn/", "https://www.hbxl.gov.cn/"] },
  { city: "承德市", name: "滦平县", guesses: ["http://www.lpx.gov.cn/", "https://www.lpx.gov.cn/"] },
  { city: "承德市", name: "隆化县", guesses: ["http://www.hebeilonghua.gov.cn/", "https://www.hebeilonghua.gov.cn/"] },
  { city: "承德市", name: "宽城满族自治县", guesses: ["http://www.hbkc.gov.cn/", "https://www.hbkc.gov.cn/"] },
  // ── 沧州 (1 empty) ──
  { city: "沧州市", name: "盐山县", guesses: ["http://www.hbyanshan.gov.cn/", "https://www.hbyanshan.gov.cn/"] },
  // ── 廊坊 (3 empty) ──
  { city: "廊坊市", name: "固安县", guesses: ["http://www.guan.gov.cn/", "https://www.guan.gov.cn/"] },
  { city: "廊坊市", name: "大厂回族自治县", guesses: ["http://www.dachang.gov.cn/", "https://www.dachang.gov.cn/"] },
  { city: "廊坊市", name: "三河市", guesses: ["http://www.sanhe.gov.cn/", "https://www.sanhe.gov.cn/"] },
  // ── 衡水 (1 empty) ──
  { city: "衡水市", name: "阜城县", guesses: ["http://www.fucheng.gov.cn/", "http://www.hsfucheng.gov.cn/"] },
];

async function processEntry(entry) {
  const { city, name, guesses } = entry;
  console.log(`\n── ${city} > ${name} ──`);

  // Phase 1: Find a working homepage domain
  let liveDomain = null;
  let homeBody = null;

  for (const g of guesses) {
    try {
      const res = await fetchUrl(g);
      if (res.error) {
        console.log(`  [SKIP] ${g} → ${res.error}`);
        continue;
      }
      if (res.status === 200 && res.body && res.body.length > 500) {
        console.log(`  [LIVE] ${g} → ${res.status} (${res.body.length} bytes)`);
        const u = new URL(res.url || g);
        liveDomain = `${u.protocol}//${u.host}`;
        homeBody = res.body;
        break;
      } else {
        console.log(`  [SKIP] ${g} → ${res.status || "empty"} (${(res.body || "").length} bytes)`);
      }
    } catch (e) {
      console.log(`  [ERR]  ${g} → ${e.message}`);
    }
  }

  if (!liveDomain) {
    console.log(`  ❌ NO LIVE DOMAIN FOUND`);
    return { ...entry, result: "NO_DOMAIN" };
  }

  // Phase 2: Extract fiscal links from homepage
  if (homeBody) {
    const links = extractFiscalLinks(homeBody, liveDomain);
    if (links.length > 0) {
      console.log(`  📎 Found ${links.length} fiscal link(s) on homepage:`);
      let bestLink = null, bestScore = 0;
      for (const link of links.slice(0, 5)) {
        console.log(`    → "${link.text}" ${link.url}`);
        try {
          const r = await fetchUrl(link.url);
          if (r.status === 200 && r.body) {
            const sc = scoreFiscalContent(r.body);
            console.log(`      score=${sc} (${r.body.length} bytes)`);
            if (sc > bestScore) { bestScore = sc; bestLink = link.url; }
          }
        } catch {}
      }
      if (bestLink && bestScore >= 5) {
        console.log(`  ✅ FOUND via homepage link: ${bestLink} (score=${bestScore})`);
        return { ...entry, result: "FOUND", url: bestLink, score: bestScore, method: "homepage_link" };
      }
    }
  }

  // Phase 3: Try fiscal sub-paths on live domain
  // Choose sub-paths based on city
  let subPaths = [...FISCAL_SUBPATHS];
  if (city === "唐山市") {
    // Tangshan counties use CMS paths like /{pinyin}/czyjss/index.html
    const pinyin = guessPinyin(name, liveDomain);
    for (const sp of TANGSHAN_SUBPATHS) {
      if (pinyin) subPaths.unshift(`/${pinyin}${sp}`);
    }
  } else if (city === "沧州市") {
    const pinyin = guessPinyin(name, liveDomain);
    for (const sp of CANGZHOU_SUBPATHS) {
      if (pinyin) subPaths.unshift(`/${pinyin}${sp}`);
    }
  }

  let bestUrl = null, bestScore = 0;
  for (const sp of subPaths) {
    const url = liveDomain + sp;
    try {
      const r = await fetchUrl(url);
      if (r.error) continue;
      if (r.status === 200 && r.body && r.body.length > 500) {
        const sc = scoreFiscalContent(r.body);
        if (sc > 0) console.log(`  📊 ${sp} → score=${sc}`);
        if (sc > bestScore) { bestScore = sc; bestUrl = r.url || url; }
      }
    } catch {}
  }

  if (bestUrl && bestScore >= 5) {
    console.log(`  ✅ FOUND via sub-path: ${bestUrl} (score=${bestScore})`);
    return { ...entry, result: "FOUND", url: bestUrl, score: bestScore, method: "subpath" };
  }

  // Phase 4: If homepage has col-based CMS, look for fiscal columns
  if (homeBody && /col\/col\d+/i.test(homeBody)) {
    const colLinks = [];
    const re = /href\s*=\s*["']((?:https?:\/\/[^"']*)?\/col\/col(\d+)\/index\.html[^"']*)["']/gi;
    let m;
    while ((m = re.exec(homeBody)) !== null) {
      colLinks.push({ url: m[1], id: m[2] });
    }
    // Check col pages for fiscal keywords
    for (const cl of colLinks.slice(0, 20)) {
      let cUrl = cl.url;
      if (cUrl.startsWith("/")) cUrl = liveDomain + cUrl;
      try {
        const r = await fetchUrl(cUrl);
        if (r.status === 200 && r.body) {
          const sc = scoreFiscalContent(r.body);
          if (sc > 0) console.log(`  📊 col/${cl.id} → score=${sc}`);
          if (sc > bestScore) { bestScore = sc; bestUrl = cUrl; }
        }
      } catch {}
    }
    if (bestUrl && bestScore >= 5) {
      console.log(`  ✅ FOUND via col scan: ${bestUrl} (score=${bestScore})`);
      return { ...entry, result: "FOUND", url: bestUrl, score: bestScore, method: "col_scan" };
    }
  }

  if (bestUrl && bestScore > 0) {
    console.log(`  ⚠️ LOW SCORE: ${bestUrl} (score=${bestScore})`);
    return { ...entry, result: "LOW_SCORE", url: bestUrl, score: bestScore };
  }

  console.log(`  ❌ NOT FOUND (domain live: ${liveDomain})`);
  return { ...entry, result: "NOT_FOUND", domain: liveDomain };
}

function guessPinyin(name, domain) {
  // Extract pinyin from live domain
  try {
    const host = new URL(domain).hostname;
    const m = host.match(/(?:www\.)?([a-z]+)\.gov\.cn/);
    if (m) return m[1];
  } catch {}
  return null;
}

async function main() {
  console.log(`═══ Hebei Missing URL Discovery ═══`);
  console.log(`Total entries: ${ENTRIES.length}\n`);

  const results = [];
  for (let i = 0; i < ENTRIES.length; i++) {
    console.log(`\n[${i + 1}/${ENTRIES.length}]`);
    try {
      const r = await processEntry(ENTRIES[i]);
      results.push(r);
    } catch (e) {
      console.log(`  ❌ CRASH: ${e.message}`);
      results.push({ ...ENTRIES[i], result: "ERROR", error: e.message });
    }
  }

  // Summary
  console.log(`\n\n═══ SUMMARY ═══`);
  const found = results.filter(r => r.result === "FOUND");
  const lowScore = results.filter(r => r.result === "LOW_SCORE");
  const notFound = results.filter(r => r.result === "NOT_FOUND");
  const noDomain = results.filter(r => r.result === "NO_DOMAIN");
  const errors = results.filter(r => r.result === "ERROR");

  console.log(`\nFOUND (${found.length}):`);
  for (const r of found) {
    console.log(`  ${r.city} > ${r.name}: ${r.url} (score=${r.score}, ${r.method})`);
  }

  console.log(`\nLOW SCORE (${lowScore.length}):`);
  for (const r of lowScore) {
    console.log(`  ${r.city} > ${r.name}: ${r.url} (score=${r.score})`);
  }

  console.log(`\nNOT FOUND - domain live (${notFound.length}):`);
  for (const r of notFound) {
    console.log(`  ${r.city} > ${r.name}: ${r.domain}`);
  }

  console.log(`\nNO DOMAIN (${noDomain.length}):`);
  for (const r of noDomain) {
    console.log(`  ${r.city} > ${r.name}`);
  }

  if (errors.length > 0) {
    console.log(`\nERRORS (${errors.length}):`);
    for (const r of errors) console.log(`  ${r.city} > ${r.name}: ${r.error}`);
  }
}

main().catch(console.error);
