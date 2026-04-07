// Apply Beijing district fiscal budget URLs to data file
// Sources: Beijing 市财政局 各区财政预决算 page + individual district gov sites
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'data', 'fiscal-budget-links.ts');

const urls = [
  // From https://czj.beijing.gov.cn/zwxx/czsj/gqczyjs/index.html
  { name: "西城区", url: "http://www.bjxch.gov.cn/zt/yjs/index.html" },
  { name: "海淀区", url: "http://www.bjhd.gov.cn/zfxxgk/" },
  { name: "丰台区", url: "http://www.bjft.gov.cn/ftq/czxxgkzl/czxxgk.shtml" },
  { name: "石景山区", url: "http://www.bjsjs.gov.cn/gongkai/zwgkpd/ztzl/Y2020/yjszl/" },
  { name: "门头沟区", url: "https://www.bjmtg.gov.cn/11J000/c100012/xxgklist.shtml" },
  { name: "房山区", url: "http://www.bjfsh.gov.cn/zwgk/ysjs/" },
  { name: "通州区", url: "http://www.bjtzh.gov.cn/bjtz/c102935/common_list.shtml" },
  { name: "顺义区", url: "http://www.bjshy.gov.cn/web/zwgk/czsj/index.html" },
  { name: "昌平区", url: "https://www.bjchp.gov.cn/cpqzf/sy_index/index.html" },
  { name: "大兴区", url: "http://www.bjdx.gov.cn/bjsdxqrmzf/zwfw/zdly/yjs/index.html" },
  { name: "延庆区", url: "http://www.bjyq.gov.cn/yanqing/zwgk/czxx/index.shtml" },
  // From individual district gov sites
  { name: "怀柔区", url: "https://www.bjhr.gov.cn/zwgk/czxx/czyjs/" },
  { name: "平谷区", url: "https://www.bjpg.gov.cn/pgqrmzf/bm/czj/czsz/index.html" },
  { name: "密云区", url: "http://www.bjmy.gov.cn/zwgk/czyjs/index.html" },
];

let src = readFileSync(dataPath, 'utf8');
let applied = 0;

for (const { name, url } of urls) {
  // Match pattern: { name: "区名", url: "" } within 北京市 section
  const re = new RegExp(
    `(\\{\\s*name:\\s*"${name}",\\s*url:\\s*)""`
  );
  if (re.test(src)) {
    src = src.replace(re, `$1"${url}"`);
    applied++;
    console.log(`✅ ${name} → ${url}`);
  } else {
    console.log(`⚠️  ${name} — not matched (may already have URL)`);
  }
}

writeFileSync(dataPath, src, 'utf8');
console.log(`\nApplied ${applied} / ${urls.length} URLs`);
