# 地区政策导航 — 查找日志

> 数据文件：[data/website-policy.ts](../data/website-policy.ts)
> 前端组件：[components/pages/website-policy-nav.tsx](../components/pages/website-policy-nav.tsx) → [components/pages/website-region-nav.tsx](../components/pages/website-region-nav.tsx)
> 挂载位置：`/policies` 页面子菜单 "地区政策导航"

## 1. 栏目定义与筛选标准

收录目标：各级政府门户中**代表本地政策文件入口**的稳定栏目页，优先可检索/可筛选入口。

### 1.1 可接受栏目名称
- 政策文件、政策文件库、政策法规
- 行政规范性文件、规范性文件、规范性文件库、规范性文件查询
- 政府文件、政府公文
- 找政策、政策查询、政策服务、政策库、政策检索、政策图谱

### 1.2 层级约束
- 省级：省政府门户下的政策文件入口（不用省属厅局单独入口）。
- 市级：市政府门户下的政策入口；若市级同时存在**政策文件列表**和**找政策/政策检索/政策库**两种入口，**优先可检索入口**（按 prompt 明确要求）。
  - 例：北京应用 "找政策" `zhengce/zcdh` 而非 "政策文件" `zhengce/zhengcefagui`。
  - 例：广州应用 "政策文件库" `gzzcwjk` 而非 "规范性文件统一发布" `gfxwj`。
- 区县级：本区县政府门户下的政策入口；若该区县统一接入上级平台（如北京市"找政策"可按区县筛选），也可用上级平台作为入口，前提是默认过滤为本区县。

### 1.3 不收录
- 单篇文件、废止文件库
- 短期"学习资料汇编"专题
- 部门单独的规范性文件列表（除非该区仅此一入口）

## 2. 已验证种子样例（v1 首期）

| 路径 | 入口名 | URL | 备注 |
|---|---|---|---|
| 北京市 | 找政策 | `https://www.beijing.gov.cn/zhengce/zcdh?token=4260&adx=&asmzq=&type=1` | prompt 指定优先"找政策"而非普通"政策文件" |
| 上海市/黄浦区 | 行政规范性文件 | `https://www.shhuangpu.gov.cn/zw/.../specification.html` | prompt 原示例 |
| 广东省/广州市 | 政策文件库 | `https://www.gz.gov.cn/gzzcwjk/index.html` | 支持主题/文号/发文机关检索 |
| 广东省/深圳市 | 规范性文件查询 | `https://www.sz.gov.cn/szsrmzfxxgk/zc/gfxwj/szfgfxwj/` | 深圳市信息公开内规范性文件库 |

## 3. 代表性 20 地区待复核清单

| # | 类型 | 地区 | 推测路径 |
|---|---|---|---|
| 1 | 直辖市 | 北京市 ✓ | 已核验 |
| 2 | 直辖市 | 上海市 | 上海"一网通办"政策库 `zwdt.sh.gov.cn` 或市政府 `zhengce.sh.gov.cn`，待确认 |
| 3 | 直辖市 | 天津市 | 通常 `tj.gov.cn/zwgk/zcfg/` |
| 4 | 直辖市 | 重庆市 | `cq.gov.cn/zwgk/zcwjk/` 政策文件库 |
| 5 | 直辖市下区 | 上海市/黄浦区 ✓ | 已核验 |
| 6 | 副省级 | 广东省/广州市 ✓ | 已核验 |
| 7 | 副省级 | 广东省/深圳市 ✓ | 已核验 |
| 8 | 地级市下区 | 广东省/深圳市/福田区 | 福田政策库 / 规范性文件 |
| 9 | 副省级 | 江苏省/苏州市 | 苏州政策文件库 |
| 10 | 省会 | 浙江省/杭州市 | `hangzhou.gov.cn/col/` 规范性文件 |
| 11 | 副省级 | 山东省/青岛市 | 青岛政策文件库 |
| 12 | 省会 | 四川省/成都市 | 成都政府门户政策文件 |
| 13 | 省会 | 湖北省/武汉市 | 武汉规范性文件 |
| 14 | 省会 | 陕西省/西安市 | 西安政策文件 |
| 15 | 省会 | 河南省/郑州市 | 郑州规范性文件 |
| 16 | 省会 | 云南省/昆明市 | 昆明政策法规 |
| 17 | 副省级 | 福建省/厦门市 | 厦门政策文件库 |
| 18 | 县级市 | 江苏省/苏州市/昆山市 | 昆山规范性文件 |
| 19 | 县级市 | 浙江省/金华市/义乌市 | 义乌政策文件 |
| 20 | 省会 | 江苏省/南京市 | 南京政策文件库 |

