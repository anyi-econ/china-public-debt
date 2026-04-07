/**
 * Hebei Deep Check: Fix homepage-only URLs → actual fiscal pages,
 * and discover missing URLs for empty entries.
 *
 * Task 1: For URLs that point to a gov homepage (not a fiscal page),
 *          crawl the homepage for fiscal links and try common sub-paths.
 * Task 2: For empty URLs, try domain guessing + sub-path checking.
 */

import https from "https";
import http from "http";

const TIMEOUT = 8000;
const CONCURRENCY = 6;

// ── All Hebei entries with their current status ──
// Format: { city, name, url, domain (if known) }
const HOMEPAGE_ONLY = [
  // 邯郸
  { city: "邯郸市", name: "临漳县", url: "http://www.linzhang.gov.cn/" },
  { city: "邯郸市", name: "涉县", url: "http://www.shexian.gov.cn/" },
  { city: "邯郸市", name: "磁县", url: "http://www.cixian.gov.cn/" },
  { city: "邯郸市", name: "邱县", url: "http://www.qiuxian.gov.cn/" },
  { city: "邯郸市", name: "鸡泽县", url: "http://www.jize.gov.cn/" },
  { city: "邯郸市", name: "馆陶县", url: "http://www.guantao.gov.cn/" },
  // 邢台
  { city: "邢台市", name: "南和区", url: "https://www.nanhe.gov.cn/" },
  { city: "邢台市", name: "宁晋县", url: "http://www.ningjin.gov.cn/" },
  { city: "邢台市", name: "平乡县", url: "http://www.pingxiang.gov.cn/" },
  // 保定
  { city: "保定市", name: "徐水区", url: "http://www.xushui.gov.cn/" },
  { city: "保定市", name: "涞水县", url: "http://www.laishui.gov.cn/" },
  { city: "保定市", name: "高阳县", url: "http://www.gaoyang.gov.cn/" },
  { city: "保定市", name: "望都县", url: "http://www.wangdu.gov.cn/" },
  { city: "保定市", name: "曲阳县", url: "http://www.quyang.gov.cn/" },
  { city: "保定市", name: "蠡县", url: "http://www.lixian.gov.cn/" },
  { city: "保定市", name: "雄县", url: "http://www.xiongxian.gov.cn/" },
  { city: "保定市", name: "涿州市", url: "http://www.zhuozhou.gov.cn/" },
  { city: "保定市", name: "安国市", url: "http://www.anguo.gov.cn/" },
  { city: "保定市", name: "高碑店市", url: "http://www.gaobeidian.gov.cn/" },
  // 承德
  { city: "承德市", name: "鹰手营子矿区", url: "http://www.ysyz.gov.cn/" },
  // 沧州
  { city: "沧州市", name: "新华区", url: "http://www.czxh.gov.cn/" },
  { city: "沧州市", name: "东光县", url: "http://www.dongguang.gov.cn/" },
  { city: "沧州市", name: "海兴县", url: "http://www.haixing.gov.cn/" },
  { city: "沧州市", name: "吴桥县", url: "http://www.wuqiao.gov.cn/" },
  { city: "沧州市", name: "泊头市", url: "http://www.botou.gov.cn/" },
  // 廊坊
  { city: "廊坊市", name: "香河县", url: "http://www.xianghe.gov.cn/" },
  { city: "廊坊市", name: "文安县", url: "http://www.wenan.gov.cn/" },
  // 衡水 (ALL are homepage-only)
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
  // 唐山
  { city: "唐山市", name: "滦南县", url: "http://www.luannan.gov.cn/" },
  { city: "唐山市", name: "迁西县", url: "http://www.qianxi.gov.cn/" },
];

