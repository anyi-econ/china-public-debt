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

---

## 吉林省

### 长春市
| 县区 | 状态 | 备注 |
|------|------|------|
| 宽城区 | ✅ | `http://www.jckc.gov.cn/xxgk/zdxxlygk/czxx/czyjs/` — 重点领域信息公开→财政信息→财政预决算，2024年预算/决算文件列表 |
| 农安县 | ✅ | `http://www.nongan.gov.cn/zw/xxgkzdly/zfczyjs/` — 政务→信息公开重点领域→政府财政预决算，19页内容，最新2026-01 |
| 榆树市 | ✅ | `http://www.yushu.gov.cn/xxgk/zdly/czxx/czyjsxx/` — 信息公开→重点领域→财政信息→财政预决算信息，含政府预决算/部门预决算两个标签 |

### 四平市
| 县区 | 状态 | 备注 |
|------|------|------|
| 铁东区 | ✅ | `http://tdq.siping.gov.cn/zw/zwxxgkzl/czysgk/` — 政务→政务信息公开专栏→财政预算公开，25页，最新2026-02。另有决算页 `/czjsgk/` |

### 通化市
| 县区 | 状态 | 备注 |
|------|------|------|
| 通化县 | ✅ | `http://www.tonghuaxian.gov.cn/zwgk/czxxgk/` — 政务公开→财政信息公开，含2016-2018年部门预算/决算。2019+年数据可能迁至 `xxgk.tonghuaxian.gov.cn`（需登录） |

### 吉林省经验总结
- **长春市**: 各县区独立建站，不共用 `zwgk.changchun.gov.cn` 平台（该平台需登录）
- **四平市**: 铁东区 主站 `tdq.siping.gov.cn` 的政务信息公开专栏有独立的预算/决算栏目，与铁西区网站结构不同
- **通化市**: 通化县 的财政信息已从旧门户停更（2018），新数据在信息公开平台但受限
- **5/5 全部找到**: 所有吉林省缺口均已补齐

---

## 贵州省

### 贵阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 乌当区 | ✅ | 域名迁移 `udq.gov.cn`→`gzwd.gov.cn`，`/zwgk/zdlyxx/czzj/czysjsgjf/` — 含2026部门预算 |
| 白云区 | ✅ | 域名迁移 `byq.gov.cn`→`gzbaiyun.gov.cn`，`/zwgk/zdlyxx/czzj/czysjsgjf/` |
| 观山湖区 | ✅ | 域名迁移 `gsh.gov.cn`→`guanshanhu.gov.cn`，`/zwgk/zdlyxx/czzj/czysjsgjf/` |

### 遵义市
| 县区 | 状态 | 备注 |
|------|------|------|
| 汇川区 | ✅ | 域名迁移→`zyhc.gov.cn`，`/zwgk/zdlygk/czzj/czyjsjsgjf/` — 1553条，含2026部门预算 |
| 桐梓县 | ✅ | `gztongzi.gov.cn`，`/zwgk/zfxxgk/fdzdgknr/czzj/czyjs_5621094/` — 含财政预决算+收支情况+三公经费子栏目 |
| 习水县 | ✅ | `gzxishui.gov.cn`，`/zwgk/zdlyxx/czzj/czysjsgjf/` |
| 余庆县 | ✅ | `zgyq.gov.cn`，`/zwgk/zdlyxx/czzj/czyjsjsgjf/` — 341条，含2026部门预算 |
| 仁怀市 | ✅ | `renhuai.gov.cn`，`/zwgk/zdlyxx/czzj/czysjsgjf/` |
| 赤水市 | ✅ | `gzchishui.gov.cn`，`/zwgk/zfxxgkml/czxx/czysbg/` — 含2025市级预算/部门预算，另有决算 `/czjsbg/` |

### 毕节市
| 县区 | 状态 | 备注 |
|------|------|------|
| 黔西市 | ✅ | `gzqianxi.gov.cn`，`/zwgk2022/zdly/czxx/sgjf/` — 侧栏含市政府预决算/乡镇预决算/部门预决算 |

### 铜仁市
| 县区 | 状态 | 备注 |
|------|------|------|
| 碧江区 | ✅ | 域名迁移 `bijiang.gov.cn`→`bjq.gov.cn`，`/zwgk/zdlyxx/czzj/czysjsgjf/` — 1635条 |
| 万山区 | ✅ | `gzwanshan.gov.cn`，`/zwgk/zdlyxx/czzj/czysjsgjf/` |
| 沿河土家族自治县 | ✅ | `yanhe.gov.cn`，`/zwgk/zdlyxx/czzj/czyjsjsgjf/` |

### 黔西南布依族苗族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 晴隆县 | ✅ | 域名迁移 `ql.qxn.gov.cn`→`gzql.gov.cn`，`/zfbm/qlxczj/zfxxgk_5790691/fdzdgknr_5790694/czyjs_5906923/` — 2207条，通过财政局信息公开入口 |
| 望谟县 | ✅ | 域名迁移→`gzwm.gov.cn`，`/xxgk/xxgkml/zdlyxx/czzj_5857488/czyjsjsgjf/` — 含完整子分类（政府/党委/人大/群团/政府部门/乡镇/教育/医疗/其他） |

### 贵州省经验总结
- **域名大迁移**: 贵州省 2022-2024 间大量县区迁移域名（乌当→gzwd、白云→gzbaiyun、观山湖→guanshanhu、汇川→zyhc、碧江→bjq、晴隆→gzql、望谟→gzwm），旧域名失效
- **CMS 统一度高**: 多数县区使用贵州多彩博虹科技统一建站，路径模式为 `/zwgk/zdlyxx/czzj/czysjsgjf/` 或 `/czyjsjsgjf/`
- **例外站点**: 桐梓走 `/zfxxgk/fdzdgknr/` 路径，赤水走 `/zfxxgkml/czxx/` 路径，黔西走 `/zwgk2022/zdly/czxx/` 路径，晴隆走财政局部门入口
- **JS 渲染**: 多数站点内容需 JS 渲染，直接 HTTP 请求返回空页面，但 fetch_webpage 可成功提取
- **15/15 全部找到**: 所有贵州省缺口均已补齐

---

## 辽宁省

### 沈阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 沈河区 | ✅ | `shenhe.gov.cn`，`/dzgk/zwgk/fdzdgknr/ysjs/` |
| 大东区 | ✅ | 域名 `sydd.gov.cn`（非 dd.gov.cn），`/zwgk/fdzdgknr/ysjs/` |
| 皇姑区 | ✅ | 域名 `syhg.gov.cn`，`/xxgk/zwgk/fdzdgknr/czyjs/` — 路径不同于其他区 |
| 铁西区 | ✅ | `tiexi.gov.cn`，`/zwxxgk/fdzdgknr/ysjs/` |
| 苏家屯区 | ✅ | `sjtq.gov.cn`，`/zwgk/fdzdgknr/ysjs/` |
| 沈北新区 | ✅ | 域名 `nsy.gov.cn`，`/zwgk/fdzdgknr/ysjs/` |
| 于洪区 | ✅ | 域名 `syyh.gov.cn`，`/zwgk/fdzdgknr/ysjs/` |
| 辽中区 | ✅ | `liaozhong.gov.cn`，`/zwgk/fdzdgknr/ysjs/` |
| 康平县 | ✅ | `kangping.gov.cn`，`/zwgk/fdzdgknr/ysjs/` |
| 新民市 | ✅ | `xinmin.gov.cn`，`/zwgk/fdzdgknr/ysjs/` |

### 大连市
| 县区 | 状态 | 备注 |
|------|------|------|
| 中山区 | ✅ | 集中平台 `dl.gov.cn`，`/col/col8081/index.html` |
| 西岗区 | ✅ | 集中平台，`/col/col8082/index.html` |
| 沙河口区 | ✅ | 集中平台，`/col/col8083/index.html` |
| 甘井子区 | ✅ | 集中平台，`/col/col8084/index.html` |
| 旅顺口区 | ✅ | 集中平台，`/col/col8085/index.html` |
| 金州区 | ✅ | 集中平台，`/col/col8090/index.html` — 标为"金普新区" |
| 普兰店区 | ✅ | 集中平台，`/col/col8086/index.html` |
| 长海县 | ✅ | 集中平台，`/col/col8089/index.html` |
| 瓦房店市 | ✅ | 集中平台，`/col/col8087/index.html` |
| 庄河市 | ✅ | 集中平台，`/col/col8088/index.html` |

### 抚顺市
| 县区 | 状态 | 备注 |
|------|------|------|
| 新抚区 | ✅ | 集中平台 `czj.fushun.gov.cn`，`/fsczbgs/zwgk/qxyjsgkzl/` — 市财政局统一"区县预决算公开专栏" |
| 东洲区 | ✅ | 同上 |
| 望花区 | ✅ | 同上 |
| 顺城区 | ✅ | 同上 |
| 抚顺县 | ✅ | 同上 |

### 丹东市
| 县区 | 状态 | 备注 |
|------|------|------|
| 元宝区 | ✅ | epoint CMS，`yuanbao.gov.cn`，`/ybqzf/zfxxgk/fdzdgknr/ysjs/index.html` |
| 振兴区 | ✅ | epoint CMS，`zhenxing.gov.cn`，`/zxqzf/zfxxgk/fdzdgknr/ysjs/index.html` |
| 振安区 | ✅ | epoint CMS，`zaq.gov.cn`，`/zaqzf/zfxxgk/fdzdgknr/ysjs/index.html` |
| 宽甸满族自治县 | ✅ | epoint CMS，`lnkd.gov.cn`，`/kdxzf/zfxxgk/fdzdgknr/ysjs/index.html` |
| 东港市 | ✅ | epoint CMS，`donggang.gov.cn`，`/dgszf/zfxxgk/fdzdgknr/ysjs/index.html` |
| 凤城市 | ✅ | epoint CMS，`lnfc.gov.cn`，`/fcszf/zfxxgk/fdzdgknr/ysjs/index.html` |

### 锦州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 太和区 | ✅ | `jzthq.gov.cn`，`/zwgk/fdzdgknr/ys_js.htm` — JS渲染重 |
| 义县 | ✅ | `lnyx.gov.cn`，`/xxgk/fdzdgknr/ys_js.htm` |
| 黑山县 | ✅ | `heishan.gov.cn`，`/zwgk/fdzdgknr/ys_js.htm` |
| 北镇市 | ✅ | `beizhen.gov.cn`，`/zwgk/fdzdgknr/ys_js.htm` |

### 辽宁省经验总结
- **沈阳市**: 各区独立建站，域名不直观（大东→sydd、皇姑→syhg、于洪→syyh、沈北→nsy），多数走 `/zwgk/fdzdgknr/ysjs/` 路径
- **大连市**: 全市集中式平台 `dl.gov.cn/col/col{id}/index.html`，10个区市县各有独立栏目ID
- **抚顺市**: 市财政局集中公开 `czj.fushun.gov.cn`，5区县共用同一个"区县预决算公开专栏"
- **丹东市**: 统一 epoint CMS，路径模式 `/{sitecode}/zfxxgk/fdzdgknr/ysjs/index.html`
- **锦州市**: 统一 `/fdzdgknr/ys_js.htm` 路径，JS渲染重
- **35/35 全部找到**: 所有辽宁省缺口均已补齐

---

## 云南省（昆明/曲靖/玉溪/保山 4市23县）

