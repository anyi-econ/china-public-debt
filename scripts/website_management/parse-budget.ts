/**
 * 第 0 步：解析 data/website-budget.ts，输出扁平化 JSON
 * 使用 tsx 运行：npx tsx scripts/website_management/parse-budget.ts
 *
 * 输入：data/website-budget.ts
 * 输出：scripts/website_management/diagnosis-data.json
 */

import { FISCAL_REGIONS, type FiscalRegionNode } from '../../data/website-budget.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DIRECT_MUNICIPALITIES = ['北京市', '天津市', '上海市', '重庆市'];

interface FlatRecord {
  province: string;
  city: string;
  district: string;
  name: string;
  level: 'province' | 'city' | 'district';
  url: string;
  path: string;
  // Fetch results — filled by subsequent layers
  httpStatus: number | null;
  fetchError: string | null;
  responseUrl: string | null;
  contentType: string | null;
  pageTitle: string | null;
  pageTextSnippet: string | null;
  breadcrumbs: string | null;
  metaKeywords: string | null;
  // Diagnosis fields — filled by analysis
  pageAvailable: string | null;
  regionMatch: string | null;
  pageType: string | null;
  directAccess: string | null;
  bothBudgetAndFinal: string | null;
  hasSubordinateContent: string | null;
  diagnosisNote: string | null;
  needsManualReview: string | null;
  diagnosisLayer: number | null;
  needsLayer2: boolean;
  needsLayer3: boolean;
}

function flatten(regions: FiscalRegionNode[]): FlatRecord[] {
  const records: FlatRecord[] = [];
  const emptyDiag = {
    httpStatus: null, fetchError: null, responseUrl: null, contentType: null,
    pageTitle: null, pageTextSnippet: null, breadcrumbs: null, metaKeywords: null,
    pageAvailable: null, regionMatch: null, pageType: null, directAccess: null,
    bothBudgetAndFinal: null, hasSubordinateContent: null,
    diagnosisNote: null, needsManualReview: null,
    diagnosisLayer: null, needsLayer2: false, needsLayer3: false,
  };

  for (const prov of regions) {
    records.push({
      province: prov.name, city: '', district: '',
      name: prov.name, level: 'province',
      url: prov.url, path: prov.name,
      ...emptyDiag,
    });

    if (!prov.children) continue;

    const isDirect = DIRECT_MUNICIPALITIES.includes(prov.name);

    for (const child of prov.children) {
      if (isDirect) {
        // 直辖市：子级直接是区县
        records.push({
          province: prov.name, city: '', district: child.name,
          name: child.name, level: 'district',
          url: child.url, path: `${prov.name}/${child.name}`,
          ...emptyDiag,
        });
        // 直辖市区下不再有子级
      } else {
        // 省：子级为地级市
        records.push({
          province: prov.name, city: child.name, district: '',
          name: child.name, level: 'city',
          url: child.url, path: `${prov.name}/${child.name}`,
          ...emptyDiag,
        });

        if (child.children) {
          for (const dist of child.children) {
            records.push({
              province: prov.name, city: child.name, district: dist.name,
              name: dist.name, level: 'district',
              url: dist.url, path: `${prov.name}/${child.name}/${dist.name}`,
              ...emptyDiag,
            });
          }
        }
      }
    }
  }

  return records;
}

const records = flatten(FISCAL_REGIONS);
const withUrl = records.filter(r => r.url).length;
const withoutUrl = records.filter(r => !r.url).length;

const output = {
  metadata: {
    source: 'data/website-budget.ts',
    parsedAt: new Date().toISOString(),
    totalRecords: records.length,
    withUrl,
    withoutUrl,
  },
  records,
};

const outputPath = join(__dirname, 'diagnosis-data.json');
writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`✓ 解析完成：共 ${records.length} 条记录（有链接 ${withUrl}，无链接 ${withoutUrl}）`);
console.log(`  输出：${outputPath}`);
