---
description: "生成本周地方政府债券发行周报（含图表与分析性文字）。USE WHEN: 用户要求生成周报、更新周报、bond weekly report、债券周报、债券发行周报、YYYYMMDD-YYYYMMDD 格式的日期区间"
agent: "agent"
argument-hint: "输入周报日期区间，如 20260420-20260426"
---

根据用户给定的日期区间（格式 `YYYYMMDD-YYYYMMDD`），完成债券发行周报的全流程生成。

## 输入解析

从用户输入中提取：
- `WEEK_START`：起始日期，转为 `YYYY-MM-DD` 格式
- `WEEK_END`：结束日期，转为 `YYYY-MM-DD` 格式
- `WEEK_DISPLAY`：中文展示格式，如 `2026年4月20日—2026年4月26日`（用全角破折号"—"）

## 报告架构

报告采用"标准化数据段落 + 图表 + 分析段落"三层结构，按主题组织为4个正文章节 + 附录：

| 章节 | 自动生成（死结构） | 图表 | 分析段落（活分析） |
|---|---|---|---|
| 一、发行总量特征 | 总量/环比/单只均额 | 柱线图（规模+只数趋势） | volume_analysis |
| 二、类型特征与变化 | 各类型金额/只数/占比 | 饼图（类型结构） | type_analysis |
| 三、利率特征与变化 | 区间/均值/利差/长期占比 | 折线图（利率趋势）+条形图（分地区利率） | rate_analysis |
| 四、地区特征与变化 | 地区列表/最大/轮动 | 饼图（地区分布） | region_analysis |
| 附录：发行明细 | 全量债券表格 | — | — |

每个正文章节遵循固定排布：**数据段落 → 图表 → 分析段落**。数据段落由 Python 自动生成（无需手写），图表由 matplotlib 自动绘制，分析段落从 `weekly_analysis.json` 注入。

## 执行步骤

### 步骤 1：抓取本周 Chinabond 数据

```bash
node scripts/data_management/fetch-chinabond-list.mjs --since=YYYY-MM-DD --until=YYYY-MM-DD
```

确认输出的债券数量和总金额。如果返回 0 条，提醒用户确认日期是否正确。

### 步骤 2：更新脚本日期常量

修改 [generate_weekly_report.py](../../scripts/report_generation/generate_weekly_report.py) 中的日期常量：

```python
WEEK_START = "YYYY-MM-DD"
WEEK_END = "YYYY-MM-DD"
WEEK_DISPLAY = "中文日期展示"
```

同步更新 `DOCX_OUT` 和 `PDF_OUT` 中的文件名。

### 步骤 3：数据分析与背景研究

#### 3a. 环比数据对比

读取 [weekly-reports.json](../../data/weekly-reports.json) 中**上一期**数据，与本周对比：
- 总量：发行规模/只数/单只均额的变化
- 结构：再融资 vs 新增专项 vs 一般债券的占比变动
- 地区：发行地区数量、重叠度、轮动特征
- 利率：均值变化、极差变化、地区利差

#### 3b. 联网搜索政策背景

使用 `fetch_webpage` 访问：
- 财政部网站：`http://www.mof.gov.cn/zhengwuxinxi/caizhengxinwen/`
- 中国债券信息网：`https://www.chinabond.com.cn`
- 搜索关键词：`地方债 发行 YYYY年M月`、`专项债 政策`

提取与本周相关的政策动态（如专项债加速、利率联动、省份发行原因）。搜索失败可跳过，仅基于数据撰写。

### 步骤 4：撰写四段分析文字

基于步骤 3 的数据和背景，为报告四个章节各撰写**一段分析文字**。每段只需覆盖本章主题，由脚本注入到对应章节的"数据段落"和"图表"之后。

#### 总体写作要求

每段遵循"观点—论据—推理"结构：
1. **首句为判断性观点**：一句话概括本段核心发现
2. **中间用关键数据支撑**：只引用最能说明问题的 1-2 个数据点
3. **末句给出分析性推理**：解释数据背后的含义或动因

