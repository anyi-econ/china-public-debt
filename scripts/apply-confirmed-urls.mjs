/**
 * apply-confirmed-urls.mjs
 * Batch-apply confirmed fiscal budget URLs to data/fiscal-budget-links.ts
 * 
 * Reads the TS file, finds each city by name under its province,
 * and sets the url field if it's currently empty.
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'data', 'fiscal-budget-links.ts');

// All confirmed URLs: 33 from batch validation + 3 manual + 1 德宏
const UPDATES = [
  // 河南省
  { province: '河南省', city: '南阳市', url: 'https://www.nanyang.gov.cn/zdlyxxgk/czzj/?channelId=4349' },
  { province: '河南省', city: '濮阳市', url: 'https://caizheng.puyang.gov.cn/pc/fwzx.asp?a=lm-16' },
  { province: '河南省', city: '郑州市', url: 'http://public.zhengzhou.gov.cn/?a=platform&k=law&t=paths&i=01' },

  // 湖北省
  { province: '湖北省', city: '宜昌市', url: 'http://www.yichang.gov.cn/list-62944-1.html' },
  { province: '湖北省', city: '仙桃市', url: 'https://www.xt.gov.cn/xt/czxx/list.shtml' },
  { province: '湖北省', city: '神农架林区', url: 'http://czj.snj.gov.cn/' },
  { province: '湖北省', city: '随州市', url: 'http://www.suizhou.gov.cn/zwgk/xxgk/czzj/czyjs/' },

  // 湖南省
  { province: '湖南省', city: '衡阳市', url: 'http://www.hy.gov.cn/xxgk/zfxxgkml/czyjs/' },
  { province: '湖南省', city: '益阳市', url: 'http://www.yy.gov.cn/col/col1229454672/index.html' },
  { province: '湖南省', city: '怀化市', url: 'http://www.huaihua.gov.cn/czj/c100743/czys.shtml' },

  // 云南省
  { province: '云南省', city: '玉溪市', url: 'https://www.yuxi.gov.cn/yxs/gg/20260211/1648788.html' },
  { province: '云南省', city: '保山市', url: 'https://www.baoshan.gov.cn/bmym/bssczj1/zfxxgkpt.htm' },
  { province: '云南省', city: '昭通市', url: 'https://www.zt.gov.cn/lanmu/zwgk/1136.html' },
  { province: '云南省', city: '临沧市', url: 'http://lincang.gov.cn/zfxxgk_lcs_czj' },
  { province: '云南省', city: '楚雄彝族自治州', url: 'http://www.chuxiong.gov.cn/zwgk/fdzdgknr/czxx.htm' },
  { province: '云南省', city: '怒江傈僳族自治州', url: 'https://www.nujiang.gov.cn/2026/0202/20052.html' },
  { province: '云南省', city: '迪庆藏族自治州', url: 'http://www.diqing.gov.cn/zfxxgk_dqzzf_zczj' },
  { province: '云南省', city: '德宏傣族景颇族自治州', url: 'https://www.dh.gov.cn/czj/Web/_M2_1710240937256B0808aAb27723C297_1.htm' },

  // 广西壮族自治区
  { province: '广西壮族自治区', city: '南宁市', url: 'https://nncz.nanning.gov.cn/' },
  { province: '广西壮族自治区', city: '柳州市', url: 'http://lzscz.liuzhou.gov.cn/' },
  { province: '广西壮族自治区', city: '北海市', url: 'http://www.beihai.gov.cn/xxgkbm/bhsczj/ztzl_3/yujuesuangongkai/' },
  { province: '广西壮族自治区', city: '河池市', url: 'https://www.hc.gov.cn/bmjd/bm_100475/czj/' },
  { province: '广西壮族自治区', city: '崇左市', url: 'http://www.chongzuo.gov.cn/zfxxgkzl/xxgkzn_fdzdgknr/czxx/' },

  // 贵州省
  { province: '贵州省', city: '安顺市', url: 'http://www.anshun.gov.cn/zwgk/zdlyxx/#czsj' },
  { province: '贵州省', city: '铜仁市', url: 'https://www.tongren.gov.cn/2026/0318/346223.shtml' },
  { province: '贵州省', city: '黔西南布依族苗族自治州', url: 'https://www.qxn.gov.cn/zwgk/zjxx/' },

  // 西藏自治区
  { province: '西藏自治区', city: '林芝市', url: 'http://www.czj.linzhi.gov.cn/lzczj/c103925/202509/bed35267b7614b228974c7a90350f5fc.shtml' },
  { province: '西藏自治区', city: '那曲市', url: 'http://www.nq.gov.cn/nqzd/nqzwgk/czzj/gk_n_czzj.shtml' },

  // 甘肃省
  { province: '甘肃省', city: '白银市', url: 'http://www.baiyin.gov.cn/bysczj/gzdt/art/2026/art_51e9396b7e424badbe6d280cf4a8949b.html' },
  { province: '甘肃省', city: '天水市', url: 'http://www.tianshui.gov.cn/zwgk/fdzdgknr/czxx.htm' },
  { province: '甘肃省', city: '张掖市', url: 'http://www.zhangye.gov.cn/czj/index.html' },
  { province: '甘肃省', city: '庆阳市', url: 'https://www.qy.gov.cn/qy/czxx/list.shtml' },

  // 青海省
  { province: '青海省', city: '海东市', url: 'https://www.haidong.gov.cn/html/40/115545.html' },
  { province: '青海省', city: '玉树藏族自治州', url: 'http://www.yushu.gov.cn/xxgk/fgwj/fgwjsw/202601/t20260119_3462211.html' },

  // 吉林省
  { province: '吉林省', city: '吉林市', url: 'http://xxgk.jlcity.gov.cn/szf/xbgkml/202603/t20260317_1311066.html' },
  { province: '吉林省', city: '四平市', url: 'http://cz.siping.gov.cn/czxx/czysgk/' },
  { province: '吉林省', city: '通化市', url: 'http://www.tonghua.gov.cn/zwgk/czsj/' },
];

let content = readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

let applied = 0;
let skipped = 0;
let notFound = 0;

for (const { province, city, url } of UPDATES) {
  // Find the province line
  const provRe = new RegExp(`name:\\s*["']${escapeRegex(province)}["']`);
  let provIdx = lines.findIndex(l => provRe.test(l));
  if (provIdx === -1) {
    console.log(`❌ Province not found: ${province}`);
    notFound++;
    continue;
  }

  // Find the city line after the province
  const cityRe = new RegExp(`name:\\s*["']${escapeRegex(city)}["']`);
  let cityIdx = -1;
  // Search within a reasonable range after province (up to 500 lines ahead)
  for (let i = provIdx + 1; i < Math.min(provIdx + 500, lines.length); i++) {
    if (cityRe.test(lines[i])) {
      cityIdx = i;
      break;
    }
    // Stop if we hit another province
    if (/name:\s*["'][^"']+省["']/.test(lines[i]) || /name:\s*["'][^"']+自治区["']/.test(lines[i])) {
      break;
    }
  }

  if (cityIdx === -1) {
    console.log(`❌ City not found: ${province} > ${city}`);
    notFound++;
    continue;
  }

  // Find the url line right after the city name (within 2 lines)
  let urlIdx = -1;
  for (let j = cityIdx; j <= cityIdx + 2; j++) {
    if (/url:\s*["']/.test(lines[j])) {
      urlIdx = j;
      break;
    }
  }

  if (urlIdx === -1) {
    // url might be on the same line as name
    if (/url:\s*["']/.test(lines[cityIdx])) {
      urlIdx = cityIdx;
    } else {
      console.log(`❌ URL line not found near: ${province} > ${city} (line ${cityIdx + 1})`);
      notFound++;
      continue;
    }
  }

  // Check if url is already filled
  const urlLine = lines[urlIdx];
  const emptyMatch = urlLine.match(/url:\s*["']["']/);
  if (!emptyMatch) {
    // URL is already filled
    const existMatch = urlLine.match(/url:\s*["']([^"']+)["']/);
    console.log(`⏭️  Already filled: ${province} > ${city} → ${existMatch?.[1] || '?'}`);
    skipped++;
    continue;
  }

  // Replace empty url with new url
  lines[urlIdx] = urlLine.replace(/url:\s*["']["']/, `url: "${url}"`);
  console.log(`✅ Applied: ${province} > ${city} → ${url}`);
  applied++;
}

content = lines.join('\n');
writeFileSync(filePath, content, 'utf-8');

console.log(`\n--- Summary ---`);
console.log(`✅ Applied: ${applied}`);
console.log(`⏭️  Skipped (already filled): ${skipped}`);
console.log(`❌ Not found: ${notFound}`);
console.log(`Total: ${UPDATES.length}`);

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