## 4. 难点类型

1. **可检索 vs 列表并存**：很多城市同时存在"政策文件"（简单列表）和"找政策/政策库"（全文检索）。必须选择可检索者。
2. **规范性文件 vs 政策文件**：严格意义下规范性文件只是一类，而"政策文件"含义更广。门户命名不统一——有的地方"规范性文件"是最全的政策入口，有的地方则单独一类。需要按实际栏目内容判断。
3. **JS 单页应用**：北京"找政策"是前端框架；广州"政策文件库"依靠 AJAX 列表。这类入口只能用浏览器访问，fetch 拿到的是壳。
4. **跳到第三方平台**：部分区县的政策入口跳到省级平台（广东省"粤省事""粤商通"），需判断是否按本区县过滤。
5. **过期栏目**：不少市级门户改版后旧 URL 仍留，但不再更新。须通过首页链接溯源确认。

## 5. 优先级判定

1. 可检索、可按主题/文号/发文机关筛选的政策平台 >
2. 政府门户一级导航下的"政策文件 / 规范性文件"列表 >
3. 法制办 / 司法局 / 办公厅 的规范性文件子栏目 >
4. （下策）以通知公告或政务公开信息公开目录替代。

## 6. 候选备忘

- 北京市：
  - `https://www.beijing.gov.cn/zhengce/zhengcefagui/index.html` — 政策文件列表。**未采用原因**：不可检索，按 prompt 优先"找政策"。
  - `https://www.beijing.gov.cn/zhengce/gfxwj/` — 行政规范性文件库。**未采用原因**：覆盖窄于"找政策"。
- 广州市：
  - `https://www.gz.gov.cn/gfxwj` — 规范性文件统一发布。**未采用原因**：与 `gzzcwjk` 相比仅为子集且不支持主题检索。
  - `https://www.gz.gov.cn/gkmlpt/search?type=policySearch` — 规章库 + 搜索。**未采用原因**：仅规章，范围小于政策文件库。
- 深圳市：
  - `https://www.sz.gov.cn/cn/xxgk/zfxxgj/zfwj/index.html` — 政府文件列表。**未采用原因**：按 prompt 优先可检索入口。

## 7. 查找方法

- 静态 fetch 首页，正则匹配 `政策|规范性|法规|文件库|找政策`。
- 检查站点地图。
- 通过 `site:{domain} 找政策` Google 搜索兜底（人工验证）。
- JS 渲染入口：Playwright。
- 批量仅在同省政策库结构高度一致时使用。

## 8. 验证结果

- Typecheck：`npm run lint` 通过。
- 构建：Next.js 构建通过。
- 前端：`/policies` → "地区政策导航" 子菜单正常下钻，已核验地区蓝色可点击，未核验地区灰色虚线。

## 9. 后续扩展建议

- 先覆盖 31 省 + 省会 + 副省级市三层，优先使用可检索平台。
- 建议在 `scripts/website_management/` 下新增 `policy-probe.mjs`，按省批处理。
- 批量结果必须人工抽样 ≥ 10%。

## 10. v2 扩充（省级政策入口批量核验）

本轮尝试通过 `fetch_webpage` 访问 31 个省级门户首页提取政策文件/规范性文件/可检索政策库入口。

### 10.1 本次新增 / 确认