**语言与风格**：
- 研究报告体，避免口语化（❌"合拍""登场""扎堆"）
- 叙述为主，数据穿插作为论据，不堆砌
- 每段 3-5 句，100-160 字为宜
- 禁止套话（"整体来看""总而言之""值得注意的是"）
- 禁止空洞展望（"预计将保持/维持"）
- 数字：亿元精确到两位小数，百分比精确到一位

**因果推理**：
- 回答"为什么"和"意味着什么"，不只描述"是什么"
- 政策关联说清具体传导机制，不用"共振""信号"等空泛词
- 地区分析聚焦 1 个典型案例深入分析，不要平铺 2-3 个省

#### 各章节写作指引

**volume_analysis（发行总量分析）**：
- 直入核心变化（如放量/缩量/格局切换），结合环比揭示趋势
- 可融入政策背景（如国债安排、财政节奏），将规模变化置于宏观语境中
- 这是报告第一段分析，应有"开篇力度"——最有分析价值的发现放这里

**type_analysis（类型分析）**：
- 聚焦结构变动而非简单报告占比（❌"再融资占66.1%"→✅"再融资占比从87%降至66.1%，发行重心正从存量置换向新增项目融资转移"）
- 解释结构变化的原因和含义，关联财政政策节奏
- 不要重复数据段落已有的数字

**rate_analysis（利率分析）**：
- 利率变化要归因于期限结构，不要简单说"上升/下降"
- 地区利差要解释原因（如信用资质差异、经济实力差距）
- 可引入反面切入（如"利率上升表面看融资成本抬升，但实则是期限结构的映射"）

**region_analysis（地区分析）**：
- 归纳区域层面的规律性特征（轮动、分化、集中），不逐省列举
- 用 1 个典型案例说明共性特征，对照融入分析而非硬加"相比之下"
- 可关联地方财政背景（到期集中、债务置换进度、项目批复周期）

### 步骤 5：生成周报文档

将步骤 4 的分析文字保存为 `scripts/report_generation/weekly_analysis.json`，格式：

```json
{
  "volume_analysis": "发行总量分析段落...",
  "type_analysis": "类型特征分析段落...",
  "rate_analysis": "利率特征分析段落...",
  "region_analysis": "地区特征分析段落..."
}
```

然后运行：

```bash
python scripts/report_generation/generate_weekly_report.py --analysis scripts/report_generation/weekly_analysis.json
```

脚本将自动：
1. 生成 5 张 matplotlib 图表到 `scripts/report_generation/charts/`
2. 生成 .docx 文档，图表嵌入文档
3. 生成 .pdf 文档（LibreOffice 或 reportlab）

确认 .docx 和 .pdf 都已生成到 `docs/` 目录。

### 步骤 6：更新 weekly-reports.json

将本周元数据**插入** [weekly-reports.json](../../data/weekly-reports.json) 数组**头部**（最新在前）。

`summary` 100 字以内含环比分析，`highlights` 3-5 条含数据支撑。

```json
{
  "id": "weekly-YYYY-MM-DD",
  "weekStart": "YYYY-MM-DD",
  "weekEnd": "YYYY-MM-DD",
  "title": "地方政府债券发行周报（中文日期）",
  "totalBonds": 30,
  "totalAmount": 1290.26,
  "unit": "亿元",
  "summary": "含环比分析的摘要，100字以内",
  "highlights": ["不超过5条，每条一句话，含数据支撑"],
  "regions": [{ "name": "省名", "amount": 0.00, "count": 0 }],
  "docxPath": "docs/债券发行周报（YYYYMMDD-YYYYMMDD）.docx",
  "pdfPath": "docs/债券发行周报（YYYYMMDD-YYYYMMDD）.pdf"
}
```

### 步骤 7：更新网站

```bash
npm run update:weekly
```

## 完成确认

最后汇报：
- 本周债券数量和总金额
- 地区分布（按金额排序）
- 与上周的主要变化
- 生成的图表和文件路径
