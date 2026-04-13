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
