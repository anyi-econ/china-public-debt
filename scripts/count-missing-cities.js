const fs = require('fs');
const d = fs.readFileSync('data/fiscal-budget-links.ts','utf8');
const lines = d.split('\n');
let missing = [];
let currentProv = '';
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const pm = line.match(/^\s{4}name:\s*"([^"]+)"/);
  if (pm) currentProv = pm[1];
  const cm = line.match(/^\s{8}name:\s*"([^"]+)"/);
  if (cm) {
    const urlLine = lines[i+1];
    if (urlLine && /url:\s*""/.test(urlLine)) {
      missing.push({ prov: currentProv, city: cm[1], line: i+1 });
    }
  }
}
console.log('Missing city URLs:', missing.length);
missing.forEach(m => console.log('  ' + m.prov + ' > ' + m.city));
