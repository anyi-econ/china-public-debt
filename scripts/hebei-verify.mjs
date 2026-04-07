import https from "https";
import http from "http";

function getPage(url, timeout = 10000) {
  return new Promise((resolve) => {
    const mod = url.startsWith("https") ? https : http;
    try {
      const req = mod.get(
        url,
        { timeout, headers: { "User-Agent": "Mozilla/5.0" } },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const loc = res.headers.location;
            const abs = loc.startsWith("http") ? loc : new URL(loc, url).href;
            return getPage(abs, timeout).then(resolve);
          }
          let data = "";
          res.on("data", (d) => (data += d));
          res.on("end", () => resolve({ url, status: res.statusCode, body: data }));
        }
      );
      req.on("error", () => resolve({ url, status: 0, body: "", error: "error" }));
      req.on("timeout", () => { req.destroy(); resolve({ url, status: 0, body: "", error: "timeout" }); });
    } catch (e) {
      resolve({ url, status: 0, body: "", error: e.message });
    }
  });
}

const toVerify = [
  { county: "平乡县", city: "邢台市", url: "https://www.pingxiangxian.gov.cn/__sys_block__/czyjs.html" },
  { county: "下花园区", city: "张家口市", url: "http://www.zjkxhy.gov.cn/info/czyjs.jsp" },
  { county: "崇礼区", city: "张家口市", url: "http://www.zjkcl.gov.cn/xxgk/czyjs.thtml" },
  { county: "张北县", city: "张家口市", url: "http://www.zjkzb.gov.cn/xxgk/czyjs.thtml" },
  { county: "康保县", city: "张家口市", url: "http://www.zjkkb.gov.cn/xxgk/czyjs.thtml" },
  { county: "蔚县", city: "张家口市", url: "http://www.zjkyx.gov.cn/xxgk/czyjs.thtml" },
  { county: "阳原县", city: "张家口市", url: "http://www.zjkyy.gov.cn/xxgk/czyjs.jsp" },
  { county: "怀安县", city: "张家口市", url: "http://www.zjkha.gov.cn/info/czyjs.jsp" },
  { county: "赤城县", city: "张家口市", url: "http://www.ccx.gov.cn/xxgk/czyjs.jsp" },
  { county: "信都区", city: "邢台市", url: "http://www.xinduqu.gov.cn/xxgk/czyjs.jsp" },
  { county: "内丘县", city: "邢台市", url: "http://www.hbnq.gov.cn/xxgk/czyjs.jsp" },
  { county: "柏乡县", city: "邢台市", url: "http://www.baixiangxian.gov.cn/__sys_block__/czyjs.html" },
  { county: "广宗县", city: "邢台市", url: "http://www.gzx.gov.cn/xxgk/czyjs.jsp" },
];

const needFiscal = [
  { county: "桥西区", city: "张家口市", domain: "www.zjkqxq.gov.cn" },
  { county: "宣化区", city: "张家口市", domain: "www.zjkxuanhua.gov.cn" },
  { county: "万全区", city: "张家口市", domain: "www.zjkwq.gov.cn" },
  { county: "沽源县", city: "张家口市", domain: "www.zjkgy.gov.cn" },
  { county: "尚义县", city: "张家口市", domain: "www.zjksy.gov.cn" },
  { county: "涿鹿县", city: "张家口市", domain: "www.zjkzl.gov.cn" },
  { county: "清河县", city: "邢台市", domain: "www.qinghexian.gov.cn" },
  { county: "清苑区", city: "保定市", domain: "www.qingyuanqu.gov.cn" },
  { county: "阜平县", city: "保定市", domain: "www.bdfuping.gov.cn" },
  { county: "易县", city: "保定市", domain: "www.bdyixian.gov.cn" },
  { county: "顺平县", city: "保定市", domain: "www.shunping.gov.cn" },
  { county: "隆化县", city: "承德市", domain: "www.hebeilonghua.gov.cn" },
  { county: "盐山县", city: "沧州市", domain: "www.chinayanshan.gov.cn" },
];

const extraPaths = [
  "/xxgk/czyjs.thtml", "/xxgk/czyjs.jsp", "/info/czyjs.jsp", "/info/czyjs.thtml",
  "/__sys_block__/czyjs.html", "/czysindex.html", "/zwgk/czyjsgk/",
  "/zfxxgk/fdzdgknr/czyjs/", "/czyjs/", "/zwgk/czyjszl/",
  "/xxgk/czysindex.html", "/zwgk/xxgk/czyjs/",
  "/content/czyjs/12.html", "/content/czyjs/13.html",
];

const KW = ["预算", "决算", "预决算", "财政"];
function sc(body) {
  let s = 0;
  for (const k of KW) s += (body.match(new RegExp(k, "g")) || []).length;
  return s;
}

const CONC = 8;
async function runBatch(tasks, c) {
  const res = [];
  let idx = 0;
  async function w() { while (idx < tasks.length) { const i = idx++; res[i] = await tasks[i](); } }
  await Promise.all(Array.from({ length: c }, () => w()));
  return res;
}

async function main() {
  console.log("=== Phase 1: Verify discovered URLs ===\n");
  const vTasks = toVerify.map((v) => () => getPage(v.url, 12000));
  const vRes = await runBatch(vTasks, CONC);
  const confirmed = [];
  for (let i = 0; i < toVerify.length; i++) {
    const v = toVerify[i];
    const r = vRes[i];
    const s = r.status === 200 ? sc(r.body) : 0;
    const ok = s >= 3;
    console.log((ok ? "OK " : "FAIL ") + v.city + " " + v.county + ": " + v.url + " (status=" + r.status + " score=" + s + ")");
    if (ok) confirmed.push({ county: v.county, city: v.city, url: v.url, score: s });
  }

  console.log("\n=== Phase 2: Try extra patterns ===\n");
  const allChecks = [];
  for (const e of needFiscal) {
    for (const p of extraPaths) {
      allChecks.push({ ...e, url: "http://" + e.domain + p });
    }
  }
  console.log("Trying " + allChecks.length + " URLs...\n");
  const cTasks = allChecks.map((c) => () => getPage(c.url, 10000));
  const cRes = await runBatch(cTasks, CONC);
  const extra = {};
  for (let i = 0; i < allChecks.length; i++) {
    const c = allChecks[i];
    const r = cRes[i];
    if (r.status === 200) {
      const s = sc(r.body);
      if (s >= 3 && (!extra[c.county] || s > extra[c.county].score)) {
        extra[c.county] = { county: c.county, city: c.city, url: c.url, score: s };
      }
    }
  }
  for (const [county, data] of Object.entries(extra)) {
    console.log("FOUND " + data.city + " " + county + ": " + data.url + " (score=" + data.score + ")");
    confirmed.push(data);
  }
  const still = needFiscal.filter((n) => !extra[n.county]);
  if (still.length > 0) {
    console.log("\nStill missing:");
    for (const m of still) console.log("  " + m.city + " " + m.county + " (" + m.domain + ")");
  }

  console.log("\n=== CONFIRMED (" + confirmed.length + ") ===\n");
  for (const c of confirmed.sort((a, b) => a.city.localeCompare(b.city) || a.county.localeCompare(b.county))) {
    console.log(c.city + " " + c.county + ": " + c.url);
  }
}

main();
