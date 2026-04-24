/**
 * 诊断工具函数 —— 链接核查共用模块
 * 本模块只提供分析与判断函数，不修改任何原始数据。
 */

import { readFileSync, writeFileSync } from 'fs';

// ═══════ 关键词词典 ═══════

/** 预决算页面信号 */
export const BUDGET_KEYWORDS = [
  '财政预决算', '预决算公开', '预算公开', '决算公开',
  '政府预算', '政府决算', '预算执行情况', '决算报告', '四本账',
  '预决算', '预算信息公开', '决算信息公开',
  '一般公共预算', '政府性基金预算', '国有资本经营预算', '社会保险基金预算',
];

/** 法定公开内容页面信号 */
export const LEGAL_DISCLOSURE_KEYWORDS = [
  '政府信息公开', '法定主动公开内容', '主动公开目录',
  '信息公开指南', '信息公开制度', '法定主动公开',
  '政务公开',
];

/** 财政信息或上层栏目页面信号 */
export const FISCAL_GENERAL_KEYWORDS = [
  '财政信息', '财政数据', '财政收支', '财政资金', '财政专栏',
  '财政局', '财政厅',
];

/** 下级单位信号 */
export const SUBORDINATE_KEYWORDS = [
  '教育局', '公安局', '卫健局', '卫生健康委', '民政局',
  '人社局', '住建局', '交通局', '水利局', '农业农村局',
  '商务局', '文旅局', '市场监管局', '应急管理局', '司法局',
  '自然资源局', '生态环境局', '审计局', '统计局', '医保局',
  '学校', '医院', '街道办', '乡镇', '街道',
  '部门预算公开', '部门决算公开', '单位预算', '单位决算',
  '部门预算', '部门决算',
];

// ═══════ 地区名称处理 ═══════

/** 提取地区核心名（去除行政区划后缀和民族前缀） */
export function extractRegionCore(name) {
  if (!name) return '';
  return name
    .replace(/(?:壮族|回族|维吾尔|土家族|苗族|彝族|藏族|傣族|哈尼族|白族|傈僳族|佤族|拉祜族|纳西族|景颇族|布朗族|阿昌族|普米族|怒族|德昂族|独龙族|基诺族|蒙古族|达斡尔族|鄂温克族|鄂伦春族|赫哲族|朝鲜族|锡伯族|满族|瑶族|侗族|仫佬族|毛南族|京族|布依族|水族|仡佬族|羌族|畲族|黎族|哈萨克族|柯尔克孜族|塔吉克族|乌孜别克族|俄罗斯族|塔塔尔族|裕固族|保安族|东乡族|撒拉族|土族)/g, '')
    .replace(/(?:特别行政区|自治区|自治州|自治县|自治旗|地区|新区|林区|矿区)$/, '')
    .replace(/(?:省|市|区|县|盟|旗)$/, '');
}

// ═══════ 诊断判断函数 ═══════

/**
 * 判断 "页面是否可用"
 */
export function judgePageAvailable(record) {
  if (!record.url) return { value: '否', note: '无链接' };
  if (record.fetchError) {
    if (/timeout|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|ECONNRESET|fetch failed/i.test(record.fetchError)) {
      return { value: '否', note: `请求失败: ${record.fetchError}` };
    }
    return { value: '存疑', note: `异常: ${record.fetchError}` };
  }
  const status = record.httpStatus;
  if (!status) return { value: '存疑', note: '无HTTP状态码' };
  if (status === 404 || status === 403 || status === 521 || status === 502 || status === 503) {
    return { value: '否', note: `HTTP ${status}` };
  }
  if (status >= 400) {
    return { value: '否', note: `HTTP ${status}` };
  }
  // 200 but empty or minimal content
  const textLen = (record.pageTextSnippet || '').length;
  if (status >= 200 && status < 400 && textLen < 50) {
    return { value: '存疑', note: '页面可访问但内容极少，可能依赖JS渲染' };
  }
  if (status >= 200 && status < 400) {
    return { value: '是', note: null };
  }
  return { value: '存疑', note: `HTTP ${status}` };
}

/**
 * 判断 "地区是否匹配"
 */