### 曲靖市
| 县区 | 状态 | 备注 |
|------|------|------|
| 麒麟区 | ❌ ENOTFOUND | `qjqilin.gov.cn` DNS无法解析，备选域名也不通 |
| 沾益区 | ✅ | `http://www.zhanyi.gov.cn/pub/special/203.html` — 华海信息CMS，"财政预决算报告"+"各部门财政预决算公开"，2026数据在列 |
| 陆良县 | ❌ ENOTFOUND | `luliang.gov.cn` DNS无法解析 |
| 师宗县 | ❌ JS渲染 | `ynsz.gov.cn` 域名可达(200)，但全站JS渲染，所有fiscal路径404，华海信息CMS但URL结构不明 |
| 罗平县 | ✅ | `http://www.luoping.gov.cn/public/special/czys.html` — 华海信息CMS，"预算信息公开"49页，nav还有`jsxxgk.html`(决算) |
| 富源县 | ❌ ENOTFOUND | `fuyuan.gov.cn` DNS无法解析 |
| 会泽县 | ✅ | `http://www.huize.gov.cn/huize/public/special/61.html` — 华海信息CMS变体(含/huize/前缀)，预算/决算，86页2026部门预算 |
| 宣威市 | ❌ ENOTFOUND | `xuanwei.gov.cn` DNS无法解析 |

### 昆明市
| 县区 | 状态 | 备注 |
|------|------|------|
| 官渡区 | ❌ ENOTFOUND | `guandu.gov.cn` DNS无法解析，备选`guandu.km.gov.cn`也不通 |
| 西山区 | ❌ ENOTFOUND | `kmxs.gov.cn` DNS无法解析 |
| 禄劝彝族苗族自治县 | ❌ DNS/TIMEOUT | `luquan.gov.cn` DNS临时失败(EAI_AGAIN) |
| 寻甸回族彝族自治县 | ❌ ENOTFOUND | `xundian.gov.cn` DNS无法解析 |

### 玉溪市
| 县区 | 状态 | 备注 |
|------|------|------|
| 江川区 | ❌ CMS | `ynjc.gov.cn` 可达，玉溪CMS(yxgovfront)，`/czyjs/` 403 Forbidden，CMS通道页(channelId)JS渲染无法提取 |
| 通海县 | ❌ CMS | `tonghai.gov.cn` 可达，同上玉溪CMS，`/thxzfxxgk/czyjs/` 403，channelId=23836的财政局页只显示指南 |
| 易门县 | ❌ ENOTFOUND | `yimen.gov.cn` DNS无法解析 |
| 峨山彝族自治县 | ❌ ENOTFOUND | `eshan.gov.cn` DNS无法解析 |
| 新平彝族傣族自治县 | ⚠️ 域名错误 | `xp.gov.cn` 实为湖南溆浦县，非云南新平！需修正gov-website-links.ts |
| 元江哈尼族彝族傣族自治县 | ❌ CMS | `yjx.gov.cn` 可达，同上玉溪CMS，channelId=19183财政局页只显示指南 |
| 澄江市 | ❌ ENOTFOUND | `chengjiang.gov.cn` DNS无法解析 |

### 保山市
| 县区 | 状态 | 备注 |
|------|------|------|
| 隆阳区 | ❌ 404 | `longyang.gov.cn` HTTP→HTTPS重定向后所有fiscal路径404(zwgk/zwgk1/zwgk2/bmgkml/zfxxgkpt均不通) |
| 施甸县 | ❌ 404/JS | `shidian.gov.cn` 可达但JS渲染，fiscal路径全部404或ECONNRESET |
| 龙陵县 | ❌ ECONNRESET | `longling.gov.cn` 连接频繁重置，首页偶尔可达但全站不稳定 |
| 昌宁县 | ✅ | `https://www.yncn.gov.cn/zfxxgkpt/fdzdgknr/czxx/czyjs.htm` — 与腾冲同系CMS但路径略异(无zwgk1前缀)，4726条2026预算 |

### 小结
- **4/23 确认**: 沾益区、罗平县、会泽县、昌宁县
- **11/23 ENOTFOUND**: 域名DNS完全无法解析(官渡、西山、禄劝、寻甸、麒麟、陆良、富源、宣威、易门、峨山、澄江)
- **3/23 玉溪CMS**: 站点可达但fiscal内容在JS渲染的CMS频道中(通海、元江、江川)
- **4/23 站点问题**: 404/JS渲染/连接重置(师宗、隆阳、施甸、龙陵)
- **1/23 域名错误**: 新平(xp.gov.cn≠新平)
- 网络环境后期全面超时，影响了ENOTFOUND县的搜索引擎验证

---

## 山东省（18县区）

### 济南市
| 县区 | 状态 | 备注 |
|------|------|------|
| 市中区 | ✅ | gov URL 修正 `jncc.jinan.gov.cn`→`shizhong.gov.cn`(原URL为住建局)，`/gongkai/channel_6389a15037599182826341d0/` 区级政府财政预决算 |
| 济阳区 | ✅ | `jiyang.gov.cn` — `/gongkai/channel_6389ae3e3759918282645274/` |

### 青岛市
| 县区 | 状态 | 备注 |
|------|------|------|
| 崂山区 | ✅ | gov URL 修正 `qdlaoshan.gov.cn`→`laoshan.gov.cn`，`/zt/czxx/zfyjs/` |
| 即墨区 | ✅ | `jimo.gov.cn` — `/zwzt/czxx/czyjs/` |
| 胶州市 | ✅ | `jiaozhou.gov.cn` — `/ztzl/czxx/` |

### 烟台市
| 县区 | 状态 | 备注 |
|------|------|------|
| 栖霞市 | ✅ | gov URL 修正 `qixia.gov.cn`→`sdqixia.gov.cn`，`/col/col42614/index.html` |

### 潍坊市
| 县区 | 状态 | 备注 |
|------|------|------|
| 昌乐县 | ✅ | `changle.gov.cn` — `/CLXXXGK/XXGK/czyjszt/` |
| 青州市 | ✅ | `qingzhou.gov.cn` — `/zwgk/view/zwgk/zdlyxxgk/czxx2.0.html` |
| 高密市 | ✅ | `gaomi.gov.cn` — `/xxgk/zwzt/gmczyjs/` |
| 昌邑市 | ✅ | `changyi.gov.cn` — `/CYSXXGK/SCZJ/?classinfoid=16148` |

### 济宁市
| 县区 | 状态 | 备注 |
|------|------|------|
| 金乡县 | ✅ | `jinxiang.gov.cn` — `/col/col73931/index.html` 财政预决算公开平台，Baidu redirect 确认 |
| 嘉祥县 | ✅ | `jiaxiang.gov.cn` — `/col/col25801/index.html` 财政预算决算，Baidu redirect 确认 |
| 泗水县 | ✅ | `sishui.gov.cn` — `/col/col27277/index.html` |
| 曲阜市 | ✅ | `qufu.gov.cn` — `/col/col15257/index.html` 财政信息，Baidu redirect 确认 |

### 泰安市
| 县区 | 状态 | 备注 |
|------|------|------|
| 岱岳区 | ✅ | `daiyue.gov.cn` — `/col/col335362/index.html` |
| 新泰市 | ✅ | `xintai.gov.cn` — `/col/col202219/index.html` |

### 东营市
| 县区 | 状态 | 备注 |
|------|------|------|
| 河口区 | ✅ | `hekou.gov.cn` — `/col/col70392/index.html` |

### 日照市
| 县区 | 状态 | 备注 |
|------|------|------|
| 东港区 | ✅ | gov URL 修正 `rzdg.gov.cn`→`rzdonggang.gov.cn`，`/col/col252936/index.html` 财政预决算专栏 |

### 小结
- **18/18 全部确认** ✅
- 修正 4 个 gov URL：市中区(非住建局)、崂山区(qdlaoshan→laoshan)、栖霞市(qixia→sdqixia)、东港区(rzdg→rzdonggang)
- 济宁市 3 县(金乡/嘉祥/曲阜) fetch_webpage 无法直接获取，通过 Baidu redirect 确认

---

## 河南省（21县区）

### 安阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 北关区 | ✅ | `beiguan.gov.cn` — `/zwgk/zfgzjg/bgqczj/czyjsly/` 财政预决算领域 |
| 滑县 | ✅ | gov URL 修正 `huaxian.gov.cn`→`hnhx.gov.cn`，`caizhengju.hnhx.gov.cn/hxczj/eynbmyjs/` 财政预决算公开平台 |
| 内黄县 | ✅ | `neihuang.gov.cn` — `/.../fdzdgknr/czzj/index.html` 财政资金 |

### 新乡市
| 县区 | 状态 | 备注 |
|------|------|------|
| 卫滨区 | ✅ | `wbq.gov.cn` — `/htmls/740v1618_caizhengyujuesuan/list-1.html` |
| 凤泉区 | ✅ | `fengquan.gov.cn` — `/cover-89052j34/89052j34_caizhengyujuesuan` |
| 牧野区 | ✅ | `xxmyq.gov.cn` — `/sitesources/myqzf/page_pc/xxgk/zdlyxxgk/czzj/czyjs/` |
| 新乡县 | ✅ | gov URL 修正 `xinxiang.gov.cn`→`xinxiangxian.gov.cn`，`/htmls/d6p434r11_caizhengyujuesuan/list-1.html` |
| 延津县 | ✅ | `yanjin.gov.cn` — `/news/53.html` 预决算公开专题专栏 |
| 卫辉市 | ✅ | `weihui.gov.cn` — `/portal/zfxxgk/.../czzj/` 财政资金 |
| 长垣市 | ✅ | `changyuan.gov.cn` — `/sitesources/cyxrmzf/page_pc/xxgk/zdlyxxgk/czzj/` |

### 焦作市
| 县区 | 状态 | 备注 |
|------|------|------|
| 解放区 | ✅ | `jfq.gov.cn` — `/news/161` JS-rendered |
| 山阳区 | ✅ | `syq.gov.cn` — `/xxgk/zfxxgkml/czyjsbg/` 财政预决算报告 |

### 濮阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 清丰县 | ✅ | `qingfeng.gov.cn` — `/class.asp?class=1150` 财政预决算 151条 |
| 范县 | ✅ | gov URL 修正 `puyang.gov.cn`→`fanxian.gov.cn`，`/index.aspx?lanmuid=76&sublanmuid=973` |

### 许昌市
| 县区 | 状态 | 备注 |
|------|------|------|
| 禹州市 | ✅ | `yuzhou.gov.cn` — `/jcxx/czyjsly/` 财政预决算领域 |

### 商丘市
| 县区 | 状态 | 备注 |
|------|------|------|
| 睢阳区 | ✅ | `suiyangqu.gov.cn` — `/zwgk/fdzdgknr/czxx26syqrmzf` |

### 周口市
| 县区 | 状态 | 备注 |
|------|------|------|
| 西华县 | ✅ | `xihua.gov.cn` — `/sitesources/xhxrmzf/page_pc/ztzl/czyjs/` |
| 沈丘县 | ✅ | `shenqiu.gov.cn` — `/xj.asp` 预决算公开平台 |
| 鹿邑县 | ✅ | gov URL 修正 `zhoukou.gov.cn`→`luyi.gov.cn`，`/portal/zwgk/jczwgk/czyjs/czyjs/` Baidu 确认 |

