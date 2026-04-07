// Add county/district children to 湖北 and 广东 cities
import { readFileSync, writeFileSync } from 'fs';

const HUBEI_COUNTIES = {
  '武汉市': ['江岸区','江汉区','硚口区','汉阳区','武昌区','青山区','洪山区','东西湖区','汉南区','蔡甸区','江夏区','黄陂区','新洲区'],
  '黄石市': ['黄石港区','西塞山区','下陆区','铁山区','阳新县','大冶市'],
  '十堰市': ['茅箭区','张湾区','郧阳区','郧西县','竹山县','竹溪县','房县','丹江口市'],
  '宜昌市': ['西陵区','伍家岗区','点军区','猇亭区','夷陵区','远安县','兴山县','秭归县','长阳土家族自治县','五峰土家族自治县','宜都市','当阳市','枝江市'],
  '襄阳市': ['襄城区','樊城区','襄州区','南漳县','谷城县','保康县','老河口市','枣阳市','宜城市'],
  '鄂州市': ['梁子湖区','华容区','鄂城区'],
  '荆门市': ['东宝区','掇刀区','沙洋县','钟祥市','京山市'],
  '孝感市': ['孝南区','孝昌县','大悟县','云梦县','应城市','安陆市','汉川市'],
  '荆州市': ['沙市区','荆州区','公安县','江陵县','松滋市','石首市','洪湖市','监利市'],
  '咸宁市': ['咸安区','嘉鱼县','通城县','崇阳县','通山县','赤壁市'],
  '随州市': ['曾都区','随县','广水市'],
  '恩施土家族苗族自治州': ['恩施市','利川市','建始县','巴东县','宣恩县','咸丰县','来凤县','鹤峰县'],
};

const GUANGDONG_COUNTIES = {
  '广州市': ['荔湾区','越秀区','海珠区','天河区','白云区','黄埔区','花都区','番禺区','南沙区','从化区','增城区'],
  '韶关市': ['武江区','浈江区','曲江区','始兴县','仁化县','翁源县','乳源瑶族自治县','新丰县','乐昌市','南雄市'],
  '深圳市': ['罗湖区','福田区','南山区','宝安区','龙岗区','盐田区','龙华区','坪山区','光明区'],
  '珠海市': ['香洲区','斗门区','金湾区'],
  '汕头市': ['龙湖区','金平区','濠江区','潮阳区','潮南区','澄海区','南澳县'],
  '佛山市': ['禅城区','南海区','顺德区','三水区','高明区'],
  '湛江市': ['赤坎区','霞山区','坡头区','麻章区','遂溪县','徐闻县','廉江市','雷州市','吴川市'],
  '肇庆市': ['端州区','鼎湖区','高要区','广宁县','怀集县','封开县','德庆县','四会市'],
  '惠州市': ['惠城区','惠阳区','博罗县','惠东县','龙门县'],
  '梅州市': ['梅江区','梅县区','大埔县','丰顺县','五华县','平远县','蕉岭县','兴宁市'],
  '汕尾市': ['城区','海丰县','陆丰市','陆河县'],
  '河源市': ['源城区','紫金县','龙川县','连平县','和平县','东源县'],
  '阳江市': ['江城区','阳东区','阳西县','阳春市'],
  '清远市': ['清城区','清新区','佛冈县','阳山县','连山壮族瑶族自治县','连南瑶族自治县','英德市','连州市'],
  '潮州市': ['湘桥区','潮安区','饶平县'],
  '揭阳市': ['榕城区','揭东区','揭西县','惠来县','普宁市'],
  '云浮市': ['云城区','云安区','新兴县','郁南县','罗定市'],
};

const content = readFileSync('data/fiscal-budget-links.ts', 'utf-8');
const lines = content.split('\n');
const output = [];

function makeChildren(counties, indent) {
  const pad = ' '.repeat(indent);
  const items = counties.map(c => `${pad}  { name: "${c}", url: "" },`);
  return [`${pad}children: [`, ...items, `${pad}],`];
}

let hubeiCount = 0, gdCount = 0;

function findProvince(name) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`═══════ ${name} ═══════`)) return i;
  }
  return -1;
}

// Process line by line
let i = 0;
while (i < lines.length) {
  const line = lines[i];

  // Match single-line city entries that need children
  // Pattern: { name: "XXX市/州", url: "..." },
  const cityMatch = line.match(/^(\s*)\{\s*name:\s*"([^"]+)",\s*url:\s*"([^"]*)"\s*\},?\s*$/);
  if (cityMatch) {
    const [, indent, cityName, cityUrl] = cityMatch;
    const counties = HUBEI_COUNTIES[cityName] || GUANGDONG_COUNTIES[cityName];

    if (counties) {
      // Replace single-line with multi-line + children
      const pad = indent;
      output.push(`${pad}{`);
      output.push(`${pad}  name: "${cityName}",`);
      output.push(`${pad}  url: "${cityUrl}",`);
      const childLines = makeChildren(counties, indent.length + 2);
      childLines.forEach(cl => output.push(cl));
      output.push(`${pad}},`);

      if (HUBEI_COUNTIES[cityName]) hubeiCount += counties.length;
      else gdCount += counties.length;
      i++;
      continue;
    }
  }

  output.push(line);
  i++;
}

writeFileSync('data/fiscal-budget-links.ts', output.join('\n'));
console.log(`Added ${hubeiCount} counties for 湖北 (${Object.keys(HUBEI_COUNTIES).length} cities)`);
console.log(`Added ${gdCount} counties for 广东 (${Object.keys(GUANGDONG_COUNTIES).length} cities)`);
console.log(`Total: ${hubeiCount + gdCount} county entries`);
