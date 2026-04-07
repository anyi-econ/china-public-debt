import { readFileSync, writeFileSync } from 'fs';

let data = readFileSync('data/fiscal-budget-links.ts', 'utf-8');

const updates = [
  // 邢台市
  ['信都区', 'http://www.xinduqu.gov.cn/xxgk/czyjs.jsp'],
  ['内丘县', 'http://www.hbnq.gov.cn/xxgk/czyjs.jsp'],
  ['柏乡县', 'http://www.baixiangxian.gov.cn/__sys_block__/czyjs.html'],
  ['广宗县', 'http://www.gzx.gov.cn/xxgk/czyjs.jsp'],
  ['平乡县', 'https://www.pingxiangxian.gov.cn/__sys_block__/czyjs.html'],
  ['清河县', 'https://www.qinghexian.gov.cn/qhxczj/'],
  // 保定市
  ['清苑区', 'https://www.qingyuanqu.gov.cn/yujuesuan.html'],
  ['阜平县', 'https://www.bdfuping.gov.cn/caiwuyujuesuan.html'],
  ['易县', 'https://www.bdyixian.gov.cn/col/1673576758307/index.html'],
  // 张家口市
  ['桥西区', 'http://www.zjkqxq.gov.cn/xxgk/czyjs.jsp'],
  ['宣化区', 'http://www.zjkxuanhua.gov.cn/channelList/10858.html'],
  ['下花园区', 'http://www.zjkxhy.gov.cn/info/czyjs.jsp'],
  ['万全区', 'http://www.zjkwq.gov.cn/xxgk/czyjs.jsp'],
  ['崇礼区', 'http://www.zjkcl.gov.cn/xxgk/czyjs.thtml'],
  ['张北县', 'http://www.zjkzb.gov.cn/xxgk/czyjs.thtml'],
  ['康保县', 'http://www.zjkkb.gov.cn/xxgk/czyjs.thtml'],
  ['沽源县', 'http://www.zjkgy.gov.cn/xxgk/czyjs.jsp'],
  ['尚义县', 'http://www.zjksy.gov.cn/xxgk/czyjs.jsp'],
  ['蔚县', 'http://www.zjkyx.gov.cn/xxgk/czyjs.thtml'],
  ['阳原县', 'http://www.zjkyy.gov.cn/xxgk/czyjs.jsp'],
  ['怀安县', 'http://www.zjkha.gov.cn/info/czyjs.jsp'],
  ['涿鹿县', 'http://www.zjkzl.gov.cn/xxgk/czyjs.jsp'],
  ['赤城县', 'http://www.ccx.gov.cn/xxgk/czyjs.jsp'],
  // 承德市
  ['隆化县', 'http://www.hebeilonghua.gov.cn/col/col12021/index.html?number=LH1004'],
  // 沧州市
  ['盐山县', 'https://www.chinayanshan.gov.cn/chinayanshan/c117631/listDisplaySon.shtml'],
];

let count = 0;
for (const [name, url] of updates) {
  const oldStr = `{ name: "${name}", url: "" }`;
  const newStr = `{ name: "${name}", url: "${url}" }`;
  const occ = data.split(oldStr).length - 1;
  if (occ === 1) {
    data = data.replace(oldStr, newStr);
    count++;
    console.log(`OK: ${name}`);
  } else if (occ === 0) {
    console.log(`SKIP (not found): ${name}`);
  } else {
    console.log(`AMBIGUOUS (${occ} matches): ${name}`);
  }
}

console.log(`\nTotal updated: ${count}/${updates.length}`);
writeFileSync('data/fiscal-budget-links.ts', data);
console.log('File saved.');
