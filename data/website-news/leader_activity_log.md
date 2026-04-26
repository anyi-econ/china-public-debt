# 领导活动抓取日志

- 抓取时间：2026-04-26T16:20:31.339Z
- 处理地区：31
- 成功：22；失败/跳过：9
- 累计领导活动条目：156
- 主表：data\website-news\leader_activity.xlsx
- 翻页日志：data\website-news\leader_activity_log.xlsx

## 失败 / 跳过地区
- **甘肃省**：homepage-unreachable（原始要闻栏目尚未识别，待补全）
- **海南省**：no-2026-items
- **河北省**：no-route-found（原始要闻栏目尚未识别，待补全）
- **湖北省**：homepage-unreachable（原始要闻栏目尚未识别，待补全）
- **吉林省**：homepage-unreachable（原始要闻栏目尚未识别，待补全）
- **江西省**：no-2026-items
- **四川省**：no-route-found（原始要闻栏目尚未识别，待补全）
- **西藏自治区**：no-route-found（原始要闻栏目尚未识别，待补全）
- **浙江省**：no-route-found（原始要闻栏目尚未识别，待补全）

## 基准网址被升级 / 切换的地区
- **福建省**：原 https://www.fujian.gov.cn/xwdt/ → 升级 https://www.fujian.gov.cn/szf/hd/（领导活动）
- **辽宁省**：原 https://www.ln.gov.cn/web/ywdt/index.shtml → 升级 https://www.ln.gov.cn/web/zwgkx/rdxx01_105674/index.shtml（领导活动）

## 备注
- 字段抽取采用关键词规则 + （可选）Anthropic LLM 兜底；首批仅省级 31 条，含 7 条因要闻栏目尚未识别而跳过。
- 缺失要闻栏目的省份需先在 `probe-column` 中补全后再抓取。

## 其他记录
- 河北省: 无要闻栏目识别（no-route-found），跳过
- 吉林省: 无要闻栏目识别（homepage-unreachable），跳过
- 浙江省: 无要闻栏目识别（no-route-found），跳过
- 湖北省: 无要闻栏目识别（homepage-unreachable），跳过
- 四川省: 无要闻栏目识别（no-route-found），跳过
- 西藏自治区: 无要闻栏目识别（no-route-found），跳过
- 甘肃省: 无要闻栏目识别（homepage-unreachable），跳过