| 路径 | 入口名 | URL | 源 |
|---|---|---|---|
| 重庆市 | 省级政府文件 | `https://www.cq.gov.cn/zwgk/zfxxgkml/szfwj/` | 政府信息公开目录→市政府文件 |
| 辽宁省 | 省政府政策文件库 | `https://www.ln.gov.cn/web/lnszcwjk/index.shtml` | 首页"政策文件库"一级入口，可检索 |
| 吉林省 | 政策信息 | `https://www.jl.gov.cn/zcxx/` | 首页"政策信息"一级栏目 |
| 黑龙江省 | 文件库（可检索） | `https://www.hlj.gov.cn/hlj/c108371/zfxxgk_search.shtml` | 政务公开版块"文件库"检索页 |
| 江苏省 | 最新文件 | `https://www.jiangsu.gov.cn/col/col84242/index.html` | 首页"最新文件"栏目（省政府/办公厅发文），可按时间倒序 |

> 说明：吉林省同时存在 `http://xxgk.jl.gov.cn/szf/gzk/`（省政府规章库），但规章库范围小于"政策信息"，按本文 §5 优先级判定采用后者。

### 10.2 本轮无法稳定抓取、需人工复核的省级门户

- 天津市 / 河北省 / 山西省 / 浙江省 / 福建省 / 江西省 / 山东省（JS 渲染）
- 内蒙古自治区 / 安徽省 / 河南省（Forbidden）
- 其余 湖北 / 湖南 / 广东 / 广西 / 海南 / 四川 / 贵州 / 云南 / 西藏 / 陕西 / 甘肃 / 青海 / 宁夏 / 新疆 本轮未抓取

### 10.3 省会城市

省会城市层（除广州/深圳外 27 个）本轮未批量抓取，延后到下一阶段。前端对应节点显示灰色"待补充"。

### 10.4 覆盖率说明

v1 + v2 共收录 9 条政策入口（北京、上海黄浦、广州、深圳、重庆、辽宁、吉林、黑龙江、江苏）。其余节点均以空字符串保留，前端显示为灰色"待补充"。
## 11. v3 扩充（subagent 并行核验）

### 11.1 本轮新增确认

| 路径 | 入口名 | URL |
|---|---|---|
| 广东省 | 省政府文件库 | `http://www.gd.gov.cn/zwgk/wjk/` |
| 湖南省 | 文件库（省政府文件） | `https://www.hunan.gov.cn/hnszf/xxgk/wjk/szfwj/wjk_glrb.html` |
| 海南省 | 省政府政策文件 | `https://www.hainan.gov.cn/hainan/zfwj/szfzcwj.shtml` |
| 云南省 | 政策文件 | `https://www.yn.gov.cn/zwgk/zcwj/` |
| 宁夏回族自治区 | 区政府文件 | `https://www.nx.gov.cn/zwgk/qzfwj/` |
| 新疆维吾尔自治区 | 政策 | `https://www.xinjiang.gov.cn/xinjiang/zfl/zfxxgk_zhengce_list.shtml` |
| 江西省/南昌市 | 政策文件库 | `https://www.nc.gov.cn/ncszf/gfxwjtyfbpt/zcwjk.shtml` |
| 湖北省/武汉市 | 政策 | `https://www.wuhan.gov.cn/zwgk/?channelid=26315` |
| 西藏自治区/拉萨市 | 文件资料 | `https://www.lasa.gov.cn/lasa/wjzl/common_list.shtml` |
| 陕西省/西安市 | 政策法规 | `https://www.xa.gov.cn/gk/zcfg/` |
| 宁夏回族自治区/银川市 | 规范性文件 | `https://www.yinchuan.gov.cn/xxgk/zcwj/xzgfxwj/` |
| 新疆维吾尔自治区/乌鲁木齐市 | 政府文件 | `https://www.wlmq.gov.cn/wlmqs/c119064/zfxxgk_list.shtml` |
| 辽宁省/沈阳市 | 政府文件 | `https://www.shenyang.gov.cn/zwgk/zcwj/zfwj/` |

### 11.2 未采用的 subagent 返回项

- 济南市：`https://www.jinan.gov.cn/api-gateway/jpaas-jpolicy-web-server/front/info/index` — 形象上是 API 端点而非面向用户的栏目页，暂不采用。
- 郑州市：`http://public.zhengzhou.gov.cn/` — 政府信息公开平台首页，范围过宽，未采用。
- 西藏自治区：`https://www.xizang.gov.cn/zwgk/` — 政务公开总页而非政策文件库，未采用。

