/**
 * Hebei batch check - robust version with better error handling.
 * Checks homepage-only URLs and discovers missing ones.
 */
import https from "https";
import http from "http";

const TIMEOUT = 8000;

// Budget keywords for scoring
function scoreFiscalContent(html) {
  let score = 0;
  const checks = [
    [/预决算公开/g, 5], [/预算公开/g, 3], [/决算公开/g, 3],
    [/一般公共预算/g, 3], [/政府性基金预算/g, 3],
    [/部门预算/g, 2], [/部门决算/g, 2], [/政府预算/g, 2], [/政府决算/g, 2],
    [/预算执行/g, 2], [/预算草案/g, 2], [/财政预决算/g, 5], [/预算信息公开/g, 4],
  ];
  for (const [regex, pts] of checks) {
    const matches = html.match(regex);
    if (matches) score += matches.length * pts;
  }
  return score;
}

function fetchUrl(url, timeout = TIMEOUT) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ error: "TIMEOUT" }), timeout);
    try {
      const mod = url.startsWith("https") ? https : http;
      const req = mod.get(url, {
        timeout, headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9",
        }, rejectUnauthorized: false,
      }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          clearTimeout(timer);
          const loc = res.headers.location;
          if (!loc) { resolve({ status: res.statusCode, body: "" }); return; }
          let rUrl = loc.startsWith("/") ? `${new URL(url).origin}${loc}` : loc;
          try {
            const mod2 = rUrl.startsWith("https") ? https : http;
            const req2 = mod2.get(rUrl, {
              timeout, headers: { "User-Agent": "Mozilla/5.0", "Accept": "text/html" },
              rejectUnauthorized: false,
            }, (res2) => {
              let body = ""; res2.setEncoding("utf-8");
              res2.on("data", d => { body += d; if (body.length > 150000) res2.destroy(); });
              res2.on("end", () => resolve({ status: res2.statusCode, body }));
              res2.on("error", () => resolve({ status: res2.statusCode, body }));
            });
            req2.on("error", () => resolve({ error: "REDIRECT_ERR" }));
            req2.on("timeout", () => { req2.destroy(); resolve({ error: "TIMEOUT" }); });
          } catch { resolve({ error: "REDIRECT_ERR" }); }
          return;
        }
        if (res.statusCode !== 200) { clearTimeout(timer); resolve({ status: res.statusCode, body: "" }); return; }
        let body = ""; res.setEncoding("utf-8");
        res.on("data", d => { body += d; if (body.length > 150000) res.destroy(); });
        res.on("end", () => { clearTimeout(timer); resolve({ status: 200, body }); });
        res.on("error", () => { clearTimeout(timer); resolve({ status: 200, body }); });
      });
      req.on("error", () => { clearTimeout(timer); resolve({ error: "ERR" }); });
      req.on("timeout", () => { req.destroy(); });
    } catch { clearTimeout(timer); resolve({ error: "ERR" }); }
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
      if (href.startsWith("/")) { try { full = `${new URL(baseUrl).origin}${href}`; } catch { continue; } }
      else if (!href.startsWith("http")) continue;
      if (/mof\.gov\.cn|www\.gov\.cn|hebei\.gov\.cn|javascript/i.test(full)) continue;
      links.push({ url: full, text });
    }
  }
  return links;
}

const FISCAL_SUBPATHS = [
  "/ztzl/czyjs/", "/ztlm/czyjs/", "/zwgk/czyjszl/", "/zwgk/czzj/",
  "/zfxxgk/fdzdgknr/czyjsgk/", "/zfxxgk/fdzdgknr/czyjs/",
  "/__sys_block__/czyjs.html", "/czyjs/", "/czyjs.html",
  "/xxgk/czyjs.jsp", "/czysindex.html", "/cms/index/czyjs.html",
  "/yjs", "/plugin/zfyjs", "/yusuan/", "/zhengfuyusuan.html",
  "/list-czwyjszl.html",
  // Cangzhou patterns
  "/YuJueSuan.shtml", "/czyjs/YuJueSuan.shtml",
  "/czyjsgkzl/YuJueSuan.shtml", "/czyjs/newslist_czyjs.shtml",
  // Tangshan patterns 
  "/czyjss/index.html", "/yjsgk/index.html",
];

async function checkOne(city, name, baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  let bestUrl = null, bestScore = 0;

  // Try sub-paths sequentially (more robust)
  for (const sp of FISCAL_SUBPATHS) {
    try {
      const u = `${base}${sp}`;
      const res = await fetchUrl(u, 6000);
      if (!res.error && res.status === 200 && res.body && res.body.length > 500) {
        const score = scoreFiscalContent(res.body);
        if (score > bestScore) { bestScore = score; bestUrl = u; }
      }
    } catch {}
  }

  // Also try with domain subdir patterns (e.g., /cixian/czyjs/)
  const hostname = new URL(baseUrl).hostname;
  const parts = hostname.split(".");
  const subdomain = parts[0] === "www" ? parts[1] : parts[0];
  const extraPaths = [
    `/${subdomain}/czyjs/`, `/${subdomain}/czyjss/index.html`,
    `/${subdomain}/yjsgk/index.html`, `/${subdomain}/c100153/YuJueSuan.shtml`,
  ];
  for (const sp of extraPaths) {
    try {
      const u = `${base}${sp}`;
      const res = await fetchUrl(u, 6000);
      if (!res.error && res.status === 200 && res.body && res.body.length > 500) {
        const score = scoreFiscalContent(res.body);
        if (score > bestScore) { bestScore = score; bestUrl = u; }
      }
    } catch {}
  }

  // Crawl homepage for fiscal links if still no good result
  if (bestScore < 3) {
    try {
      const homeRes = await fetchUrl(baseUrl, 8000);
      if (!homeRes.error && homeRes.body) {
        const links = extractFiscalLinks(homeRes.body, baseUrl);
        for (const link of links.slice(0, 5)) {
          try {
            const lr = await fetchUrl(link.url, 6000);
            if (!lr.error && lr.status === 200 && lr.body) {
              const score = scoreFiscalContent(lr.body);
              if (score > bestScore) { bestScore = score; bestUrl = link.url; }
            }
          } catch {}
        }
      }
    } catch {}
  }

  return { city, name, baseUrl, bestUrl, bestScore };
}