export function judgeRegionMatch(record) {
  if (record.pageAvailable === '否') return { value: '存疑', note: '页面不可用，无法判断' };

  const searchText = [
    record.pageTitle || '',
    record.breadcrumbs || '',
    record.metaKeywords || '',
    (record.pageTextSnippet || '').slice(0, 5000),
  ].join(' ');

  if (!searchText.trim()) return { value: '存疑', note: '无可分析文本' };

  const core = extractRegionCore(record.name);
  const fullName = record.name;

  // Check full name first
  if (searchText.includes(fullName)) return { value: '是', note: null };

  // Check core name (2+ chars to avoid false positives)
  if (core.length >= 2 && searchText.includes(core)) return { value: '是', note: null };

  // Check parent (city/province) as context signal
  const parentName = record.city || record.province;
  if (parentName && parentName !== record.name) {
    const parentCore = extractRegionCore(parentName);
    if (parentCore.length >= 2 && searchText.includes(parentCore)) {
      // Parent matches but not the region itself - ambiguous
      return { value: '存疑', note: `页面提及上级"${parentName}"但未明确匹配"${record.name}"` };
    }
  }

  return { value: '存疑', note: `页面文本中未找到"${core}"相关字样` };
}

/**
 * 判断 "页面类型"
 */
export function judgePageType(record) {
  if (record.pageAvailable === '否') return { value: '存疑', note: '页面不可用' };

  const title = record.pageTitle || '';
  const bc = record.breadcrumbs || '';
  const body = (record.pageTextSnippet || '').slice(0, 5000);

  // 1. Title-level signals (strongest)
  if (BUDGET_KEYWORDS.some(kw => title.includes(kw))) return { value: '预决算页面', note: null };
  if (BUDGET_KEYWORDS.some(kw => bc.includes(kw))) return { value: '预决算页面', note: null };

  // 2. Check for legal disclosure in title
  if (LEGAL_DISCLOSURE_KEYWORDS.some(kw => title.includes(kw))) {
    // But body might have budget content → still legal disclosure if budget is a sub-item
    if (BUDGET_KEYWORDS.some(kw => body.includes(kw))) {
      return { value: '法定公开内容页面', note: '标题为信息公开类，正文含预决算子项' };
    }
    return { value: '法定公开内容页面', note: null };
  }

  // 3. Body-level budget signals
  const budgetHits = BUDGET_KEYWORDS.filter(kw => body.includes(kw));
  if (budgetHits.length >= 2) return { value: '预决算页面', note: `正文含"${budgetHits.slice(0, 2).join('""')}"等关键词` };

  // 4. Body-level legal disclosure
  if (LEGAL_DISCLOSURE_KEYWORDS.some(kw => body.includes(kw))) {
    return { value: '法定公开内容页面', note: null };
  }

  // 5. General fiscal
  if (FISCAL_GENERAL_KEYWORDS.some(kw => title.includes(kw)) ||
      FISCAL_GENERAL_KEYWORDS.some(kw => bc.includes(kw))) {
    return { value: '财政信息或上层栏目页面', note: null };
  }
  if (FISCAL_GENERAL_KEYWORDS.some(kw => body.includes(kw))) {
    return { value: '财政信息或上层栏目页面', note: null };
  }

  // 6. Single budget keyword hit in body
  if (budgetHits.length === 1) return { value: '预决算页面', note: `正文含"${budgetHits[0]}"` };

  // 7. Check URL path as additional signal
  const urlLower = (record.url || '').toLowerCase();
  if (/yjs|yjsgk|czyjs|yusuan|juesuan|czyjsgk/.test(urlLower)) {
    return { value: '预决算页面', note: 'URL路径含预决算相关标识' };
  }
  if (/xxgk|zfxxgk|zwgk/.test(urlLower)) {
    return { value: '法定公开内容页面', note: 'URL路径含信息公开标识' };
  }

  return { value: '存疑', note: '无法从标题、面包屑或正文判断页面类型' };
}

/**
 * 判断 "是否直达目标层级"
 */