// Common fiscal sub-paths to try on each homepage domain
const FISCAL_SUBPATHS = [
  // 专题专栏 pattern (邯郸市 style)
  "/ztzl/czyjs/",
  "/ztlm/czyjs/",
  // 政务公开 pattern
  "/zwgk/czyjszl/",
  "/zwgk/czzj/",
  "/zwgk/czxx/",
  "/zwgk/zdly/czzj/",
  "/zwgk/zdlyxxgk/czyjshsgjf/",
  // 政府信息公开 pattern
  "/zfxxgk/fdzdgknr/czyjsgk/",
  "/zfxxgk/fdzdgknr/czyjs/",
  "/zfxxgk/fdzdgknr/czxx/",
  "/zfxxgk/czxx/",
  // Special patterns found in Hebei
  "/__sys_block__/czyjs.html",
  "/czyjs/",
  "/czyjs.html",
  "/yjs",
  "/plugin/zfyjs",
  "/czysindex.html",
  "/cms/index/czyjs.html",
  "/list-czwyjszl.html",
  "/xxgk/czyjs.jsp",
  "/zhengfuyusuan.html",
  "/yusuan/",
  // Tangshan CMS pattern
  "/columns/zhuzhan/tsczxx/index.html",
  // Cangzhou CMS patterns
  "/c100153/YuJueSuan.shtml",
  // col-based CMS patterns (承德 style)
  "/col/col4515/index.html",
  "/col/col5414/index.html",
  "/col/col10261/index.html",
  // 沧州 county patterns
  "/czyjsgkzl/YuJueSuan.shtml",
  "/czyjs/newslist_czyjs.shtml",
  "/c104002/listCollect.shtml",
  "/c117956/YuJueSuan.shtml",
  "/c118785/czyjs.shtml",
  "/c118362/YuJueSuan.shtml",
  "/c120223/YuJueSuan.shtml",
  "/c116975/YuJueSuan.shtml",
  "/c119480/listDisplaySon.shtml",
  "/czyjs/YuJueSuan.shtml",
  "/czyjss/index.html",
  "/yjsgk/index.html",
  "/ytczxx/index.html",
  // Hebei common patterns
  "/publicity/qzfxx/czyjs/",
  "/caizhengyujuesuangongkai/",
];

// Budget keywords for scoring
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
    [/预算执行/g, 2],
    [/预算草案/g, 2],
    [/财政预决算/g, 5],
    [/预算信息公开/g, 4],
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
        timeout: timeout,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "zh-CN,zh;q=0.9",
        },
        rejectUnauthorized: false,
      }, (res) => {
        // Handle redirects
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          clearTimeout(timer);
          const location = res.headers.location;
          if (location) {
            let redirectUrl = location;
            if (redirectUrl.startsWith("/")) {
              const u = new URL(url);
              redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
            }
            // Follow one redirect
            const mod2 = redirectUrl.startsWith("https") ? https : http;
            const req2 = mod2.get(redirectUrl, {
              timeout: timeout,
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "zh-CN,zh;q=0.9",
              },
              rejectUnauthorized: false,
            }, (res2) => {
              let body = "";
              res2.setEncoding("utf-8");
              res2.on("data", (d) => { body += d; if (body.length > 200000) res2.destroy(); });
              res2.on("end", () => resolve({ status: res2.statusCode, body, url: redirectUrl }));
              res2.on("error", () => resolve({ status: res2.statusCode, body, url: redirectUrl }));
            });
            req2.on("error", (e) => { clearTimeout(timer); resolve({ error: e.code || e.message }); });
            req2.on("timeout", () => { req2.destroy(); resolve({ error: "TIMEOUT" }); });
          } else {
            resolve({ status: res.statusCode, body: "", url });
          }
          return;
        }

        if (res.statusCode !== 200) {
          clearTimeout(timer);
          resolve({ status: res.statusCode, body: "", url });
          return;
        }

        let body = "";
        res.setEncoding("utf-8");
        res.on("data", (d) => { body += d; if (body.length > 200000) res.destroy(); });
        res.on("end", () => { clearTimeout(timer); resolve({ status: 200, body, url }); });
        res.on("error", () => { clearTimeout(timer); resolve({ status: 200, body, url }); });
      });
      req.on("error", (e) => { clearTimeout(timer); resolve({ error: e.code || e.message }); });
      req.on("timeout", () => { req.destroy(); });
    } catch (e) {
      clearTimeout(timer);
      resolve({ error: e.message });
    }
  });
}

// Extract links from HTML that contain fiscal keywords
function extractFiscalLinks(html, baseUrl) {
  const links = [];
  // Match <a> tags with href
  const linkRegex = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (/预[算决]|财政|czyjs|czyjsgk|czyjszl|czzj|czxx|YuJueSuan|yjsgk|预决算/.test(text + href)) {
      let fullUrl = href;
      if (href.startsWith("/")) {
        try {
          const u = new URL(baseUrl);
          fullUrl = `${u.protocol}//${u.host}${href}`;
        } catch { continue; }
      } else if (!href.startsWith("http")) {
        continue;
      }
      // Filter out national/provincial sites
      if (/mof\.gov\.cn|www\.gov\.cn|hebei\.gov\.cn|hbzwfw|javascript/i.test(fullUrl)) continue;
      links.push({ url: fullUrl, text });
    }
  }
  return links;
}

async function runBatch(items, fn, concurrency = CONCURRENCY) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

