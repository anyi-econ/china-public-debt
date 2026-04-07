/**
 * Probe fiscal budget URLs for 信阳/周口/驻马店 counties
 */
import http from "http";
import https from "https";
import fs from "fs";

function fetch(url, timeout = 15000, maxRedirects = 5) {
  return new Promise((resolve) => {
    function doFetch(u, redirectsLeft) {
      const mod = u.startsWith("https") ? https : http;
      const req = mod.get(u, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        timeout,
        rejectUnauthorized: false,
      }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
          let loc = res.headers.location;
          if (loc.startsWith("/")) {
            const parsed = new URL(u);
            loc = parsed.protocol + "//" + parsed.host + loc;
          } else if (!loc.startsWith("http")) {
            loc = new URL(loc, u).href;
          }
          res.resume();
          doFetch(loc, redirectsLeft - 1);
          return;
        }
        let body = "";
        res.setEncoding("utf-8");
        res.on("data", (c) => { body += c; if (body.length > 80000) res.destroy(); });
        res.on("end", () => {
          const titleMatch = body.match(/<title[^>]*>(.*?)<\/title>/is);
          resolve({ status: res.statusCode, title: titleMatch?.[1]?.trim() || "", bodyLen: body.length, body, url: u, originalUrl: url });
        });
        res.on("error", () => resolve({ status: res.statusCode, title: "", bodyLen: body.length, body, url: u }));
      });
      req.on("timeout", () => { req.destroy(); resolve({ status: "timeout", url: u }); });
      req.on("error", (e) => resolve({ status: "error", error: e.code || e.message, url: u }));
    }
    doFetch(url, maxRedirects);
  });
}

async function probeCounty(name, govUrl, patterns) {
  console.log(`\n=== ${name} ===`);
  // Step 1: Check gov portal
  const gov = await fetch(govUrl, 20000);
  console.log(`  GOV: ${gov.status} ${gov.title || gov.redirect || gov.error || ""}`);
  
  if (gov.status === "timeout" || gov.status === "error") {
    // retry once
    const gov2 = await fetch(govUrl, 25000);
    console.log(`  GOV retry: ${gov2.status} ${gov2.title || gov2.redirect || gov2.error || ""}`);
    if (gov2.status === "timeout" || gov2.status === "error") {
      return { county: name, govUrl, govStatus: "unreachable", fiscalUrl: "", fiscalStatus: "skipped", notes: `gov ${gov2.status} ${gov2.error||""}` };
    }
  }

  // Step 2: Probe fiscal paths
  const results = [];
  for (const pattern of patterns) {
    let fullUrl;
    if (pattern.startsWith("http")) {
      fullUrl = pattern;
    } else {
      fullUrl = govUrl.replace(/\/$/, "") + pattern;
    }
    const r = await fetch(fullUrl, 15000);
    const isHomepage = r.title && (r.title.includes("首页") || r.title.includes("人民政府") || r.title === gov.title);
    const hasFiscal = r.body && /预[算决]|财政预决算|预算公开|决算公开/.test(r.body);
    const is404 = r.status === 404 || (r.body && /<title[^>]*>.*?404/i.test(r.body));
    
    let verdict = "miss";
    if (r.status === 200 && !isHomepage && !is404 && hasFiscal) verdict = "HIT";
    else if (r.status === 200 && hasFiscal && isHomepage) verdict = "homepage-redirect";
    else if (r.status === 200 && !is404 && r.bodyLen > 1000) verdict = "page-no-fiscal";
    
    console.log(`  ${verdict} [${r.status}] ${pattern} -> title="${r.title||""}" len=${r.bodyLen||0} fiscal=${hasFiscal}`);
    results.push({ pattern, fullUrl, status: r.status, title: r.title, len: r.bodyLen, hasFiscal, isHomepage, verdict });
  }
  
  const hit = results.find(r => r.verdict === "HIT");
  if (hit) {
    return { county: name, govUrl, govStatus: "ok", fiscalUrl: hit.fullUrl, fiscalStatus: "confirmed", notes: `title="${hit.title}"` };
  }
  
  // Check for any promising leads
  const promising = results.filter(r => r.verdict === "page-no-fiscal" || r.verdict === "homepage-redirect");
  return { 
    county: name, govUrl, govStatus: gov.status === "timeout" ? "unreachable" : "ok", 
    fiscalUrl: "", fiscalStatus: "not-found", 
    notes: promising.length ? `promising: ${promising.map(p=>p.pattern).join(", ")}` : "all paths 404/timeout" 
  };
}

