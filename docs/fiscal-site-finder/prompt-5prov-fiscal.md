# Prompt：云贵黑吉辽 预决算链接查找

> 复制以下内容作为新对话的第一条消息。

---

## 任务

请使用 `.github/skills/fiscal-site-from-gov-site/SKILL.md` 的完整流程，为以下 5 个省份的区县查找预决算公开链接，填入 `data/fiscal-budget-links.ts`。

**目标省份与空缺数（url: "" 的条目数）：**

| 省份 | 总条目 | 空缺 | 已填 | 在 fiscal-budget-links.ts 中的起始行 |
|------|--------|------|------|--------------------------------------|
| 黑龙江省 | 139 | 114 | 25 | ~1015 |
| 云南省 | 228 | 128 | 100 | ~3925 |
| 辽宁省 | 115 | 35 | 80 | ~701 |
| 贵州省 | 98 | 15 | 83 | ~3775 |
| 吉林省 | 70 | 5 | 65 | ~893 |

**建议处理顺序**：先做空缺少的省（吉林→贵州→辽宁），再做空缺多的省（黑龙江→云南）。这样可以快速积累成功经验，遇到大省时更有效率。

## 严格遵循的流程

1. **先完整阅读 skill 文件**：`read_file` 读取 `.github/skills/fiscal-site-from-gov-site/SKILL.md` 全文（约 370 行），不要跳过任何部分。
2. **阅读经验日志**：`read_file` 读取 `docs/fiscal-site-log.md`，了解江西省的实战经验和踩坑记录。
3. **逐省逐市处理**：按省→市→区县的层级，严格执行 Step 1→2→3→4。
4. **每找到一批 URL 就写入数据文件**，不要攒到最后一起写。每个城市处理完后写入一次。
5. **处理完每个省后**：运行 `npx tsc --noEmit` 确认编译通过，然后 commit + push。
6. **记录经验**：在 `docs/fiscal-site-log.md` 中追加每个省的查找记录（格式参照江西省已有的记录）。

## 关键经验（来自江西省实战）

### 域名问题是最大坑
- `gov-website-links.ts` 中的域名可能是错的（ENOTFOUND）。遇到 ENOTFOUND 不要放弃，用 Baidu 搜索「XX县人民政府」找正确域名。
- 同时修正 `gov-website-links.ts` 和 `fiscal-budget-links.ts` 两个文件中的域名。

### WAF/CDN 拦截的处理
- HTTP 返回 content-length=1166 的 JS 空壳页面 → 不代表站点不存在，尝试 `fetch_webpage` 渲染。
- HTTPS EPROTO / HTTP 405/412 → WAF 严格拦截，`fetch_webpage` 也无法绕过，可直接用 Baidu 搜索 `site:xxx.gov.cn 预算` 尝试找到具体路径。
- 如果 Baidu 也搜不到，标记为 WAF 留空（宁缺勿错）。

### 同城模式复用
- 同一个地级市下的区县，通常使用相同的 CMS 系统，URL 模式相似。
- 找到第一个区县后注意总结模式，后续区县可以基于模式快速尝试。
- 典型模式举例：
  - 信息公开系统：`/{prefix}xxgk/{code}/xxgk_lists.shtml`
  - 部门预算：`/{prefix}rmzf/{path}/pc/list.html`
  - 栏目列表：`/col/col{id}/index.html`
  - 政务公开：`/zwgk/zfxxgk/fdzdgknr/czxx/`

### 效率提示
- 每个城市先挑 1-2 个区县摸清 CMS 模式，然后批量处理剩余区县。
- 用 subagent 并行处理多个区县可以大幅提速，但要确保每个 subagent 的 prompt 包含足够上下文（域名、模式、验证要求）。
- 对于 SPA 站点（HTTP GET 返回空白/重定向），必须用 `fetch_webpage` 渲染才能看到内容。

### 宁缺勿错
- URL 必须指向真实的预决算栏目列表页，不能是：政府首页、财政局首页、新闻详情页、404 页面。
- 如果不确定，宁可留空。错误的 URL 比空 URL 危害更大。

## 参考文件

| 文件 | 用途 |
|------|------|
| `.github/skills/fiscal-site-from-gov-site/SKILL.md` | 主 skill（必须先完整阅读） |
| `.github/skills/fiscal-site-finder/SKILL.md` | 查找方法大全（备用参考） |
| `.github/skills/gov-site-finder/SKILL.md` | 修正政府官网域名用 |
| `data/fiscal-budget-links.ts` | 预决算链接数据文件（写入目标） |
| `data/gov-website-links.ts` | 政府官网数据文件（域名参考+修正） |
| `docs/fiscal-site-log.md` | 经验日志（读取江西经验+追加新省记录） |