### 11.3 v3 未能核验的门户

省级：天津、河北、山西、内蒙古、浙江、安徽、福建、江西、山东、河南、湖北、广西、四川、贵州、陕西、甘肃、青海。
省会：石家庄、太原、呼和浩特、长春、哈尔滨、南京、杭州、合肥、福州、长沙、南宁、海口、成都、贵阳、昭明、兰州、西宁。
均为 JS 渲染/WAF 拦截，留待后续 Playwright 补充。

### 11.4 覆盖率变化

| 类别 | v2 合计 | v3 新增 | 当前合计 |
|---|---|---|---|
| 地区政策 | 9 | 13 | **22** |

## 12. v4 扩充（聚焦"政府信息公开 > 政策 > 行政规范性文件"路径）

本轮按用户明示目标：遵循 `政府信息公开 → 政策 → 行政规范性文件` 官方路径。
优先采用省/市政府门户下该路径的可访问列表页。方法：先尝试 4 个并行 subagent + fetch_webpage 定向核验已知模式（`/zfxxgk/…/xzgfxwj/`、`/zwgk/zcwj/szfwj/`、`/zwgk/zxwj/szfwj/` 等）；WAF/JS 渲染失败则留空。

### 12.1 本轮新增确认

| 路径 | 入口名 | URL | 来源 |
|---|---|---|---|
| 上海市 | 市政府信息公开目录（含市政府规章/文件/规划纲要） | `https://www.shanghai.gov.cn/nw11494/index.html` | 政务公开→政府信息公开目录，fetch_webpage 确认含 `市政府规章`、`市级预算和执行情况` 等二级栏目 |
| 福建省 | 省政府文件 | `https://www.fujian.gov.cn/zwgk/zxwj/szfwj/` | 政务公开→最新文件→省政府文件，fetch_webpage 正常返回 |
| 福建省/福州市 | 市政府文件 | `http://www.fuzhou.gov.cn/zwgk/zxwj/szfwj/` | 与省级同构 URL，subagent 核验通过 |

### 12.2 未采用的候选（SKILL §3 过滤）

- 济南市 `https://www.jinan.gov.cn/api-gateway/jpaas-jpolicy-web-server/front/info/index`：API 端点，非面向用户的栏目页。
- 贵阳市 `http://www.gy.gov.cn/zwgk/szfwj/index.html`：页面已被撤稿/删除（404）。
- 海口市 `http://www.haikou.gov.cn/xxgk/szfwj/`：被"安全狗"防火墙拦截，无法作为稳定入口。
- 南京市 `http://www.nanjing.gov.cn/zdgk/zcwj/szfwj/`：返回 404。
- 昆明市 `http://www.km.gov.cn/c/2018-09-26/2639729.shtml`：单篇文章而非列表。

### 12.3 v4 仍未能稳定核验（留待 Playwright / 第三方镜像）

**省级**（15）：天津、河北、山西、内蒙古、浙江、安徽、江西（仅 v3 市级有）、山东、河南、湖北（仅 v3 市级有）、广西、四川、贵州、陕西（仅 v3 市级有）、甘肃、青海、西藏（仅 v3 市级有）。

**省会/副省级市**（17）：石家庄、太原、呼和浩特、长春、哈尔滨、杭州、南京、合肥、济南、郑州、长沙、南宁、海口、成都、贵阳、昆明、兰州、西宁、厦门。

均确认为 JS 单页应用或 WAF/防火墙拦截（HTTP 403/404 或 `Failed to extract meaningful content`）。

### 12.4 覆盖率变化

| 类别 | v3 合计 | v4 新增 | 当前合计 |
|---|---|---|---|
| 地区政策 | 22 | 3 | **25** |

### 12.5 下一步

- 使用 Playwright（`webapp-testing` 技能）按省批量访问 §12.3 中的门户，等待 JS 渲染后提取 `政策文件/规范性文件/行政规范性文件` 栏目 URL。
- 优先级：省级 > 省会 > 副省级市 > 其他地级市。
- 批处理脚本建议位置：`scripts/website_management/policy-probe.mjs`。