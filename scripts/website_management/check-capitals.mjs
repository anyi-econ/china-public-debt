import fs from 'fs';
const src = fs.readFileSync('data/website-policy.ts', 'utf8');
const caps = ['石家庄市','太原市','呼和浩特市','沈阳市','长春市','哈尔滨市','南京市','杭州市','合肥市','福州市','南昌市','济南市','郑州市','武汉市','长沙市','广州市','南宁市','海口市','成都市','贵阳市','昆明市','拉萨市','西安市','兰州市','西宁市','银川市','乌鲁木齐市'];
const present = caps.filter(c => src.includes(`/${c}":`));
const missing = caps.filter(c => !src.includes(`/${c}":`));
console.log('capitals present:', present.length, '/', caps.length);
console.log('missing:', missing);