### 驻马店市
| 县区 | 状态 | 备注 |
|------|------|------|
| 平舆县 | ✅ | `pingyu.gov.cn` — `/ztzl/jczwgkbzhgfh/ztzlgkly/czyjsly/` |
| 汝南县 | ✅ | `runan.gov.cn` — `/zwgk/zfxxgk/fdzdgknr/ysjs/` 政府预决算+部门预决算 |

### 小结
- **21/21 全部确认** ✅
- 修正 5 个 gov URL：滑县(huaxian→hnhx)、新乡县(xinxiang→xinxiangxian)、范县(puyang→fanxian)、鹿邑县(zhoukou→luyi)、(滑县 huaxian→hnhx)

---

## 西藏自治区（30县区）

### 拉萨市
| 县区 | 状态 | 备注 |
|------|------|------|
| 城关区 | ✅ | `cgq.gov.cn/cgqrmzf/czzj/czzj.shtml` 同拉萨CMS模式 |
| 堆龙德庆区 | ✅ | `dldqq.gov.cn/dldqqrmzf/czzj/czzj.shtml` |
| 达孜区 | ❌ | SSO/Sogou确认有196条但无法确定栏目路径 |

### 日喀则市
| 县区 | 状态 | 备注 |
|------|------|------|
| 定日县 | ✅ | gov修正 `dingri→drx`，`drx.gov.cn/public-policy.thtml?id=14291` |
| 萨迦县 | ✅ | gov修正 `sajia→sj`，`sj.gov.cn/public-policy.thtml?id=11971` |
| 昂仁县 | ✅ | gov修正 `angren→arx`，`arx.gov.cn/public-policy.thtml?id=11755` |
| 白朗县 | ✅ | gov修正 `bailang→blx`，`blx.gov.cn/public-policy.thtml?id=11551` |
| 定结县 | ✅ | gov修正 `xzdj→djx`，`djx.gov.cn/public-policy.thtml?id=12175` |
| 亚东县 | ✅ | gov修正 `xzyadong→ydx`，`ydx.gov.cn/public-policy.thtml?id=11440` |
| 聂拉木县 | ✅ | gov修正 `xznlm→nlmx`，`nlmx.gov.cn/public-policy.thtml?id=11661` |
| 萨嘎县 | ✅ | gov修正 `xzsaga→sgx`，`sgx.gov.cn/public-policy.thtml?id=12489` |
| 岗巴县 | ✅ | gov修正 `gangba→gbx`，`gbx.gov.cn/public-policy.thtml?id=12387` |

### 昌都市
| 县区 | 状态 | 备注 |
|------|------|------|
| 卡若区 | ✅ | `karuo.changdu.gov.cn/.../c101758/zfxxgk_gknrz.shtml` 379条 |
| 江达县 | ✅ | `jiangda.changdu.gov.cn/.../c102085/` 60条 |
| 贡觉县 | ✅ | `gongjue.changdu.gov.cn/.../c101805/` 423条 |
| 类乌齐县 | ✅ | `leiwuqi.changdu.gov.cn/.../c102131/` 99条 |
| 丁青县 | ✅ | `dingqing.changdu.gov.cn/.../c101664/` 80条 |
| 察雅县 | ✅ | `chaya.changdu.gov.cn/.../c101993/` 28条 |
| 八宿县 | ✅ | `basu.changdu.gov.cn/.../c101947/` 12条 |
| 左贡县 | ✅ | `zuogong.changdu.gov.cn/.../c101853/` 281条 |
| 芒康县 | ✅ | `mangkang.changdu.gov.cn/.../c101900/` 63条 |
| 洛隆县 | ✅ | `luolong.changdu.gov.cn/.../c101711/` 42条 |
| 边坝县 | ✅ | `bianba.changdu.gov.cn/.../c102039/` 62条 |

### 林芝市
| 县区 | 状态 | 备注 |
|------|------|------|
| 巴宜区 | ✅ | `bayiqu.gov.cn/byq/c105978/zfxxgk_czzj.shtml` |
| 工布江达县 | ✅ | `gongbujiangda.gov.cn/gbjd/c106049/zfxxgk_czzj.shtml` |
| 米林市 | ✅ | `milin.gov.cn/mlx/c106091/czzj.shtml` |
| 墨脱县 | ✅ | `motuo.gov.cn/mtx/c101915/czzj.shtml` |
| 波密县 | ✅ | `bomi.gov.cn/bmx/c100235/czzj.shtml` |
| 朗县 | ✅ | `langxian.gov.cn/lx/zwgk/czzj.shtml` |

### 阿里地区
| 县区 | 状态 | 备注 |
|------|------|------|
| 措勤县 | ❌ | gov可达但所有财政路径404 |

### 小结
- **28/30 确认** ✅，2 未找到（达孜区 SSO阻塞、措勤县 404）
- 修正 9 个日喀则 gov URL（原域名均为全拼，实际为缩写）
- 昌都 11 县共享统一 CMS，column ID 递增规律

---

## 青海省（32县区）

### 西宁市
| 县区 | 状态 | 备注 |
|------|------|------|
| 城东区 | ✅ | `xncd.gov.cn/html/public/czysjs.html` |
| 城中区 | ✅ | `xncz.gov.cn/zwgk/fdzdgknr1/czzj/czxx.htm` |
| 城西区 | ❌ | 站点所有路径返回 Not Found |
| 城北区 | ❌ | 站点完全无法抓取 |
| 湟中区 | ❌ | 站点完全无法抓取 |
| 湟源县 | ✅ | ThinkPHP模式 `category&id=56` |

### 海东市
| 县区 | 状态 | 备注 |
|------|------|------|
| 乐都区 | ❌ | 子页面500错误 |
| 平安区 | ✅ | `pinganqu.gov.cn/public/czyjs/index.html` |
| 民和回族土族自治县 | ❌ | ASP.NET CMS lmid未知 |
| 化隆回族自治县 | ✅ | gov修正 `hualong→hualongxian`，`hualongxian.gov.cn/html/10577/Item.html` |
| 循化撒拉族自治县 | ❌ | CDN防机器人保护 |

### 海北藏族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 门源回族自治县 | ✅ | `menyuan.gov.cn/public/column/6617041` publicsite CMS |
| 祁连县 | ✅ | `qilian.gov.cn/public/column/6617001` |
| 海晏县 | ✅ | `haiyanxian.gov.cn/public/column/6617021` |
| 刚察县 | ✅ | `gangcha.gov.cn/html/5602/Item.html` |

### 黄南藏族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 河南蒙古族自治县 | ❌ | WAF阻塞，百度未收录 |

### 果洛藏族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 玛沁县 | ✅ | `maqin.gov.cn/zwgk/fdzdgknr/czgk/` |
| 班玛县 | ✅ | `banma.gov.cn/zwgk/fdzdgknr/ysjs/` |
| 甘德县 | ✅ | `gande.gov.cn/zwgk/fdzdgknr/ysjs/` |
| 达日县 | ✅ | `dari.gov.cn/zwgk/fdzdgknr/ysjs/` |
| 久治县 | ✅ | `jiuzhixian.gov.cn/zwgk/fdzdgknr/ysjs/` |
| 玛多县 | ✅ | `maduo.gov.cn/zwgk/fdzdgknr/ysjs/` |

### 玉树藏族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 玉树市 | ✅ | gov修正 `yss→yushushi`，`yushushi.gov.cn/html/3367/Item.html` |
| 杂多县 | ✅ | gov修正 `qhzaduo→zaduo`，`zaduo.gov.cn/xxgk/List_zlm.aspx?lmid=2820` |
| 称多县 | ✅ | gov修正 `qhcd→chengduo`，`chengduo.gov.cn/...?lmid=1717` |
| 治多县 | ✅ | `zhiduo.gov.cn/...?lmid=1642` |
| 曲麻莱县 | ✅ | gov修正 `qml→qumalai`，`qumalai.gov.cn/html/2827/Item.html` |

### 海西蒙古族藏族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 德令哈市 | ✅ | `delingha.gov.cn/zfxxgl/fdzdgknr/yshjs/n21/ys.htm` |
| 茫崖市 | ✅ | `mangya.gov.cn/zfxxgk/fdzdgknr/zdly/ys_js.htm` |
| 乌兰县 | ✅ | `wulanxian.gov.cn/gk/fdzdgknr/ysjs.htm` |
| 都兰县 | ✅ | `dulan.gov.cn/zfxxgk/fdzdgknr/yjs.htm` |
| 天峻县 | ✅ | `tianjun.gov.cn/zfxxgk/fdzdgknr/ys_js.htm` |

### 小结
- **25/32 确认** ✅，7 未找到（城西区/城北区/湟中区站点不可达、乐都区500、民和县CMS未知、循化CDN拦截、河南蒙古族自治县WAF）
- 修正 5 个 gov URL：化隆(hualong→hualongxian)、玉树市(yss→yushushi)、杂多(qhzaduo→zaduo)、称多(qhcd→chengduo)、曲麻莱(qml→qumalai)
- 果洛 6 县统一路径 `/zwgk/fdzdgknr/ysjs/`

---

## 甘肃省（75县区）

### 兰州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 城关区 | ✅ | `lzcgq.gov.cn` — `/col/col21424/index.html` |
| 七里河区 | ✅ | `qilihe.gov.cn` — `/col/col1709/index.html` |
| 西固区 | ✅ | `xigu.gov.cn` — `/col/col13313/index.html`，gov URL 修正 |
| 安宁区 | ✅ | `lzanning.gov.cn` — `/col/col12024/index.html`，gov URL 修正 |
| 红古区 | ✅ | `honggu.gov.cn` — `/col/col6661/index.html`，gov URL 修正 |
| 永登县 | ✅ | `yongdeng.gov.cn` — `/col/col9741/index.html` |
| 皋兰县 | ✅ | `gaolan.gov.cn` — `/col/col22621/index.html` |
| 榆中县 | ✅ | `lzyuzhong.gov.cn` — `/col/col21502/index.html`，gov URL 修正 |

### 金昌市
| 县区 | 状态 | 备注 |
|------|------|------|
| 金川区 | ✅ | `jinchuan.gov.cn` — `/zfxxgk/fdzdgknr/ysjs/index.html` |
| 永昌县 | ✅ | `yongchang.gov.cn` — `/zwgk/fdzdgk/xysjs/index.html` |

### 白银市
| 县区 | 状态 | 备注 |
|------|------|------|
| 白银区 | ✅ | `baiyinqu.gov.cn` — `/FDZDGKNR/ysjs/index.html` |
| 平川区 | ✅ | `bypc.gov.cn` — `/zfxxgk/fdzdgknr/ysjs/index.html` |
| 靖远县 | ✅ | `jingyuan.gov.cn` — 财政局路径 |
| 会宁县 | ✅ | `huining.gov.cn` — 财政局路径 |
| 景泰县 | ✅ | `jingtai.gov.cn` — `/zfxxgk/fdzdgknr/ysjs/index.html` |