// ── Remaining homepage-only entries (not yet checked or NOT_FOUND in first run) ──
const ENTRIES = [
  // Already confirmed from first run:
  // ✅ 临漳县 -> /ztzl/czyjs/, 涉县 -> /ztzl/czyjs/, 邱县 -> /ztzl/czyjs/,
  // ✅ 馆陶县 -> /ztzl/czyjs/, 宁晋县 -> /xxgk/czyjs.jsp, 南和区 -> /ztzl/czyjs/,
  // ✅ 蠡县 -> /czysindex.html, 雄县 -> /czysindex.html

  // First run NOT_FOUND (re-check with more patterns):
  { city: "邯郸市", name: "磁县", url: "http://www.cixian.gov.cn/" },
  { city: "邯郸市", name: "鸡泽县", url: "http://www.jize.gov.cn/" },
  { city: "邢台市", name: "平乡县", url: "http://www.pingxiang.gov.cn/" },
  { city: "保定市", name: "徐水区", url: "http://www.xushui.gov.cn/" },
  { city: "保定市", name: "涞水县", url: "http://www.laishui.gov.cn/" },
  { city: "保定市", name: "望都县", url: "http://www.wangdu.gov.cn/" },
  { city: "保定市", name: "高阳县", url: "http://www.gaoyang.gov.cn/" },
  { city: "保定市", name: "曲阳县", url: "http://www.quyang.gov.cn/" },
  { city: "保定市", name: "涿州市", url: "http://www.zhuozhou.gov.cn/" },

  // Not checked yet (script crashed before reaching these):
  { city: "保定市", name: "安国市", url: "http://www.anguo.gov.cn/" },
  { city: "保定市", name: "高碑店市", url: "http://www.gaobeidian.gov.cn/" },
  { city: "承德市", name: "鹰手营子矿区", url: "http://www.ysyz.gov.cn/" },
  { city: "沧州市", name: "新华区", url: "http://www.czxh.gov.cn/" },
  { city: "沧州市", name: "东光县", url: "http://www.dongguang.gov.cn/" },
  { city: "沧州市", name: "海兴县", url: "http://www.haixing.gov.cn/" },
  { city: "沧州市", name: "吴桥县", url: "http://www.wuqiao.gov.cn/" },
  { city: "沧州市", name: "泊头市", url: "http://www.botou.gov.cn/" },
  { city: "廊坊市", name: "香河县", url: "http://www.xianghe.gov.cn/" },
  { city: "廊坊市", name: "文安县", url: "http://www.wenan.gov.cn/" },
  { city: "唐山市", name: "滦南县", url: "http://www.luannan.gov.cn/" },
  { city: "唐山市", name: "迁西县", url: "http://www.qianxi.gov.cn/" },
  // 衡水 ALL counties
  { city: "衡水市", name: "桃城区", url: "http://www.taocheng.gov.cn/" },
  { city: "衡水市", name: "冀州区", url: "http://www.jizhou.gov.cn/" },
  { city: "衡水市", name: "枣强县", url: "http://www.zaoqiang.gov.cn/" },
  { city: "衡水市", name: "武邑县", url: "http://www.wuyi.gov.cn/" },
  { city: "衡水市", name: "武强县", url: "http://www.wuqiang.gov.cn/" },
  { city: "衡水市", name: "饶阳县", url: "http://www.raoyang.gov.cn/" },
  { city: "衡水市", name: "安平县", url: "http://www.anping.gov.cn/" },
  { city: "衡水市", name: "故城县", url: "http://www.gucheng.gov.cn/" },
  { city: "衡水市", name: "景县", url: "http://www.jingxian.gov.cn/" },
  { city: "衡水市", name: "深州市", url: "http://www.shenzhou.gov.cn/" },
];

async function main() {
  console.log("Hebei Batch Check v2 - Remaining homepage-only URLs\n");
  const results = [];

  for (const entry of ENTRIES) {
    try {
      const r = await checkOne(entry.city, entry.name, entry.url);
      results.push(r);
      if (r.bestScore >= 3) {
        console.log(`FOUND: ${r.city} ${r.name}: ${r.bestUrl} (score=${r.bestScore})`);
      } else {
        console.log(`NOT_FOUND: ${r.city} ${r.name} (best_score=${r.bestScore})`);
      }
    } catch (e) {
      console.log(`ERROR: ${entry.city} ${entry.name}: ${e.message}`);
      results.push({ ...entry, bestUrl: null, bestScore: 0 });
    }
  }

  console.log("\n\n=== RESULTS JSON ===\n");
  console.log(JSON.stringify(results.filter(r => r.bestScore >= 3).map(r => ({
    city: r.city, name: r.name, url: r.bestUrl, score: r.bestScore
  })), null, 2));

  console.log("\n\n=== NOT FOUND ===\n");
  console.log(JSON.stringify(results.filter(r => r.bestScore < 3).map(r => ({
    city: r.city, name: r.name, baseUrl: r.baseUrl || r.url
  })), null, 2));
}

main().catch(console.error);
