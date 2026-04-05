#!/usr/bin/env node
/**
 * Stage 4: Extract government portal URLs from fiscal-budget-links.ts
 * 
 * Strategy:
 * - Parse fiscal URLs to find government portal domains
 * - Only use www.*.gov.cn patterns (skip czj., czt., fiscal bureau domains)
 * - Only apply a URL to a node if the domain "belongs" to that node
 *   (e.g., don't apply a city domain to a county)
 * - Generate https://www.{domain}/ as the portal URL
 */
import fs from 'fs';

// Read both files
const fiscalSrc = fs.readFileSync('data/fiscal-budget-links.ts', 'utf8');
const govSrc = fs.readFileSync('data/gov-website-links.ts', 'utf8');

// Extract the array from fiscal-budget-links.ts
const fiscalMatch = fiscalSrc.match(/export const FISCAL_REGIONS[^=]*=\s*(\[[\s\S]*\]);?\s*$/);
if (!fiscalMatch) { console.error('Could not parse FISCAL_REGIONS'); process.exit(1); }

// We'll use a simpler approach: parse the TS as JS
const fiscalData = eval(fiscalMatch[1]);

// Domains to skip (not government portal sites)
const SKIP_DOMAIN_PREFIXES = [
  'czj.', 'czt.', 'cz.', 'zwfw.', 'xxgk.', 'zwgk.',
  'yjs.', 'zfcg.', 'www.mof.gov.cn', 'www.gov.cn',
  'www.hubei.gov.cn', 'www.jiangxi.gov.cn',  // province-level portals misused for counties
];

// Domains that are actually province portals (skip for city/county assignment)
const PROVINCE_PORTAL_DOMAINS = new Set([
  'www.beijing.gov.cn', 'www.shanghai.gov.cn', 'www.tj.gov.cn', 'www.cq.gov.cn',
  'www.hebei.gov.cn', 'www.shanxi.gov.cn', 'www.nm.gov.cn',
  'www.ln.gov.cn', 'www.jl.gov.cn', 'www.hlj.gov.cn',
  'www.jiangsu.gov.cn', 'www.zhejiang.gov.cn', 'www.anhui.gov.cn',
  'www.fujian.gov.cn', 'www.jiangxi.gov.cn', 'www.shandong.gov.cn',
  'www.henan.gov.cn', 'www.hubei.gov.cn', 'www.hunan.gov.cn',
  'www.gd.gov.cn', 'www.gxzf.gov.cn', 'www.hainan.gov.cn',
  'www.sc.gov.cn', 'www.guizhou.gov.cn', 'www.yn.gov.cn',
  'www.xizang.gov.cn', 'www.shaanxi.gov.cn', 'www.gansu.gov.cn',
  'www.qinghai.gov.cn', 'www.nx.gov.cn', 'www.xinjiang.gov.cn',
]);

function extractDomain(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return null;
  }
}

function shouldSkipDomain(domain) {
  if (!domain) return true;
  for (const prefix of SKIP_DOMAIN_PREFIXES) {
    if (domain.startsWith(prefix) || domain === prefix) return true;
  }
  // Skip non-gov.cn domains
  if (!domain.endsWith('.gov.cn')) return true;
  return false;
}

function getPortalUrl(url, domain) {
  // Determine scheme from original URL
  const scheme = url.startsWith('https') ? 'https' : 'http';
  return `${scheme}://${domain}/`;
}

// Build a mapping: for each node path, what government portal URL should be assigned
// Path format: "province" or "province>city" or "province>city>county"
const govUrlMap = new Map(); // path -> portalUrl

function processNode(node, parentPath, depth) {
  const path = parentPath ? `${parentPath}>${node.name}` : node.name;
  const domain = extractDomain(node.url);
  
  if (domain && !shouldSkipDomain(domain)) {
    // For provinces (depth 0): always use the domain
    // For cities (depth 1): only use if not a province portal
    // For counties (depth 2): only use if not a province or city portal from parent
    if (depth === 0) {
      govUrlMap.set(path, getPortalUrl(node.url, domain));
    } else if (depth === 1) {
      if (!PROVINCE_PORTAL_DOMAINS.has(domain)) {
        govUrlMap.set(path, getPortalUrl(node.url, domain));
      }
    } else if (depth === 2) {
      if (!PROVINCE_PORTAL_DOMAINS.has(domain)) {
        // Check if the domain is the same as the parent city's domain
        const cityPath = parentPath;
        const cityDomain = extractDomain(
          fiscalData.flatMap(p => p.children || [])
            .find(c => `${path.split('>')[0]}>${c.name}` === cityPath)?.url || ''
        );
        if (domain !== cityDomain) {
          // This county has its own domain
          govUrlMap.set(path, getPortalUrl(node.url, domain));
        }
        // If same as city domain, skip (county doesn't have its own portal identified)
      }
    }
  }
  
  if (node.children) {
    for (const child of node.children) {
      processNode(child, path, depth + 1);
    }
  }
}

// Process all fiscal data
for (const province of fiscalData) {
  processNode(province, '', 0);
}