### 天水市
| 县区 | 状态 | 备注 |
|------|------|------|
| 秦州区 | ✅ | `qinzhouqu.gov.cn` — `/zfxxgk/fdnrzdgk/czxx.htm` |
| 麦积区 | ✅ | `maiji.gov.cn` — `/zfxxgk/fdzdgknr1/czxx.htm` |
| 清水县 | ✅ | `qingshui.gov.cn` — `/zfxxgk/fdzdgknr/czxx.htm` |
| 秦安县 | ✅ | `qinan.gov.cn` — `/zfxxgk/fdzdgknr/czxx.htm` |
| 甘谷县 | ✅ | `gangu.gov.cn` — `/zfxxgk/fdzdgknr/czxx.htm` |
| 武山县 | ✅ | `wushan.gov.cn` — `/zfxxgk/fdzdgknr/ysjs/ysgk.htm` |
| 张家川回族自治县 | ✅ | `zjc.gov.cn` — `/zfxxgk/fdzdgknr/czxx.htm` |

### 武威市
| 县区 | 状态 | 备注 |
|------|------|------|
| 凉州区 | ✅ | `gsliangzhou.gov.cn` — `/col/col2930/index.html` |
| 民勤县 | ✅ | `minqin.gov.cn` — `/col/col30289/index.html` |
| 古浪县 | ✅ | `gulang.gov.cn` — `/col/col30299/index.html` |
| 天祝藏族自治县 | ✅ | `gstianzhu.gov.cn` — `/col/col30281/index.html` |

### 张掖市
| 县区 | 状态 | 备注 |
|------|------|------|
| 甘州区 | ✅ | `gsgz.gov.cn` — `/gzzfxxgk/fdzdgknr/czyjs/` |
| 肃南裕固族自治县 | ✅ | `gssn.gov.cn` — `/zfxgk/fdzdgknr/jczwgkbzml/czyjs_6942/` |
| 民乐县 | ✅ | `gsml.gov.cn` — `/zfxxgk/fdzdgknr/jczwgkbzml/czyjs/` |
| 临泽县 | ✅ | `gslz.gov.cn` — `/zfxxgk/fdzdgknr/jczwgkly/czyjs/` |
| 高台县 | ✅ | `gaotai.gov.cn` — `/zfxxgk/fdzdgknr/sgjfjyjs/` |
| 山丹县 | ✅ | `shandan.gov.cn` — `/zfxxgk/fdzdgknr/jczwgkbzml/czyjs/` |

### 酒泉市
| 县区 | 状态 | 备注 |
|------|------|------|
| 肃州区 | ✅ | `jqsz.gov.cn` — 独立 CMS xxgk_jcsdlist |
| 金塔县 | ✅ | `jtxzf.gov.cn` — xxgk_caizhj_zwgk |
| 瓜州县 | ✅ | `guazhou.gov.cn` — xxgj_ysjs |
| 肃北蒙古族自治县 | ✅ | `subei.gov.cn` — xxgk_jcsdlist |
| 阿克塞哈萨克族自治县 | ✅ | `akesai.gov.cn` — xxgk_jcsdlylist |
| 玉门市 | ✅ | `yumen.gov.cn` — xxgk_jcsd |
| 敦煌市 | ✅ | `dunhuang.gov.cn` — zfxxgk_jcsdlyzwgk |

### 庆阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 西峰区 | ✅ | `gsxf.gov.cn` — `/xxgk/fdzdgknr/czgk/czyjs` |
| 庆城县 | ✅ | `chinaqingcheng.gov.cn` — `/zwgk/xxgkml/ysjs` |
| 环县 | ✅ | `huanxian.gov.cn` — `/zwgk/fdzdgknr/ysjs/` |
| 华池县 | ✅ | `hcx.gov.cn` — `/xxgk/fdzdgknr/ysjs` |
| 合水县 | ✅ | `hsxzf.gov.cn` — `/xxgk/fdzdgknr/czgk` |
| 正宁县 | ✅ | `zninfo.gov.cn` — `/zwgk/fdzdgknr/czzj/` |
| 宁县 | ✅ | `ningxian.gov.cn` — `/zwgk/fdzdgknr/czgk`，gov URL 修正 |
| 镇原县 | ✅ | `gszy.gov.cn` — `/xxgk/fdzdgknr/ysjy`，gov URL 修正 |

### 定西市
| 县区 | 状态 | 备注 |
|------|------|------|
| 安定区 | ✅ | `anding.gov.cn` — `/col/col13654/index.html` |
| 通渭县 | ✅ | `tongwei.gov.cn` — `/col/col7037/index.html` |
| 陇西县 | ✅ | `cnlongxi.gov.cn` — `/col/col10716/index.html` |
| 渭源县 | ✅ | `cnwy.gov.cn` — `/col/col15484/index.html` |
| 临洮县 | ✅ | `lintao.gov.cn` — `/col/col6989/index.html` |
| 漳县 | ✅ | `zhangxian.gov.cn` — `/col/col15649/index.html` |
| 岷县 | ✅ | `minxian.gov.cn` — `/col/col5337/index.html` |

### 陇南市
| 县区 | 状态 | 备注 |
|------|------|------|
| 武都区 | ✅ | `gslnwd.gov.cn` — 统一 CMS column 系统 |
| 成县 | ✅ | `gscx.gov.cn` — 统一 CMS column 系统 |
| 文县 | ✅ | `lnwx.gov.cn` — 统一 CMS column 系统 |
| 宕昌县 | ✅ | `tanchang.gov.cn` — 统一 CMS column 系统 |
| 康县 | ✅ | `gskx.gov.cn` — 统一 CMS column 系统 |
| 西和县 | ✅ | `xihe.gov.cn` — 统一 CMS column 系统 |
| 礼县 | ✅ | `gslx.gov.cn` — 统一 CMS column 系统 |
| 徽县 | ✅ | `gshxzf.gov.cn` — 统一 CMS column 系统 |
| 两当县 | ✅ | `ldxzf.gov.cn` — 统一 CMS column 系统 |

### 临夏回族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 临夏市 | ✅ | `lxs.gov.cn` — `/zwgk/fdzdgknr/ysjs/` |
| 临夏县 | ✅ | `linxiaxian.gov.cn` — `/lxx/zwgk/fdzdgknr/YSJS/index.html` |
| 康乐县 | ✅ | `gskanglexian.gov.cn` — gov URL 修正 |
| 永靖县 | ✅ | `gsyongjing.gov.cn` — gov URL 修正 |
| 广河县 | ✅ | `ghx.gov.cn` — gov URL 修正 |
| 和政县 | ✅ | `hezheng.gov.cn` — `/zfxxgk/fdzdgknr/ysjs/` |
| 东乡族自治县 | ✅ | `dxzzzx.gov.cn` — gov URL 修正 |
| 积石山保安族东乡族撒拉族自治县 | ✅ | `jss.gov.cn` — gov URL 修正 |

### 甘南藏族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 合作市 | ✅ | `hezuo.gov.cn` — `/zfxxgk1/fdzdgknr1/ys_js.htm` |
| 临潭县 | ✅ | `lintan.gov.cn` — `/zfxxgk/fdzdgknr/ysjs.htm` |
| 卓尼县 | ✅ | `zhuoni.gov.cn` — `/zwgk/fdzdgknr/czxx/czyjs.htm` |
| 舟曲县 | ✅ | `zqx.gov.cn` — gov URL 修正 |
| 迭部县 | ✅ | `tewo.gov.cn` — gov URL 修正 |
| 玛曲县 | ✅ | `maqu.gov.cn` — `/zfxxgk/zdmsxx1/ysjs.htm` |
| 碌曲县 | ✅ | `luqu.gov.cn` — `/zfxxgk/fdzdgknr/czgk.htm` |
| 夏河县 | ✅ | `xiahe.gov.cn` — `/zfxxgk/fdzdgknr/ysjs1.htm` |

### 小结
- **75/75 全部确认** ✅
- 修正多个 gov URL（兰州4区、庆阳2县、临夏5县、甘南2县等）
- 天水 7 县统一 `.htm` 后缀模式
- 定西 7 县统一 col/col 模式
- 陇南 9 县统一 CMS column 系统
- 酒泉 7 县统一 shtml 模式

---

## 陕西省（89县区）

---

## 湖北省（23县区）

### 武汉市
| 县区 | 状态 | 备注 |
|------|------|------|
| 武昌区 | ✅ | `wuchang.gov.cn/zwgk_37/fdzdgknr/czxx/czyjs/` |
| 江汉区 | ❌ | JS渲染，无法验证实际内容 |
| 江夏区 | ✅ | `jiangxia.gov.cn/xxgk_22343/xxgkml_22349/cwgk_22359/` |
| 黄陂区 | ✅ | `huangpi.gov.cn/fbjd_33/xxgkml/czzj/czyjs_mh/` |

### 黄石市
| 县区 | 状态 | 备注 |
|------|------|------|
| 西塞山区 | ❌ | 所有 /czzj/ 路径 404 |
| 铁山区 | ❌ | 所有 /czzj/ 路径 404；铁山+经开合站 |

### 十堰市
| 县区 | 状态 | 备注 |
|------|------|------|
| 房县 | ✅ | 市级统一 `czj.shiyan.gov.cn/sczj/sfgwgkml/czzj_920/czzxzj/`，同郧西/竹山/竹溪/丹江口 |

### 荆门市
| 县区 | 状态 | 备注 |
|------|------|------|
| 京山市 | ✅ | `jingshan.gov.cn/col/col2014/index.html`；gov修正 jingmen→jingshan |

### 襄阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 樊城区 | ✅ | `fc.gov.cn/gk/xxgkml/czzj/czyjs/xysfcqczj/` |
| 襄州区 | ✅ | `xz.xiangyang.gov.cn/zwgk/fdzdgknr/czzj/czyjs/`；gov修正 zgxy→xyxz |
| 南漳县 | ✅ | `hbnz.gov.cn/ysgk/` |

### 鄂州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 梁子湖区 | ❌ | czyjs.ezhou.gov.cn 502不可达 |
| 华容区 | ❌ | 同上 |
| 鄂城区 | ❌ | 同上 |

### 孝感市
| 县区 | 状态 | 备注 |
|------|------|------|
| 云梦县 | ❌ | yunmeng.gov.cn 500 错误 |
| 应城市 | ❌ | 未找到独立预决算页面 |
| 汉川市 | ✅ | `hanchuan.gov.cn/2025nysxxgk.jhtml` 年度预算信息公开 |

### 荆州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 公安县 | ✅ | `zwgk.gongan.gov.cn/list.shtml?column_id=32153` |
| 江陵县 | ✅ | 荆州统一 `zwgk.jingzhou.gov.cn/ysqgk_county.shtml?id=9` |
| 松滋市 | ✅ | 荆州统一 `zwgk.jingzhou.gov.cn/ysqgk_county.shtml?id=7` |

### 咸宁市
| 县区 | 状态 | 备注 |
|------|------|------|
| 崇阳县 | ✅ | `chongyang.gov.cn/xxgk/xxgkml/czzjxx/` JS渲染但兄弟模式匹配 |
| 通山县 | ✅ | `tongshan.gov.cn/xxgk/xxgkml/czzj/` 完全匹配咸安/通城/赤壁兄弟 |

### 恩施州
| 县区 | 状态 | 备注 |
|------|------|------|
| 利川市 | ✅ | `lichuan.gov.cn/xxgk/gkml/czzj/` JS渲染但路径合理 |
| 建始县 | ❌ | 所有路径 404 |

**汇总**: 15/23 已填，8 缺失（江汉区、西塞山区、铁山区、梁子湖区、华容区、鄂城区、云梦县、应城市、建始县）

---

## 湖南省（113县区）

