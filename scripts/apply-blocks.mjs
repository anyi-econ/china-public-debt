// Replace province sections in fiscal-budget-links.ts
import { readFileSync, writeFileSync } from 'fs';

const dataFile = 'data/fiscal-budget-links.ts';
let content = readFileSync(dataFile, 'utf8');

const provinces = ['河北省', '山西省', '辽宁省', '吉林省', '黑龙江省', '安徽省', '福建省', '江西省', '山东省'];

for (const province of provinces) {
  const blockFile = `scripts/block-${province}.txt`;
  const newBlock = readFileSync(blockFile, 'utf8');
  
  // Find the existing section: from "// ═══════ {province} ═══════" to the next "// ═══════" or end
  const startMarker = `  // ═══════ ${province} ═══════`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    console.error(`Cannot find start marker for ${province}`);
    continue;
  }
  
  // Find the end: look for next "// ═══════" after the start
  const afterStart = content.indexOf('\n', startIdx) + 1;
  const nextMarkerIdx = content.indexOf('  // ═══════', afterStart);
  
  // Find the end of the province block (the "},\n" before the next marker)
  // We need to find the "},\n\n  // ═══════" pattern
  let endIdx;
  if (nextMarkerIdx !== -1) {
    // Go backwards from nextMarkerIdx to find the end of the previous block
    endIdx = nextMarkerIdx;
    // Trim trailing whitespace
    while (endIdx > 0 && (content[endIdx - 1] === '\n' || content[endIdx - 1] === '\r' || content[endIdx - 1] === ' ')) {
      endIdx--;
    }
    // endIdx should now point just after the last non-whitespace char (should be comma after })
    // Add 1 to include the comma
    endIdx++;
  } else {
    console.error(`Cannot find end marker after ${province}`);
    continue;
  }
  
  const oldBlock = content.substring(startIdx, endIdx);
  console.log(`${province}: replacing ${oldBlock.length} chars with ${newBlock.length} chars`);
  
  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
}

writeFileSync(dataFile, content, 'utf8');
console.log('Done! All provinces updated.');