// ─── Task 1: Upgrade homepage-only URLs ───
async function upgradeHomepageUrls() {
  console.log("═══ TASK 1: Upgrading homepage-only URLs to fiscal pages ═══\n");
  const results = [];

  await runBatch(HOMEPAGE_ONLY, async (entry) => {
    const { city, name, url } = entry;
    const baseUrl = url.replace(/\/$/, "");
    let bestUrl = null;
    let bestScore = 0;

    // Phase 1: Try common fiscal sub-paths
    const subpathResults = await runBatch(
      FISCAL_SUBPATHS.map(p => `${baseUrl}${p}`),
      async (candidateUrl) => {
        const res = await fetchUrl(candidateUrl, 6000);
        if (res.error || res.status !== 200 || !res.body || res.body.length < 500) return null;
        const score = scoreFiscalContent(res.body);
        if (score >= 3) return { url: candidateUrl, score };
        return null;
      },
      8
    );

    for (const r of subpathResults) {
      if (r && r.score > bestScore) {
        bestScore = r.score;
        bestUrl = r.url;
      }
    }

    // Phase 2: If no sub-path found, crawl homepage for fiscal links
    if (!bestUrl) {
      const homeRes = await fetchUrl(url, 8000);
      if (!homeRes.error && homeRes.status === 200 && homeRes.body) {
        const fiscalLinks = extractFiscalLinks(homeRes.body, url);
        for (const link of fiscalLinks.slice(0, 5)) {
          const linkRes = await fetchUrl(link.url, 6000);
          if (!linkRes.error && linkRes.status === 200 && linkRes.body) {
            const score = scoreFiscalContent(linkRes.body);
            if (score > bestScore) {
              bestScore = score;
              bestUrl = link.url;
            }
          }
        }
      }
    }

    const status = bestUrl ? "FOUND" : "NOT_FOUND";
    const result = { city, name, oldUrl: url, newUrl: bestUrl || url, score: bestScore, status };
    results.push(result);

    if (bestUrl) {
      console.log(`✅ ${city} ${name}: ${bestUrl} (score=${bestScore})`);
    } else {
      console.log(`❌ ${city} ${name}: No fiscal page found on ${url}`);
    }
  }, 3);

  return results;
}