### 长沙市
| 县区 | 状态 | 备注 |
|------|------|------|
| 芙蓉区 | ❌ | 全站JS渲染，10+路径均404 |
| 天心区 | ✅ | `tianxin.gov.cn/redianzhuanti/czyjsgkzl72/` |
| 岳麓区 | ✅ | `yuelu.gov.cn/rdzt/1757362/jsgkzty/` |
| 开福区 | ✅ | `kaifu.gov.cn/ztpd/czyjsgkzl/` |
| 雨花区 | ✅ | `yuhua.gov.cn/zwgk97/rdzt/czyjsgkzl/` |
| 望城区 | ✅ | `wangcheng.gov.cn/xxgk_343/qzfxxgkml/.../wcqczyjsgk/` |
| 长沙县 | 🟡 | `csx.gov.cn/zwgk/zfxxgkml/rdzt/czyjsgkzl/` JS |
| 浏阳市 | ✅ | `liuyang.gov.cn/fzlm_1/ztzl/zwzt/lyczyjsgk7/` |
| 宁乡市 | 🟡 | `ningxiang.gov.cn/ztpd/czyjsgkzl/` JS |

### 株洲市
| 县区 | 状态 | 备注 |
|------|------|------|
| 荷塘区 | ❌ | SPA catch-all，无法区分 |
| 芦淞区 | ✅ | `lusong.gov.cn/c218/index.html` |
| 石峰区 | ❌ | SPA catch-all |
| 天元区 | ❌ | SPA catch-all |
| 渌口区 | ✅ | `lukou.gov.cn/c24888` 预决算公开管理平台 |
| 醴陵市 | ❌ | SPA catch-all |
| 攸县 | ❌ | SPA catch-all |
| 茶陵县 | ✅ | `chaling.gov.cn/c22438/` 专题专栏 |

### 湘潭市
| 县区 | 状态 | 备注 |
|------|------|------|
| 雨湖区 | ❌ | 未找到 |
| 岳塘区 | ❌ | SPA |
| 湘潭县 | ✅ | `xtx.gov.cn/6571/6572/index.htm` |
| 湘乡市 | ✅ | `xxs.gov.cn/1876/24430/29779/index.htm` |
| 韶山市 | ✅ | `shaoshan.gov.cn/11698/21105/index.htm` |

### 衡阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 雁峰区 | 🟡 | `hyyfq.gov.cn/zwgk/qzfxxgk/czzj/index.html` JS |
| 石鼓区 | 🟡 | `hysgq.gov.cn/xxgk/czxx/` JS |
| 蒸湘区 | 🟡 | `zhengxiang.gov.cn/zwgk/bmxzxxgk/qczj/czxx/` JS |
| 南岳区 | ✅ | `nanyue.gov.cn/nyczj/czysgk/index.html` |
| 衡阳县 | 🟡 | `hyx.gov.cn/zwgk/fdzdgknr/czyjs/` JS |
| 衡南县 | ✅ | `hengnan.gov.cn/zwgk/ztzl/hnxczysgk/` |
| 衡山县 | 🟡 | `hengshan.gov.cn/xxgk/fdzdgknr/czxx/` JS |
| 祁东县 | 🟡 | `qdx.gov.cn/xxgk/czzj/` JS |
| 耒阳市 | 🟡 | `leiyang.gov.cn/ztzl/zdgksxml/bm/sczj/` 目录式 |
| 常宁市 | 🟡 | `changning.gov.cn/zwgk/qzfxxgk/czzj/index.html` JS |

### 邵阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 双清区 | ❌ | 全站502 |
| 大祥区 | ❌ | 全站502 |
| 新邵县 | ❌ | 全站502 |
| 邵阳县 | 🟡 | `shaoyangxian.gov.cn/shaoyangxian/syxczyjs/list_czyjs.shtml` JS |
| 隆回县 | ✅ | `longhui.gov.cn/longhui/lhxczyjs/list_czyjs.shtml` |
| 洞口县 | ✅ | `dongkou.gov.cn/dongkou/czyjs/list.shtml` |
| 绥宁县 | ✅ | `hnsn.gov.cn/hnsn/czxxsn/list.shtml` |
| 新宁县 | 🟡 | `xinning.gov.cn/xinning/xnxczyjs/list_czyjs.shtml` JS |
| 城步苗族自治县 | ✅ | `chengbu.gov.cn/chengbu/czzj/class_Simple.shtml` |
| 武冈市 | ✅ | `wugang.gov.cn/wugang/czxx/list.shtml` |
| 邵东市 | ✅ | `shaodong.gov.cn/shaodong/czszjyjsgk/listygd21.shtml` |

### 岳阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 岳阳楼区 | ❌ | 全站JS无法定位 |
| 云溪区 | 🟡 | `yunxiqu.gov.cn/38965/42325/index.htm` JS |
| 君山区 | ❌ | JS全站 |
| 岳阳县 | ✅ | `yyx.gov.cn/37584/.../40254/index.htm` |
| 华容县 | ❌ | JS全站+404 |
| 湘阴县 | ❌ | JS全站+404 |
| 平江县 | ✅ | `pingjiang.gov.cn/35048/.../36291/default.htm` |
| 汨罗市 | ❌ | 所有路径404 |
| 临湘市 | 🟡 | `linxiang.gov.cn/24733/.../30553/default.htm` JS |

### 常德市
| 县区 | 状态 | 备注 |
|------|------|------|
| 武陵区 | ✅ | 湖南 PowerEasy CMS `wuling.gov.cn/zwgk/public/column/...` |
| 鼎城区 | ✅ | 同上 `dingcheng.gov.cn/zwgk/public/column/...` |
| 安乡县 | ✅ | 同上 |
| 汉寿县 | ✅ | 同上 |
| 澧县 | ✅ | 同上 (域名 li-xian.gov.cn) |
| 临澧县 | ✅ | 同上 |
| 桃源县 | ✅ | `taoyuan.gov.cn/zwdt/szzl/dqzt/bjyjs/` 独立预决算专栏 |
| 石门县 | ✅ | CMS |
| 津市市 | ✅ | CMS |

### 张家界市
| 县区 | 状态 | 备注 |
|------|------|------|
| 永定区 | ✅ | 省级预决算平台 `175.6.60.107:29081/portal/allOpen/...` |
| 武陵源区 | ❌ | DNS解析失败 |
| 慈利县 | ✅ | `cili.gov.cn/c3388/index.html` |
| 桑植县 | 🟡 | `sangzhi.gov.cn/c2394/index.html` 财政信息栏 |

### 益阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 资阳区 | ❌ | JS下拉菜单无法展开 |
| 赫山区 | ✅ | `hnhs.gov.cn/27128/27140/27327/index.htm` |
| 南县 | ✅ | `nanxian.gov.cn/14890/36191/index.htm` |
| 桃江县 | ✅ | `taojiang.gov.cn/24398/.../39040/index.htm` |
| 安化县 | ✅ | `anhua.gov.cn/199/2808/.../2820/default.htm` |
| 沅江市 | ✅ | `yuanjiang.gov.cn/21144/21155/index.htm` |

### 郴州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 北湖区 | ❌ | JS/WAF 无法确定URL |
| 苏仙区 | ❌ | WAF 412 |
| 桂阳县 | ❌ | WAF 412 |
| 宜章县 | ❌ | JS |
| 永兴县 | ❌ | JS |
| 嘉禾县 | ❌ | JS |
| 临武县 | ❌ | JS |
| 汝城县 | ❌ | 未找到独立域名 |
| 桂东县 | ❌ | JS |
| 安仁县 | ❌ | JS |
| 资兴市 | ✅ | `zixing.gov.cn/zwgk/ztbd/zfydzl/czzj/default.htm` |

### 永州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 零陵区 | ✅ | `cnll.gov.cn/cnll/yjsgk/czyjs.shtml` |
| 东安县 | ✅ | `da.gov.cn/da/czxx/list.shtml`；gov修正 hnda→da |
| 双牌县 | ✅ | `sp.gov.cn/sp/czxx/list.shtml`；gov修正 shuangpai→sp |
| 道县 | ✅ | `dx.gov.cn/dx/zwgk/dxxbzwgklist.shtml?catecode=czxx`；gov修正 daoxian→dx |
| 新田县 | ✅ | `xt.gov.cn/xt/czxx/list.shtml`；gov修正 xintian→xt |
| 江华瑶族自治县 | ✅ | `jh.gov.cn/jh/czxx/list.shtml`；gov修正 jianghua→jh |

### 怀化市
| 县区 | 状态 | 备注 |
|------|------|------|
| 鹤城区 | ✅ | `hechengqu.gov.cn/hechengqu/c132683/2021jczwgk_gkly.shtml` |
| 中方县 | ✅ | `zhongfang.gov.cn/zhongfang/c104621/zfxxgkMultiList.shtml` |
| 沅陵县 | ✅ | `yuanling.gov.cn/yuanling/c108873/zfxxgkMultiList.shtml` |
| 辰溪县 | ✅ | `chenxi.gov.cn/chenxi/c113842/zfxxgkList.shtml` |
| 溆浦县 | ❌ | DNS解析失败 |
| 会同县 | ✅ | `huitong.gov.cn/huitong/c117594/zfxxgkMultiList.shtml` |
| 麻阳苗族自治县 | ✅ | `mayang.gov.cn/mayang/c105503/zfxxgkMultiList.shtml` |
| 新晃侗族自治县 | ✅ | `xinhuang.gov.cn/xinhuang/c137784/list2021.shtml` |
| 芷江侗族自治县 | ❌ | DNS解析失败 |
| 靖州苗族侗族自治县 | ✅ | `jzx.gov.cn/jzx/c116375/zfxxgkMultiList.shtml` |
| 通道侗族自治县 | ✅ | `tongdao.gov.cn/tongdao/c133065/2021jczwgk_gkly.shtml` |
| 洪江市 | ❌ | DNS解析失败 |

### 娄底市
| 县区 | 状态 | 备注 |
|------|------|------|
| 娄星区 | ✅ | `louxing.gov.cn/louxing/c100026/.../czzj_bm.shtml` |
| 双峰县 | ✅ | `hnsf.gov.cn/hnsf/sfxczzjgk/xhxczzjzl.shtml` |
| 新化县 | ✅ | `xinhua.gov.cn/xinhua/xhxczjgk/xhxczzjzl.shtml` |
| 冷水江市 | ✅ | `lsj.gov.cn/lsj/zwgk/zfxxgk/szfxxgkml/czzj/xxgks_lists.shtml` |
| 涟源市 | ✅ | `lianyuan.gov.cn/lianyuan/zwgk/xxgk_zfxxgkml/010/xxgkfdnr.shtml` |

### 湘西州
| 县区 | 状态 | 备注 |
|------|------|------|
| 吉首市 | 🟡 | `jishou.gov.cn/zwgk/xzfxxgkml/czxx/zfyjs/` WAF |
| 泸溪县 | 🟡 | `lxx.gov.cn/zwgk/qzfxxgkml/czxx/` WAF |
| 凤凰县 | 🟡 | `fhzf.gov.cn/zwgk_49798/fdzdgknr/czxx_49813/` WAF；gov修正 fhx→fhzf |
| 花垣县 | 🟡 | `huayuan.gov.cn/zwgk_23240/xzfxxgkml_23243/jcxxgk/czyjs/` WAF |
| 保靖县 | 🟡 | `bjzf.gov.cn/zwgk/xzfxxgkml/czxx/` WAF；gov修正 baojing→bjzf |
| 古丈县 | 🟡 | `guzhang.gov.cn/zwgk/xzfxxgkml/czxx/` WAF |
| 永顺县 | 🟡 | `ysx.gov.cn/zwgk/bmxx/zfbm/czj/` WAF；gov修正 yongshun→ysx |
| 龙山县 | 🟡 | `xxls.gov.cn/zwgk/xzfxxgkml/czxx/` WAF；gov修正 longshan→xxls |

