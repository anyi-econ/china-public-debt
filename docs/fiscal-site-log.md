# 财政预决算链接查找记录

> 每个省按地级市分组记录。状态码含义见 `.github/skills/fiscal-site-from-gov-site/SKILL.md`。

---

## 江西省

### 景德镇市
| 县区 | 状态 | 备注 |
|------|------|------|
| 昌江区 | ❌ WAF | `jdzcjq.gov.cn` 被 WAF 拦截(HTTP l=1166 JS stub, HTTPS EPROTO)，fetch_webpage 也无法渲染。Baidu 确认财政内容存在但无法获取列表页路径 |
| 浮梁县 | ✅ | `fuliang.gov.cn` — HTTP l=1166 但 fetch_webpage 可渲染，找到 `/xzf/czxx/czyjs/index.shtml` |
| 乐平市 | ✅ | `lps.gov.cn` — ENOTFOUND→修正域名后找到 `/zfxxgk/zfxxgkml/fdzdgknr_15921/czxx/zfyjs/` |

### 萍乡市
| 县区 | 状态 | 备注 |
|------|------|------|
| 湘东区 | ✅ | `jxxd.gov.cn` — HTTP l=1166 WAF，通过 Baidu 找到 `/col/col5404/index.html` (财政局部门预算) |
| 莲花县 | ✅ | `zglh.gov.cn` — ENOTFOUND→修正域名，Baidu 找到 `/col/col813/index.html` |
| 上栗县 | ✅ | `jxslx.gov.cn` — ENOTFOUND→修正域名，Baidu 找到 `/col/col3002/index.html` |
| 芦溪县 | ✅ | `luxi.gov.cn` — HTTP l=1166 但 fetch_webpage 渲染成功，找到 `/lxxrmzf/czysjs/pc/list.html` |

### 九江市
| 县区 | 状态 | 备注 |
|------|------|------|
| 浔阳区 | ✅ | SPA 站点，fetch_webpage 渲染找到 `/zwgk/zfxxgkzl/zfxxgkml/czxx/qbjczyjs/` |
| 柴桑区 | ✅ | SPA 站点，`/zwgk/zfxxgk/fdzdgknr/czxxly/qbjczyjsjsgjf/` |
| 武宁县 | ✅ | `/wnxczj/czxx/zfyjs/` |
| 修水县 | ✅ | `/xxgk/bmxxgk/czj/czxx/zfyjsw/` |
| 永修县 | ✅ | `/zwgkx/01_298277/czzz/ndczyjs/` |
| 德安县 | ✅ | `/zw/03/04/05/01/` |
| 都昌县 | ✅ | `/fdzdxxgk/01/03_1/xbjczyjs/` |
| 湖口县 | ✅ | `/zw/zfxxgkzl/fdzdgknr/czzjly0/xbjczyjs/` |
| 彭泽县 | ✅ | `pengze.gov.cn` ECONNRESET→HTTPS 可达，`/zw/03/04/zhxxl/09/01/01/` |
| 瑞昌市 | ✅ | `ruichang.gov.cn` ENOTFOUND(HTTP)→HTTPS 可达，`/fdzdxxgk/bmxxgk/rcsczj/zdly/sbjczyjsrcsczj/` |
| 共青城市 | ✅ | 域名修正 `gqc.gov.cn`→`gongqing.gov.cn`，`/fdzdxxgk/01/03_1/01/` |

### 赣州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 南康区 | ✅ | 赣州 xxgk CMS，从信息公开→财政局页面找到 `/nkqxxgk/nk104/xxgk_bmtt.shtml?code=nk1291&temp=navs_list` |
| 赣县区 | ✅ | `/gxqxxgk/zfyjs25/xxgk_navs.shtml` — 区政府预决算 |
| 信丰县 | ✅ | `/xfxrmzfyyh/c104612/list.shtml` — 不同 CMS 结构 |
| 上犹县 | ✅ | `/syxxxgk/zfyjs/xxgk_list.shtml` |
| 安远县 | ✅ | `/ayxxxgk/c143369/xxgk_navs.shtml` — 从信息公开→财政信息导航找到 |
| 定南县 | ✅ | `/dnxxxgk/dn88/xxgk_navs.shtml` |
| 全南县 | ✅ | `/qnxxxgk/zfyjs25/xxgk_list.shtml` |
| 宁都县 | ✅ | `/ndxxxgk/c108382/xxgk_navs.shtml` — 含政府预决算+部门预决算+政府债务 |
| 于都县 | ✅ | `yudu.gov.cn/yudu/c105469/list.shtml` — 不同路径结构 |
| 会昌县 | ✅ | `/hcxxxgk/zfyjshc/xxgk_list.shtml` |
| 石城县 | ✅ | `/scxxxgk/sc91413/xxgk_lists.shtml` — 含预算公开+决算公开两节 |
| 瑞金市 | ✅ | `/rjsxxgk/zfyjs/xxgk_list.shtml` |