// ─── Task 2: Missing URLs (empty entries) ───
// Only key cities and counties with empty URLs
const MISSING_ENTRIES = [
  // City level
  { city: "河北省", name: "保定市", domain: "baoding.gov.cn", guesses: [
    "https://czj.baoding.gov.cn/", "http://czj.baoding.gov.cn/",
    "https://www.baoding.gov.cn/zwgk/czzj/", "https://www.baoding.gov.cn/zwgk/czxx/",
    "https://www.baoding.gov.cn/zwgk/czyjszl/", "https://www.baoding.gov.cn/zwgk/zdly/czzj/",
    "https://www.baoding.gov.cn/zfxxgk/fdzdgknr/czyjsgk/",
    "https://www.baoding.gov.cn/zfxxgk/fdzdgknr/czyjs/",
  ]},
  { city: "河北省", name: "秦皇岛市", domain: "qhd.gov.cn", guesses: [
    "https://czj.qhd.gov.cn/", "http://czj.qhd.gov.cn/",
    "https://www.qhd.gov.cn/zwgk/czzj/", "https://www.qhd.gov.cn/zwgk/czyjszl/",
    "https://www.qhd.gov.cn/zfxxgk/fdzdgknr/czyjs/",
    "http://www.qhd.gov.cn/col/col4280/index.html",
    "http://www.qhd.gov.cn/col/col13896/index.html",
  ]},
  // 石家庄 counties (all empty)
  { city: "石家庄市", name: "长安区", domain: "sjzca.gov.cn", guesses: [
    "http://www.sjzca.gov.cn/", "https://www.sjzca.gov.cn/",
    "http://www.sjzca.gov.cn/__sys_block__/czyjs.html",
    "http://www.sjzca.gov.cn/czyjs/", "http://www.sjzca.gov.cn/zwgk/czyjszl/",
  ]},
  { city: "石家庄市", name: "桥西区", domain: "sjzqx.gov.cn", guesses: [
    "http://www.sjzqx.gov.cn/", "https://www.sjzqx.gov.cn/",
    "http://www.sjzqx.gov.cn/__sys_block__/czyjs.html",
    "http://www.sjzqx.gov.cn/czyjs/", "http://www.sjzqx.gov.cn/zwgk/czyjszl/",
  ]},
  { city: "石家庄市", name: "新华区", domain: "sjzxhq.gov.cn", guesses: [
    "http://www.sjzxhq.gov.cn/", "https://www.sjzxhq.gov.cn/",
    "http://www.sjzxhq.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "井陉矿区", domain: "jxkq.gov.cn", guesses: [
    "http://www.jxkq.gov.cn/", "http://www.jxkq.gov.cn/__sys_block__/czyjs.html",
    "http://www.sjzjxkq.gov.cn/", "http://www.jingxingkuangqu.gov.cn/",
  ]},
  { city: "石家庄市", name: "裕华区", domain: "sjzyh.gov.cn", guesses: [
    "http://www.sjzyh.gov.cn/", "http://www.sjzyuhua.gov.cn/",
    "http://www.sjzyh.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "藁城区", domain: "gaocheng.gov.cn", guesses: [
    "http://www.gaocheng.gov.cn/", "https://www.gaocheng.gov.cn/",
    "http://www.gaocheng.gov.cn/__sys_block__/czyjs.html",
    "http://www.gaocheng.gov.cn/czyjs/",
  ]},
  { city: "石家庄市", name: "鹿泉区", domain: "luquan.gov.cn", guesses: [
    "http://www.luquan.gov.cn/", "https://www.luquan.gov.cn/",
    "http://www.luquan.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "栾城区", domain: "luancheng.gov.cn", guesses: [
    "http://www.luancheng.gov.cn/", "https://www.luancheng.gov.cn/",
    "http://www.luancheng.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "井陉县", domain: "jingxing.gov.cn", guesses: [
    "http://www.jingxing.gov.cn/", "https://www.jingxing.gov.cn/",
    "http://www.jingxing.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "正定县", domain: "zhengding.gov.cn", guesses: [
    "http://www.zhengding.gov.cn/", "https://www.zhengding.gov.cn/",
    "http://www.zhengding.gov.cn/__sys_block__/czyjs.html",
    "http://www.zhengding.gov.cn/czyjs/",
  ]},
  { city: "石家庄市", name: "行唐县", domain: "xingtang.gov.cn", guesses: [
    "http://www.xingtang.gov.cn/", "https://www.xingtang.gov.cn/",
    "http://www.xingtang.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "灵寿县", domain: "lingshou.gov.cn", guesses: [
    "http://www.lingshou.gov.cn/", "http://www.lingshou.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "高邑县", domain: "gaoyi.gov.cn", guesses: [
    "http://www.gaoyi.gov.cn/", "http://www.gaoyi.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "深泽县", domain: "shenze.gov.cn", guesses: [
    "http://www.shenze.gov.cn/", "http://www.shenze.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "赞皇县", domain: "zanhuang.gov.cn", guesses: [
    "http://www.zanhuang.gov.cn/", "http://www.zanhuang.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "无极县", domain: "wuji.gov.cn", guesses: [
    "http://www.wuji.gov.cn/", "http://www.wuji.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "元氏县", domain: "yuanshi.gov.cn", guesses: [
    "http://www.yuanshi.gov.cn/", "http://www.yuanshi.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "赵县", domain: "zhaoxian.gov.cn", guesses: [
    "http://www.zhaoxian.gov.cn/", "http://www.zhaoxian.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "辛集市", domain: "xinji.gov.cn", guesses: [
    "http://www.xinji.gov.cn/", "https://www.xinji.gov.cn/",
    "http://www.xinji.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "石家庄市", name: "晋州市", domain: "jinzhou.gov.cn", guesses: [
    "http://www.jinzhou.gov.cn/", "http://www.sjzjinzhou.gov.cn/",
    "http://www.jinzhoushi.gov.cn/",
  ]},
  { city: "石家庄市", name: "新乐市", domain: "xinle.gov.cn", guesses: [
    "http://www.xinle.gov.cn/", "http://www.xinle.gov.cn/__sys_block__/czyjs.html",
  ]},
  // 唐山 missing
  { city: "唐山市", name: "路南区", domain: "tsln.gov.cn", guesses: [
    "http://www.tsln.gov.cn/", "http://www.tsln.gov.cn/__sys_block__/czyjs.html",
    "https://www.tsln.gov.cn/tsln/czyjss/index.html",
  ]},
  { city: "唐山市", name: "古冶区", domain: "guye.gov.cn", guesses: [
    "http://www.guye.gov.cn/", "https://www.guye.gov.cn/guye/czyjss/index.html",
  ]},
  { city: "唐山市", name: "开平区", domain: "tskp.gov.cn", guesses: [
    "http://www.tskp.gov.cn/", "https://www.tskp.gov.cn/tskp/czyjss/index.html",
  ]},
  { city: "唐山市", name: "丰南区", domain: "fengnan.gov.cn", guesses: [
    "http://www.fengnan.gov.cn/", "https://www.fengnan.gov.cn/fengnan/czyjss/index.html",
    "https://www.fengnan.gov.cn/fengnan/yjsgk/index.html",
  ]},
  { city: "唐山市", name: "丰润区", domain: "fengrun.gov.cn", guesses: [
    "http://www.fengrun.gov.cn/", "https://www.fengrun.gov.cn/fengrun/czyjss/index.html",
  ]},
  { city: "唐山市", name: "遵化市", domain: "zunhua.gov.cn", guesses: [
    "http://www.zunhua.gov.cn/", "https://www.zunhua.gov.cn/zunhua/czyjss/index.html",
    "https://www.zunhua.gov.cn/zunhua/yjsgk/index.html",
  ]},
  { city: "唐山市", name: "迁安市", domain: "qianan.gov.cn", guesses: [
    "http://www.qianan.gov.cn/", "https://www.qianan.gov.cn/qianan/czyjss/index.html",
  ]},
  { city: "唐山市", name: "滦州市", domain: "luanzhou.gov.cn", guesses: [
    "http://www.luanzhou.gov.cn/", "https://www.luanzhou.gov.cn/luanzhou/czyjss/index.html",
    "https://www.luanzhou.gov.cn/luanzhou/yjsgk/index.html",
  ]},
  // 秦皇岛 missing
  { city: "秦皇岛市", name: "海港区", domain: "hgq.qhd.gov.cn", guesses: [
    "http://hgq.qhd.gov.cn/", "http://www.hgq.gov.cn/",
  ]},
  { city: "秦皇岛市", name: "山海关区", domain: "shanhaiguan.gov.cn", guesses: [
    "http://www.shanhaiguan.gov.cn/", "http://www.shanhaiguan.gov.cn/__sys_block__/czyjs.html",
    "http://www.shanhaiguan.gov.cn/czyjs/",
  ]},
  { city: "秦皇岛市", name: "抚宁区", domain: "funing.gov.cn", guesses: [
    "http://www.funing.gov.cn/", "http://www.qhdfn.gov.cn/",
  ]},
  { city: "秦皇岛市", name: "青龙满族自治县", domain: "qinglong.gov.cn", guesses: [
    "http://www.qinglong.gov.cn/", "http://www.hbqinglong.gov.cn/",
  ]},
  { city: "秦皇岛市", name: "昌黎县", domain: "changli.gov.cn", guesses: [
    "http://www.changli.gov.cn/", "https://www.changli.gov.cn/",
  ]},
  { city: "秦皇岛市", name: "卢龙县", domain: "lulong.gov.cn", guesses: [
    "http://www.lulong.gov.cn/", "https://www.lulong.gov.cn/",
  ]},
  // 邯郸 missing
  { city: "邯郸市", name: "丛台区", domain: "congtai.gov.cn", guesses: [
    "http://www.congtai.gov.cn/", "http://www.congtai.gov.cn/ztzl/czyjs/",
    "http://www.congtai.gov.cn/ztlm/czyjs/",
  ]},
  { city: "邯郸市", name: "峰峰矿区", domain: "fengfeng.gov.cn", guesses: [
    "http://www.fengfeng.gov.cn/", "http://www.fengfeng.gov.cn/ztzl/czyjs/",
  ]},
  { city: "邯郸市", name: "肥乡区", domain: "feixiang.gov.cn", guesses: [
    "http://www.feixiang.gov.cn/", "http://www.feixiang.gov.cn/ztzl/czyjs/",
  ]},
  { city: "邯郸市", name: "永年区", domain: "yongnian.gov.cn", guesses: [
    "http://www.yongnian.gov.cn/", "http://www.yongnian.gov.cn/ztzl/czyjs/",
  ]},
  { city: "邯郸市", name: "成安县", domain: "chengan.gov.cn", guesses: [
    "http://www.chengan.gov.cn/", "http://www.chengan.gov.cn/ztzl/czyjs/",
  ]},
  { city: "邯郸市", name: "广平县", domain: "guangping.gov.cn", guesses: [
    "http://www.guangping.gov.cn/", "http://www.guangping.gov.cn/ztzl/czyjs/",
  ]},
  { city: "邯郸市", name: "魏县", domain: "hbweixian.gov.cn", guesses: [
    "http://www.hbweixian.gov.cn/", "http://www.hbweixian.gov.cn/ztzl/czyjs/",
    "http://www.hdweixian.gov.cn/",
  ]},
  { city: "邯郸市", name: "曲周县", domain: "quzhou.gov.cn", guesses: [
    "http://www.hdquzhou.gov.cn/", "http://www.quzhou.gov.cn/",
    "http://www.quzhouxian.gov.cn/",
  ]},
  // 邢台 missing
  { city: "邢台市", name: "信都区", domain: "xindu.gov.cn", guesses: [
    "http://www.xindu.gov.cn/", "http://www.xtxd.gov.cn/",
    "http://www.xtxindu.gov.cn/",
  ]},
  { city: "邢台市", name: "内丘县", domain: "neiqiu.gov.cn", guesses: [
    "http://www.neiqiu.gov.cn/", "http://www.neiqiu.gov.cn/__sys_block__/czyjs.html",
    "http://www.neiqiu.gov.cn/xxgk/czyjs.jsp",
  ]},
  { city: "邢台市", name: "柏乡县", domain: "baixiang.gov.cn", guesses: [
    "http://www.baixiang.gov.cn/", "http://www.baixiang.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "邢台市", name: "新河县", domain: "xinhe.gov.cn", guesses: [
    "http://www.xinhe.gov.cn/", "http://www.hbxinhe.gov.cn/",
    "http://www.xinhe.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "邢台市", name: "广宗县", domain: "guangzong.gov.cn", guesses: [
    "http://www.guangzong.gov.cn/", "http://www.guangzong.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "邢台市", name: "清河县", domain: "qinghe.gov.cn", guesses: [
    "http://www.qinghe.gov.cn/", "http://www.hbqinghe.gov.cn/",
    "http://www.qinghe.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "邢台市", name: "沙河市", domain: "shahe.gov.cn", guesses: [
    "http://www.shahe.gov.cn/", "http://www.shahe.gov.cn/__sys_block__/czyjs.html",
  ]},
  // 保定 missing
  { city: "保定市", name: "清苑区", domain: "qingyuan.gov.cn", guesses: [
    "http://www.bdqy.gov.cn/", "http://www.bdqingyuan.gov.cn/",
  ]},
  { city: "保定市", name: "阜平县", domain: "fuping.gov.cn", guesses: [
    "http://www.hbfuping.gov.cn/", "http://www.bdfuping.gov.cn/",
  ]},
  { city: "保定市", name: "定兴县", domain: "dingxing.gov.cn", guesses: [
    "http://www.dingxing.gov.cn/", "http://www.dingxing.gov.cn/czyjs/",
    "http://www.dingxing.gov.cn/czyjs.html",
  ]},
  { city: "保定市", name: "容城县", domain: "rongcheng.gov.cn", guesses: [
    "http://www.bdrongcheng.gov.cn/", "http://www.rongchengxian.gov.cn/",
  ]},
  { city: "保定市", name: "安新县", domain: "anxin.gov.cn", guesses: [
    "http://www.anxin.gov.cn/", "http://www.anxin.gov.cn/czyjs/",
  ]},
  { city: "保定市", name: "易县", domain: "yixian.gov.cn", guesses: [
    "http://www.yixian.gov.cn/", "http://www.hbyixian.gov.cn/",
    "http://www.yixian.gov.cn/czyjs/",
  ]},
  { city: "保定市", name: "顺平县", domain: "shunping.gov.cn", guesses: [
    "http://www.shunping.gov.cn/", "http://www.shunping.gov.cn/czyjs/",
  ]},
  { city: "保定市", name: "博野县", domain: "boye.gov.cn", guesses: [
    "http://www.boye.gov.cn/", "http://www.boye.gov.cn/czyjs/",
  ]},
  { city: "保定市", name: "定州市", domain: "dingzhou.gov.cn", guesses: [
    "http://www.dingzhou.gov.cn/", "https://www.dingzhou.gov.cn/",
    "http://www.dingzhou.gov.cn/czyjs/",
  ]},
  // 张家口 missing
  { city: "张家口市", name: "桥西区", domain: "zjkqx.gov.cn", guesses: [
    "http://www.zjkqx.gov.cn/", "http://www.zjkqx.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "张家口市", name: "宣化区", domain: "xuanhua.gov.cn", guesses: [
    "http://www.xuanhua.gov.cn/", "http://www.xuanhua.gov.cn/__sys_block__/czyjs.html",
    "http://www.xuanhua.gov.cn/xxgk/czyjs.jsp",
  ]},
  { city: "张家口市", name: "下花园区", domain: "xiahuayuan.gov.cn", guesses: [
    "http://www.xiahuayuan.gov.cn/", "http://www.xiahuayuan.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "张家口市", name: "万全区", domain: "wanquan.gov.cn", guesses: [
    "http://www.wanquan.gov.cn/", "http://www.wanquan.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "张家口市", name: "崇礼区", domain: "chongli.gov.cn", guesses: [
    "http://www.chongli.gov.cn/", "http://www.chongli.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "张家口市", name: "张北县", domain: "zhangbei.gov.cn", guesses: [
    "http://www.zhangbei.gov.cn/", "http://www.zhangbei.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "张家口市", name: "康保县", domain: "kangbao.gov.cn", guesses: [
    "http://www.kangbao.gov.cn/", "http://www.kangbao.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "张家口市", name: "沽源县", domain: "guyuan.gov.cn", guesses: [
    "http://www.hbguyuan.gov.cn/", "http://www.guyuan.gov.cn/",
  ]},
  { city: "张家口市", name: "尚义县", domain: "shangyi.gov.cn", guesses: [
    "http://www.shangyi.gov.cn/", "http://www.shangyi.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "张家口市", name: "蔚县", domain: "yuxian.gov.cn", guesses: [
    "http://www.yuxian.gov.cn/", "http://www.yuxian.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "张家口市", name: "阳原县", domain: "yangyuan.gov.cn", guesses: [
    "http://www.yangyuan.gov.cn/", "http://www.yangyuan.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "张家口市", name: "怀安县", domain: "huaian.gov.cn", guesses: [
    "http://www.zjkhuaian.gov.cn/", "http://www.hbhuaian.gov.cn/",
  ]},
  { city: "张家口市", name: "涿鹿县", domain: "zhuolu.gov.cn", guesses: [
    "http://www.zhuolu.gov.cn/", "http://www.zhuolu.gov.cn/__sys_block__/czyjs.html",
    "http://www.zhuolu.gov.cn/xxgk/czyjs.jsp",
  ]},
  { city: "张家口市", name: "赤城县", domain: "chicheng.gov.cn", guesses: [
    "http://www.chicheng.gov.cn/", "http://www.chicheng.gov.cn/__sys_block__/czyjs.html",
  ]},
  // 承德 missing
  { city: "承德市", name: "双桥区", domain: "sqq.gov.cn", guesses: [
    "http://www.sqq.gov.cn/", "http://www.sqq.gov.cn/__sys_block__/czyjs.html",
    "http://sqq.chengde.gov.cn/",
  ]},
  { city: "承德市", name: "双滦区", domain: "slq.gov.cn", guesses: [
    "http://www.slq.gov.cn/", "http://www.slq.gov.cn/__sys_block__/czyjs.html",
    "http://slq.chengde.gov.cn/",
  ]},
  { city: "承德市", name: "兴隆县", domain: "hbxl.gov.cn", guesses: [
    "http://www.hbxl.gov.cn/", "http://www.hbxl.gov.cn/__sys_block__/czyjs.html",
    "http://www.hbxl.gov.cn/xxgk/czyjs.jsp",
  ]},
  { city: "承德市", name: "滦平县", domain: "lpx.gov.cn", guesses: [
    "http://www.lpx.gov.cn/", "https://www.lpx.gov.cn/",
    "http://www.lpx.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "承德市", name: "隆化县", domain: "hebeilonghua.gov.cn", guesses: [
    "http://www.hebeilonghua.gov.cn/", "https://www.hebeilonghua.gov.cn/",
    "http://www.hebeilonghua.gov.cn/__sys_block__/czyjs.html",
  ]},
  { city: "承德市", name: "宽城满族自治县", domain: "hbkc.gov.cn", guesses: [
    "http://www.hbkc.gov.cn/", "https://www.hbkc.gov.cn/",
    "http://www.hbkc.gov.cn/__sys_block__/czyjs.html",
  ]},
  // 沧州 missing
  { city: "沧州市", name: "盐山县", domain: "hbyanshan.gov.cn", guesses: [
    "http://www.hbyanshan.gov.cn/", "http://www.hbyanshan.gov.cn/czyjs/",
    "https://www.hbyanshan.gov.cn/hbyanshan/czyjs/YuJueSuan.shtml",
  ]},
  // 廊坊 missing
  { city: "廊坊市", name: "固安县", domain: "guan.gov.cn", guesses: [
    "http://www.guan.gov.cn/", "https://www.guan.gov.cn/",
    "http://www.guan.gov.cn/czyjs/",
  ]},
  { city: "廊坊市", name: "大厂回族自治县", domain: "dachang.gov.cn", guesses: [
    "http://www.dachang.gov.cn/", "https://www.dachang.gov.cn/",
    "http://www.dachang.gov.cn/czyjs/",
  ]},
  { city: "廊坊市", name: "三河市", domain: "sanhe.gov.cn", guesses: [
    "http://www.sanhe.gov.cn/", "https://www.sanhe.gov.cn/",
    "http://www.sanhe.gov.cn/czyjs/",
  ]},
  // 衡水 missing
  { city: "衡水市", name: "阜城县", domain: "fucheng.gov.cn", guesses: [
    "http://www.fucheng.gov.cn/", "http://www.hsfucheng.gov.cn/",
  ]},
];