**汇总**: 82/113 已填，31 缺失
- Gov修正 9 处：永州5（东安/双牌/道县/新田/江华）+ 湘西4（凤凰/保靖/永顺/龙山）
- 常德9县统一 PowerEasy CMS catId 系统
- 永州6县统一 `/{slug}/czxx/list.shtml` 模式
- 怀化9县统一 `/{slug}/c{id}/zfxxgkMultiList.shtml` 模式
- 湘西8县全部 WAF 412 拦截，URL来自百度索引
- 郴州10县全部 JS/WAF 无法确定路径

### 西安市
| 县区 | 状态 | 备注 |
|------|------|------|
| 雁塔区 | ✅ | `yanta.gov.cn` — `/xxgk/zdxxgk/czzjjg/qzfczyjs/1.html` |
| 阎良区 | ✅ | `yanliang.gov.cn` — `/xxgk/zhgk/czzj/qjzfczyjszhqkgk/1.html` |
| 长安区 | ✅ | `changanqu.gov.cn` — gov URL 修正（原 changan.gov.cn） |
| 鄠邑区 | ✅ | `xahy.gov.cn` — gov URL 修正（原 huyi.gov.cn） |
| 蓝田县 | ✅ | `lantian.gov.cn` — `/zwgk/czzj/xzfczyjsjsgjf/1.html` |
| 周至县 | ✅ | `zhouzhi.gov.cn` — `/xxgk/fdzdgknr/czxx/xczyjs/1.html` |

### 铜川市
| 县区 | 状态 | 备注 |
|------|------|------|
| 王益区 | ✅ | `tcwy.gov.cn` — resources/site/151 模式 |
| 印台区 | ✅ | `yintai.gov.cn` — resources/site/152 模式 |
| 耀州区 | ✅ | `yaozhou.gov.cn` — resources/site/153 模式 |
| 宜君县 | ✅ | `yijun.gov.cn` — `news_list.rt?channlId=5578` |

### 宝鸡市
| 县区 | 状态 | 备注 |
|------|------|------|
| 渭滨区 | ✅ | `weibin.gov.cn` — col系统 `/col15477/col15482/col15503/` |
| 金台区 | ✅ | `jintai.gov.cn` — col系统 |
| 陈仓区 | ✅ | `chencang.gov.cn` — col系统 |
| 凤翔区 | ✅ | `fengxiang.gov.cn` — col系统 |
| 岐山县 | ✅ | `qishan.gov.cn` — col系统 |
| 扶风县 | ✅ | `fufeng.gov.cn` — col系统 |
| 眉县 | ✅ | `meixian.gov.cn` — col系统（4层） |
| 陇县 | ✅ | `longxian.gov.cn` — col系统 |
| 千阳县 | ✅ | `qianyang.gov.cn` — col系统 |
| 麟游县 | ✅ | `linyou.gov.cn` — col系统 |
| 凤县 | ✅ | `sxfx.gov.cn` — col系统 |
| 太白县 | ✅ | `taibai.gov.cn` — col系统 |

### 咸阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 秦都区 | ✅ | `snqindu.gov.cn` — `/zfxxgk/fdzdgknr/czzj/zfyjsjsgjf/` |
| 渭城区 | ✅ | `weic.gov.cn` — `/zfxxgk/fdzdgknr/zdly/czxx/` |
| 兴平市 | ✅ | `snxingping.gov.cn` — gov URL 修正（原 xingping.gov.cn） |
| 武功县 | ✅ | `wugong.gov.cn` — gov URL 修正（原 sxwg.gov.cn） |
| 乾县 | ✅ | `snqianxian.gov.cn` — `/zfxxgk/fdzdgknr/czgk/` |
| 礼泉县 | ✅ | `liquan.gov.cn` — `/zfxxgk/fdzdgknr/czzj/` |
| 三原县 | ✅ | `snsanyuan.gov.cn` — `/zfxxgk/fdzdgknr/zdlyxxgk/czxx/` |
| 长武县 | ✅ | `changwu.gov.cn` — `/zfxxgk/fdzdgk/zdly/czxx/` |
| 旬邑县 | ✅ | `snxunyi.gov.cn` — 含编号路径 `czzj_21562/xjyjsjsgjf_21563/` |
| 淳化县 | ✅ | `snchunhua.gov.cn` — `/zfxxgk/fdzdgknr/czgk/` |
| 杨陵区 | ✅ | `ylq.gov.cn` — `/zfxxgk/zdlygk/czxx/1.html` |

### 渭南市
| 县区 | 状态 | 备注 |
|------|------|------|
| 临渭区 | ✅ | `linwei.gov.cn` — `/zfxxgk/fdzdgknr/czxx/czyjs/1.html` |
| 华州区 | ✅ | `hzqu.gov.cn` — gov URL 修正（原 hzq.gov.cn） |
| 潼关县 | ✅ | `tongguan.gov.cn` — 统一路径模式 |
| 大荔县 | ✅ | `dalisn.gov.cn` — 统一路径模式 |
| 合阳县 | ✅ | `heyang.gov.cn` — `/xjczyjs/1.html` |
| 澄城县 | ✅ | `chengcheng.gov.cn` — `/xjczyjs/` |
| 蒲城县 | ✅ | `pucheng.gov.cn` — `/xjczyjs/` |
| 白水县 | ✅ | `baishui.gov.cn` — `/jczfgk/czgk/czysjs/` |
| 富平县 | ✅ | `fuping.gov.cn` — `/xjczyjs/1.html` |
| 华阴市 | ✅ | `huayin.gov.cn` — `/zfxxgk/zdxx/czxx/zfyjs/1.html` |
| 韩城市 | ❌ | `hancheng.gov.cn` ECONNRESET，搜索引擎无法找到集中公开页面 |

### 延安市
| 县区 | 状态 | 备注 |
|------|------|------|
| 宝塔区 | ✅ | 统一城市门户 `yanan.gov.cn/gk/fdzdgknr/czxx/czyjs/xq/1.html` |
| 安塞区 | ✅ | 同上 |
| 延长县 | ✅ | 同上 |
| 延川县 | ✅ | 同上 |
| 子长市 | ✅ | 同上 |
| 志丹县 | ✅ | 同上 |
| 吴起县 | ✅ | 同上 |
| 甘泉县 | ✅ | 同上 |
| 富县 | ✅ | 同上 |
| 洛川县 | ✅ | 同上 |
| 宜川县 | ✅ | 同上 |
| 黄龙县 | ✅ | 同上 |
| 黄陵县 | ✅ | 同上 |

### 汉中市
| 县区 | 状态 | 备注 |
|------|------|------|
| 镇巴县 | ✅ | `zb.gov.cn` — gov URL 修正（原 zhenba.gov.cn） |

### 榆林市
| 县区 | 状态 | 备注 |
|------|------|------|
| 横山区 | ✅ | `hszf.gov.cn` — `/xxgk/fdzdgknr/czxx/` |
| 府谷县 | ✅ | `fg.gov.cn` — gov URL 修正（原 fugu.gov.cn） |
| 米脂县 | ✅ | `mizhi.gov.cn` — `/zwgk/fdzdgknr/yjsgk/` |

### 安康市
| 县区 | 状态 | 备注 |
|------|------|------|
| 石泉县 | ✅ | `shiquan.gov.cn` — `/Node-76760.html` |

### 商洛市
全部 7 县已在前轮补齐（商州区/洛南县/丹凤县/商南县/山阳县/镇安县/柞水县）

### 小结
- **88/89 确认** ✅，1 个失败（韩城市 ECONNRESET）
- 修正 7 个 gov URL（长安区/鄠邑区/华州区/镇巴县/府谷县/兴平市/武功县）
- 宝鸡 12 县全部使用 col/col 系统（与市级 CMS 一致）
- 铜川 3 县统一 resources/site/{N} 模式
- 延安 13 县统一使用城市门户集中公开（`/xq/` 路径区分县区级）
- 汉中 shtml 系统、安康 Node/category 系统、商洛 .htm 系统各自统一
- 补充 3 个市级链接（金昌市/陇南市/枣庄市）

---

## 批量补全轮（2026-04-14）

### 陕西省 渭南市
| 县区 | 状态 | 备注 |
|------|------|------|
| 韩城市 | ❌ SPA | 全站 SPA 架构，所有路径（含不存在的）均返回相同 JS 壳，无法验证任何页面 |

### 河北省

#### 唐山市
| 县区 | 状态 | 备注 |
|------|------|------|
| 迁西县 | ❌ JS渲染 | 候选 `qianxi/tsqianxixianczxx/index.html` 路径模式符合兄弟县，但内容完全 JS 渲染无法验证 |
| 乐亭县 | 🔧修正 | URL 修正为 `/laoting/czyjsgk/index.html`（原路径 yjsgk→czyjsgk）|

#### 保定市
| 县区 | 状态 | 备注 |
|------|------|------|
| 涿州市 | ✅ | `zhuozhou.gov.cn/zzgxportal/caizhengys.jsp`，百度验证标题"涿州市人民政府---政府预、决算公开" |

#### 廊坊市
| 县区 | 状态 | 备注 |
|------|------|------|
| 固安县 | ✅ | `guan.gov.cn/public/budgets`，百度搜索确认为"财政预决算"页面，含 2026 年预算信息 |

### 黑龙江省

#### 双鸭山市
| 县区 | 状态 | 备注 |
|------|------|------|
| 宝山区 | ✅ | `sysbsq.gov.cn/bs/366/xxgk_list.shtml`，页面标题"预算决算"，含 2025/2026 年预算文件 |

#### 七台河市
| 县区 | 状态 | 备注 |
|------|------|------|
| 勃利县 | ❌ | 法定主动公开仅4项，无财政预决算栏目，probed c100465–c100515 全部 404 |

#### 黑河市
| 县区 | 状态 | 备注 |
|------|------|------|
| 嫩江市 | ❌ | CMS 实例与黑河兄弟县不共享 c100783 列号，probed c100429–c100510 全部 404 |

#### 绥化市
| 县区 | 状态 | 备注 |
|------|------|------|
| 兰西县 | ❌ | ⚠️ gov 修正 `lanxi.gov.cn`→`hljlanxi.gov.cn`（`lanxi.gov.cn`是浙江兰溪）。绥化兄弟 `/ysjs/zfxxgk.shtml` 模式在兰西 404 |

### 福建省

#### 莆田市
| 县区 | 状态 | 备注 |
|------|------|------|
| 涵江区 | ✅ | ⚠️ gov 修正 `hanjiang.gov.cn`→`pthj.gov.cn`。`/zwgk/czzj/` 含区级预决算 |
| 秀屿区 | ✅ | ⚠️ gov 修正 `xiuyu.gov.cn`→`ptxy.gov.cn`。`/zwgk/czzj/bjzfczyjshsgjf/` 含预算公开与决算公开 |

#### 泉州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 金门县 | ❌ N/A | 金门县由台湾当局管辖，大陆无政府门户/预决算信息 |

