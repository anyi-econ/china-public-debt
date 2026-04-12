# 鲁豫陕甘青藏 预决算公开链接查找 — Prompt

> 前置条件：已完成吉林(5/5)、贵州(15/15)、辽宁(35/35)、黑龙江(68/72)、云南(39/98)

## 任务

补齐以下 6 省/自治区的县级财政预决算公开链接（`data/fiscal-budget-links.ts`），**严格按照** `.github/skills/fiscal-site-from-gov-site/SKILL.md` 的四步流程执行。

## 目标省份与缺口

| 省 | 缺口数 | 城市分布 |
|----|--------|---------|
| 山东省 | 19 | 济南2, 青岛3, 枣庄1, 东营1, 烟台1, 潍坊4, 济宁4, 泰安2, 日照1 |
| 河南省 | 21 | 安阳3, 新乡7, 焦作2, 濮阳2, 许昌1, 商丘1, 周口3, 驻马店2 |
| 西藏自治区 | 30 | 拉萨3, 日喀则9, 昌都11, 林芝6, 阿里1 |
| 青海省 | 35 | 西宁6, 海东5, 海北5, 黄南2, 果洛7, 玉树5, 海西5 |
| 甘肃省 | 75 | 兰州8, 金昌3, 白银2, 天水7, 武威5, 张掖6, 酒泉7, 庆阳6, 定西7, 陇南10, 临夏6, 甘南8 |
| 陕西省 | 89 | 西安6, 铜川4, 宝鸡12, 咸阳11, 渭南11, 延安13, 汉中11, 榆林4, 安康10, 商洛7 |

**总计: 269 个缺口**

## 执行要求

### 必须严格遵守的规则

1. **四步串行流程，不得跳过 Step 1（校验政府官网）**：
   - 每个区县必须先从 `data/gov-website-links.ts` 读取政府官网 URL
   - 用 `fetch_webpage` 验证可达性 + 地名匹配 + 是否为门户主站
   - **DNS 失败 / 连接超时 / 地名不匹配 → 标记 gov-suspicious，调用 gov-site-finder 修复后才能继续**
   - 不得在官网可疑状态下直接找预决算链接

2. **遇到政府官网失效时的处理**：
   - 读取 `.github/skills/gov-site-finder/SKILL.md`（特别是 G2 方法：从市级门户找县级官网）
   - 更新 `data/gov-website-links.ts` 中的错误域名
   - 用修复后的新 URL 重新执行 Step 1
   - 如确实无法修复，记录为 `gov-dns-fail`

3. **subagent 的 prompt 必须内联核心规则**：
   - 不要只写"参考 SKILL.md"，因为 subagent 往往只读前 100 行
   - 将 SKILL.md 并行策略节的 subagent 提示词模板（全文）直接粘入 prompt
   - 明确告知 subagent：DNS/连接失败时必须标记 gov-suspicious 而非 "not-found"

4. **同市路径模式复用**：
   - 在一个市的第一个区县找到有效路径后，立即在同市其他区县尝试相同模式
   - 减少不必要的逐站探测

5. **真并行 subagent**：
   - 将 3-4 个 subagent 的 `runSubagent` 调用放在同一个 `<function_calls>` block 中
   - 每轮完成后汇总，处理 gov-suspicious 项，再发下一轮
   - 不要串行一个一个发 subagent

### 处理顺序

按缺口数从少到多：山东(19) → 河南(21) → 西藏(30) → 青海(35) → 甘肃(75) → 陕西(89)

### 每省完成后的检查清单

- [ ] `npx tsc --noEmit` 无错误
- [ ] `docs/fiscal-site-log.md` 已记录每个区县的结论（✅/❌/⚠️）
- [ ] gov-suspicious 项已全部尝试修复或标记为 dns-fail
- [ ] `git add + commit + push`
- [ ] commit message 格式：`feat({省名}): fill N/M county fiscal budget URLs`

### 经验教训（来自云贵黑吉辽五省）

1. **JS 渲染 CMS 站点**（如黑龙江人民中科系统、云南玉溪 yxgovfront）：
   - HTTP 探测拿到空骨架，必须用 `fetch_webpage`
   - GUID 路径不可猜测，需从导航菜单或搜索引擎获取
   - 超过 2 轮同类失败就换策略，不要反复 probe

2. **统一 CMS 的路径复用**：
   - 黑龙江鹤岗 8 县全用 GUID 模式：`/{site}/{guid}/zfxxgk.shtml`
   - 云南临沧 8 县全用：`/zfxxgk_{code}/zfyjs.html`
   - 云南大理 12 县全用：`/{site}rmzf/c{id}/pc/list.html`
   - 找到模式后批量验证，效率高 10 倍

3. **DNS 失败常见原因**：
   - 域名已迁移但 gov-website-links.ts 未更新（如贵州乌当区、白云区）
   - 域名变更（如绥化望奎 wangkui.gov.cn → hlwangkui.gov.cn）
   - 临时网络问题（非站点问题）
   - **必须尝试修复而非直接放弃**

4. **搜索引擎辅助**：
   - 直接访问失败时，用 Baidu 搜索 `site:xxx.gov.cn 预决算` 可发现正确路径
   - 但 Baidu 有时会触发验证码，需多次尝试

5. **慢站≠死站**：
   - 西部省份政府网站普遍较慢（5-15 秒）
   - 首次超时不代表不可达，至少重试 2 次
   - 502/503 是临时故障，不是永久缺失

6. **每省的政府官网修复要同步做**：
   - 不要把 gov-suspicious 放到最后统一处理
   - 每完成一个 subagent 批次，立即处理返回的 suspicious 项
   - 修复后重新查找预决算链接

### 西部省份特殊注意

- **西藏/青海/甘肃**：县级政府网站覆盖率低于东部，可能有较多真正缺失的官网
- 藏区域名可能用藏文拼音，不易猜测
- 部分县级政府可能没有独立网站（合并到州/地区网站）
- 对这些省份，`no-fiscal-link` 和 `gov-dns-fail` 的比例会更高，属正常

### subagent prompt 模板（直接复用）

对每个 subagent，使用 SKILL.md 中更新后的模板，额外补充：
- 同市内已找到的路径模式样例
- 该市所有区县的 gov portal URL（从 gov-website-links.ts 中提取）
- 明确要求：找到 URL 后直接用 replace_string_in_file 写入 data/fiscal-budget-links.ts