async function discoverMissingUrls() {
  console.log("\n═══ TASK 2: Discovering missing URLs ═══\n");
  const results = [];

  await runBatch(MISSING_ENTRIES, async (entry) => {
    const { city, name, guesses } = entry;
    let bestUrl = null;
    let bestScore = 0;
    let homepageUrl = null;

    // Phase 1: Try all guessed URLs
    for (const guess of guesses) {
      const res = await fetchUrl(guess, 6000);
      if (res.error || !res.body) continue;
      if (res.status !== 200) continue;

      // Check if the page title matches the expected location
      const titleMatch = res.body.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "";

      // If this is just a homepage, save it for Phase 2
      if (guess.endsWith("/") || guess.endsWith(".cn")) {
        if (!homepageUrl) homepageUrl = guess;
      }

      const score = scoreFiscalContent(res.body);
      if (score > bestScore) {
        bestScore = score;
        bestUrl = guess;
      }
    }

    // Phase 2: If we found a homepage but no fiscal page, try sub-paths
    if (bestScore < 3 && homepageUrl) {
      const baseUrl = homepageUrl.replace(/\/$/, "");
      const subpaths = FISCAL_SUBPATHS.slice(0, 25); // Try the most common ones
      for (const sp of subpaths) {
        const candidateUrl = `${baseUrl}${sp}`;
        const res = await fetchUrl(candidateUrl, 5000);
        if (res.error || res.status !== 200 || !res.body || res.body.length < 500) continue;
        const score = scoreFiscalContent(res.body);
        if (score > bestScore) {
          bestScore = score;
          bestUrl = candidateUrl;
        }
      }

      // Phase 3: Crawl homepage for fiscal links
      if (bestScore < 3) {
        const homeRes = await fetchUrl(homepageUrl, 8000);
        if (!homeRes.error && homeRes.body) {
          const fiscalLinks = extractFiscalLinks(homeRes.body, homepageUrl);
          for (const link of fiscalLinks.slice(0, 5)) {
            const linkRes = await fetchUrl(link.url, 6000);
            if (!linkRes.error && linkRes.status === 200 && linkRes.body) {
              const score = scoreFiscalContent(linkRes.body);
              if (score > bestScore) {
                bestScore = score;
                bestUrl = link.url;
              }
            }
          }
        }
      }
    }

    const status = bestScore >= 3 ? "FOUND" : (homepageUrl ? "HOMEPAGE_ONLY" : "NOT_FOUND");
    const result = { city, name, url: bestUrl, homepage: homepageUrl, score: bestScore, status };
    results.push(result);

    if (status === "FOUND") {
      console.log(`✅ ${city} ${name}: ${bestUrl} (score=${bestScore})`);
    } else if (status === "HOMEPAGE_ONLY") {
      console.log(`🏠 ${city} ${name}: Homepage found (${homepageUrl}) but no fiscal page`);
    } else {
      console.log(`❌ ${city} ${name}: No site found`);
    }
  }, 3);

  return results;
}