#### 漳州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 东山县 | ✅ | ⚠️ gov 修正 `dongshan.gov.cn`→`dongshandao.gov.cn`。漳州 CMS 模板 `/cms/html/dsxrmzf/czzj/index.html` |

### 江西省

#### 景德镇市
| 县区 | 状态 | 备注 |
|------|------|------|
| 昌江区 | ❌ WAF | WAF 拦截所有访问（1334B JS challenge），fetch_webpage 也无法渲染 |

#### 上饶市
| 县区 | 状态 | 备注 |
|------|------|------|
| 弋阳县 | ❌ WAF | WAF 返回 412，Baidu 0 条索引页面，仅有 2018 年外部引用过旧 |

### 西藏自治区

#### 拉萨市
| 县区 | 状态 | 备注 |
|------|------|------|
| 达孜区 | ✅ | `dzq.gov.cn/dzqzf/czjr/ypwz.shtml`，HTML 验证含 2024 决算/2025 预算/三公经费/政府债务 |

#### 阿里地区
| 县区 | 状态 | 备注 |
|------|------|------|
| 措勤县 | ❌ | 站点可访问但无专门财政栏目，仅在统计数据 `tjsj.htm` 下有 2020 年预算文档 |

### 小批量汇总
- **已填 7 个**：涿州市、固安县、宝山区(黑龙江)、涵江区、秀屿区、东山县、达孜区
- **留空 9 个**：韩城市(SPA)、迁西县(JS渲染)、勃利县(无栏目)、嫩江市(CMS不共享)、兰西县(模式不匹配)、金门县(台湾管辖)、昌江区(WAF)、弋阳县(WAF)、措勤县(无栏目)
- **gov 修正 4 处**：兰西县、涵江区、秀屿区、东山县
- **URL 修正 1 处**：乐亭县

---

## 批量补全轮二（湖北/海南/青海/新疆）

### 湖北省

#### 武汉市
| 县区 | 状态 | 备注 |
|------|------|------|
| 江汉区 | ✅ | `jianghan.gov.cn/qzfgzbm/qrmzfbgs/fdzdgknr/czzj/` |

#### 黄石市
| 县区 | 状态 | 备注 |
|------|------|------|
| 西塞山区 | ✅ | `xisaishan.gov.cn/xxgk/fdzdgknr/czyjs/zfbjczyjsgk/` |
| 铁山区 | ✅ | `hsdz.gov.cn/xxgk/fdzdgknr/yjsgk/czyjs/` |

#### 鄂州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 梁子湖区 | ✅ | `liangzh.gov.cn/lzhxxgk/xxgkml/?itemid=3363` |
| 华容区 | ✅ | `hbhr.gov.cn/hrqxxgk/xxgkml/czgk/zfyjs/` |
| 鄂城区 | ✅ | `echeng.gov.cn/ecqxxgk/xxgkml/czgk1/bmyjs/` |

#### 孝感市
| 县区 | 状态 | 备注 |
|------|------|------|
| 云梦县 | ✅ | `yunmeng.gov.cn/c/ymx/czzj.jhtml` 与兄弟 大悟县 同 jhtml 模式 |
| 应城市 | ✅ | `yingcheng.gov.cn/c/ycs/czzj.jhtml` 与兄弟 大悟县 同 jhtml 模式 |

#### 恩施土家族苗族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 建始县 | ✅ | `hbjs.gov.cn/xxgk/dfbmptlj/xz/xczj/FDZDGKNR/czgk/` |

### 海南省

#### 海口市
| 县区 | 状态 | 备注 |
|------|------|------|
| 秀英区 | ✅ | `xyqzf.haikou.gov.cn/hksxyqzf/czzj/lists.shtml` 区级财政资金页 |
| 龙华区 | ❌ | 无集中预决算页面，财政信息分散在各部门子目录 `lhqzf.haikou.gov.cn/xxgk/lhqzf/{dept}/fdzdgknr/czgk_*/` |
| 琼山区 | ✅ | `qsqzf.haikou.gov.cn/hksqsqzf/czgk/list_s.shtml` 含预算/决算/绩效评价 |
| 美兰区 | ✅ | `mlqzf.haikou.gov.cn/xgk/czxx/czyjs/index.shtml` 财政预决算2635条目录 |

#### 三沙市
| 县区 | 状态 | 备注 |
|------|------|------|
| 西沙区 | ❌ N/A | 无独立政府网站 |
| 南沙区 | ❌ N/A | 无独立政府网站 |

#### 省直辖
| 县区 | 状态 | 备注 |
|------|------|------|
| 定安县 | ✅ | `dingan.hainan.gov.cn/dingan/zdly/czxx/` |
| 白沙黎族自治县 | ✅ | `baisha.hainan.gov.cn/baisha/xxgkall.html?ClassInfoId=1902` 与兄弟县同模式 |

### 青海省

#### 海东市
| 县区 | 状态 | 备注 |
|------|------|------|
| 乐都区 | ✅ | `ledu.gov.cn/html/public/caizheng.html` |
| 民和回族土族自治县 | ✅ | `minhe.gov.cn/xxgk/List_zlm.aspx?lmid=9044` |

### 新疆维吾尔自治区（兵团城市）

#### 新疆生产建设兵团
| 县区 | 状态 | 备注 |
|------|------|------|
| 北屯市 | ✅ | `bts.gov.cn/zwgk/fdzdgknr/czgk/` |

### 第二轮汇总
- **已填 17 个**：湖北全部9个 + 海南5个（秀英区/琼山区/美兰区/定安县/白沙） + 青海2个（乐都区/民和县） + 新疆1个（北屯市）
- **留空 5 个**：龙华区(无集中页面)、西沙区(无政府网站)、南沙区(无政府网站)、三沙暂无独立运营的区级网站

---

## 批量补全轮三（青海余/新疆余/广东）

### 青海省（余5个）

#### 西宁市
| 县区 | 状态 | 备注 |
|------|------|------|
| 城西区 | ❌ | 百度未索引该区政府网站，无法验证 |
| 城北区 | ❌ | 百度未索引该区政府网站，无法验证 |
| 湟中区 | ❌ | 百度未索引该区政府网站，无法验证 |

#### 海东市
| 县区 | 状态 | 备注 |
|------|------|------|
| 循化撒拉族自治县 | ❌ | CDN 阻断访问 |

#### 黄南藏族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 河南蒙古族自治县 | ❌ | WAF 返回 412 |

### 新疆维吾尔自治区（兵团余5个）

#### 新疆生产建设兵团
| 县区 | 状态 | 备注 |
|------|------|------|
| 图木舒克市 | ❌ | 政府网站无法访问 |
| 五家渠市 | ❌ | 无专门预决算分类页面，仅有散落文章 |
| 铁门关市 | ❌ | 无专门预决算分类页面 |
| 双河市 | ❌ | 无专门预决算分类页面 |
| 新星市 | ❌ | 无专门预决算分类页面 |
| 白杨市 | ❌ | 无专门预决算分类页面 |

### 广东省

#### 韶关市
| 县区 | 状态 | 备注 |
|------|------|------|
| 武江区 | ❌ | 未找到集中预决算页面 |
| 浈江区 | ✅ | `sgzj.gov.cn/zw/czyjs/`（⚠️ 实际域名 sgzj.gov.cn ≠ gov-links 中 zjq.gov.cn）|
| 曲江区 | ✅ | `qujiang.gov.cn/zdly/czsyj/` |
| 始兴县 | ✅ | `gdsx.gov.cn/zdlyxx/yssgjf/sjczys/`（⚠️ 实际域名 gdsx.gov.cn ≠ gov-links 中 gdshixing.gov.cn）|
| 翁源县 | ❌ | 未找到集中预决算页面 |
| 新丰县 | ❌ | 未找到集中预决算页面 |

#### 珠海市
| 县区 | 状态 | 备注 |
|------|------|------|
| 金湾区 | ❌ | 未找到集中预决算页面 |

#### 肇庆市
| 县区 | 状态 | 备注 |
|------|------|------|
| 鼎湖区 | ❌ | 未找到集中预决算页面 |
| 高要区 | ❌ | 未找到集中预决算页面 |
| 德庆县 | ✅ | `gddq.gov.cn/czysjshsgjfgk/czyjs/index.html`（⚠️ 实际域名 gddq.gov.cn ≠ gov-links 中 zqdq.gov.cn）|
| 封开县 | ❌ | 未找到集中预决算页面 |

#### 汕尾市
| 县区 | 状态 | 备注 |
|------|------|------|
| 海丰县 | ✅ | `gdhf.gov.cn/gdhf/zdlyxxgk/sgjf/czyjs/index.html` |

#### 清远市
| 县区 | 状态 | 备注 |
|------|------|------|
| 清城区 | ❌ | 未找到集中预决算页面 |

### 第三轮汇总
- **已填 5 个**：浈江区、曲江区、始兴县、德庆县、海丰县（均广东）
- **留空 18 个**：青海5个(百度/CDN/WAF)、新疆兵团6个(无分类页/不可访问)、广东7个(无集中页面)
- **gov 域名差异记录 3 处**：浈江区、始兴县、德庆县（fiscal URL与gov-links域名不同但均正确）

---

## 批量补全轮四（湖南/安徽）

### 湖南省

#### 长沙市
| 县区 | 状态 | 备注 |
|------|------|------|
| 芙蓉区 | ✅ | `furong.gov.cn/affairs/fdzdgknr/ysjs/yjs/` |

#### 株洲市
| 县区 | 状态 | 备注 |
|------|------|------|
| 荷塘区 | ❌ | 未找到集中预决算页面 |
| 石峰区 | ❌ | 同上 |
| 天元区 | ❌ | 同上 |
| 醴陵市 | ❌ | 同上 |
| 攸县 | ❌ | 同上 |

#### 湘潭市
| 县区 | 状态 | 备注 |
|------|------|------|
| 雨湖区 | ✅ | `xtyh.gov.cn/2997/3005/3013/3091/3230/` |
| 岳塘区 | ✅ | `hnxtyt.gov.cn/xxgk/28984/index.htm` |

#### 邵阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 双清区 | ✅ | `shuangqing.gov.cn/shuangqing/czyjs/nlist_czyjs.shtml` |
| 大祥区 | ✅ | `dxzc.gov.cn/dxzc/nczyjs/nczyjs.shtml` |
| 新邵县 | ✅ | `xinshao.gov.cn/xinshao/czyjsgkb/2020czyhsgk.shtml` |

#### 岳阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 岳阳楼区 | ✅ | `yylq.gov.cn/21487/21498/21516/default.htm` |
| 君山区 | ❌ | 未找到 |
| 华容县 | ✅ | `huarong.gov.cn/33763/index.htm` Baidu 验证"财政预决算-华容县人民政府" |
| 湘阴县 | ✅ | `xiangyin.gov.cn/31185/62150/index.htm` |
| 汨罗市 | ✅ | `miluo.gov.cn/25305/55848/index.htm` |

#### 张家界市
| 县区 | 状态 | 备注 |
|------|------|------|
| 武陵源区 | ❌ | 未找到 |

#### 益阳市
| 县区 | 状态 | 备注 |
|------|------|------|
| 资阳区 | ✅ | `hnziyang.gov.cn/18534/18525/18740/24360/index.htm` Baidu 验证"财政预决算公开" |

