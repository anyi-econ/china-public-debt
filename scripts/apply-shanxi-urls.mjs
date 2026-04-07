// Apply 山西省 county fiscal URLs using the provincial platform ADMDIV pattern
import { readFileSync, writeFileSync } from 'fs';

// Administrative division codes for all 山西 counties
const shanxiCountyCodes = {
  // 太原市 140100
  "小店区": "140105", "迎泽区": "140106", "杏花岭区": "140107",
  "尖草坪区": "140108", "万柏林区": "140109", "晋源区": "140110",
  "清徐县": "140121", "阳曲县": "140122", "娄烦县": "140123", "古交市": "140181",
  // 大同市 140200
  "新荣区": "140212", "平城区": "140213", "云冈区": "140214", "云州区": "140215",
  "阳高县": "140221", "天镇县": "140222", "广灵县": "140223", "灵丘县": "140224",
  "浑源县": "140225", "左云县": "140226",
  // 阳泉市 140300
  // 城区 and 矿区 are ambiguous names, handle with context
  // 平定县 and 盂县 are unique
  "平定县": "140321", "盂县": "140322",
  // 长治市 140400
  "潞州区": "140403", "上党区": "140404", "屯留区": "140405", "潞城区": "140406",
  "襄垣县": "140423", "平顺县": "140425", "黎城县": "140426", "壶关县": "140427",
  "长子县": "140428", "武乡县": "140429", "沁县": "140430", "沁源县": "140431",
  // 晋城市 140500
  // 城区 is ambiguous (阳泉 also has 城区), handle separately
  "沁水县": "140521", "阳城县": "140522", "陵川县": "140524",
  "泽州县": "140525", "高平市": "140581",
  // 朔州市 140600
  "朔城区": "140602", "平鲁区": "140603",
  "山阴县": "140621", "应县": "140622", "右玉县": "140623", "怀仁市": "140681",
  // 晋中市 140700
  "榆次区": "140702", "太谷区": "140703",
  "榆社县": "140721", "左权县": "140722", "和顺县": "140723", "昔阳县": "140724",
  "寿阳县": "140725", "祁县": "140727", "平遥县": "140728", "灵石县": "140729",
  "介休市": "140781",
  // 运城市 140800
  "盐湖区": "140802",
  "临猗县": "140821", "万荣县": "140822", "闻喜县": "140823", "稷山县": "140824",
  "新绛县": "140825", "绛县": "140826", "垣曲县": "140827", "夏县": "140828",
  "平陆县": "140829", "芮城县": "140830", "永济市": "140881", "河津市": "140882",
  // 忻州市 140900
  "忻府区": "140902",
  "定襄县": "140921", "五台县": "140922", "代县": "140923", "繁峙县": "140924",
  "宁武县": "140925", "静乐县": "140926", "神池县": "140927", "五寨县": "140928",
  "岢岚县": "140929", "河曲县": "140930", "保德县": "140931", "偏关县": "140932",
  "原平市": "140981",
  // 临汾市 141000
  "尧都区": "141002",
  "曲沃县": "141021", "翼城县": "141022", "襄汾县": "141023", "洪洞县": "141024",
  "古县": "141025", "安泽县": "141026", "浮山县": "141027", "吉县": "141028",
  "乡宁县": "141029", "大宁县": "141030", "隰县": "141031", "永和县": "141032",
  "蒲县": "141033", "汾西县": "141034", "侯马市": "141081", "霍州市": "141082",
  // 吕梁市 141100
  "离石区": "141102",
  "文水县": "141121", "交城县": "141122", "兴县": "141123", "临县": "141124",
  "柳林县": "141125", "石楼县": "141126", "岚县": "141127", "方山县": "141128",
  "中阳县": "141129", "交口县": "141130", "孝义市": "141181", "汾阳市": "141182",
};

// Ambiguous names that need city context
const ambiguousNames = {
  "阳泉市": { "城区": "140302", "矿区": "140303", "郊区": "140311" },
  "晋城市": { "城区": "140502" },
};

const BASE_URL = "https://czt.shanxi.gov.cn/bmp_pub/index_gfa.html?ADMDIV=";

const filePath = 'data/fiscal-budget-links.ts';
let content = readFileSync(filePath, 'utf-8');
let count = 0;

// Find 山西省 section and process
const lines = content.split('\n');
let inShanxi = false;
let currentCity = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('═══════ 山西省 ═══════')) {
    inShanxi = true;
    continue;
  }
  if (inShanxi && line.includes('═══════') && !line.includes('山西省')) {
    break;
  }
  
  if (!inShanxi) continue;
  
  // Track current city
  const cityMatch = line.match(/name:\s*"([^"]+市|[^"]+州)"/);
  if (cityMatch && line.includes('children')) {
    currentCity = cityMatch[1];
  } else if (cityMatch && !line.includes('url: ""')) {
    // City line without empty URL - just a regular city entry
    const cm = line.match(/name:\s*"([^"]+)"/);
    if (cm) currentCity = cm[1];
  }
  
  // Match county entries with empty URLs
  const match = line.match(/\{\s*name:\s*"([^"]+)",\s*url:\s*""\s*\}/);
  if (match) {
    const name = match[1];
    let code = shanxiCountyCodes[name];
    
    // Check ambiguous names
    if (!code && currentCity && ambiguousNames[currentCity] && ambiguousNames[currentCity][name]) {
      code = ambiguousNames[currentCity][name];
    }
    
    if (code) {
      const url = `${BASE_URL}${code}000`;
      lines[i] = line.replace(`url: ""`, `url: "${url}"`);
      count++;
      console.log(`  ${currentCity} > ${name} → ${code}000`);
    } else {
      console.log(`  ⚠ ${currentCity} > ${name} — NO CODE FOUND`);
    }
  }
}

writeFileSync(filePath, lines.join('\n'));
console.log(`\nApplied ${count} URLs`);