async function main() {
  const allResults = [];

  // ====== 信阳市 ======
  console.log("\n\n########## 信阳市 ##########");
  const xinyangPatterns = [
    "/zfxxgk/zdlyxxgk/czzj/",
    "/zfxxgk/fdzdgknr/czyjs/",
    "/zdlyxxgk/czzj",
    "/zdlyxxgkzl/czzj",
    "/zwgk/zdlyxxgk/czzj/",
    "/zfxxgk/fdzdgknr/czxx/",
    "/xxgk/zdlyxxgkzl/czzj",
    "/jczwgkbzhgfh/sdly/czyjsly/",
  ];

  const xinyangCounties = [
    { name: "浉河区", govUrl: "http://www.shihe.gov.cn/" },
    { name: "平桥区", govUrl: "http://www.xypingqiao.gov.cn/" },
    { name: "商城县", govUrl: "http://www.hnsc.gov.cn/" },
    { name: "潢川县", govUrl: "http://www.huangchuan.gov.cn/" },
  ];
  
  for (const c of xinyangCounties) {
    const r = await probeCounty(c.name, c.govUrl, xinyangPatterns);
    r.city = "信阳市";
    allResults.push(r);
  }

  // ====== 周口市 ======
  console.log("\n\n########## 周口市 ##########");
  // Pattern from existing: /sitesources/{code}/page_pc/... or /yjsgkpt/
  const zhoukouCounties = [
    { name: "西华县", govUrl: "http://www.xihua.gov.cn/", codes: ["xhx"] },
    { name: "沈丘县", govUrl: "https://www.shenqiu.gov.cn/", codes: ["sqx"] },
    { name: "郸城县", govUrl: "http://www.dancheng.gov.cn/", codes: ["dcx"] },
    { name: "鹿邑县", govUrl: "http://www.zhoukou.gov.cn/", codes: ["lyx"], note: "govUrl may be wrong (city portal)" },
  ];

  for (const c of zhoukouCounties) {
    const patterns = [];
    for (const code of c.codes) {
      patterns.push(`/sitesources/${code}/page_pc/ztzl/czyjsgk/`);
      patterns.push(`/sitesources/${code}/page_pc/zwgk/zdxxgk/czxx/`);
      patterns.push(`/sitesources/${code}/page_pc/zwgk/zfxxgkml/yjsgk/`);
      patterns.push(`/sitesources/${code}/page_pc/yjsgkpt/`);
      patterns.push(`/sitesources/${code}/page_pc/zwgk/jcxxgk/czyjs/list1.html`);
    }
    // Also generic paths
    patterns.push("/yjsgkpt/");
    patterns.push("/zwgk/zdxxgk/czxx/");
    patterns.push("/zfxxgk/fdzdgknr/czyjs/");
    
    const r = await probeCounty(c.name, c.govUrl, patterns);
    r.city = "周口市";
    if (c.note) r.notes = c.note + "; " + (r.notes || "");
    allResults.push(r);
  }

  // ====== 驻马店市 ======
  console.log("\n\n########## 驻马店市 ##########");
  const zmdCounties = [
    { name: "驿城区", govUrl: "http://www.zmdycq.gov.cn/" },
    { name: "西平县", govUrl: "http://www.xiping.gov.cn/" },
    { name: "上蔡县", govUrl: "http://www.shangcai.gov.cn/" },
    { name: "平舆县", govUrl: "http://www.pingyu.gov.cn/" },
    { name: "正阳县", govUrl: "http://www.zhengyang.gov.cn/" },
    { name: "确山县", govUrl: "http://www.queshan.gov.cn/" },
    { name: "泌阳县", govUrl: "http://www.biyang.gov.cn/" },
    { name: "汝南县", govUrl: "http://www.runan.gov.cn/" },
    { name: "遂平县", govUrl: "http://www.suiping.gov.cn/" },
    { name: "新蔡县", govUrl: "https://www.xincai.gov.cn/" },
  ];
  
  const zmdPatterns = [
    "/zfxxgk/fdzdgknr/czyjs/",
    "/zfxxgk/zdlyxxgk/czzj/",
    "/zdlyxxgk/czzj/",
    "/zwgk/fdzdgknr/czyjs/",
    "/zwgk/zdlyxxgk/czzj/",
    "/zfxxgk/fdzdgknr/czxx/",
    "/xxgk/zdlyxxgk/czzj/",
    "/jczwgkbzhgfh/sdly/czyjsly/",
    "/yjsgkpt/",
  ];
  
  for (const c of zmdCounties) {
    const r = await probeCounty(c.name, c.govUrl, zmdPatterns);
    r.city = "驻马店市";
    allResults.push(r);
  }

  // Save results
  fs.writeFileSync("scripts/_henan_3cities_results.json", JSON.stringify(allResults, null, 2));
  
  console.log("\n\n########## SUMMARY ##########");
  for (const r of allResults) {
    const icon = r.fiscalStatus === "confirmed" ? "✅" : r.fiscalStatus === "not-found" ? "❌" : "⚠️";
    console.log(`${icon} ${r.city} > ${r.county}: ${r.fiscalUrl || "NOT FOUND"} | ${r.notes || ""}`);
  }
}

main().catch(console.error);