### 吉安市
| 县区 | 状态 | 备注 |
|------|------|------|
| 青原区 | ✅ | 域名修正→`qyq.gov.cn`，`/xxgk-list-zfyjs.html` |
| 永丰县 | ✅ | 域名修正→`jxyongfeng.gov.cn`，`/xxgk-list-xbjczyjs.html` |
| 泰和县 | ✅ | `/xxgk-list-czyjsudgpkz.html` |
| 遂川县 | ✅ | `/xxgk-list-bmczyjssc.html` |
| 万安县 | ✅ | 域名修正→`wanan.gov.cn`，`/xxgk-list-xbjczyjs.html` |
| 安福县 | ✅ | `afx.gov.cn` WAF→fetch_webpage 渲染成功，`/afxrmzfw/zfysjs/index.html` |
| 永新县 | ✅ | `/xxgk-list-zfyjsyxx.html` |
| 井冈山市 | ✅ | `/xxgk-list-bmyjs1.html` |

### 宜春市
| 县区 | 状态 | 备注 |
|------|------|------|
| 奉新县 | ✅ | `/fxxrmzf/zfndczyjs/pc/list.html` |
| 万载县 | ✅ | `/wzxrmzf/wzysjs/ysjszt.shtml` |
| 上高县 | ✅ | 域名修正→`shanggao.gov.cn`，`/sgxrmzf/czyjs/pc/list.html` |
| 宜丰县 | ✅ | `/yfxrmzf/zfyjsf/pc/list.html` |
| 靖安县 | ✅ | 域名 `jxjaxzf.gov.cn`，`/jaxrmzf/czxxt/xxgk_lists.shtml` |
| 铜鼓县 | ✅ | 域名 `tonggu.gov.cn`，`/tgxrmzf/czyjsb5/pc/list.html` |
| 丰城市 | ✅ | `/fcsrmzf/qdglg/pc/list.html` |
| 樟树市 | ✅ | `/zssrmzf/czyjsa7/pc/list.html` |

### 抚州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 东乡区 | ✅ | 抚州 CMS，`/col/col9348/index.html?number=L00025L00008` |
| 南城县 | ✅ | `/col/col7204/index.html?number=N00005` |
| 黎川县 | ✅ | `/col/col2355/index.html?number=LC0005` |
| 崇仁县 | ✅ | `/col/col8719/index.html?number=J00005` |
| 乐安县 | ✅ | 域名修正→`jxlean.gov.cn`，`/col/col406/index.html?number=B00005` |
| 宜黄县 | ✅ | `/col/col2811/index.html` |
| 金溪县 | ✅ | 域名修正→`jinxi.gov.cn`，`/col/col10611/index.html` |
| 资溪县 | ✅ | 域名修正→`zixi.gov.cn`，`/col/col1887/index.html?number=E00005` |

### 上饶市
| 县区 | 状态 | 备注 |
|------|------|------|
| 广丰区 | ✅ | `gfx.gov.cn`，`/public/column/31?type=4&catId=4694221&action=list` |
| 广信区 | ✅ | `srx.gov.cn`，`/srx/cjxx/gxzwgk_xxgklists.shtml` |
| 玉山县 | ✅ | `zgys.gov.cn`，`/zgys/c120962/xxgk_lists.shtml` |
| 铅山县 | ✅ | 域名 `jxyanshan.gov.cn`，`/jxyanshan/czxx/yszwgk_xxgklists.shtml` |
| 横峰县 | ✅ | `hfzf.gov.cn`，`/hfzf/czzj/xlists.shtml` |
| 弋阳县 | ❌ WAF | `jxyy.gov.cn` 返回 HTTP 405/412 WAF 拦截，fetch_webpage 无法渲染，Baidu 无索引结果 |
| 鄱阳县 | ✅ | `poyang.gov.cn`，`/pyxczjj/caijingxinxicbjlxn/pyxxgkListMore.shtml` |
| 万年县 | ✅ | `zgwn.gov.cn`，`/ZWGK_2_0/CZYJSJZ/list_1.shtml` |
| 德兴市 | ✅ | 域名 `dxs.gov.cn`，`/dxsczj/caijingxinxiowablr/xxgk_category.shtml` |

### 关键发现
- **赣州 CMS**: 使用信息公开系统 (`xxgk_list.shtml`/`xxgk_navs.shtml`)，每个县有唯一前缀 (如 `nkqxxgk`, `gxqxxgk`)
- **九江 CMS**: SPA 站点，HTTP GET 返回空页面需 JS 渲染，路径模式多样 (`/zwgk/`, `/fdzdxxgk/`, `/zw/`)
- **吉安 CMS**: 统一 `/xxgk-list-{slug}.html` 模式
- **宜春 CMS**: 统一 `/{prefix}rmzf/{path}/pc/list.html` 模式
- **抚州 CMS**: 统一 `/col/col{id}/index.html?number={code}` 模式
- **上饶 CMS**: 混合模式，部分用 `xxgk_lists.shtml`，部分用不同系统
- **WAF 拦截**: 昌江区 和 弋阳县 被严格 WAF 封锁，需手动浏览器访问
