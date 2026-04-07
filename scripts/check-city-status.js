const fs = require('fs');
const d = fs.readFileSync('data/fiscal-budget-links.ts','utf8');
const cities = ['秦皇岛市','白山市','白城市','毕节市','石嘴山市','鸡西市','鹤岗市','双鸭山市','绥化市','安庆市','宿州市','九江市','宜春市','抚州市','上饶市','枣庄市','东营市','菏泽市','海口市','三亚市','黔南布依族苗族自治州','丽江市','普洱市','红河哈尼族彝族自治州','西双版纳傣族自治州','大理白族自治州','金昌市','武威市','陇南市','临夏回族自治州','甘南藏族自治州','海北藏族自治州','黄南藏族自治州','海南藏族自治州','果洛藏族自治州','吴忠市','固原市','中卫市'];
for (const c of cities) {
  const idx = d.indexOf(`name: "${c}"`);
  if (idx === -1) { console.log(c + ': NOT FOUND'); continue; }
  const after = d.substring(idx, idx+200);
  const m = after.match(/url: "([^"]*)"/);
  console.log(c + ': ' + (m ? (m[1] || '(empty)') : '???'));
}