async function main() {
  console.log("Hebei Deep Check — Starting...\n");
  console.log(`Time: ${new Date().toISOString()}\n`);

  const task1Results = await upgradeHomepageUrls();
  const task2Results = await discoverMissingUrls();

  // Summary
  console.log("\n\n═══════════════════════════════════════");
  console.log("SUMMARY");
  console.log("═══════════════════════════════════════\n");

  const t1Found = task1Results.filter(r => r.status === "FOUND");
  const t1NotFound = task1Results.filter(r => r.status !== "FOUND");
  console.log(`Task 1 (Homepage Upgrades): ${t1Found.length} upgraded, ${t1NotFound.length} still homepage-only`);

  const t2Found = task2Results.filter(r => r.status === "FOUND");
  const t2Homepage = task2Results.filter(r => r.status === "HOMEPAGE_ONLY");
  const t2NotFound = task2Results.filter(r => r.status === "NOT_FOUND");
  console.log(`Task 2 (Missing URLs): ${t2Found.length} found, ${t2Homepage.length} homepage-only, ${t2NotFound.length} not found`);

  // Output actionable results as JSON
  console.log("\n\n═══ ACTIONABLE RESULTS (JSON) ═══\n");

  const actions = [];
  for (const r of t1Found) {
    actions.push({ action: "UPGRADE", city: r.city, name: r.name, from: r.oldUrl, to: r.newUrl, score: r.score });
  }
  for (const r of t1NotFound) {
    actions.push({ action: "CLEAR", city: r.city, name: r.name, from: r.oldUrl, reason: "homepage-only, no fiscal page found" });
  }
  for (const r of t2Found) {
    actions.push({ action: "ADD", city: r.city, name: r.name, url: r.url, score: r.score });
  }
  for (const r of t2Homepage) {
    actions.push({ action: "HOMEPAGE", city: r.city, name: r.name, homepage: r.homepage, reason: "homepage found but no fiscal page" });
  }

  console.log(JSON.stringify(actions, null, 2));
}

main().catch(console.error);
