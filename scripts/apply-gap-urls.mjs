/**
 * Apply verified gap-fill URLs to fiscal-budget-links.ts
 * Only contains URLs that have been verified to map to the correct city.
 */
import fs from 'fs';

const urlMap = {
  // 河北省
  '秦皇岛市': 'http://www.qhd.gov.cn/zwgk/czzj/',
  '邯郸市': 'https://www.hd.gov.cn/zwgk/czzj/',
  '邢台市': 'https://www.xt.gov.cn/zwgk/czzj/',
  '保定市': 'https://www.baoding.gov.cn/zwgk/czzj/',
  '承德市': 'https://www.chengde.gov.cn/zwgk/czzj/',
  '沧州市': 'https://www.cangzhou.gov.cn/zwgk/czzj/',
  // 山西省
  '太原市': 'https://www.taiyuan.gov.cn/zwgk/czzj/',
  '吕梁市': 'http://www.lvliang.gov.cn/zwgk/czzj/',
  // 辽宁省
  '抚顺市': 'https://czj.fushun.gov.cn/',
  '丹东市': 'https://www.dandong.gov.cn/zwgk/czzj/',
  // 黑龙江省
  '哈尔滨市': 'https://www.harbin.gov.cn/zwgk/czzj/',
  '齐齐哈尔市': 'https://www.qqhr.gov.cn/zwgk/czzj/',
  '大庆市': 'https://www.daqing.gov.cn/zwgk/czzj/',
  '佳木斯市': 'https://www.jms.gov.cn/zwgk/czzj/',
  '七台河市': 'https://www.qth.gov.cn/zwgk/czzj/',
  '黑河市': 'https://www.heihe.gov.cn/zwgk/czzj/',
  '大兴安岭地区': 'https://www.dxal.gov.cn/zwgk/czzj/',
  // 安徽省
  '芜湖市': 'https://www.wuhu.gov.cn/zwgk/czzj/',
  '淮南市': 'https://cz.huainan.gov.cn/',
  '马鞍山市': 'https://cz.mas.gov.cn/',
  // 山东省
  '青岛市': 'http://www.qingdao.gov.cn/zwgk/czzj/',
  '淄博市': 'https://www.zibo.gov.cn/zwgk/czzj/',
  '济宁市': 'https://www.jining.gov.cn/zwgk/czzj/',
};

const filePath = 'data/fiscal-budget-links.ts';
let content = fs.readFileSync(filePath, 'utf8');
let count = 0;

for (const [city, url] of Object.entries(urlMap)) {
  const pattern = `name: "${city}",\n        url: ""`;
  if (content.includes(pattern)) {
    content = content.replace(pattern, `name: "${city}",\n        url: "${url}"`);
    count++;
    console.log(`  ✓ ${city}: ${url}`);
  } else {
    // Check if already has a URL
    const regex = new RegExp(`name: "${city}",\\n        url: "(.+?)"`);
    const match = content.match(regex);
    if (match) {
      console.log(`  ⚠ ${city}: already has URL "${match[1]}"`);
    } else {
      console.log(`  ✗ ${city}: pattern not found`);
    }
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nApplied ${count} URLs`);