console.log(`Found ${govUrlMap.size} government portal URLs from fiscal data`);

// Count by depth
let provCount = 0, cityCount = 0, countyCount = 0;
for (const [path] of govUrlMap) {
  const depth = path.split('>').length - 1;
  if (depth === 0) provCount++;
  else if (depth === 1) cityCount++;
  else countyCount++;
}
console.log(`  Provinces: ${provCount}, Cities: ${cityCount}, Counties: ${countyCount}`);

// Also add well-known province portal URLs
const PROVINCE_PORTALS = {
  '北京市': 'https://www.beijing.gov.cn/',
  '天津市': 'https://www.tj.gov.cn/',
  '上海市': 'https://www.shanghai.gov.cn/',
  '重庆市': 'https://www.cq.gov.cn/',
  '河北省': 'https://www.hebei.gov.cn/',
  '山西省': 'https://www.shanxi.gov.cn/',
  '内蒙古自治区': 'https://www.nmg.gov.cn/',
  '辽宁省': 'https://www.ln.gov.cn/',
  '吉林省': 'https://www.jl.gov.cn/',
  '黑龙江省': 'https://www.hlj.gov.cn/',
  '江苏省': 'https://www.jiangsu.gov.cn/',
  '浙江省': 'https://www.zj.gov.cn/',
  '安徽省': 'https://www.ah.gov.cn/',
  '福建省': 'https://www.fujian.gov.cn/',
  '江西省': 'https://www.jiangxi.gov.cn/',
  '山东省': 'https://www.shandong.gov.cn/',
  '河南省': 'https://www.henan.gov.cn/',
  '湖北省': 'https://www.hubei.gov.cn/',
  '湖南省': 'https://www.hunan.gov.cn/',
  '广东省': 'https://www.gd.gov.cn/',
  '广西壮族自治区': 'https://www.gxzf.gov.cn/',
  '海南省': 'https://www.hainan.gov.cn/',
  '四川省': 'https://www.sc.gov.cn/',
  '贵州省': 'https://www.guizhou.gov.cn/',
  '云南省': 'https://www.yn.gov.cn/',
  '西藏自治区': 'https://www.xizang.gov.cn/',
  '陕西省': 'https://www.shaanxi.gov.cn/',
  '甘肃省': 'https://www.gansu.gov.cn/',
  '青海省': 'https://www.qinghai.gov.cn/',
  '宁夏回族自治区': 'https://www.nx.gov.cn/',
  '新疆维吾尔自治区': 'https://www.xinjiang.gov.cn/',
  '香港特别行政区': 'https://www.gov.hk/',
  '澳门特别行政区': 'https://www.gov.mo/',
  '台湾省': '',
};

// Add province portals
for (const [name, url] of Object.entries(PROVINCE_PORTALS)) {
  if (url) govUrlMap.set(name, url);
}

console.log(`\nAfter adding province portals: ${govUrlMap.size} total URLs`);

// Now apply to gov-website-links.ts
let newGovSrc = govSrc;
let applied = 0;
let skipped = 0;

// Parse the gov data to traverse nodes
const govMatch = govSrc.match(/export const GOV_WEBSITES[^=]*=\s*(\[[\s\S]*\]);?\s*$/);
if (!govMatch) { console.error('Could not parse GOV_WEBSITES'); process.exit(1); }
const govData = eval(govMatch[1]);

function applyUrls(nodes, parentPath) {
  for (const node of nodes) {
    const path = parentPath ? `${parentPath}>${node.name}` : node.name;
    const portalUrl = govUrlMap.get(path);
    
    if (portalUrl && !node.url) {
      // Replace in the source text
      // Find: name: "{node.name}",\n        url: ""  (or similar indentation)
      // Try multiple indentation patterns
      const patterns = [
        `name: "${node.name}",\n    url: ""`,
        `name: "${node.name}",\n      url: ""`,
        `name: "${node.name}",\n        url: ""`,
        `name: "${node.name}",\n          url: ""`,
        `name: "${node.name}",\n            url: ""`,
      ];
      
      let replaced = false;
      for (const pattern of patterns) {
        if (newGovSrc.includes(pattern)) {
          // Only replace first occurrence to avoid duplicates
          newGovSrc = newGovSrc.replace(pattern, 
            pattern.replace('url: ""', `url: "${portalUrl}"`));
          applied++;
          replaced = true;
          break;
        }
      }
      if (!replaced) {
        skipped++;
        console.log(`  Could not find pattern for: ${path}`);
      }
    }
    
    if (node.children) {
      applyUrls(node.children, path);
    }
  }
}

applyUrls(govData, '');

console.log(`\nApplied ${applied} URLs, skipped ${skipped}`);

// Write updated gov-website-links.ts
fs.writeFileSync('data/gov-website-links.ts', newGovSrc);
console.log('Updated data/gov-website-links.ts');

// Print sample of what was applied
console.log('\nSample applied URLs:');
let count = 0;
for (const [path, url] of govUrlMap) {
  if (count++ >= 20) break;
  console.log(`  ${path}: ${url}`);
}