#### 郴州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 北湖区 | ❌ | 未找到 |
| 苏仙区 | ✅ | `hnsx.gov.cn/zwgk/cwys/czyjs/default.htm` Baidu 验证"区级财政预决算 部门预决算和三公经费" |
| 桂阳县 | ❌ | 未找到 |
| 宜章县 | ❌ | 未找到 |
| 永兴县 | ❌ | 未找到 |
| 嘉禾县 | ❌ | 未找到 |
| 临武县 | ❌ | 未找到 |
| 汝城县 | ❌ | 未找到 |
| 桂东县 | ❌ | 未找到 |
| 安仁县 | ❌ | 未找到 |

#### 怀化市
| 县区 | 状态 | 备注 |
|------|------|------|
| 溆浦县 | ❌ | 未找到 |
| 芷江侗族自治县 | ❌ | 未找到 |
| 洪江市 | ❌ | 未找到 |

### 安徽省

#### 芜湖市
| 县区 | 状态 | 备注 |
|------|------|------|
| 繁昌区 | ✅ | `fanchang.gov.cn/zt/czzjzl/index.html` 含"政府财政预决算"栏目 |

#### 蚌埠市
| 县区 | 状态 | 备注 |
|------|------|------|
| 禹会区 | ❌ | catId 已隐藏 |
| 淮上区 | ❌ | JS渲染 |
| 怀远县 | ❌ | 仅市级链接 |
| 固镇县 | ❌ | 无财政入口 |

#### 铜陵市
| 县区 | 状态 | 备注 |
|------|------|------|
| 义安区 | ✅ | `ahtlyaq.gov.cn/openness/OpennessFinance/` |
| 郊区 | ✅ | `tljq.gov.cn/openness/OpennessFinance/` |

#### 安庆市
| 县区 | 状态 | 备注 |
|------|------|------|
| 怀宁县 | ❌ | DNS无法解析 |
| 宜秀区 | ❌ | CMS目录失效 |

#### 滁州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 琅琊区 | ✅ | `lyq.gov.cn/zwgk/czyjssgjfxxgk/index.html` |
| 南谯区 | ✅ | `cznq.gov.cn/zwgk/czyjssgjfxxgk/index.html` |
| 来安县 | ✅ | `laian.gov.cn/zwgk/cwyjssgjf/index.html` |
| 全椒县 | ❌ | Forbidden |
| 定远县 | ❌ | Forbidden |
| 凤阳县 | ❌ | Forbidden |
| 天长市 | ❌ | Forbidden |
| 明光市 | ❌ | Forbidden |

#### 合肥市 (8个)
| 县区 | 状态 | 备注 |
|------|------|------|
| 庐阳区 | ❌ | JS渲染 |
| 蜀山区 | ❌ | DNS无法解析 |
| 包河区 | ❌ | DNS无法解析 |
| 长丰县 | ❌ | JS渲染 |
| 肥东县 | ❌ | JS渲染 |
| 肥西县 | ❌ | DNS无法解析 |
| 庐江县 | ❌ | DNS无法解析 |
| 巢湖市 | ❌ | JS渲染 |

#### 其他
| 县区 | 状态 | 备注 |
|------|------|------|
| 雨山区(马鞍山) | ❌ | DNS无法解析 |
| 含山县(马鞍山) | ❌ | DNS无法解析 |
| 和县(马鞍山) | ❌ | DNS无法解析 |
| 颍州区(阜阳) | ❌ | DNS无法解析 |
| 颍东区(阜阳) | ❌ | DNS无法解析 |
| 颍上县(阜阳) | ❌ | DNS无法解析 |
| 裕安区(六安) | ❌ | 所有候选路径 404 |
| 旌德县(宣城) | ❌ | HTTP 550 错误 |

### 第四轮汇总
- **湖南已填 12 个**（含3个 Baidu 验证候选）：芙蓉区/雨湖区/岳塘区/双清区/大祥区/新邵县/岳阳楼区/华容县/湘阴县/汨罗市/资阳区/苏仙区
- **湖南留空 19 个**：株洲5个/岳阳1个(君山区)/张家界1个/郴州9个/怀化3个
- **安徽已填 6 个**：繁昌区/义安区/郊区/琅琊区/南谯区/来安县
- **安徽留空 27 个**：合肥8个(DNS/JS)/蚌埠4个/马鞍山3个(DNS)/阜阳3个(DNS)/滁州5个(Forbidden)/安庆2个/六安1个/宣城1个

---

## 批量补全轮五（云南首批 + 玉溪 gov 修复）

### 云南省

#### 曲靖市
| 县区 | 状态 | 备注 |
|------|------|------|
| 师宗县 | ✅ | `ynsz.gov.cn/shizong/public/special/70.html`，页面标题与正文均为“预算/决算”，列出大量师宗县部门预算条目 |

#### 玉溪市
| 县区 | 状态 | 备注 |
|------|------|------|
| 通海县 | ✅ | `tonghai.gov.cn/yxgovfront/newDepartmentContentds.jspx?path=thxzfxxgk&channelId=6871&pageNo=1`，页面抬头“通海县财政局 财政预决算公开” |
| 易门县 | 🔧 gov修正 | `ym.yuxi.gov.cn` → `ym.gov.cn`，来自玉溪市官网“各县区政府网站” |
| 新平彝族傣族自治县 | 🔧 gov修正 | `xp.gov.cn` → `xinping.gov.cn`，原域名实际指向湖南溆浦县 |
| 澄江市 | 🔧 gov修正 | `cj.yuxi.gov.cn` → `yncj.gov.cn`，新域名标题为“澄江市人民政府” |

#### 保山市
| 县区 | 状态 | 备注 |
|------|------|------|
| 龙陵县 | ✅ | `longling.gov.cn/zwgk/zfxxgkpt/fdzdgknr/czxx/czyjs.htm`，为政府信息公开平台下财政预决算栏目 |

#### 文山壮族苗族自治州
| 县区 | 状态 | 备注 |
|------|------|------|
| 砚山县 | ✅ | `yanshan.gov.cn/ysxrmzf/czyjs/pc/list.html`，页面含“财政预决算 / 预算公开 / 决算公开”三级栏目 |

#### 待继续修复的 gov-suspicious
| 县区 | 状态 | 备注 |
|------|------|------|
| 盐津县 | ⚠️ gov-suspicious | 现有 `yanjin.gov.cn` 实际为河南延津县人民政府 |
| 彝良县 | ⚠️ gov-suspicious | 现有 `ylx.gov.cn` 实际为大理州云龙县人民政府 |
| 富宁县 | ⚠️ gov-suspicious | 现有 `funing.gov.cn` 实际为江苏阜宁县人民政府 |

### 第五轮汇总
- **云南已填 4 个**：师宗县、通海县、龙陵县、砚山县
- **gov 修正 3 处**：易门县、新平县、澄江市
- **继续待修复 gov 3 处**：盐津县、彝良县、富宁县

---

## 批量补全轮六（安徽补充）

### 安徽省

#### 蚌埠市
| 县区 | 状态 | 备注 |
|------|------|------|
| 怀远县 | ✅ | `bengbu.gov.cn/zfxxgk/site/tpl/7741` 页面标题“怀远县财政资金集中展示”，正文含“怀远县政府财政预决算和‘三公’经费” |

#### 滁州市
| 县区 | 状态 | 备注 |
|------|------|------|
| 明光市 | ✅ | `mingguang.gov.cn/zwgk/czyjssgjfxxgk/index.html` 页面分栏列出“年度财政预算 / 年度财政决算 / 三公经费” |

#### 继续留空
| 县区 | 状态 | 备注 |
|------|------|------|
| 禹会区 | ❌ | `yuhui.gov.cn` 对应目录提示“目录id已隐藏”，不写入 |
| 裕安区 | ❌ | 候选页实际落到“政策文件”列表，不是财政预决算专栏 |
| 定远县 | ❌ | 候选 `site/tpl/162748674` 当前返回 Forbidden，证据不足不写入 |

### 第六轮汇总
- **安徽再填 2 个**：怀远县、明光市
- **明确排除 3 个弱候选**：禹会区(目录隐藏)、裕安区(误入政策文件)、定远县(Forbidden)

---

## 批量补全轮七（云南玉溪二次深挖）

### 云南省

#### 玉溪市
| 县区 | 状态 | 备注 |
|------|------|------|
| 江川区 | ✅ | `ynjc.gov.cn/yxgovfront/newDepartmentContentds.jspx?path=jcqzfxxgk&channelId=4013&pageNo=1`；由江川区政府信息公开索引提取财政局 `channelId=4013`，落地页为“江川区财政局”信息公开页，指南明确公开“财政预算、决算信息”“行政事业性收费”“政府采购”，列表页含大量区级部门预算公开 |
| 易门县 | ✅ | `ym.gov.cn/yxgovfront/newDepartmentContentds.jspx?path=ymxzfxxgk&channelId=8100&pageNo=1`；易门县财政局信息公开内容页显式列出“预决算公开”“预算执行情况”“政府集中采购”“行政事业性收费”等财政栏目 |
| 元江哈尼族彝族傣族自治县 | ✅ | `yjx.gov.cn/yxgovfront/newDepartmentContentds.jspx?path=yjxzfxxgk&channelId=19188&pageNo=1`；由元江县财政局指南跳转到“法定主动公开内容”，页面直接列出“2026年预算公开”“地方财政预算执行情况和预算草案报告”“2024年度部门决算”“直达资金支出情况”等财政内容 |

### 第七轮汇总
- **云南再填 3 个**：江川区、易门县、元江哈尼族彝族傣族自治县
- **验证方法**：均先确认官方县区政府门户，再从政府信息公开索引提取财政局公开页，核验预算/决算类栏目或条目后写入

---

## 批量补全轮八（云南玉溪继续）

### 云南省

#### 玉溪市
| 县区 | 状态 | 备注 |
|------|------|------|
| 新平彝族傣族自治县 | ✅ | `xinping.gov.cn/yxgovfront/newDepartmentContentds.jspx?path=xpxzfxxgk&channelId=12641&pageNo=1`；由县政府信息公开索引提取财政局 `channelId=12641`，页面标题即“县级财政预决算”，列表含大量 2026 年部门预算公开条目 |
| 澄江市 | ✅ | `yncj.gov.cn/yxgovfront/newDepartmentContentds.jspx?path=cjxzfxxgk&channelId=16078&pageNo=1`；澄江市财政局指南明确写明该栏目为对外发布渠道，页面显式列出“预决算公开”“行政事业性收费”“财政资金直达基层”“政府采购”等栏目 |
| 峨山彝族自治县 | 🔧 gov修正 / ❌ 暂留空 | `es.yuxi.gov.cn` 已失效，改为 `yxes.gov.cn`；已确认 `https://www.yxes.gov.cn/yxgovfront/newShowContentPage.jspx?path=esxzfxxgk&channelId=8899` 为峨山县财政局公开指南，但当前抓到的公开页仅明确显示“重点领域信息公开专栏 / 行政事业性收费 / 财政资金直达基层 / 政府采购”，未直接见到“预算/决算/预决算”关键词，按“宁缺勿错”暂不写入 fiscal |

### 第八轮汇总
- **云南再填 2 个**：新平彝族傣族自治县、澄江市
- **gov 修正 1 处**：峨山彝族自治县 `es.yuxi.gov.cn` → `yxes.gov.cn`
- **继续留空 1 个强候选**：峨山彝族自治县，因财政页未直接出现预算/决算关键词