export function judgeDirectAccess(record) {
  if (record.pageAvailable === '否') return { value: '存疑', note: '页面不可用' };
  if (record.pageType === '存疑') return { value: '存疑', note: '页面类型不明' };

  if (record.pageType === '预决算页面') {
    return { value: '是', note: null };
  }
  if (record.pageType === '法定公开内容页面') {
    return { value: '否', note: '需从上层页面点击进入预决算栏目' };
  }
  if (record.pageType === '财政信息或上层栏目页面') {
    return { value: '否', note: '停留在财政信息上层页面' };
  }
  if (record.pageType === '其他') {
    return { value: '否', note: '页面与预决算方向不符' };
  }
  return { value: '存疑', note: null };
}

/**
 * 判断 "是否同时包含预算和决算"
 */
export function judgeBothBudgetAndFinal(record) {
  if (record.pageAvailable === '否') return { value: '存疑', note: '页面不可用' };

  const combined = [
    record.pageTitle || '',
    record.breadcrumbs || '',
    (record.pageTextSnippet || '').slice(0, 8000),
  ].join(' ');

  // "预决算" already means both
  if (/预决算/.test(combined)) return { value: '是', note: '页面含"预决算"' };

  const hasBudget = /预算/.test(combined);
  const hasFinal = /决算/.test(combined);

  if (hasBudget && hasFinal) return { value: '是', note: null };
  if (hasBudget && !hasFinal) return { value: '否', note: '仅见预算相关内容' };
  if (!hasBudget && hasFinal) return { value: '否', note: '仅见决算相关内容' };
  return { value: '存疑', note: '未见预算或决算关键词' };
}

/**
 * 判断 "是否含下级内容"
 */
export function judgeHasSubordinateContent(record) {
  if (record.pageAvailable === '否') return { value: '存疑', note: '页面不可用' };

  const text = (record.pageTextSnippet || '').slice(0, 8000);
  if (!text.trim()) return { value: '存疑', note: '无可分析文本' };

  const hits = SUBORDINATE_KEYWORDS.filter(kw => text.includes(kw));
  if (hits.length >= 2) return { value: '是', note: `含"${hits.slice(0, 3).join('""')}"等下级单位信号` };
  if (hits.length === 1) return { value: '存疑', note: `仅见"${hits[0]}"，不确定是否为下级内容` };
  return { value: '否', note: null };
}

/**
 * 判断 "是否需人工复核"
 */
export function judgeNeedsManualReview(record) {
  const uncertainCount = [
    record.pageAvailable,
    record.regionMatch,
    record.pageType,
    record.directAccess,
    record.bothBudgetAndFinal,
    record.hasSubordinateContent,
  ].filter(v => v === '存疑').length;

  if (uncertainCount >= 2) return '是';
  if (record.pageAvailable === '存疑') return '是';
  if (record.regionMatch === '否' || record.regionMatch === '存疑') return '是';
  if (record.pageType === '其他' || record.pageType === '存疑') return '是';
  // Page available but very little text → probably needs JS rendering
  if (record.pageAvailable === '是' && (record.pageTextSnippet || '').length < 200) return '是';
  return '否';
}

/**
 * 对单条记录执行全部6项诊断 + 汇总说明 + 人工复核标记
 */
export function runFullDiagnosis(record) {
  const r1 = judgePageAvailable(record);
  record.pageAvailable = r1.value;

  const r2 = judgeRegionMatch(record);
  record.regionMatch = r2.value;

  const r3 = judgePageType(record);
  record.pageType = r3.value;

  const r4 = judgeDirectAccess(record);
  record.directAccess = r4.value;

  const r5 = judgeBothBudgetAndFinal(record);
  record.bothBudgetAndFinal = r5.value;

  const r6 = judgeHasSubordinateContent(record);
  record.hasSubordinateContent = r6.value;

  // 合成判断说明
  const notes = [r1.note, r2.note, r3.note, r4.note, r5.note, r6.note].filter(Boolean);
  record.diagnosisNote = notes.join('；') || '各项判断正常';

  record.needsManualReview = judgeNeedsManualReview(record);

  return record;
}

// ═══════ 文件 I/O ═══════

const DATA_FILE = 'diagnosis-data.json';

export function getDataPath(baseDir) {
  return `${baseDir}/${DATA_FILE}`;
}

export function loadDiagnosisData(baseDir) {
  const path = getDataPath(baseDir);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function saveDiagnosisData(baseDir, data) {
  const path = getDataPath(baseDir);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}
