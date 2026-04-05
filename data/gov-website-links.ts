/**
 * 政府官网导航数据
 *
 * 链接查找优先级：
 * 1. 该地区正式政府门户网站（www.{region}.gov.cn 形式）
 * 2. 省/市/县人民政府官方网站
 * 3. 无法确认则留空（灰色显示）
 *
 * 注意区分：
 * - 政府门户网站（本文件收录）
 * - 财政局官网（见 fiscal-budget-links.ts）
 * - 门户导航页、信息公开平台等不收录
 *
 * url 为空字符串表示暂未找到可验证的政府门户网站
 */

export interface GovWebsiteNode {
  name: string;
  url: string;
  children?: GovWebsiteNode[];
}

export const GOV_WEBSITES: GovWebsiteNode[] = [
  {
    name: "北京市",
    url: "https://www.beijing.gov.cn/",
    children: [
      {
        name: "东城区",
        url: "https://www.bjdch.gov.cn/"
      },
      {
        name: "西城区",
        url: "http://www.bjxch.gov.cn/"
      },
      {
        name: "朝阳区",
        url: "https://www.bjchy.gov.cn/"
      },
      {
        name: "海淀区",
        url: "http://www.bjhd.gov.cn/"
      },
      {
        name: "丰台区",
        url: "http://www.bjft.gov.cn/"
      },
      {
        name: "石景山区",
        url: "http://www.bjsjs.gov.cn/"
      },
      {
        name: "门头沟区",
        url: "https://www.bjmtg.gov.cn/"
      },
      {
        name: "房山区",
        url: "http://www.bjfsh.gov.cn/"
      },
      {
        name: "通州区",
        url: "http://www.bjtzh.gov.cn/"
      },
      {
        name: "顺义区",
        url: "http://www.bjshy.gov.cn/"
      },
      {
        name: "昌平区",
        url: "https://www.bjchp.gov.cn/"
      },
      {
        name: "大兴区",
        url: "http://www.bjdx.gov.cn/"
      },
      {
        name: "怀柔区",
        url: "https://www.bjhr.gov.cn/"
      },
      {
        name: "平谷区",
        url: "https://www.bjpg.gov.cn/"
      },
      {
        name: "密云区",
        url: "http://www.bjmy.gov.cn/"
      },
      {
        name: "延庆区",
        url: "http://www.bjyq.gov.cn/"
      }
    ]
  },
  {
    name: "天津市",
    url: "https://www.tj.gov.cn/",
    children: [
      {
        name: "和平区",
        url: "https://www.tjhp.gov.cn/"
      },
      {
        name: "河东区",
        url: "http://www.hedong.gov.cn/"
      },
      {
        name: "河西区",
        url: "https://www.tjhx.gov.cn/"
      },
      {
        name: "南开区",
        url: "https://www.tjnk.gov.cn/"
      },
      {
        name: "河北区",
        url: "https://www.tjhbq.gov.cn/"
      },
      {
        name: "红桥区",
        url: "https://www.tjhqqzf.gov.cn/"
      },
      {
        name: "东丽区",
        url: "https://www.tjdl.gov.cn/"
      },
      {
        name: "西青区",
        url: "https://www.tjxq.gov.cn/"
      },
      {
        name: "津南区",
        url: "https://www.tjjn.gov.cn/"
      },
      {
        name: "北辰区",
        url: "https://www.tjbc.gov.cn/"
      },
      {
        name: "武清区",
        url: "https://www.tjwq.gov.cn/"
      },
      {
        name: "宝坻区",
        url: "https://www.tjbd.gov.cn/"
      },
      {
        name: "滨海新区",
        url: "https://www.tjbh.gov.cn/"
      },
      {
        name: "宁河区",
        url: "https://www.tjnh.gov.cn/"
      },
      {
        name: "静海区",
        url: "http://www.tjjh.gov.cn/"
      },
      {
        name: "蓟州区",
        url: "https://www.tjjz.gov.cn/"
      }
    ]
  },
  {
    name: "上海市",
    url: "https://www.shanghai.gov.cn/",
    children: [
      {
        name: "黄浦区",
        url: "https://www.shhuangpu.gov.cn/"
      },
      {
        name: "徐汇区",
        url: "https://www.xuhui.gov.cn/"
      },
      {
        name: "长宁区",
        url: "https://www.shcn.gov.cn/"
      },
      {
        name: "静安区",
        url: "https://www.jingan.gov.cn/"
      },
      {
        name: "普陀区",
        url: "https://www.putuo.gov.cn/"
      },
      {
        name: "虹口区",
        url: "https://www.shhk.gov.cn/"
      },
      {
        name: "杨浦区",
        url: "https://www.shyp.gov.cn/"
      },
      {
        name: "闵行区",
        url: "https://www.shmh.gov.cn/"
      },
      {
        name: "宝山区",
        url: "https://www.shbsq.gov.cn/"
      },
      {
        name: "嘉定区",
        url: "https://www.shjd.gov.cn/"
      },
      {
        name: "浦东新区",
        url: "https://www.pudong.gov.cn/"
      },
      {
        name: "金山区",
        url: "https://www.jinshan.gov.cn/"
      },
      {
        name: "松江区",
        url: "https://www.songjiang.gov.cn/"
      },
      {
        name: "青浦区",
        url: "https://www.shqp.gov.cn/"
      },
      {
        name: "奉贤区",
        url: "https://www.fengxian.gov.cn/"
      },
      {
        name: "崇明区",
        url: "https://www.shcm.gov.cn/"
      }
    ]
  },
  {
    name: "重庆市",
    url: "https://www.cq.gov.cn/",
    children: [
      {
        name: "万州区",
        url: "https://www.wz.gov.cn/"
      },
      {
        name: "涪陵区",
        url: "https://www.fl.gov.cn/"
      },
      {
        name: "渝中区",
        url: "https://www.cqyz.gov.cn/"
      },
      {
        name: "大渡口区",
        url: "https://www.ddk.gov.cn/"
      },
      {
        name: "江北区",
        url: "https://www.cqjb.gov.cn/"
      },
      {
        name: "沙坪坝区",
        url: "https://www.shapingba.gov.cn/"
      },
      {
        name: "九龙坡区",
        url: "https://www.cqjlp.gov.cn/"
      },
      {
        name: "南岸区",
        url: "https://www.cqna.gov.cn/"
      },
      {
        name: "北碚区",
        url: "https://www.beibei.gov.cn/"
      },
      {
        name: "綦江区",
        url: "https://www.cqqj.gov.cn/"
      },
      {
        name: "大足区",
        url: "https://www.dazu.gov.cn/"
      },
      {
        name: "渝北区",
        url: "https://www.ybq.gov.cn/"
      },
      {
        name: "巴南区",
        url: "https://www.cqbn.gov.cn/"
      },
      {
        name: "黔江区",
        url: "https://www.qianjiang.gov.cn/"
      },
      {
        name: "长寿区",
        url: "https://www.cqcs.gov.cn/"
      },
      {
        name: "江津区",
        url: "https://www.jiangjin.gov.cn/"
      },
      {
        name: "合川区",
        url: "https://www.hc.gov.cn/"
      },
      {
        name: "永川区",
        url: "https://www.cqyc.gov.cn/"
      },
      {
        name: "南川区",
        url: "https://www.cqnc.gov.cn/"
      },
      {
        name: "璧山区",
        url: "https://www.bishan.gov.cn/"
      },
      {
        name: "铜梁区",
        url: "https://www.cqtl.gov.cn/"
      },
      {
        name: "潼南区",
        url: "https://www.cqtn.gov.cn/"
      },
      {
        name: "荣昌区",
        url: "https://www.rongchang.gov.cn/"
      },
      {
        name: "开州区",
        url: "https://www.cqkz.gov.cn/"
      },
      {
        name: "梁平区",
        url: "https://www.cqlp.gov.cn/"
      },
      {
        name: "武隆区",
        url: "https://www.cqwl.gov.cn/"
      },
      {
        name: "城口县",
        url: "https://www.cqck.gov.cn/"
      },
      {
        name: "丰都县",
        url: "https://www.cqfd.gov.cn/"
      },
      {
        name: "垫江县",
        url: "https://www.dianjiang.gov.cn/"
      },
      {
        name: "忠县",
        url: "https://www.cqzx.gov.cn/"
      },
      {
        name: "云阳县",
        url: "https://www.yunyang.gov.cn/"
      },
      {
        name: "奉节县",
        url: "https://www.cqfj.gov.cn/"
      },
      {
        name: "巫山县",
        url: "https://www.cqwushan.gov.cn/"
      },
      {
        name: "巫溪县",
        url: "https://www.cqwx.gov.cn/"
      },
      {
        name: "石柱土家族自治县",
        url: "https://www.cqsz.gov.cn/"
      },
      {
        name: "秀山土家族苗族自治县",
        url: "https://www.cqxs.gov.cn/"
      },
      {
        name: "酉阳土家族苗族自治县",
        url: "https://www.cqyy.gov.cn/"
      },
      {
        name: "彭水苗族土家族自治县",
        url: "https://www.cqps.gov.cn/"
      }
    ]
  },
  {
    name: "河北省",
    url: "https://www.hebei.gov.cn/",
    children: [
      {
        name: "石家庄市",
        url: "http://www.sjz.gov.cn/",
        children: [
          {
            name: "长安区",
            url: "http://www.sjzca.gov.cn/"
          },
          {
            name: "桥西区",
            url: "http://www.sjzqx.gov.cn/"
          },
          {
            name: "新华区",
            url: "http://www.xhqsjz.gov.cn/"
          },
          {
            name: "井陉矿区",
            url: "http://www.sjzkq.gov.cn/"
          },
          {
            name: "裕华区",
            url: "http://www.yuhuaqu.gov.cn/"
          },
          {
            name: "藁城区",
            url: "http://www.gc.gov.cn/"
          },
          {
            name: "鹿泉区",
            url: "http://www.sjzlq.gov.cn/"
          },
          {
            name: "栾城区",
            url: "http://www.luancheng.gov.cn/"
          },
          {
            name: "井陉县",
            url: "http://www.sjzjx.gov.cn/"
          },
          {
            name: "正定县",
            url: "http://www.zd.gov.cn/"
          },
          {
            name: "行唐县",
            url: "http://www.xingtang.gov.cn/"
          },
          {
            name: "灵寿县",
            url: "http://www.lingshou.gov.cn/"
          },
          {
            name: "高邑县",
            url: "http://www.gyx.gov.cn/"
          },
          {
            name: "深泽县",
            url: "http://www.shenze.gov.cn/"
          },
          {
            name: "赞皇县",
            url: "http://www.zanhuang.gov.cn/"
          },
          {
            name: "无极县",
            url: "http://www.wuji.gov.cn/"
          },
          {
            name: "平山县",
            url: "http://www.sjzps.gov.cn/"
          },
          {
            name: "元氏县",
            url: "http://www.yuanshi.gov.cn/"
          },
          {
            name: "赵县",
            url: "http://www.zhaoxian.gov.cn/"
          },
          {
            name: "辛集市",
            url: ""
          },
          {
            name: "晋州市",
            url: "http://www.jzs.gov.cn/"
          },
          {
            name: "新乐市",
            url: "http://www.xinle.gov.cn/"
          }
        ]
      },
      {
        name: "唐山市",
        url: "https://www.tangshan.gov.cn/",
        children: [
          {
            name: "路南区",
            url: ""
          },
          {
            name: "路北区",
            url: "http://www.tslb.gov.cn/"
          },
          {
            name: "古冶区",
            url: "http://www.guye.gov.cn/"
          },
          {
            name: "开平区",
            url: "http://www.tskaiping.gov.cn/"
          },
          {
            name: "丰南区",
            url: "https://www.fengnanqu.gov.cn/"
          },
          {
            name: "丰润区",
            url: "http://www.fengrun.gov.cn/"
          },
          {
            name: "曹妃甸区",
            url: "https://www.caofeidian.gov.cn/"
          },
          {
            name: "滦南县",
            url: "https://www.luannan.gov.cn/"
          },
          {
            name: "乐亭县",
            url: "https://www.laoting.gov.cn/"
          },
          {
            name: "迁西县",
            url: "http://www.qianxi.gov.cn/"
          },
          {
            name: "玉田县",
            url: "https://www.yutian.gov.cn/"
          },
          {
            name: "遵化市",
            url: ""
          },
          {
            name: "迁安市",
            url: "http://www.qianan.gov.cn/"
          },
          {
            name: "滦州市",
            url: ""
          }
        ]
      },
      {
        name: "秦皇岛市",
        url: "http://www.qhd.gov.cn/",
        children: [
          {
            name: "海港区",
            url: ""
          },
          {
            name: "山海关区",
            url: "http://www.shanhaiguan.gov.cn/"
          },
          {
            name: "北戴河区",
            url: "https://www.beidaihe.gov.cn/"
          },
          {
            name: "抚宁区",
            url: ""
          },
          {
            name: "青龙满族自治县",
            url: ""
          },
          {
            name: "昌黎县",
            url: ""
          },
          {
            name: "卢龙县",
            url: "https://www.lulong.gov.cn/"
          }
        ]
      },
      {
        name: "邯郸市",
        url: "https://www.hd.gov.cn/",
        children: [
          {
            name: "邯山区",
            url: "http://www.hdhs.gov.cn/"
          },
          {
            name: "丛台区",
            url: "http://www.hdct.gov.cn/"
          },
          {
            name: "复兴区",
            url: "http://www.hdfx.gov.cn/"
          },
          {
            name: "峰峰矿区",
            url: ""
          },
          {
            name: "肥乡区",
            url: ""
          },
          {
            name: "永年区",
            url: "https://www.hdyn.gov.cn/"
          },
          {
            name: "临漳县",
            url: "http://www.linzhang.gov.cn/"
          },
          {
            name: "成安县",
            url: "https://www.chengan.gov.cn/"
          },
          {
            name: "大名县",
            url: "http://www.daming.gov.cn/"
          },
          {
            name: "涉县",
            url: "http://www.shexian.gov.cn/"
          },
          {
            name: "磁县",
            url: "http://www.cixian.gov.cn/"
          },
          {
            name: "邱县",
            url: "http://www.qiuxian.gov.cn/"
          },
          {
            name: "鸡泽县",
            url: "http://www.jize.gov.cn/"
          },
          {
            name: "广平县",
            url: ""
          },
          {
            name: "馆陶县",
            url: "http://www.guantao.gov.cn/"
          },
          {
            name: "魏县",
            url: ""
          },
          {
            name: "曲周县",
            url: ""
          },
          {
            name: "武安市",
            url: "http://www.wuan.gov.cn/"
          }
        ]
      },
      {
        name: "邢台市",
        url: "https://www.xingtai.gov.cn/",
        children: [
          {
            name: "襄都区",
            url: "https://www.xiangdu.gov.cn/"
          },
          {
            name: "信都区",
            url: "http://www.xinduqu.gov.cn/"
          },
          {
            name: "任泽区",
            url: "http://www.renze.gov.cn/"
          },
          {
            name: "南和区",
            url: "https://www.nanhe.gov.cn/"
          },
          {
            name: "临城县",
            url: "https://www.lincheng.gov.cn/"
          },
          {
            name: "内丘县",
            url: "http://www.hbnq.gov.cn/"
          },
          {
            name: "柏乡县",
            url: "http://www.baixiangxian.gov.cn/"
          },
          {
            name: "隆尧县",
            url: "https://www.longyao.gov.cn/"
          },
          {
            name: "宁晋县",
            url: "http://www.ningjin.gov.cn/"
          },
          {
            name: "巨鹿县",
            url: "http://www.julu.gov.cn/"
          },
          {
            name: "新河县",
            url: "http://www.xinhe.gov.cn/"
          },
          {
            name: "广宗县",
            url: "http://www.gzx.gov.cn/"
          },
          {
            name: "平乡县",
            url: "https://www.pingxiangxian.gov.cn/"
          },
          {
            name: "威县",
            url: "https://www.weixian.gov.cn/"
          },
          {
            name: "清河县",
            url: "https://www.qinghexian.gov.cn/"
          },
          {
            name: "临西县",
            url: "https://www.linxi.gov.cn/"
          },
          {
            name: "南宫市",
            url: "https://www.nangong.gov.cn/"
          },
          {
            name: "沙河市",
            url: ""
          }
        ]
      },
      {
        name: "保定市",
        url: "https://www.baoding.gov.cn/",
        children: [
          {
            name: "竞秀区",
            url: "https://www.jingxiu.gov.cn/"
          },
          {
            name: "莲池区",
            url: "https://www.lianchi.gov.cn/"
          },
          {
            name: "满城区",
            url: "http://www.mancheng.gov.cn/"
          },
          {
            name: "清苑区",
            url: "https://www.qingyuanqu.gov.cn/"
          },
          {
            name: "徐水区",
            url: "http://www.xushui.gov.cn/"
          },
          {
            name: "涞水县",
            url: "http://www.laishui.gov.cn/"
          },
          {
            name: "阜平县",
            url: "https://www.bdfuping.gov.cn/"
          },
          {
            name: "定兴县",
            url: "https://www.dingxing.gov.cn/"
          },
          {
            name: "唐县",
            url: "https://www.tangxian.gov.cn/"
          },
          {
            name: "高阳县",
            url: "http://www.gaoyang.gov.cn/"
          },
          {
            name: "容城县",
            url: "http://www.rongcheng.gov.cn/"
          },
          {
            name: "涞源县",
            url: "http://www.laiyuan.gov.cn/"
          },
          {
            name: "望都县",
            url: "http://www.wangdu.gov.cn/"
          },
          {
            name: "安新县",
            url: ""
          },
          {
            name: "易县",
            url: "https://www.bdyixian.gov.cn/"
          },
          {
            name: "曲阳县",
            url: "http://www.quyang.gov.cn/"
          },
          {
            name: "蠡县",
            url: "http://www.lixian.gov.cn/"
          },
          {
            name: "顺平县",
            url: ""
          },
          {
            name: "博野县",
            url: "http://www.boye.gov.cn/"
          },
          {
            name: "雄县",
            url: "http://www.xiongxian.gov.cn/"
          },
          {
            name: "涿州市",
            url: "http://www.zhuozhou.gov.cn/"
          },
          {
            name: "定州市",
            url: ""
          },
          {
            name: "安国市",
            url: "http://www.anguo.gov.cn/"
          },
          {
            name: "高碑店市",
            url: "http://www.gaobeidian.gov.cn/"
          }
        ]
      },
      {
        name: "张家口市",
        url: "https://www.zjk.gov.cn/",
        children: [
          {
            name: "桥东区",
            url: "http://www.zjkqd.gov.cn/"
          },
          {
            name: "桥西区",
            url: "http://www.zjkqxq.gov.cn/"
          },
          {
            name: "宣化区",
            url: "http://www.zjkxuanhua.gov.cn/"
          },
          {
            name: "下花园区",
            url: "http://www.zjkxhy.gov.cn/"
          },
          {
            name: "万全区",
            url: "http://www.zjkwq.gov.cn/"
          },
          {
            name: "崇礼区",
            url: "http://www.zjkcl.gov.cn/"
          },
          {
            name: "张北县",
            url: "http://www.zjkzb.gov.cn/"
          },
          {
            name: "康保县",
            url: "http://www.zjkkb.gov.cn/"
          },
          {
            name: "沽源县",
            url: "http://www.zjkgy.gov.cn/"
          },
          {
            name: "尚义县",
            url: "http://www.zjksy.gov.cn/"
          },
          {
            name: "蔚县",
            url: "http://www.zjkyx.gov.cn/"
          },
          {
            name: "阳原县",
            url: "http://www.zjkyy.gov.cn/"
          },
          {
            name: "怀安县",
            url: "http://www.zjkha.gov.cn/"
          },
          {
            name: "怀来县",
            url: "http://www.huailai.gov.cn/"
          },
          {
            name: "涿鹿县",
            url: "http://www.zjkzl.gov.cn/"
          },
          {
            name: "赤城县",
            url: "http://www.ccx.gov.cn/"
          }
        ]
      },
      {
        name: "承德市",
        url: "https://www.chengde.gov.cn/",
        children: [
          {
            name: "双桥区",
            url: "https://www.sqq.gov.cn/"
          },
          {
            name: "双滦区",
            url: "http://www.slq.gov.cn/"
          },
          {
            name: "鹰手营子矿区",
            url: "http://www.ysyz.gov.cn/"
          },
          {
            name: "承德县",
            url: "http://www.cdx.gov.cn/"
          },
          {
            name: "兴隆县",
            url: "http://www.hbxl.gov.cn/"
          },
          {
            name: "滦平县",
            url: "http://www.lpx.gov.cn/"
          },
          {
            name: "隆化县",
            url: "http://www.hebeilonghua.gov.cn/"
          },
          {
            name: "丰宁满族自治县",
            url: "https://www.fengning.gov.cn/"
          },
          {
            name: "宽城满族自治县",
            url: "https://www.hbkc.gov.cn/"
          },
          {
            name: "围场满族蒙古族自治县",
            url: "https://www.weichang.gov.cn/"
          },
          {
            name: "平泉市",
            url: "https://www.pingquan.gov.cn/"
          }
        ]
      },
      {
        name: "沧州市",
        url: "http://www.cangzhou.gov.cn/",
        children: [
          {
            name: "新华区",
            url: "http://www.czxh.gov.cn/"
          },
          {
            name: "运河区",
            url: "http://www.czyh.gov.cn/"
          },
          {
            name: "沧县",
            url: "http://www.cangxian.gov.cn/"
          },
          {
            name: "青县",
            url: "https://www.qingxian.gov.cn/"
          },
          {
            name: "东光县",
            url: "http://www.dongguang.gov.cn/"
          },
          {
            name: "海兴县",
            url: "https://www.haixing.gov.cn/"
          },
          {
            name: "盐山县",
            url: "https://www.chinayanshan.gov.cn/"
          },
          {
            name: "肃宁县",
            url: "https://www.suning.gov.cn/"
          },
          {
            name: "南皮县",
            url: "http://www.nanpi.gov.cn/"
          },
          {
            name: "吴桥县",
            url: "http://www.wuqiao.gov.cn/"
          },
          {
            name: "献县",
            url: "https://www.xianxian.gov.cn/"
          },
          {
            name: "孟村回族自治县",
            url: "https://www.mengcun.gov.cn/"
          },
          {
            name: "泊头市",
            url: "http://www.botou.gov.cn/"
          },
          {
            name: "任丘市",
            url: "https://www.renqiu.gov.cn/"
          },
          {
            name: "黄骅市",
            url: "http://www.huanghua.gov.cn/"
          },
          {
            name: "河间市",
            url: "https://www.hejian.gov.cn/"
          }
        ]
      },
      {
        name: "廊坊市",
        url: "https://www.lf.gov.cn/",
        children: [
          {
            name: "安次区",
            url: "https://www.anci.gov.cn/"
          },
          {
            name: "广阳区",
            url: "http://www.guangyang.gov.cn/"
          },
          {
            name: "固安县",
            url: ""
          },
          {
            name: "永清县",
            url: "https://www.yongqing.gov.cn/"
          },
          {
            name: "香河县",
            url: "http://www.xianghe.gov.cn/"
          },
          {
            name: "大城县",
            url: "https://www.dacheng.gov.cn/"
          },
          {
            name: "文安县",
            url: "http://www.wenan.gov.cn/"
          },
          {
            name: "大厂回族自治县",
            url: ""
          },
          {
            name: "霸州市",
            url: ""
          },
          {
            name: "三河市",
            url: ""
          }
        ]
      },
      {
        name: "衡水市",
        url: "https://www.hengshui.gov.cn/",
        children: [
          {
            name: "桃城区",
            url: "http://www.taocheng.gov.cn/"
          },
          {
            name: "冀州区",
            url: "http://www.jizhou.gov.cn/"
          },
          {
            name: "枣强县",
            url: "http://www.zaoqiang.gov.cn/"
          },
          {
            name: "武邑县",
            url: "http://www.wuyi.gov.cn/"
          },
          {
            name: "武强县",
            url: "http://www.wuqiang.gov.cn/"
          },
          {
            name: "饶阳县",
            url: "http://www.raoyang.gov.cn/"
          },
          {
            name: "安平县",
            url: "http://www.anping.gov.cn/"
          },
          {
            name: "故城县",
            url: "http://www.gucheng.gov.cn/"
          },
          {
            name: "景县",
            url: "http://www.jingxian.gov.cn/"
          },
          {
            name: "阜城县",
            url: ""
          },
          {
            name: "深州市",
            url: "http://www.shenzhou.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "山西省",
    url: "https://www.shanxi.gov.cn/",
    children: [
      {
        name: "太原市",
        url: "https://www.taiyuan.gov.cn/",
        children: [
          {
            name: "小店区",
            url: "https://www.tyxd.gov.cn/"
          },
          {
            name: "迎泽区",
            url: "https://www.yingze.gov.cn/"
          },
          {
            name: "杏花岭区",
            url: "https://www.sxtyxhl.gov.cn/"
          },
          {
            name: "尖草坪区",
            url: "http://www.sxjcp.gov.cn/"
          },
          {
            name: "万柏林区",
            url: "https://www.wanbailin.gov.cn/"
          },
          {
            name: "晋源区",
            url: "https://www.sxjyq.gov.cn/"
          },
          {
            name: "清徐县",
            url: "http://www.qingxu.gov.cn/"
          },
          {
            name: "阳曲县",
            url: "http://www.yangqu.gov.cn/"
          },
          {
            name: "娄烦县",
            url: "http://www.loufan.gov.cn/"
          },
          {
            name: "古交市",
            url: "https://www.sxgujiao.gov.cn/"
          }
        ]
      },
      {
        name: "大同市",
        url: "https://www.dt.gov.cn/",
        children: [
          {
            name: "新荣区",
            url: "http://www.xinrong.gov.cn/"
          },
          {
            name: "平城区",
            url: "http://www.pingcheng.gov.cn/"
          },
          {
            name: "云冈区",
            url: "http://www.yungang.gov.cn/"
          },
          {
            name: "云州区",
            url: "http://www.yunzhou.gov.cn/"
          },
          {
            name: "阳高县",
            url: "http://www.yanggao.gov.cn/"
          },
          {
            name: "天镇县",
            url: "http://www.tianzhen.gov.cn/"
          },
          {
            name: "广灵县",
            url: "http://www.guangling.gov.cn/"
          },
          {
            name: "灵丘县",
            url: "http://www.lingqiu.gov.cn/"
          },
          {
            name: "浑源县",
            url: "http://www.hunyuan.gov.cn/"
          },
          {
            name: "左云县",
            url: "http://www.zuoyun.gov.cn/"
          }
        ]
      },
      {
        name: "阳泉市",
        url: "https://www.yq.gov.cn/",
        children: [
          {
            name: "城区",
            url: "http://www.yqcq.gov.cn/"
          },
          {
            name: "矿区",
            url: "http://www.yqkq.gov.cn/"
          },
          {
            name: "郊区",
            url: "https://www.jmsjqzf.gov.cn/"
          },
          {
            name: "平定县",
            url: "http://www.pd.gov.cn/"
          },
          {
            name: "盂县",
            url: "https://www.sxyx.gov.cn/"
          }
        ]
      },
      {
        name: "长治市",
        url: "https://www.changzhi.gov.cn/",
        children: [
          {
            name: "潞州区",
            url: "http://www.luzhouqu.gov.cn/"
          },
          {
            name: "上党区",
            url: "http://www.shangdangqu.gov.cn/"
          },
          {
            name: "屯留区",
            url: "http://www.tunliu.gov.cn/"
          },
          {
            name: "潞城区",
            url: "http://www.luchengqu.gov.cn/"
          },
          {
            name: "襄垣县",
            url: "http://www.xiangyuan.gov.cn/"
          },
          {
            name: "平顺县",
            url: "http://www.pingshun.gov.cn/"
          },
          {
            name: "黎城县",
            url: "http://www.licheng.gov.cn/"
          },
          {
            name: "壶关县",
            url: "http://www.huguan.gov.cn/"
          },
          {
            name: "长子县",
            url: "http://www.changzi.gov.cn/"
          },
          {
            name: "武乡县",
            url: "http://www.wuxiang.gov.cn/"
          },
          {
            name: "沁县",
            url: "http://www.qinxian.gov.cn/"
          },
          {
            name: "沁源县",
            url: "http://www.qinyuan.gov.cn/"
          }
        ]
      },
      {
        name: "晋城市",
        url: "https://www.jcgov.gov.cn/",
        children: [
          {
            name: "城区",
            url: "http://www.jccq.gov.cn/"
          },
          {
            name: "沁水县",
            url: "https://www.qinshui.gov.cn/"
          },
          {
            name: "阳城县",
            url: "https://www.yczf.gov.cn/"
          },
          {
            name: "陵川县",
            url: "http://www.sxlc.gov.cn/"
          },
          {
            name: "泽州县",
            url: "http://www.zezhou.gov.cn/"
          },
          {
            name: "高平市",
            url: "https://www.sxgp.gov.cn/"
          }
        ]
      },
      {
        name: "朔州市",
        url: "https://www.shuozhou.gov.cn/",
        children: [
          {
            name: "朔城区",
            url: "http://www.szscq.gov.cn/"
          },
          {
            name: "平鲁区",
            url: "http://www.szpinglu.gov.cn/"
          },
          {
            name: "怀仁市",
            url: "http://www.zghr.gov.cn/"
          },
          {
            name: "山阴县",
            url: "http://www.shanyin.gov.cn/"
          },
          {
            name: "应县",
            url: "http://www.yingxian.gov.cn/"
          },
          {
            name: "右玉县",
            url: "http://www.youyuzf.gov.cn/"
          }
        ]
      },
      {
        name: "晋中市",
        url: "https://www.sxjz.gov.cn/",
        children: [
          {
            name: "榆次区",
            url: "http://www.sxyuci.gov.cn/"
          },
          {
            name: "太谷区",
            url: "http://www.sxtg.gov.cn/"
          },
          {
            name: "榆社县",
            url: "http://www.yushe.gov.cn/"
          },
          {
            name: "左权县",
            url: "http://www.sxzq.gov.cn/"
          },
          {
            name: "和顺县",
            url: "http://www.sxhs.gov.cn/"
          },
          {
            name: "昔阳县",
            url: "http://www.sxxiyang.gov.cn/"
          },
          {
            name: "寿阳县",
            url: "http://www.shouyang.gov.cn/"
          },
          {
            name: "祁县",
            url: "http://www.qixian.gov.cn/"
          },
          {
            name: "平遥县",
            url: "http://www.pingyao.gov.cn/"
          },
          {
            name: "灵石县",
            url: "http://www.lingshi.gov.cn/"
          },
          {
            name: "介休市",
            url: "http://www.jiexiu.gov.cn/"
          }
        ]
      },
      {
        name: "运城市",
        url: "https://www.yuncheng.gov.cn/",
        children: [
          {
            name: "盐湖区",
            url: "http://www.yanhu.gov.cn/"
          },
          {
            name: "临猗县",
            url: "http://www.sxly.gov.cn/"
          },
          {
            name: "万荣县",
            url: "http://www.wanrong.gov.cn/"
          },
          {
            name: "闻喜县",
            url: "http://www.wenxi.gov.cn/"
          },
          {
            name: "稷山县",
            url: "http://www.jishan.gov.cn/"
          },
          {
            name: "新绛县",
            url: "http://www.jiangzhou.gov.cn/"
          },
          {
            name: "绛县",
            url: "http://www.jiangxian.gov.cn/"
          },
          {
            name: "垣曲县",
            url: "http://www.yuanqu.gov.cn/"
          },
          {
            name: "夏县",
            url: "http://www.xiaxian.gov.cn/"
          },
          {
            name: "平陆县",
            url: "http://www.pinglu.gov.cn/"
          },
          {
            name: "芮城县",
            url: "http://www.ruicheng.gov.cn/"
          },
          {
            name: "永济市",
            url: "http://www.yongji.gov.cn/"
          },
          {
            name: "河津市",
            url: "http://www.hejin.gov.cn/"
          }
        ]
      },
      {
        name: "忻州市",
        url: "https://www.xinzhou.gov.cn/",
        children: [
          {
            name: "忻府区",
            url: "http://www.xzxfq.gov.cn/"
          },
          {
            name: "定襄县",
            url: "http://www.dingxiang.gov.cn/"
          },
          {
            name: "五台县",
            url: "http://www.wutaishan.gov.cn/"
          },
          {
            name: "代县",
            url: "http://www.daixian.gov.cn/"
          },
          {
            name: "繁峙县",
            url: "http://www.fanzhi.gov.cn/"
          },
          {
            name: "宁武县",
            url: "http://www.ningwu.gov.cn/"
          },
          {
            name: "静乐县",
            url: "http://www.sxjl.gov.cn/"
          },
          {
            name: "神池县",
            url: "http://www.shenchi.gov.cn/"
          },
          {
            name: "五寨县",
            url: "http://www.wuzhai.gov.cn/"
          },
          {
            name: "岢岚县",
            url: "http://www.kelan.gov.cn/"
          },
          {
            name: "河曲县",
            url: "http://www.hequ.gov.cn/"
          },
          {
            name: "保德县",
            url: "http://www.baode.gov.cn/"
          },
          {
            name: "偏关县",
            url: "http://www.pianguan.gov.cn/"
          },
          {
            name: "原平市",
            url: "http://www.yuanping.gov.cn/"
          }
        ]
      },
      {
        name: "临汾市",
        url: "https://www.linfen.gov.cn/",
        children: [
          {
            name: "尧都区",
            url: "http://www.yaodu.gov.cn/"
          },
          {
            name: "曲沃县",
            url: "http://www.quwo.gov.cn/"
          },
          {
            name: "翼城县",
            url: "http://www.yicheng.gov.cn/"
          },
          {
            name: "襄汾县",
            url: "http://www.xiangfen.gov.cn/"
          },
          {
            name: "洪洞县",
            url: "http://www.hongtong.gov.cn/"
          },
          {
            name: "古县",
            url: "http://www.guxian.gov.cn/"
          },
          {
            name: "安泽县",
            url: "http://www.anze.gov.cn/"
          },
          {
            name: "浮山县",
            url: "http://www.fushan.gov.cn/"
          },
          {
            name: "吉县",
            url: "http://www.jixian.gov.cn/"
          },
          {
            name: "乡宁县",
            url: "http://www.xiangning.gov.cn/"
          },
          {
            name: "大宁县",
            url: "http://www.daning.gov.cn/"
          },
          {
            name: "隰县",
            url: "http://www.xixian.gov.cn/"
          },
          {
            name: "永和县",
            url: "http://www.yonghe.gov.cn/"
          },
          {
            name: "蒲县",
            url: "http://www.puxian.gov.cn/"
          },
          {
            name: "汾西县",
            url: "http://www.fenxi.gov.cn/"
          },
          {
            name: "侯马市",
            url: "http://www.houma.gov.cn/"
          },
          {
            name: "霍州市",
            url: "http://www.huozhou.gov.cn/"
          }
        ]
      },
      {
        name: "吕梁市",
        url: "http://www.lvliang.gov.cn/",
        children: [
          {
            name: "离石区",
            url: "http://www.lishi.gov.cn/"
          },
          {
            name: "文水县",
            url: "http://www.wenshui.gov.cn/"
          },
          {
            name: "交城县",
            url: "http://www.jiaocheng.gov.cn/"
          },
          {
            name: "兴县",
            url: "http://www.sxxingxian.gov.cn/"
          },
          {
            name: "临县",
            url: "http://www.linxiancn.gov.cn/"
          },
          {
            name: "柳林县",
            url: "http://www.liulin.gov.cn/"
          },
          {
            name: "石楼县",
            url: "http://www.shilou.gov.cn/"
          },
          {
            name: "岚县",
            url: "http://www.lanxian.gov.cn/"
          },
          {
            name: "方山县",
            url: "http://www.fangshan.gov.cn/"
          },
          {
            name: "中阳县",
            url: "http://www.zhongyang.gov.cn/"
          },
          {
            name: "交口县",
            url: "http://www.jiaokou.gov.cn/"
          },
          {
            name: "孝义市",
            url: "http://www.sxxiaoyi.gov.cn/"
          },
          {
            name: "汾阳市",
            url: "http://www.fenyang.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "内蒙古自治区",
    url: "https://www.nmg.gov.cn/",
    children: [
      {
        name: "呼和浩特市",
        url: "http://www.huhhot.gov.cn/",
        children: [
          {
            name: "新城区",
            url: "http://www.xinchengqu.gov.cn/"
          },
          {
            name: "回民区",
            url: "http://www.huiminqu.gov.cn/"
          },
          {
            name: "玉泉区",
            url: "http://www.yuquan.gov.cn/"
          },
          {
            name: "赛罕区",
            url: "http://www.saihan.gov.cn/"
          },
          {
            name: "土默特左旗",
            url: "http://www.tmtzq.gov.cn/"
          },
          {
            name: "托克托县",
            url: "http://www.tuoketuo.gov.cn/"
          },
          {
            name: "和林格尔县",
            url: "http://www.helingeer.gov.cn/"
          },
          {
            name: "清水河县",
            url: "http://www.qingshuihe.gov.cn/"
          },
          {
            name: "武川县",
            url: "http://www.wuchuan.gov.cn/"
          }
        ]
      },
      {
        name: "包头市",
        url: "https://www.baotou.gov.cn/",
        children: [
          {
            name: "东河区",
            url: "http://www.donghe.gov.cn/"
          },
          {
            name: "昆都仑区",
            url: "https://www.kdl.gov.cn/"
          },
          {
            name: "青山区",
            url: "https://www.qingshan.gov.cn/"
          },
          {
            name: "石拐区",
            url: "http://www.shiguai.gov.cn/"
          },
          {
            name: "白云鄂博矿区",
            url: "http://www.byeb.gov.cn/"
          },
          {
            name: "九原区",
            url: "https://www.jiuyuanqu.gov.cn/"
          },
          {
            name: "土默特右旗",
            url: "http://www.tmtyq.gov.cn/"
          },
          {
            name: "固阳县",
            url: "https://www.guyang.gov.cn/"
          },
          {
            name: "达尔罕茂明安联合旗",
            url: "http://www.dmlhq.gov.cn/"
          }
        ]
      },
      {
        name: "乌海市",
        url: "https://www.wuhai.gov.cn/",
        children: [
          {
            name: "海勃湾区",
            url: "https://www.haibowan.gov.cn/"
          },
          {
            name: "海南区",
            url: "https://www.hainanqu.gov.cn/"
          },
          {
            name: "乌达区",
            url: "https://www.wuda.gov.cn/"
          }
        ]
      },
      {
        name: "赤峰市",
        url: "https://www.chifeng.gov.cn/",
        children: [
          {
            name: "红山区",
            url: "http://www.hongshanqu.gov.cn/"
          },
          {
            name: "元宝山区",
            url: "http://www.ybsq.gov.cn/"
          },
          {
            name: "松山区",
            url: "http://www.ssq.gov.cn/"
          },
          {
            name: "阿鲁科尔沁旗",
            url: "http://www.alkeq.gov.cn/"
          },
          {
            name: "巴林左旗",
            url: "http://www.blzq.gov.cn/"
          },
          {
            name: "巴林右旗",
            url: "http://www.blyq.gov.cn/"
          },
          {
            name: "林西县",
            url: "http://www.linxi.gov.cn/"
          },
          {
            name: "克什克腾旗",
            url: "http://www.kskqq.gov.cn/"
          },
          {
            name: "翁牛特旗",
            url: "http://www.wntq.gov.cn/"
          },
          {
            name: "喀喇沁旗",
            url: "http://www.klq.gov.cn/"
          },
          {
            name: "宁城县",
            url: "http://www.nmgningcheng.gov.cn/"
          },
          {
            name: "敖汉旗",
            url: "http://www.aohan.gov.cn/"
          }
        ]
      },
      {
        name: "通辽市",
        url: "https://www.tongliao.gov.cn/",
        children: [
          {
            name: "科尔沁区",
            url: "http://www.keerqin.gov.cn/"
          },
          {
            name: "科尔沁左翼中旗",
            url: "http://www.kzzq.gov.cn/"
          },
          {
            name: "科尔沁左翼后旗",
            url: "http://www.kzhq.gov.cn/"
          },
          {
            name: "开鲁县",
            url: "http://www.kailu.gov.cn/"
          },
          {
            name: "库伦旗",
            url: "http://www.kulun.gov.cn/"
          },
          {
            name: "奈曼旗",
            url: "http://www.naiman.gov.cn/"
          },
          {
            name: "扎鲁特旗",
            url: "http://www.zhalute.gov.cn/"
          },
          {
            name: "霍林郭勒市",
            url: "http://www.hlgl.gov.cn/"
          }
        ]
      },
      {
        name: "鄂尔多斯市",
        url: "https://www.ordos.gov.cn/",
        children: [
          {
            name: "东胜区",
            url: "http://www.ds.gov.cn/"
          },
          {
            name: "康巴什区",
            url: "http://www.kbs.gov.cn/"
          },
          {
            name: "达拉特旗",
            url: "http://www.dlt.gov.cn/"
          },
          {
            name: "准格尔旗",
            url: "http://www.zge.gov.cn/"
          },
          {
            name: "鄂托克前旗",
            url: "http://www.etkqq.gov.cn/"
          },
          {
            name: "鄂托克旗",
            url: "http://www.etkq.gov.cn/"
          },
          {
            name: "杭锦旗",
            url: "http://www.hjq.gov.cn/"
          },
          {
            name: "乌审旗",
            url: "http://www.wsq.gov.cn/"
          },
          {
            name: "伊金霍洛旗",
            url: "http://www.yjl.gov.cn/"
          }
        ]
      },
      {
        name: "呼伦贝尔市",
        url: "https://www.hulunbuir.gov.cn/",
        children: [
          {
            name: "海拉尔区",
            url: "https://www.hailar.gov.cn/"
          },
          {
            name: "扎赉诺尔区",
            url: "http://www.zhalainuoer.gov.cn/"
          },
          {
            name: "阿荣旗",
            url: "http://www.arq.gov.cn/"
          },
          {
            name: "莫力达瓦达斡尔族自治旗",
            url: "https://www.mldw.gov.cn/"
          },
          {
            name: "鄂伦春自治旗",
            url: "http://www.elc.gov.cn/"
          },
          {
            name: "鄂温克族自治旗",
            url: "https://www.ewenke.gov.cn/"
          },
          {
            name: "陈巴尔虎旗",
            url: "http://www.cbrhq.gov.cn/"
          },
          {
            name: "新巴尔虎左旗",
            url: "http://www.xzq.gov.cn/"
          },
          {
            name: "新巴尔虎右旗",
            url: "http://www.xbehyq.gov.cn/"
          },
          {
            name: "满洲里市",
            url: "http://www.manzhouli.gov.cn/"
          },
          {
            name: "牙克石市",
            url: "https://www.yks.gov.cn/"
          },
          {
            name: "扎兰屯市",
            url: "https://www.zhalantun.gov.cn/"
          },
          {
            name: "额尔古纳市",
            url: "http://www.eegn.gov.cn/"
          },
          {
            name: "根河市",
            url: "https://www.genhe.gov.cn/"
          }
        ]
      },
      {
        name: "巴彦淖尔市",
        url: "https://www.bynr.gov.cn/",
        children: [
          {
            name: "临河区",
            url: "http://www.linhe.gov.cn/"
          },
          {
            name: "五原县",
            url: "http://www.wuyuan.gov.cn/"
          },
          {
            name: "磴口县",
            url: "http://www.dengkou.gov.cn/"
          },
          {
            name: "乌拉特前旗",
            url: "http://www.wltqq.gov.cn/"
          },
          {
            name: "乌拉特中旗",
            url: "http://www.wltzq.gov.cn/"
          },
          {
            name: "乌拉特后旗",
            url: "http://www.wlthq.gov.cn/"
          },
          {
            name: "杭锦后旗",
            url: "http://www.hjhq.gov.cn/"
          }
        ]
      },
      {
        name: "乌兰察布市",
        url: "https://www.wulanchabu.gov.cn/",
        children: [
          {
            name: "集宁区",
            url: "http://www.jnq.gov.cn/"
          },
          {
            name: "卓资县",
            url: "https://www.zhuozi.gov.cn/"
          },
          {
            name: "化德县",
            url: "http://www.huade.gov.cn/"
          },
          {
            name: "商都县",
            url: "http://www.shangdu.gov.cn/"
          },
          {
            name: "兴和县",
            url: "https://www.xinghe.gov.cn/"
          },
          {
            name: "凉城县",
            url: "http://www.liangcheng.gov.cn/"
          },
          {
            name: "察哈尔右翼前旗",
            url: "http://www.chyyqq.gov.cn/"
          },
          {
            name: "察哈尔右翼中旗",
            url: "http://www.chayouzhongqi.gov.cn/"
          },
          {
            name: "察哈尔右翼后旗",
            url: "http://www.cyhq.gov.cn/"
          },
          {
            name: "四子王旗",
            url: "https://www.szwq.gov.cn/"
          },
          {
            name: "丰镇市",
            url: "https://www.fengzhen.gov.cn/"
          }
        ]
      },
      {
        name: "兴安盟",
        url: "https://www.xam.gov.cn/",
        children: [
          {
            name: "乌兰浩特市",
            url: "http://www.wlht.gov.cn/"
          },
          {
            name: "阿尔山市",
            url: "http://www.aes.gov.cn/"
          },
          {
            name: "科尔沁右翼前旗",
            url: "http://www.kyqq.gov.cn/"
          },
          {
            name: "科尔沁右翼中旗",
            url: "http://www.kyzq.gov.cn/"
          },
          {
            name: "扎赉特旗",
            url: "http://www.zltq.gov.cn/"
          },
          {
            name: "突泉县",
            url: "http://www.tq.gov.cn/"
          }
        ]
      },
      {
        name: "锡林郭勒盟",
        url: "https://www.xlgl.gov.cn/",
        children: [
          {
            name: "二连浩特市",
            url: "http://www.elht.gov.cn/"
          },
          {
            name: "锡林浩特市",
            url: "http://www.xilinhaote.gov.cn/"
          },
          {
            name: "阿巴嘎旗",
            url: "https://www.abg.gov.cn/"
          },
          {
            name: "苏尼特左旗",
            url: "https://www.sntzq.gov.cn/"
          },
          {
            name: "苏尼特右旗",
            url: "https://www.sntyq.gov.cn/"
          },
          {
            name: "东乌珠穆沁旗",
            url: "https://www.dwq.gov.cn/"
          },
          {
            name: "西乌珠穆沁旗",
            url: "https://www.xwq.gov.cn/"
          },
          {
            name: "太仆寺旗",
            url: "https://www.tpsq.gov.cn/"
          },
          {
            name: "镶黄旗",
            url: "https://www.nmxhq.gov.cn/"
          },
          {
            name: "正镶白旗",
            url: "https://www.zxbq.gov.cn/"
          },
          {
            name: "正蓝旗",
            url: "https://www.zlq.gov.cn/"
          },
          {
            name: "多伦县",
            url: "https://www.dlx.gov.cn/"
          }
        ]
      },
      {
        name: "阿拉善盟",
        url: "https://www.als.gov.cn/",
        children: [
          {
            name: "阿拉善左旗",
            url: "http://www.alszq.gov.cn/"
          },
          {
            name: "阿拉善右旗",
            url: "https://www.alsyq.gov.cn/"
          },
          {
            name: "额济纳旗",
            url: "https://www.ejnq.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "辽宁省",
    url: "https://www.ln.gov.cn/",
    children: [
      {
        name: "沈阳市",
        url: "https://www.shenyang.gov.cn/",
        children: [
          {
            name: "和平区",
            url: ""
          },
          {
            name: "沈河区",
            url: ""
          },
          {
            name: "大东区",
            url: ""
          },
          {
            name: "皇姑区",
            url: ""
          },
          {
            name: "铁西区",
            url: "http://txq.siping.gov.cn/"
          },
          {
            name: "苏家屯区",
            url: ""
          },
          {
            name: "浑南区",
            url: ""
          },
          {
            name: "沈北新区",
            url: ""
          },
          {
            name: "于洪区",
            url: ""
          },
          {
            name: "辽中区",
            url: ""
          },
          {
            name: "康平县",
            url: ""
          },
          {
            name: "法库县",
            url: ""
          },
          {
            name: "新民市",
            url: ""
          }
        ]
      },
      {
        name: "大连市",
        url: "https://www.dl.gov.cn/",
        children: [
          {
            name: "中山区",
            url: ""
          },
          {
            name: "西岗区",
            url: ""
          },
          {
            name: "沙河口区",
            url: ""
          },
          {
            name: "甘井子区",
            url: ""
          },
          {
            name: "旅顺口区",
            url: ""
          },
          {
            name: "金州区",
            url: ""
          },
          {
            name: "普兰店区",
            url: ""
          },
          {
            name: "长海县",
            url: ""
          },
          {
            name: "瓦房店市",
            url: ""
          },
          {
            name: "庄河市",
            url: ""
          }
        ]
      },
      {
        name: "鞍山市",
        url: "http://www.anshan.gov.cn/",
        children: [
          {
            name: "铁东区",
            url: "http://tdq.siping.gov.cn/"
          },
          {
            name: "铁西区",
            url: ""
          },
          {
            name: "立山区",
            url: ""
          },
          {
            name: "千山区",
            url: ""
          },
          {
            name: "台安县",
            url: ""
          },
          {
            name: "岫岩满族自治县",
            url: ""
          },
          {
            name: "海城市",
            url: ""
          }
        ]
      },
      {
        name: "抚顺市",
        url: "https://www.fushun.gov.cn/",
        children: [
          {
            name: "新抚区",
            url: "http://www.fsxf.gov.cn/"
          },
          {
            name: "东洲区",
            url: "http://www.fsdz.gov.cn/"
          },
          {
            name: "望花区",
            url: "https://www.fswh.gov.cn/"
          },
          {
            name: "顺城区",
            url: "http://www.fssc.gov.cn/"
          },
          {
            name: "抚顺县",
            url: "http://www.lnfsx.gov.cn/"
          },
          {
            name: "新宾满族自治县",
            url: "http://www.xinbin.gov.cn/"
          },
          {
            name: "清原满族自治县",
            url: "http://www.qingyuan.gov.cn/"
          }
        ]
      },
      {
        name: "本溪市",
        url: "https://www.benxi.gov.cn/",
        children: [
          {
            name: "平山区",
            url: "http://www.pingshan.gov.cn/"
          },
          {
            name: "溪湖区",
            url: "http://www.xihu.gov.cn/"
          },
          {
            name: "明山区",
            url: "http://www.mingshan.gov.cn/"
          },
          {
            name: "南芬区",
            url: "http://www.nanfen.gov.cn/"
          },
          {
            name: "本溪满族自治县",
            url: "http://www.bx.gov.cn/"
          },
          {
            name: "桓仁满族自治县",
            url: "http://www.hr.gov.cn/"
          }
        ]
      },
      {
        name: "丹东市",
        url: "https://www.dandong.gov.cn/",
        children: [
          {
            name: "元宝区",
            url: ""
          },
          {
            name: "振兴区",
            url: ""
          },
          {
            name: "振安区",
            url: ""
          },
          {
            name: "宽甸满族自治县",
            url: ""
          },
          {
            name: "东港市",
            url: ""
          },
          {
            name: "凤城市",
            url: ""
          }
        ]
      },
      {
        name: "锦州市",
        url: "https://www.jz.gov.cn/",
        children: [
          {
            name: "古塔区",
            url: "http://www.jzgtq.gov.cn/"
          },
          {
            name: "凌河区",
            url: "https://www.jzlhqzf.gov.cn/"
          },
          {
            name: "太和区",
            url: "http://www.jzth.gov.cn/"
          },
          {
            name: "义县",
            url: ""
          },
          {
            name: "黑山县",
            url: "http://www.heishan.gov.cn/"
          },
          {
            name: "北镇市",
            url: "https://www.bzs.gov.cn/"
          },
          {
            name: "凌海市",
            url: "http://www.lnlh.gov.cn/"
          }
        ]
      },
      {
        name: "营口市",
        url: "https://www.yingkou.gov.cn/",
        children: [
          {
            name: "站前区",
            url: "http://www.yingkou.gov.cn/"
          },
          {
            name: "西市区",
            url: ""
          },
          {
            name: "鲅鱼圈区",
            url: ""
          },
          {
            name: "老边区",
            url: ""
          },
          {
            name: "盖州市",
            url: ""
          },
          {
            name: "大石桥市",
            url: "http://www.yingkou.gov.cn/"
          }
        ]
      },
      {
        name: "阜新市",
        url: "https://www.fuxin.gov.cn/",
        children: [
          {
            name: "海州区",
            url: ""
          },
          {
            name: "新邱区",
            url: ""
          },
          {
            name: "太平区",
            url: ""
          },
          {
            name: "清河门区",
            url: ""
          },
          {
            name: "细河区",
            url: ""
          },
          {
            name: "阜新蒙古族自治县",
            url: ""
          },
          {
            name: "彰武县",
            url: ""
          }
        ]
      },
      {
        name: "辽阳市",
        url: "https://www.liaoyang.gov.cn/",
        children: [
          {
            name: "白塔区",
            url: "http://www.liaoyang.gov.cn/"
          },
          {
            name: "文圣区",
            url: ""
          },
          {
            name: "宏伟区",
            url: "http://www.liaoyang.gov.cn/"
          },
          {
            name: "弓长岭区",
            url: ""
          },
          {
            name: "太子河区",
            url: ""
          },
          {
            name: "辽阳县",
            url: "http://www.liaoyang.gov.cn/"
          },
          {
            name: "灯塔市",
            url: ""
          }
        ]
      },
      {
        name: "盘锦市",
        url: "https://www.panjin.gov.cn/",
        children: [
          {
            name: "双台子区",
            url: ""
          },
          {
            name: "兴隆台区",
            url: ""
          },
          {
            name: "大洼区",
            url: ""
          },
          {
            name: "盘山县",
            url: ""
          }
        ]
      },
      {
        name: "铁岭市",
        url: "https://www.tieling.gov.cn/",
        children: [
          {
            name: "银州区",
            url: "http://www.tlyz.gov.cn/"
          },
          {
            name: "清河区",
            url: "http://www.tlqh.gov.cn/"
          },
          {
            name: "铁岭县",
            url: "http://www.tielingxian.gov.cn/"
          },
          {
            name: "西丰县",
            url: "http://www.lntlxf.gov.cn/"
          },
          {
            name: "昌图县",
            url: "http://www.changtu.gov.cn/"
          },
          {
            name: "调兵山市",
            url: "http://www.lndbss.gov.cn/"
          },
          {
            name: "开原市",
            url: "http://www.lnky.gov.cn/"
          }
        ]
      },
      {
        name: "朝阳市",
        url: "https://chaoyang.gov.cn/",
        children: [
          {
            name: "双塔区",
            url: ""
          },
          {
            name: "龙城区",
            url: ""
          },
          {
            name: "朝阳县",
            url: ""
          },
          {
            name: "建平县",
            url: ""
          },
          {
            name: "喀喇沁左翼蒙古族自治县",
            url: ""
          },
          {
            name: "北票市",
            url: ""
          },
          {
            name: "凌源市",
            url: ""
          }
        ]
      },
      {
        name: "葫芦岛市",
        url: "https://www.hld.gov.cn/",
        children: [
          {
            name: "连山区",
            url: "https://www.hld.gov.cn/"
          },
          {
            name: "龙港区",
            url: "https://www.hld.gov.cn/"
          },
          {
            name: "南票区",
            url: ""
          },
          {
            name: "绥中县",
            url: ""
          },
          {
            name: "建昌县",
            url: "https://www.hld.gov.cn/"
          },
          {
            name: "兴城市",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "吉林省",
    url: "https://www.jl.gov.cn/",
    children: [
      {
        name: "长春市",
        url: "https://www.changchun.gov.cn/",
        children: [
          {
            name: "南关区",
            url: "http://nanguan.changchun.gov.cn/"
          },
          {
            name: "宽城区",
            url: "http://www.jckc.gov.cn/"
          },
          {
            name: "朝阳区",
            url: "http://chaoyang.changchun.gov.cn/"
          },
          {
            name: "二道区",
            url: "http://erdao.changchun.gov.cn/"
          },
          {
            name: "绿园区",
            url: "http://www.luyuan.gov.cn/"
          },
          {
            name: "双阳区",
            url: "http://www.shuangyang.gov.cn/"
          },
          {
            name: "九台区",
            url: "http://www.jiutai.gov.cn/"
          },
          {
            name: "农安县",
            url: "http://www.nongan.gov.cn/"
          },
          {
            name: "榆树市",
            url: "http://www.yushu.gov.cn/"
          },
          {
            name: "德惠市",
            url: "http://www.dehui.gov.cn/"
          },
          {
            name: "公主岭市",
            url: "http://www.gongzhuling.gov.cn/"
          }
        ]
      },
      {
        name: "吉林市",
        url: "https://www.jlcity.gov.cn/",
        children: [
          {
            name: "昌邑区",
            url: "http://www.jlscy.gov.cn/"
          },
          {
            name: "龙潭区",
            url: "http://www.longtan.gov.cn/"
          },
          {
            name: "船营区",
            url: "http://www.jlcy.gov.cn/"
          },
          {
            name: "丰满区",
            url: "http://www.jlfm.gov.cn/"
          },
          {
            name: "永吉县",
            url: "http://www.jlyj.gov.cn/"
          },
          {
            name: "蛟河市",
            url: "http://www.jiaohe.gov.cn/"
          },
          {
            name: "桦甸市",
            url: "http://www.huadian.gov.cn/"
          },
          {
            name: "舒兰市",
            url: "http://www.shulan.gov.cn/"
          },
          {
            name: "磐石市",
            url: "http://www.panshi.gov.cn/"
          }
        ]
      },
      {
        name: "四平市",
        url: "https://www.siping.gov.cn/",
        children: [
          {
            name: "铁西区",
            url: ""
          },
          {
            name: "铁东区",
            url: ""
          },
          {
            name: "梨树县",
            url: "http://www.lishu.gov.cn/"
          },
          {
            name: "伊通满族自治县",
            url: "http://www.yitong.gov.cn/"
          },
          {
            name: "公主岭市",
            url: ""
          },
          {
            name: "双辽市",
            url: "http://www.shuangliao.gov.cn/"
          }
        ]
      },
      {
        name: "辽源市",
        url: "https://www.liaoyuan.gov.cn/",
        children: [
          {
            name: "龙山区",
            url: "http://www.jllyls.gov.cn/"
          },
          {
            name: "西安区",
            url: "http://www.lyxa.gov.cn/"
          },
          {
            name: "东丰县",
            url: "http://www.dongfeng.gov.cn/"
          },
          {
            name: "东辽县",
            url: "http://www.dongliao.gov.cn/"
          }
        ]
      },
      {
        name: "通化市",
        url: "http://www.tonghua.gov.cn/",
        children: [
          {
            name: "东昌区",
            url: "http://www.dc.gov.cn/"
          },
          {
            name: "二道江区",
            url: "http://www.edj.gov.cn/"
          },
          {
            name: "通化县",
            url: "http://www.tonghuaxian.gov.cn/"
          },
          {
            name: "辉南县",
            url: "http://www.huinanxian.gov.cn/"
          },
          {
            name: "柳河县",
            url: "http://www.jllh.gov.cn/"
          },
          {
            name: "梅河口市",
            url: "http://www.mhk.gov.cn/"
          },
          {
            name: "集安市",
            url: "http://www.jilinja.gov.cn/"
          }
        ]
      },
      {
        name: "白山市",
        url: "http://www.cbs.gov.cn/",
        children: [
          {
            name: "浑江区",
            url: ""
          },
          {
            name: "江源区",
            url: ""
          },
          {
            name: "抚松县",
            url: ""
          },
          {
            name: "靖宇县",
            url: ""
          },
          {
            name: "长白朝鲜族自治县",
            url: ""
          },
          {
            name: "临江市",
            url: ""
          }
        ]
      },
      {
        name: "松原市",
        url: "https://www.jlsy.gov.cn/",
        children: [
          {
            name: "宁江区",
            url: ""
          },
          {
            name: "前郭尔罗斯蒙古族自治县",
            url: "http://www.qianguo.gov.cn/"
          },
          {
            name: "长岭县",
            url: "http://www.jlcl.gov.cn/"
          },
          {
            name: "乾安县",
            url: "http://www.jlqa.gov.cn/"
          },
          {
            name: "扶余市",
            url: "http://www.jlfy.gov.cn/"
          }
        ]
      },
      {
        name: "白城市",
        url: "http://www.jlbc.gov.cn/",
        children: [
          {
            name: "洮北区",
            url: ""
          },
          {
            name: "镇赉县",
            url: ""
          },
          {
            name: "通榆县",
            url: ""
          },
          {
            name: "洮南市",
            url: ""
          },
          {
            name: "大安市",
            url: ""
          }
        ]
      },
      {
        name: "延边朝鲜族自治州",
        url: "https://www.yanbian.gov.cn/",
        children: [
          {
            name: "延吉市",
            url: "http://www.yanji.gov.cn/"
          },
          {
            name: "图们市",
            url: "http://www.tumen.gov.cn/"
          },
          {
            name: "敦化市",
            url: "http://www.dunhua.gov.cn/"
          },
          {
            name: "珲春市",
            url: "http://www.yanbian.gov.cn/"
          },
          {
            name: "龙井市",
            url: "http://www.longjing.gov.cn/"
          },
          {
            name: "和龙市",
            url: "http://www.helong.gov.cn/"
          },
          {
            name: "汪清县",
            url: "http://www.wangqing.gov.cn/"
          },
          {
            name: "安图县",
            url: "http://www.antu.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "黑龙江省",
    url: "https://www.hlj.gov.cn/",
    children: [
      {
        name: "哈尔滨市",
        url: "https://www.harbin.gov.cn/",
        children: [
          {
            name: "道里区",
            url: "http://www.hrbdl.gov.cn/"
          },
          {
            name: "南岗区",
            url: "http://www.hrbng.gov.cn/"
          },
          {
            name: "道外区",
            url: "http://www.hrbdw.gov.cn/"
          },
          {
            name: "平房区",
            url: "http://www.hrbpf.gov.cn/"
          },
          {
            name: "松北区",
            url: "http://www.songbei.gov.cn/"
          },
          {
            name: "香坊区",
            url: "http://www.hrbxf.gov.cn/"
          },
          {
            name: "呼兰区",
            url: "http://www.hulan.gov.cn/"
          },
          {
            name: "阿城区",
            url: "http://www.acheng.gov.cn/"
          },
          {
            name: "双城区",
            url: "http://www.hrbsc.gov.cn/"
          },
          {
            name: "依兰县",
            url: "http://www.hrbyl.gov.cn/"
          },
          {
            name: "方正县",
            url: "http://www.hrbfz.gov.cn/"
          },
          {
            name: "宾县",
            url: ""
          },
          {
            name: "巴彦县",
            url: "http://www.bayan.gov.cn/"
          },
          {
            name: "木兰县",
            url: "https://www.zwfw.hlj.gov.cn/"
          },
          {
            name: "通河县",
            url: "http://www.hrbtonghe.gov.cn/"
          },
          {
            name: "延寿县",
            url: "http://www.hrbyanshou.gov.cn/"
          },
          {
            name: "尚志市",
            url: "http://www.shangzhi.gov.cn/"
          },
          {
            name: "五常市",
            url: "http://www.hljwch.gov.cn/"
          }
        ]
      },
      {
        name: "齐齐哈尔市",
        url: "https://www.qqhr.gov.cn/",
        children: [
          {
            name: "龙沙区",
            url: "http://www.qqhrlsq.gov.cn/"
          },
          {
            name: "建华区",
            url: "http://www.jhq.gov.cn/"
          },
          {
            name: "铁锋区",
            url: "http://www.tfqzf.gov.cn/"
          },
          {
            name: "昂昂溪区",
            url: "http://www.aax.gov.cn/"
          },
          {
            name: "富拉尔基区",
            url: "http://www.flej.gov.cn/"
          },
          {
            name: "碾子山区",
            url: "http://www.nzs.gov.cn/"
          },
          {
            name: "梅里斯达斡尔族区",
            url: "http://www.mls.gov.cn/"
          },
          {
            name: "龙江县",
            url: "http://www.ljxrmzfw.gov.cn/"
          },
          {
            name: "依安县",
            url: "http://www.hljyian.gov.cn/"
          },
          {
            name: "泰来县",
            url: "http://www.tailai.gov.cn/"
          },
          {
            name: "甘南县",
            url: "http://www.gannan.gov.cn/"
          },
          {
            name: "富裕县",
            url: "http://www.fuyu.gov.cn/"
          },
          {
            name: "克山县",
            url: "http://www.keshan.gov.cn/"
          },
          {
            name: "克东县",
            url: "http://www.kedong.gov.cn/"
          },
          {
            name: "拜泉县",
            url: "http://www.baiquan.gov.cn/"
          },
          {
            name: "讷河市",
            url: "http://www.nehe.gov.cn/"
          }
        ]
      },
      {
        name: "鸡西市",
        url: "https://www.jixi.gov.cn/",
        children: [
          {
            name: "鸡冠区",
            url: ""
          },
          {
            name: "恒山区",
            url: ""
          },
          {
            name: "滴道区",
            url: ""
          },
          {
            name: "梨树区",
            url: ""
          },
          {
            name: "城子河区",
            url: ""
          },
          {
            name: "麻山区",
            url: ""
          },
          {
            name: "鸡东县",
            url: ""
          },
          {
            name: "虎林市",
            url: ""
          },
          {
            name: "密山市",
            url: ""
          }
        ]
      },
      {
        name: "鹤岗市",
        url: "https://www.hegang.gov.cn/",
        children: [
          {
            name: "向阳区",
            url: "https://www.xyq.gov.cn/"
          },
          {
            name: "工农区",
            url: ""
          },
          {
            name: "南山区",
            url: ""
          },
          {
            name: "兴安区",
            url: ""
          },
          {
            name: "东山区",
            url: ""
          },
          {
            name: "兴山区",
            url: ""
          },
          {
            name: "萝北县",
            url: ""
          },
          {
            name: "绥滨县",
            url: ""
          }
        ]
      },
      {
        name: "双鸭山市",
        url: "https://www.sys.gov.cn/",
        children: [
          {
            name: "尖山区",
            url: ""
          },
          {
            name: "岭东区",
            url: ""
          },
          {
            name: "四方台区",
            url: ""
          },
          {
            name: "宝山区",
            url: "https://www.shbsq.gov.cn/"
          },
          {
            name: "集贤县",
            url: ""
          },
          {
            name: "友谊县",
            url: ""
          },
          {
            name: "宝清县",
            url: ""
          },
          {
            name: "饶河县",
            url: ""
          }
        ]
      },
      {
        name: "大庆市",
        url: "https://www.daqing.gov.cn/",
        children: [
          {
            name: "萨尔图区",
            url: "http://www.saertu.gov.cn/"
          },
          {
            name: "龙凤区",
            url: "http://www.dqlf.gov.cn/"
          },
          {
            name: "让胡路区",
            url: ""
          },
          {
            name: "红岗区",
            url: "http://www.honggang.gov.cn/"
          },
          {
            name: "大同区",
            url: "https://www.dqdt.gov.cn/"
          },
          {
            name: "肇州县",
            url: "http://www.zhaozhou.gov.cn/"
          },
          {
            name: "肇源县",
            url: "http://www.zgzy.gov.cn/"
          },
          {
            name: "林甸县",
            url: "http://www.lindian.gov.cn/"
          },
          {
            name: "杜尔伯特蒙古族自治县",
            url: ""
          }
        ]
      },
      {
        name: "伊春市",
        url: "https://www.yc.gov.cn/",
        children: [
          {
            name: "伊美区",
            url: ""
          },
          {
            name: "乌翠区",
            url: ""
          },
          {
            name: "友好区",
            url: ""
          },
          {
            name: "金林区",
            url: ""
          },
          {
            name: "铁力市",
            url: ""
          },
          {
            name: "嘉荫县",
            url: ""
          },
          {
            name: "汤旺县",
            url: ""
          },
          {
            name: "丰林县",
            url: ""
          },
          {
            name: "大箐山县",
            url: ""
          },
          {
            name: "南岔县",
            url: ""
          }
        ]
      },
      {
        name: "佳木斯市",
        url: "https://www.jms.gov.cn/",
        children: [
          {
            name: "向阳区",
            url: ""
          },
          {
            name: "前进区",
            url: ""
          },
          {
            name: "东风区",
            url: "https://www.jmsdf.gov.cn/"
          },
          {
            name: "郊区",
            url: "https://www.tljq.gov.cn/"
          },
          {
            name: "桦南县",
            url: "https://www.huanan.gov.cn/"
          },
          {
            name: "桦川县",
            url: ""
          },
          {
            name: "汤原县",
            url: "https://www.tangyuan.gov.cn/"
          },
          {
            name: "同江市",
            url: "https://www.tongjiang.gov.cn/"
          },
          {
            name: "富锦市",
            url: "http://www.fujin.gov.cn/"
          },
          {
            name: "抚远市",
            url: "http://www.hljfy.gov.cn/"
          }
        ]
      },
      {
        name: "七台河市",
        url: "https://www.qth.gov.cn/",
        children: [
          {
            name: "新兴区",
            url: "http://www.hljxinxing.gov.cn/"
          },
          {
            name: "桃山区",
            url: "http://www.hljtsq.gov.cn/"
          },
          {
            name: "茄子河区",
            url: "http://www.hljqzh.gov.cn/"
          },
          {
            name: "勃利县",
            url: "http://www.hljboli.gov.cn/"
          }
        ]
      },
      {
        name: "牡丹江市",
        url: "http://www.mdj.gov.cn/",
        children: [
          {
            name: "东安区",
            url: "https://www.donganqu.gov.cn/"
          },
          {
            name: "阳明区",
            url: "https://www.yangming.gov.cn/"
          },
          {
            name: "爱民区",
            url: "https://www.aimin.gov.cn/"
          },
          {
            name: "西安区",
            url: "https://www.mdjxa.gov.cn/"
          },
          {
            name: "林口县",
            url: "https://www.linkou.gov.cn/"
          },
          {
            name: "东宁市",
            url: "https://www.dongning.gov.cn/"
          },
          {
            name: "绥芬河市",
            url: "https://www.suifenhe.gov.cn/"
          },
          {
            name: "海林市",
            url: ""
          },
          {
            name: "宁安市",
            url: "https://www.ningan.gov.cn/"
          },
          {
            name: "穆棱市",
            url: "https://www.muling.gov.cn/"
          }
        ]
      },
      {
        name: "黑河市",
        url: "https://www.heihe.gov.cn/",
        children: [
          {
            name: "爱辉区",
            url: "http://www.aihui.gov.cn/"
          },
          {
            name: "逊克县",
            url: ""
          },
          {
            name: "孙吴县",
            url: "http://www.hljsunwu.gov.cn/"
          },
          {
            name: "北安市",
            url: "http://www.hljba.gov.cn/"
          },
          {
            name: "五大连池市",
            url: ""
          },
          {
            name: "嫩江市",
            url: "https://www.nenjiang.gov.cn/"
          }
        ]
      },
      {
        name: "绥化市",
        url: "https://www.suihua.gov.cn/",
        children: [
          {
            name: "北林区",
            url: ""
          },
          {
            name: "望奎县",
            url: ""
          },
          {
            name: "兰西县",
            url: ""
          },
          {
            name: "青冈县",
            url: ""
          },
          {
            name: "庆安县",
            url: ""
          },
          {
            name: "明水县",
            url: ""
          },
          {
            name: "绥棱县",
            url: ""
          },
          {
            name: "安达市",
            url: ""
          },
          {
            name: "肇东市",
            url: ""
          },
          {
            name: "海伦市",
            url: ""
          }
        ]
      },
      {
        name: "大兴安岭地区",
        url: "https://www.dxal.gov.cn/",
        children: [
          {
            name: "加格达奇区",
            url: "http://www.jgdq.gov.cn/"
          },
          {
            name: "松岭区",
            url: "http://www.songling.gov.cn/"
          },
          {
            name: "新林区",
            url: "http://www.dxalxl.gov.cn/"
          },
          {
            name: "呼中区",
            url: "http://www.huzhong.gov.cn/"
          },
          {
            name: "呼玛县",
            url: "http://www.huma.gov.cn/"
          },
          {
            name: "塔河县",
            url: "http://www.dxalth.gov.cn/"
          },
          {
            name: "漠河市",
            url: "http://www.mohe.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "江苏省",
    url: "https://www.jiangsu.gov.cn/",
    children: [
      {
        name: "南京市",
        url: "https://www.nanjing.gov.cn/",
        children: [
          {
            name: "玄武区",
            url: "http://www.xuanwu.gov.cn/"
          },
          {
            name: "秦淮区",
            url: "http://www.njqh.gov.cn/"
          },
          {
            name: "建邺区",
            url: "http://www.njjy.gov.cn/"
          },
          {
            name: "鼓楼区",
            url: "https://www.gl.gov.cn/"
          },
          {
            name: "浦口区",
            url: "http://www.pukou.gov.cn/"
          },
          {
            name: "栖霞区",
            url: "http://www.qixia.gov.cn/"
          },
          {
            name: "雨花台区",
            url: "http://www.njyh.gov.cn/"
          },
          {
            name: "江宁区",
            url: "http://www.jiangning.gov.cn/"
          },
          {
            name: "六合区",
            url: "http://www.njlh.gov.cn/"
          },
          {
            name: "溧水区",
            url: "http://www.njls.gov.cn/"
          },
          {
            name: "高淳区",
            url: "http://www.njgc.gov.cn/"
          }
        ]
      },
      {
        name: "无锡市",
        url: "https://www.wuxi.gov.cn/",
        children: [
          {
            name: "锡山区",
            url: "https://www.jsxishan.gov.cn/"
          },
          {
            name: "惠山区",
            url: "https://www.huishan.gov.cn/"
          },
          {
            name: "滨湖区",
            url: "https://www.wxbh.gov.cn/"
          },
          {
            name: "梁溪区",
            url: "https://www.wxlx.gov.cn/"
          },
          {
            name: "新吴区",
            url: "https://www.wxni.gov.cn/"
          },
          {
            name: "江阴市",
            url: "https://www.jiangyin.gov.cn/"
          },
          {
            name: "宜兴市",
            url: "https://www.yixing.gov.cn/"
          }
        ]
      },
      {
        name: "徐州市",
        url: "https://www.xz.gov.cn/",
        children: [
          {
            name: "鼓楼区",
            url: "http://www.xzgulou.gov.cn/"
          },
          {
            name: "云龙区",
            url: "http://www.xzyl.gov.cn/"
          },
          {
            name: "贾汪区",
            url: "http://www.xzjw.gov.cn/"
          },
          {
            name: "泉山区",
            url: "http://www.xzqs.gov.cn/"
          },
          {
            name: "铜山区",
            url: "http://www.zgts.gov.cn/"
          },
          {
            name: "丰县",
            url: "http://www.chinafx.gov.cn/"
          },
          {
            name: "沛县",
            url: "http://www.px.gov.cn/"
          },
          {
            name: "睢宁县",
            url: "http://www.cnsn.gov.cn/"
          },
          {
            name: "新沂市",
            url: "http://www.xy.gov.cn/"
          },
          {
            name: "邳州市",
            url: "http://www.pizhou.gov.cn/"
          }
        ]
      },
      {
        name: "常州市",
        url: "https://www.changzhou.gov.cn/",
        children: [
          {
            name: "天宁区",
            url: "https://www.cztn.gov.cn/"
          },
          {
            name: "钟楼区",
            url: "https://www.zhonglou.gov.cn/"
          },
          {
            name: "新北区",
            url: "https://www.cznd.gov.cn/"
          },
          {
            name: "武进区",
            url: "https://www.wj.gov.cn/"
          },
          {
            name: "金坛区",
            url: "https://www.jintan.gov.cn/"
          },
          {
            name: "溧阳市",
            url: "https://www.liyang.gov.cn/"
          }
        ]
      },
      {
        name: "苏州市",
        url: "https://www.suzhou.gov.cn/",
        children: [
          {
            name: "虎丘区",
            url: "http://www.snd.gov.cn/"
          },
          {
            name: "吴中区",
            url: "http://www.szwz.gov.cn/"
          },
          {
            name: "相城区",
            url: "http://www.szxc.gov.cn/"
          },
          {
            name: "姑苏区",
            url: "https://www.gusu.gov.cn/"
          },
          {
            name: "吴江区",
            url: "https://www.wujiang.gov.cn/"
          },
          {
            name: "常熟市",
            url: "http://www.changshu.gov.cn/"
          },
          {
            name: "张家港市",
            url: "http://www.zjg.gov.cn/"
          },
          {
            name: "昆山市",
            url: "https://www.ks.gov.cn/"
          },
          {
            name: "太仓市",
            url: "http://www.taicang.gov.cn/"
          }
        ]
      },
      {
        name: "南通市",
        url: "https://www.nantong.gov.cn/",
        children: [
          {
            name: "通州区",
            url: "http://www.tongzhou.gov.cn/"
          },
          {
            name: "崇川区",
            url: "https://www.chongchuan.gov.cn/"
          },
          {
            name: "海门区",
            url: "https://www.haimen.gov.cn/"
          },
          {
            name: "如东县",
            url: "https://www.rudong.gov.cn/"
          },
          {
            name: "启东市",
            url: "http://www.qidong.gov.cn/"
          },
          {
            name: "如皋市",
            url: "https://www.rugao.gov.cn/"
          },
          {
            name: "海安市",
            url: "https://www.haian.gov.cn/"
          }
        ]
      },
      {
        name: "连云港市",
        url: "https://www.lyg.gov.cn/",
        children: [
          {
            name: "连云区",
            url: "http://www.lianyun.gov.cn/"
          },
          {
            name: "海州区",
            url: "http://www.lyghz.gov.cn/"
          },
          {
            name: "赣榆区",
            url: "https://www.ganyu.gov.cn/"
          },
          {
            name: "东海县",
            url: "http://www.jsdh.gov.cn/"
          },
          {
            name: "灌云县",
            url: "http://www.guanyun.gov.cn/"
          },
          {
            name: "灌南县",
            url: "http://www.guannan.gov.cn/"
          }
        ]
      },
      {
        name: "淮安市",
        url: "https://www.huaian.gov.cn/",
        children: [
          {
            name: "淮安区",
            url: "http://www.zghaq.gov.cn/"
          },
          {
            name: "淮阴区",
            url: "http://www.zghy.gov.cn/"
          },
          {
            name: "清江浦区",
            url: "http://www.haqjp.gov.cn/"
          },
          {
            name: "洪泽区",
            url: "http://www.hongze.gov.cn/"
          },
          {
            name: "涟水县",
            url: "http://www.lianshui.gov.cn/"
          },
          {
            name: "盱眙县",
            url: "http://www.xuyi.gov.cn/"
          },
          {
            name: "金湖县",
            url: "http://www.jinhu.gov.cn/"
          }
        ]
      },
      {
        name: "盐城市",
        url: "https://www.yancheng.gov.cn/",
        children: [
          {
            name: "亭湖区",
            url: "https://www.tinghu.gov.cn/"
          },
          {
            name: "盐都区",
            url: "https://www.yandu.gov.cn/"
          },
          {
            name: "大丰区",
            url: "https://www.dafeng.gov.cn/"
          },
          {
            name: "响水县",
            url: "https://www.xiangshui.gov.cn/"
          },
          {
            name: "滨海县",
            url: "https://www.binhai.gov.cn/"
          },
          {
            name: "阜宁县",
            url: "https://www.funing.gov.cn/"
          },
          {
            name: "射阳县",
            url: "https://www.sheyang.gov.cn/"
          },
          {
            name: "建湖县",
            url: "https://www.jianhu.gov.cn/"
          },
          {
            name: "东台市",
            url: "https://www.dongtai.gov.cn/"
          }
        ]
      },
      {
        name: "扬州市",
        url: "https://www.yangzhou.gov.cn/",
        children: [
          {
            name: "广陵区",
            url: "http://www.yzglq.gov.cn/"
          },
          {
            name: "邗江区",
            url: "http://www.hj.gov.cn/"
          },
          {
            name: "江都区",
            url: "http://www.jiangdu.gov.cn/"
          },
          {
            name: "宝应县",
            url: "https://baoying.yangzhou.gov.cn/"
          },
          {
            name: "仪征市",
            url: "https://www.yizheng.gov.cn/"
          },
          {
            name: "高邮市",
            url: "http://gaoyou.yangzhou.gov.cn/"
          }
        ]
      },
      {
        name: "镇江市",
        url: "https://www.zhenjiang.gov.cn/",
        children: [
          {
            name: "京口区",
            url: "http://www.jingkou.gov.cn/"
          },
          {
            name: "润州区",
            url: "http://www.runzhou.gov.cn/"
          },
          {
            name: "丹徒区",
            url: "http://www.dantu.gov.cn/"
          },
          {
            name: "丹阳市",
            url: "http://www.danyang.gov.cn/"
          },
          {
            name: "扬中市",
            url: "http://www.yz.gov.cn/"
          },
          {
            name: "句容市",
            url: "http://www.jurong.gov.cn/"
          }
        ]
      },
      {
        name: "泰州市",
        url: "https://www.taizhou.gov.cn/",
        children: [
          {
            name: "海陵区",
            url: "https://www.tzhl.gov.cn/"
          },
          {
            name: "高港区",
            url: "http://www.gaogang.gov.cn/"
          },
          {
            name: "姜堰区",
            url: "https://www.jiangyan.gov.cn/"
          },
          {
            name: "兴化市",
            url: "http://www.xinghua.gov.cn/"
          },
          {
            name: "靖江市",
            url: "https://www.jingjiang.gov.cn/"
          },
          {
            name: "泰兴市",
            url: "http://www.taixing.gov.cn/"
          }
        ]
      },
      {
        name: "宿迁市",
        url: "https://www.suqian.gov.cn/",
        children: [
          {
            name: "宿城区",
            url: "http://www.sqsc.gov.cn/"
          },
          {
            name: "宿豫区",
            url: "http://www.suyu.gov.cn/"
          },
          {
            name: "沭阳县",
            url: "http://www.shuyang.gov.cn/"
          },
          {
            name: "泗阳县",
            url: "http://www.siyang.gov.cn/"
          },
          {
            name: "泗洪县",
            url: "http://www.sihong.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "浙江省",
    url: "https://www.zj.gov.cn/",
    children: [
      {
        name: "杭州市",
        url: "https://www.hangzhou.gov.cn/",
        children: [
          {
            name: "上城区",
            url: "https://www.hzsc.gov.cn/"
          },
          {
            name: "拱墅区",
            url: "https://www.gongshu.gov.cn/"
          },
          {
            name: "西湖区",
            url: "https://www.hzxh.gov.cn/"
          },
          {
            name: "滨江区",
            url: "http://www.hhtz.gov.cn/"
          },
          {
            name: "萧山区",
            url: "https://www.xiaoshan.gov.cn/"
          },
          {
            name: "余杭区",
            url: "https://www.yuhang.gov.cn/"
          },
          {
            name: "临平区",
            url: "https://www.linping.gov.cn/"
          },
          {
            name: "钱塘区",
            url: "https://www.qiantang.gov.cn/"
          },
          {
            name: "富阳区",
            url: "http://www.fuyang.gov.cn/"
          },
          {
            name: "临安区",
            url: "https://www.linan.gov.cn/"
          },
          {
            name: "桐庐县",
            url: "http://www.tonglu.gov.cn/"
          },
          {
            name: "淳安县",
            url: "https://www.qdh.gov.cn/"
          },
          {
            name: "建德市",
            url: "https://www.jiande.gov.cn/"
          }
        ]
      },
      {
        name: "宁波市",
        url: "https://www.ningbo.gov.cn/",
        children: [
          {
            name: "海曙区",
            url: ""
          },
          {
            name: "江北区",
            url: "https://www.cqjb.gov.cn/"
          },
          {
            name: "北仑区",
            url: ""
          },
          {
            name: "镇海区",
            url: ""
          },
          {
            name: "鄞州区",
            url: ""
          },
          {
            name: "奉化区",
            url: ""
          },
          {
            name: "象山县",
            url: ""
          },
          {
            name: "宁海县",
            url: ""
          },
          {
            name: "余姚市",
            url: ""
          },
          {
            name: "慈溪市",
            url: ""
          }
        ]
      },
      {
        name: "温州市",
        url: "https://www.wenzhou.gov.cn/",
        children: [
          {
            name: "鹿城区",
            url: "http://www.lucheng.gov.cn/"
          },
          {
            name: "龙湾区",
            url: "http://www.longwan.gov.cn/"
          },
          {
            name: "瓯海区",
            url: "http://www.ouhai.gov.cn/"
          },
          {
            name: "洞头区",
            url: "http://www.dongtou.gov.cn/"
          },
          {
            name: "永嘉县",
            url: "https://www.yj.gov.cn/"
          },
          {
            name: "平阳县",
            url: "https://www.zjpy.gov.cn/"
          },
          {
            name: "苍南县",
            url: "http://www.cncn.gov.cn/"
          },
          {
            name: "文成县",
            url: "http://www.wencheng.gov.cn/"
          },
          {
            name: "泰顺县",
            url: "http://www.ts.gov.cn/"
          },
          {
            name: "瑞安市",
            url: "http://www.ruian.gov.cn/"
          },
          {
            name: "乐清市",
            url: "https://www.yueqing.gov.cn/"
          },
          {
            name: "龙港市",
            url: "http://www.zjlg.gov.cn/"
          }
        ]
      },
      {
        name: "嘉兴市",
        url: "https://www.jiaxing.gov.cn/",
        children: [
          {
            name: "南湖区",
            url: "http://www.nanhu.gov.cn/"
          },
          {
            name: "秀洲区",
            url: "https://www.xiuzhou.gov.cn/"
          },
          {
            name: "嘉善县",
            url: "https://www.jiashan.gov.cn/"
          },
          {
            name: "海盐县",
            url: "https://www.haiyan.gov.cn/"
          },
          {
            name: "海宁市",
            url: "https://www.haining.gov.cn/"
          },
          {
            name: "平湖市",
            url: "http://www.pinghu.gov.cn/"
          },
          {
            name: "桐乡市",
            url: "https://www.tx.gov.cn/"
          }
        ]
      },
      {
        name: "湖州市",
        url: "https://www.huzhou.gov.cn/",
        children: [
          {
            name: "吴兴区",
            url: "https://www.wuxing.gov.cn/"
          },
          {
            name: "南浔区",
            url: "https://www.nanxun.gov.cn/"
          },
          {
            name: "德清县",
            url: "https://www.deqing.gov.cn/"
          },
          {
            name: "长兴县",
            url: "https://www.zjcx.gov.cn/"
          },
          {
            name: "安吉县",
            url: "https://www.anji.gov.cn/"
          }
        ]
      },
      {
        name: "绍兴市",
        url: "https://www.sx.gov.cn/",
        children: [
          {
            name: "越城区",
            url: "http://www.sxyc.gov.cn/"
          },
          {
            name: "柯桥区",
            url: "https://www.kq.gov.cn/"
          },
          {
            name: "上虞区",
            url: "https://www.shangyu.gov.cn/"
          },
          {
            name: "新昌县",
            url: "http://www.zjxc.gov.cn/"
          },
          {
            name: "诸暨市",
            url: "https://www.zhuji.gov.cn/"
          },
          {
            name: "嵊州市",
            url: "http://www.szzj.gov.cn/"
          }
        ]
      },
      {
        name: "金华市",
        url: "https://www.jinhua.gov.cn/",
        children: [
          {
            name: "婺城区",
            url: "https://www.wuch.gov.cn/"
          },
          {
            name: "金东区",
            url: "https://www.jindong.gov.cn/"
          },
          {
            name: "武义县",
            url: "https://www.zjwy.gov.cn/"
          },
          {
            name: "浦江县",
            url: "https://www.pj.gov.cn/"
          },
          {
            name: "磐安县",
            url: "https://www.panan.gov.cn/"
          },
          {
            name: "兰溪市",
            url: "https://www.lanxi.gov.cn/"
          },
          {
            name: "义乌市",
            url: "https://www.yw.gov.cn/"
          },
          {
            name: "东阳市",
            url: "http://www.dongyang.gov.cn/"
          },
          {
            name: "永康市",
            url: "https://www.yk.gov.cn/"
          }
        ]
      },
      {
        name: "衢州市",
        url: "https://www.qz.gov.cn/",
        children: [
          {
            name: "柯城区",
            url: "https://www.kecheng.gov.cn/"
          },
          {
            name: "衢江区",
            url: "https://www.qjq.gov.cn/"
          },
          {
            name: "常山县",
            url: "https://www.zjcs.gov.cn/"
          },
          {
            name: "开化县",
            url: "https://www.kaihua.gov.cn/"
          },
          {
            name: "龙游县",
            url: "http://www.longyou.gov.cn/"
          },
          {
            name: "江山市",
            url: "https://www.jiangshan.gov.cn/"
          }
        ]
      },
      {
        name: "舟山市",
        url: "https://www.zhoushan.gov.cn/",
        children: [
          {
            name: "定海区",
            url: "https://www.dinghai.gov.cn/"
          },
          {
            name: "普陀区",
            url: ""
          },
          {
            name: "岱山县",
            url: "https://www.daishan.gov.cn/"
          },
          {
            name: "嵊泗县",
            url: "https://www.shengsi.gov.cn/"
          }
        ]
      },
      {
        name: "台州市",
        url: "https://www.taizhou.com.cn/",
        children: [
          {
            name: "椒江区",
            url: "https://www.jj.gov.cn/"
          },
          {
            name: "黄岩区",
            url: "https://www.zjhy.gov.cn/"
          },
          {
            name: "路桥区",
            url: "https://www.luqiao.gov.cn/"
          },
          {
            name: "三门县",
            url: "https://www.sanmen.gov.cn/"
          },
          {
            name: "天台县",
            url: "https://www.zjtt.gov.cn/"
          },
          {
            name: "仙居县",
            url: "https://www.zjxj.gov.cn/"
          },
          {
            name: "温岭市",
            url: "https://www.wl.gov.cn/"
          },
          {
            name: "临海市",
            url: "https://www.linhai.gov.cn/"
          },
          {
            name: "玉环市",
            url: "https://www.yuhuan.gov.cn/"
          }
        ]
      },
      {
        name: "丽水市",
        url: "https://www.lishui.gov.cn/",
        children: [
          {
            name: "莲都区",
            url: "https://www.liandu.gov.cn/"
          },
          {
            name: "青田县",
            url: "http://www.qingtian.gov.cn/"
          },
          {
            name: "缙云县",
            url: "http://www.jinyun.gov.cn/"
          },
          {
            name: "遂昌县",
            url: "http://www.suichang.gov.cn/"
          },
          {
            name: "松阳县",
            url: "https://www.songyang.gov.cn/"
          },
          {
            name: "云和县",
            url: "http://www.yunhe.gov.cn/"
          },
          {
            name: "庆元县",
            url: "http://www.zjqy.gov.cn/"
          },
          {
            name: "景宁畲族自治县",
            url: "http://www.jingning.gov.cn/"
          },
          {
            name: "龙泉市",
            url: "https://www.longquan.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "安徽省",
    url: "https://www.ah.gov.cn/",
    children: [
      {
        name: "合肥市",
        url: "https://www.hefei.gov.cn/",
        children: [
          {
            name: "瑶海区",
            url: ""
          },
          {
            name: "庐阳区",
            url: ""
          },
          {
            name: "蜀山区",
            url: ""
          },
          {
            name: "包河区",
            url: ""
          },
          {
            name: "长丰县",
            url: ""
          },
          {
            name: "肥东县",
            url: ""
          },
          {
            name: "肥西县",
            url: ""
          },
          {
            name: "庐江县",
            url: ""
          },
          {
            name: "巢湖市",
            url: ""
          }
        ]
      },
      {
        name: "芜湖市",
        url: "https://www.wuhu.gov.cn/",
        children: [
          {
            name: "镜湖区",
            url: ""
          },
          {
            name: "弋江区",
            url: ""
          },
          {
            name: "鸠江区",
            url: ""
          },
          {
            name: "湾沚区",
            url: ""
          },
          {
            name: "繁昌区",
            url: ""
          },
          {
            name: "南陵县",
            url: ""
          },
          {
            name: "无为市",
            url: ""
          }
        ]
      },
      {
        name: "蚌埠市",
        url: "https://www.bengbu.gov.cn/",
        children: [
          {
            name: "龙子湖区",
            url: ""
          },
          {
            name: "蚌山区",
            url: ""
          },
          {
            name: "禹会区",
            url: ""
          },
          {
            name: "淮上区",
            url: ""
          },
          {
            name: "怀远县",
            url: ""
          },
          {
            name: "五河县",
            url: ""
          },
          {
            name: "固镇县",
            url: ""
          }
        ]
      },
      {
        name: "淮南市",
        url: "https://www.huainan.gov.cn/",
        children: [
          {
            name: "大通区",
            url: ""
          },
          {
            name: "田家庵区",
            url: ""
          },
          {
            name: "谢家集区",
            url: ""
          },
          {
            name: "八公山区",
            url: "https://www.huainan.gov.cn/"
          },
          {
            name: "潘集区",
            url: ""
          },
          {
            name: "凤台县",
            url: ""
          },
          {
            name: "寿县",
            url: ""
          }
        ]
      },
      {
        name: "马鞍山市",
        url: "https://www.mas.gov.cn/",
        children: [
          {
            name: "花山区",
            url: ""
          },
          {
            name: "雨山区",
            url: ""
          },
          {
            name: "博望区",
            url: ""
          },
          {
            name: "当涂县",
            url: ""
          },
          {
            name: "含山县",
            url: ""
          },
          {
            name: "和县",
            url: ""
          }
        ]
      },
      {
        name: "淮北市",
        url: "https://www.huaibei.gov.cn/",
        children: [
          {
            name: "杜集区",
            url: ""
          },
          {
            name: "相山区",
            url: "https://www.huaibei.gov.cn/"
          },
          {
            name: "烈山区",
            url: ""
          },
          {
            name: "濉溪县",
            url: ""
          }
        ]
      },
      {
        name: "铜陵市",
        url: "https://www.tl.gov.cn/",
        children: [
          {
            name: "铜官区",
            url: "https://www.tltg.gov.cn/"
          },
          {
            name: "义安区",
            url: "https://www.ahtlyaq.gov.cn/"
          },
          {
            name: "郊区",
            url: ""
          },
          {
            name: "枞阳县",
            url: "https://www.zongyang.gov.cn/"
          }
        ]
      },
      {
        name: "安庆市",
        url: "https://www.anqing.gov.cn/",
        children: [
          {
            name: "迎江区",
            url: ""
          },
          {
            name: "大观区",
            url: ""
          },
          {
            name: "宜秀区",
            url: ""
          },
          {
            name: "怀宁县",
            url: ""
          },
          {
            name: "太湖县",
            url: ""
          },
          {
            name: "宿松县",
            url: ""
          },
          {
            name: "望江县",
            url: ""
          },
          {
            name: "岳西县",
            url: ""
          },
          {
            name: "桐城市",
            url: ""
          },
          {
            name: "潜山市",
            url: ""
          }
        ]
      },
      {
        name: "黄山市",
        url: "https://www.huangshan.gov.cn/",
        children: [
          {
            name: "屯溪区",
            url: ""
          },
          {
            name: "黄山区",
            url: ""
          },
          {
            name: "徽州区",
            url: ""
          },
          {
            name: "歙县",
            url: ""
          },
          {
            name: "休宁县",
            url: ""
          },
          {
            name: "黟县",
            url: ""
          },
          {
            name: "祁门县",
            url: ""
          }
        ]
      },
      {
        name: "滁州市",
        url: "https://www.chuzhou.gov.cn/",
        children: [
          {
            name: "琅琊区",
            url: ""
          },
          {
            name: "南谯区",
            url: ""
          },
          {
            name: "来安县",
            url: ""
          },
          {
            name: "全椒县",
            url: ""
          },
          {
            name: "定远县",
            url: ""
          },
          {
            name: "凤阳县",
            url: ""
          },
          {
            name: "天长市",
            url: ""
          },
          {
            name: "明光市",
            url: ""
          }
        ]
      },
      {
        name: "阜阳市",
        url: "https://www.fy.gov.cn/",
        children: [
          {
            name: "颍州区",
            url: ""
          },
          {
            name: "颍东区",
            url: ""
          },
          {
            name: "颍泉区",
            url: "https://www.yingquan.gov.cn/"
          },
          {
            name: "临泉县",
            url: ""
          },
          {
            name: "太和县",
            url: ""
          },
          {
            name: "阜南县",
            url: "https://www.funan.gov.cn/"
          },
          {
            name: "颍上县",
            url: ""
          },
          {
            name: "界首市",
            url: ""
          }
        ]
      },
      {
        name: "宿州市",
        url: "https://www.ahsz.gov.cn/",
        children: [
          {
            name: "埇桥区",
            url: ""
          },
          {
            name: "砀山县",
            url: ""
          },
          {
            name: "萧县",
            url: ""
          },
          {
            name: "灵璧县",
            url: ""
          },
          {
            name: "泗县",
            url: ""
          }
        ]
      },
      {
        name: "六安市",
        url: "https://www.luan.gov.cn/",
        children: [
          {
            name: "金安区",
            url: ""
          },
          {
            name: "裕安区",
            url: ""
          },
          {
            name: "叶集区",
            url: "https://www.luan.gov.cn/"
          },
          {
            name: "霍邱县",
            url: ""
          },
          {
            name: "舒城县",
            url: ""
          },
          {
            name: "金寨县",
            url: ""
          },
          {
            name: "霍山县",
            url: ""
          }
        ]
      },
      {
        name: "亳州市",
        url: "https://www.bozhou.gov.cn/",
        children: [
          {
            name: "谯城区",
            url: ""
          },
          {
            name: "涡阳县",
            url: ""
          },
          {
            name: "蒙城县",
            url: ""
          },
          {
            name: "利辛县",
            url: ""
          }
        ]
      },
      {
        name: "池州市",
        url: "https://www.chizhou.gov.cn/",
        children: [
          {
            name: "贵池区",
            url: "http://www.chizhou.gov.cn/"
          },
          {
            name: "东至县",
            url: "http://www.dongzhi.gov.cn/"
          },
          {
            name: "石台县",
            url: "http://www.ahshitai.gov.cn/"
          },
          {
            name: "青阳县",
            url: ""
          }
        ]
      },
      {
        name: "宣城市",
        url: "https://www.xuancheng.gov.cn/",
        children: [
          {
            name: "宣州区",
            url: ""
          },
          {
            name: "郎溪县",
            url: ""
          },
          {
            name: "泾县",
            url: ""
          },
          {
            name: "绩溪县",
            url: ""
          },
          {
            name: "旌德县",
            url: ""
          },
          {
            name: "宁国市",
            url: "http://www.ningguo.gov.cn/"
          },
          {
            name: "广德市",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "福建省",
    url: "https://www.fujian.gov.cn/",
    children: [
      {
        name: "福州市",
        url: "http://www.fuzhou.gov.cn/",
        children: [
          {
            name: "鼓楼区",
            url: ""
          },
          {
            name: "台江区",
            url: "http://www.taijiang.gov.cn/"
          },
          {
            name: "仓山区",
            url: "http://www.fzcangshan.gov.cn/"
          },
          {
            name: "马尾区",
            url: "http://www.mawei.gov.cn/"
          },
          {
            name: "晋安区",
            url: "http://www.fzja.gov.cn/"
          },
          {
            name: "长乐区",
            url: "http://www.fzcl.gov.cn/"
          },
          {
            name: "闽侯县",
            url: "https://www.minhou.gov.cn/"
          },
          {
            name: "连江县",
            url: "https://www.fzlj.gov.cn/"
          },
          {
            name: "罗源县",
            url: "https://www.luoyuan.gov.cn/"
          },
          {
            name: "闽清县",
            url: "https://www.minqing.gov.cn/"
          },
          {
            name: "永泰县",
            url: "https://www.yongtai.gov.cn/"
          },
          {
            name: "平潭县",
            url: "https://www.pingtan.gov.cn/"
          },
          {
            name: "福清市",
            url: "http://www.fuqing.gov.cn/"
          }
        ]
      },
      {
        name: "厦门市",
        url: "https://www.xm.gov.cn/",
        children: [
          {
            name: "思明区",
            url: ""
          },
          {
            name: "海沧区",
            url: ""
          },
          {
            name: "湖里区",
            url: ""
          },
          {
            name: "集美区",
            url: ""
          },
          {
            name: "同安区",
            url: ""
          },
          {
            name: "翔安区",
            url: ""
          }
        ]
      },
      {
        name: "莆田市",
        url: "https://www.putian.gov.cn/",
        children: [
          {
            name: "城厢区",
            url: ""
          },
          {
            name: "涵江区",
            url: ""
          },
          {
            name: "荔城区",
            url: ""
          },
          {
            name: "秀屿区",
            url: ""
          },
          {
            name: "仙游县",
            url: "http://www.xianyou.gov.cn/"
          }
        ]
      },
      {
        name: "三明市",
        url: "https://www.sm.gov.cn/",
        children: [
          {
            name: "三元区",
            url: "http://www.smsy.gov.cn/"
          },
          {
            name: "沙县区",
            url: "http://www.fjsx.gov.cn/"
          },
          {
            name: "明溪县",
            url: "http://www.fjmx.gov.cn/"
          },
          {
            name: "清流县",
            url: "http://www.fjql.gov.cn/"
          },
          {
            name: "宁化县",
            url: "http://www.fjnh.gov.cn/"
          },
          {
            name: "大田县",
            url: "http://www.datian.gov.cn/"
          },
          {
            name: "尤溪县",
            url: ""
          },
          {
            name: "将乐县",
            url: "http://www.jiangle.gov.cn/"
          },
          {
            name: "泰宁县",
            url: "http://www.fjtn.gov.cn/"
          },
          {
            name: "建宁县",
            url: "http://www.fjjn.gov.cn/"
          },
          {
            name: "永安市",
            url: "http://www.ya.gov.cn/"
          }
        ]
      },
      {
        name: "泉州市",
        url: "https://www.quanzhou.gov.cn/",
        children: [
          {
            name: "鲤城区",
            url: "http://www.qzlc.gov.cn/"
          },
          {
            name: "丰泽区",
            url: "https://www.qzfz.gov.cn/"
          },
          {
            name: "洛江区",
            url: "https://www.qzlj.gov.cn/"
          },
          {
            name: "泉港区",
            url: "https://www.qg.gov.cn/"
          },
          {
            name: "惠安县",
            url: "http://www.huian.gov.cn/"
          },
          {
            name: "安溪县",
            url: "http://www.fjax.gov.cn/"
          },
          {
            name: "永春县",
            url: "http://www.fjyc.gov.cn/"
          },
          {
            name: "德化县",
            url: "http://www.dehua.gov.cn/"
          },
          {
            name: "金门县",
            url: ""
          },
          {
            name: "石狮市",
            url: "https://www.shishi.gov.cn/"
          },
          {
            name: "晋江市",
            url: ""
          },
          {
            name: "南安市",
            url: ""
          }
        ]
      },
      {
        name: "漳州市",
        url: "https://www.zhangzhou.gov.cn/",
        children: [
          {
            name: "芗城区",
            url: ""
          },
          {
            name: "龙文区",
            url: ""
          },
          {
            name: "龙海区",
            url: ""
          },
          {
            name: "云霄县",
            url: ""
          },
          {
            name: "漳浦县",
            url: ""
          },
          {
            name: "诏安县",
            url: ""
          },
          {
            name: "长泰区",
            url: ""
          },
          {
            name: "东山县",
            url: ""
          },
          {
            name: "南靖县",
            url: ""
          },
          {
            name: "平和县",
            url: ""
          },
          {
            name: "华安县",
            url: ""
          }
        ]
      },
      {
        name: "南平市",
        url: "https://www.np.gov.cn/",
        children: [
          {
            name: "延平区",
            url: ""
          },
          {
            name: "建阳区",
            url: ""
          },
          {
            name: "顺昌县",
            url: ""
          },
          {
            name: "浦城县",
            url: ""
          },
          {
            name: "光泽县",
            url: ""
          },
          {
            name: "松溪县",
            url: ""
          },
          {
            name: "政和县",
            url: ""
          },
          {
            name: "邵武市",
            url: ""
          },
          {
            name: "武夷山市",
            url: ""
          },
          {
            name: "建瓯市",
            url: ""
          }
        ]
      },
      {
        name: "龙岩市",
        url: "https://www.longyan.gov.cn/",
        children: [
          {
            name: "新罗区",
            url: ""
          },
          {
            name: "永定区",
            url: "http://www.yongding.gov.cn/"
          },
          {
            name: "长汀县",
            url: "http://www.changting.gov.cn/"
          },
          {
            name: "上杭县",
            url: "http://www.shanghang.gov.cn/"
          },
          {
            name: "武平县",
            url: "http://www.wp.gov.cn/"
          },
          {
            name: "连城县",
            url: ""
          },
          {
            name: "漳平市",
            url: "http://www.zp.gov.cn/"
          }
        ]
      },
      {
        name: "宁德市",
        url: "https://www.ningde.gov.cn/",
        children: [
          {
            name: "蕉城区",
            url: "http://www.jiaocheng.gov.cn/"
          },
          {
            name: "霞浦县",
            url: "http://www.xiapu.gov.cn/"
          },
          {
            name: "古田县",
            url: "http://www.gutian.gov.cn/"
          },
          {
            name: "屏南县",
            url: "https://www.pingnan.gov.cn/"
          },
          {
            name: "寿宁县",
            url: "http://www.fjsn.gov.cn/"
          },
          {
            name: "周宁县",
            url: "http://www.zhouning.gov.cn/"
          },
          {
            name: "柘荣县",
            url: "http://www.zherong.gov.cn/"
          },
          {
            name: "福安市",
            url: "http://www.fjfa.gov.cn/"
          },
          {
            name: "福鼎市",
            url: "http://www.fuding.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "江西省",
    url: "https://www.jiangxi.gov.cn/",
    children: [
      {
        name: "南昌市",
        url: "http://www.nc.gov.cn/",
        children: [
          {
            name: "东湖区",
            url: "http://dhq.nc.gov.cn/"
          },
          {
            name: "西湖区",
            url: ""
          },
          {
            name: "青云谱区",
            url: "http://qyp.nc.gov.cn/"
          },
          {
            name: "青山湖区",
            url: ""
          },
          {
            name: "新建区",
            url: ""
          },
          {
            name: "红谷滩区",
            url: ""
          },
          {
            name: "南昌县",
            url: ""
          },
          {
            name: "安义县",
            url: ""
          },
          {
            name: "进贤县",
            url: "https://jxx.nc.gov.cn/"
          }
        ]
      },
      {
        name: "景德镇市",
        url: "https://www.jdz.gov.cn/",
        children: [
          {
            name: "昌江区",
            url: ""
          },
          {
            name: "珠山区",
            url: ""
          },
          {
            name: "浮梁县",
            url: ""
          },
          {
            name: "乐平市",
            url: ""
          }
        ]
      },
      {
        name: "萍乡市",
        url: "https://www.pingxiang.gov.cn/",
        children: [
          {
            name: "安源区",
            url: ""
          },
          {
            name: "湘东区",
            url: ""
          },
          {
            name: "莲花县",
            url: ""
          },
          {
            name: "上栗县",
            url: ""
          },
          {
            name: "芦溪县",
            url: ""
          }
        ]
      },
      {
        name: "九江市",
        url: "https://www.jiujiang.gov.cn/",
        children: [
          {
            name: "濂溪区",
            url: ""
          },
          {
            name: "浔阳区",
            url: ""
          },
          {
            name: "柴桑区",
            url: ""
          },
          {
            name: "武宁县",
            url: ""
          },
          {
            name: "修水县",
            url: ""
          },
          {
            name: "永修县",
            url: ""
          },
          {
            name: "德安县",
            url: ""
          },
          {
            name: "都昌县",
            url: ""
          },
          {
            name: "湖口县",
            url: ""
          },
          {
            name: "彭泽县",
            url: ""
          },
          {
            name: "瑞昌市",
            url: ""
          },
          {
            name: "共青城市",
            url: ""
          },
          {
            name: "庐山市",
            url: ""
          }
        ]
      },
      {
        name: "新余市",
        url: "https://www.xinyu.gov.cn/",
        children: [
          {
            name: "渝水区",
            url: "http://www.yushui.gov.cn/"
          },
          {
            name: "分宜县",
            url: "http://www.fenyi.gov.cn/"
          }
        ]
      },
      {
        name: "鹰潭市",
        url: "https://www.yingtan.gov.cn/",
        children: [
          {
            name: "月湖区",
            url: "http://www.yuehu.gov.cn/"
          },
          {
            name: "余江区",
            url: "http://www.yujiang.gov.cn/"
          },
          {
            name: "贵溪市",
            url: "http://www.guixi.gov.cn/"
          }
        ]
      },
      {
        name: "赣州市",
        url: "https://www.ganzhou.gov.cn/",
        children: [
          {
            name: "章贡区",
            url: "http://www.zgq.gov.cn/"
          },
          {
            name: "南康区",
            url: ""
          },
          {
            name: "赣县区",
            url: ""
          },
          {
            name: "信丰县",
            url: ""
          },
          {
            name: "大余县",
            url: "http://www.jxdy.gov.cn/"
          },
          {
            name: "上犹县",
            url: "http://www.shangyou.gov.cn/"
          },
          {
            name: "崇义县",
            url: "http://www.chongyi.gov.cn/"
          },
          {
            name: "安远县",
            url: "http://www.ay.gov.cn/"
          },
          {
            name: "定南县",
            url: ""
          },
          {
            name: "全南县",
            url: ""
          },
          {
            name: "宁都县",
            url: "http://www.ningdu.gov.cn/"
          },
          {
            name: "于都县",
            url: ""
          },
          {
            name: "兴国县",
            url: "http://www.xingguo.gov.cn/"
          },
          {
            name: "会昌县",
            url: "http://www.huichang.gov.cn/"
          },
          {
            name: "寻乌县",
            url: "http://www.xunwu.gov.cn/"
          },
          {
            name: "石城县",
            url: ""
          },
          {
            name: "瑞金市",
            url: ""
          },
          {
            name: "龙南市",
            url: "http://www.jxln.gov.cn/"
          }
        ]
      },
      {
        name: "吉安市",
        url: "https://www.ji-an.gov.cn/",
        children: [
          {
            name: "吉州区",
            url: ""
          },
          {
            name: "青原区",
            url: ""
          },
          {
            name: "吉安县",
            url: ""
          },
          {
            name: "吉水县",
            url: ""
          },
          {
            name: "峡江县",
            url: ""
          },
          {
            name: "新干县",
            url: ""
          },
          {
            name: "永丰县",
            url: ""
          },
          {
            name: "泰和县",
            url: ""
          },
          {
            name: "遂川县",
            url: ""
          },
          {
            name: "万安县",
            url: ""
          },
          {
            name: "安福县",
            url: ""
          },
          {
            name: "永新县",
            url: ""
          },
          {
            name: "井冈山市",
            url: ""
          }
        ]
      },
      {
        name: "宜春市",
        url: "https://www.yichun.gov.cn/",
        children: [
          {
            name: "袁州区",
            url: ""
          },
          {
            name: "奉新县",
            url: ""
          },
          {
            name: "万载县",
            url: ""
          },
          {
            name: "上高县",
            url: ""
          },
          {
            name: "宜丰县",
            url: ""
          },
          {
            name: "靖安县",
            url: ""
          },
          {
            name: "铜鼓县",
            url: ""
          },
          {
            name: "丰城市",
            url: ""
          },
          {
            name: "樟树市",
            url: ""
          },
          {
            name: "高安市",
            url: ""
          }
        ]
      },
      {
        name: "抚州市",
        url: "https://www.jxfz.gov.cn/",
        children: [
          {
            name: "临川区",
            url: ""
          },
          {
            name: "东乡区",
            url: ""
          },
          {
            name: "南城县",
            url: ""
          },
          {
            name: "黎川县",
            url: ""
          },
          {
            name: "南丰县",
            url: ""
          },
          {
            name: "崇仁县",
            url: ""
          },
          {
            name: "乐安县",
            url: ""
          },
          {
            name: "宜黄县",
            url: ""
          },
          {
            name: "金溪县",
            url: ""
          },
          {
            name: "资溪县",
            url: ""
          },
          {
            name: "广昌县",
            url: ""
          }
        ]
      },
      {
        name: "上饶市",
        url: "https://www.zgsr.gov.cn/",
        children: [
          {
            name: "信州区",
            url: ""
          },
          {
            name: "广丰区",
            url: ""
          },
          {
            name: "广信区",
            url: ""
          },
          {
            name: "玉山县",
            url: ""
          },
          {
            name: "铅山县",
            url: ""
          },
          {
            name: "横峰县",
            url: ""
          },
          {
            name: "弋阳县",
            url: ""
          },
          {
            name: "余干县",
            url: ""
          },
          {
            name: "鄱阳县",
            url: ""
          },
          {
            name: "万年县",
            url: ""
          },
          {
            name: "婺源县",
            url: ""
          },
          {
            name: "德兴市",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "山东省",
    url: "https://www.shandong.gov.cn/",
    children: [
      {
        name: "济南市",
        url: "http://jncz.jinan.gov.cn/",
        children: [
          {
            name: "历下区",
            url: ""
          },
          {
            name: "市中区",
            url: "https://jncc.jinan.gov.cn/"
          },
          {
            name: "槐荫区",
            url: ""
          },
          {
            name: "天桥区",
            url: ""
          },
          {
            name: "历城区",
            url: ""
          },
          {
            name: "长清区",
            url: ""
          },
          {
            name: "章丘区",
            url: ""
          },
          {
            name: "济阳区",
            url: ""
          },
          {
            name: "莱芜区",
            url: ""
          },
          {
            name: "钢城区",
            url: ""
          },
          {
            name: "平阴县",
            url: ""
          },
          {
            name: "商河县",
            url: ""
          }
        ]
      },
      {
        name: "青岛市",
        url: "http://www.qingdao.gov.cn/",
        children: [
          {
            name: "市南区",
            url: ""
          },
          {
            name: "市北区",
            url: ""
          },
          {
            name: "黄岛区",
            url: ""
          },
          {
            name: "崂山区",
            url: ""
          },
          {
            name: "李沧区",
            url: ""
          },
          {
            name: "城阳区",
            url: ""
          },
          {
            name: "即墨区",
            url: ""
          },
          {
            name: "胶州市",
            url: ""
          },
          {
            name: "平度市",
            url: ""
          },
          {
            name: "莱西市",
            url: ""
          }
        ]
      },
      {
        name: "淄博市",
        url: "https://www.zibo.gov.cn/",
        children: [
          {
            name: "淄川区",
            url: ""
          },
          {
            name: "张店区",
            url: "http://www.zhangdian.gov.cn/"
          },
          {
            name: "博山区",
            url: ""
          },
          {
            name: "临淄区",
            url: "http://www.linzi.gov.cn/"
          },
          {
            name: "周村区",
            url: "http://www.zhoucun.gov.cn/"
          },
          {
            name: "桓台县",
            url: "http://www.huantai.gov.cn/"
          },
          {
            name: "高青县",
            url: "http://www.gaoqing.gov.cn/"
          },
          {
            name: "沂源县",
            url: "http://www.yiyuan.gov.cn/"
          }
        ]
      },
      {
        name: "枣庄市",
        url: "https://www.zaozhuang.gov.cn/",
        children: [
          {
            name: "市中区",
            url: "http://www.neijiangshizhongqu.gov.cn/"
          },
          {
            name: "薛城区",
            url: ""
          },
          {
            name: "峄城区",
            url: ""
          },
          {
            name: "台儿庄区",
            url: ""
          },
          {
            name: "山亭区",
            url: ""
          },
          {
            name: "滕州市",
            url: ""
          }
        ]
      },
      {
        name: "东营市",
        url: "http://www.dongying.gov.cn/",
        children: [
          {
            name: "东营区",
            url: ""
          },
          {
            name: "河口区",
            url: ""
          },
          {
            name: "垦利区",
            url: ""
          },
          {
            name: "利津县",
            url: ""
          },
          {
            name: "广饶县",
            url: ""
          }
        ]
      },
      {
        name: "烟台市",
        url: "https://www.yantai.gov.cn/",
        children: [
          {
            name: "芝罘区",
            url: ""
          },
          {
            name: "福山区",
            url: ""
          },
          {
            name: "牟平区",
            url: ""
          },
          {
            name: "莱山区",
            url: ""
          },
          {
            name: "蓬莱区",
            url: ""
          },
          {
            name: "龙口市",
            url: ""
          },
          {
            name: "莱阳市",
            url: ""
          },
          {
            name: "莱州市",
            url: ""
          },
          {
            name: "招远市",
            url: ""
          },
          {
            name: "栖霞市",
            url: ""
          },
          {
            name: "海阳市",
            url: ""
          }
        ]
      },
      {
        name: "潍坊市",
        url: "https://www.weifang.gov.cn/",
        children: [
          {
            name: "潍城区",
            url: ""
          },
          {
            name: "寒亭区",
            url: ""
          },
          {
            name: "坊子区",
            url: ""
          },
          {
            name: "奎文区",
            url: ""
          },
          {
            name: "临朐县",
            url: ""
          },
          {
            name: "昌乐县",
            url: ""
          },
          {
            name: "青州市",
            url: ""
          },
          {
            name: "诸城市",
            url: ""
          },
          {
            name: "寿光市",
            url: ""
          },
          {
            name: "安丘市",
            url: ""
          },
          {
            name: "高密市",
            url: ""
          },
          {
            name: "昌邑市",
            url: ""
          }
        ]
      },
      {
        name: "济宁市",
        url: "https://www.jining.gov.cn/",
        children: [
          {
            name: "任城区",
            url: "http://jirczwfw.sd.gov.cn/"
          },
          {
            name: "兖州区",
            url: ""
          },
          {
            name: "微山县",
            url: "http://jiwszwfw.sd.gov.cn/"
          },
          {
            name: "鱼台县",
            url: "http://jiytzwfw.sd.gov.cn/"
          },
          {
            name: "金乡县",
            url: ""
          },
          {
            name: "嘉祥县",
            url: ""
          },
          {
            name: "汶上县",
            url: ""
          },
          {
            name: "泗水县",
            url: ""
          },
          {
            name: "梁山县",
            url: ""
          },
          {
            name: "曲阜市",
            url: ""
          },
          {
            name: "邹城市",
            url: ""
          }
        ]
      },
      {
        name: "泰安市",
        url: "https://www.taian.gov.cn/",
        children: [
          {
            name: "泰山区",
            url: ""
          },
          {
            name: "岱岳区",
            url: ""
          },
          {
            name: "宁阳县",
            url: ""
          },
          {
            name: "东平县",
            url: ""
          },
          {
            name: "新泰市",
            url: ""
          },
          {
            name: "肥城市",
            url: ""
          }
        ]
      },
      {
        name: "威海市",
        url: "https://www.weihai.gov.cn/",
        children: [
          {
            name: "环翠区",
            url: "http://www.huancui.gov.cn/"
          },
          {
            name: "文登区",
            url: ""
          },
          {
            name: "荣成市",
            url: "http://www.rongcheng.gov.cn/"
          },
          {
            name: "乳山市",
            url: "http://www.rushan.gov.cn/"
          }
        ]
      },
      {
        name: "日照市",
        url: "https://www.rizhao.gov.cn/",
        children: [
          {
            name: "东港区",
            url: ""
          },
          {
            name: "岚山区",
            url: ""
          },
          {
            name: "五莲县",
            url: ""
          },
          {
            name: "莒县",
            url: ""
          }
        ]
      },
      {
        name: "临沂市",
        url: "https://www.linyi.gov.cn/",
        children: [
          {
            name: "兰山区",
            url: ""
          },
          {
            name: "罗庄区",
            url: "http://www.luozhuang.gov.cn/"
          },
          {
            name: "河东区",
            url: ""
          },
          {
            name: "沂南县",
            url: "http://www.yinan.gov.cn/"
          },
          {
            name: "郯城县",
            url: "http://www.tancheng.gov.cn/"
          },
          {
            name: "沂水县",
            url: "http://www.yishui.gov.cn/"
          },
          {
            name: "兰陵县",
            url: "http://www.lanling.gov.cn/"
          },
          {
            name: "费县",
            url: ""
          },
          {
            name: "平邑县",
            url: "http://www.pingyi.gov.cn/"
          },
          {
            name: "莒南县",
            url: "http://www.junan.gov.cn/"
          },
          {
            name: "蒙阴县",
            url: "http://www.mengyin.gov.cn/"
          },
          {
            name: "临沭县",
            url: "http://www.linshu.gov.cn/"
          }
        ]
      },
      {
        name: "德州市",
        url: "https://www.dezhou.gov.cn/",
        children: [
          {
            name: "德城区",
            url: ""
          },
          {
            name: "陵城区",
            url: ""
          },
          {
            name: "宁津县",
            url: ""
          },
          {
            name: "庆云县",
            url: ""
          },
          {
            name: "临邑县",
            url: ""
          },
          {
            name: "齐河县",
            url: ""
          },
          {
            name: "平原县",
            url: ""
          },
          {
            name: "夏津县",
            url: ""
          },
          {
            name: "武城县",
            url: ""
          },
          {
            name: "禹城市",
            url: ""
          },
          {
            name: "乐陵市",
            url: ""
          }
        ]
      },
      {
        name: "聊城市",
        url: "https://www.liaocheng.gov.cn/",
        children: [
          {
            name: "东昌府区",
            url: ""
          },
          {
            name: "茌平区",
            url: "http://www.chiping.gov.cn/"
          },
          {
            name: "阳谷县",
            url: "http://www.yanggu.gov.cn/"
          },
          {
            name: "莘县",
            url: ""
          },
          {
            name: "东阿县",
            url: ""
          },
          {
            name: "冠县",
            url: ""
          },
          {
            name: "高唐县",
            url: "http://www.gaotang.gov.cn/"
          },
          {
            name: "临清市",
            url: "http://www.liaocheng.gov.cn/"
          }
        ]
      },
      {
        name: "滨州市",
        url: "http://www.binzhou.gov.cn/",
        children: [
          {
            name: "滨城区",
            url: ""
          },
          {
            name: "沾化区",
            url: ""
          },
          {
            name: "惠民县",
            url: ""
          },
          {
            name: "阳信县",
            url: ""
          },
          {
            name: "无棣县",
            url: ""
          },
          {
            name: "博兴县",
            url: ""
          },
          {
            name: "邹平市",
            url: ""
          }
        ]
      },
      {
        name: "菏泽市",
        url: "http://www.heze.gov.cn/",
        children: [
          {
            name: "牡丹区",
            url: ""
          },
          {
            name: "定陶区",
            url: ""
          },
          {
            name: "曹县",
            url: ""
          },
          {
            name: "单县",
            url: ""
          },
          {
            name: "成武县",
            url: ""
          },
          {
            name: "巨野县",
            url: ""
          },
          {
            name: "郓城县",
            url: ""
          },
          {
            name: "鄄城县",
            url: ""
          },
          {
            name: "东明县",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "河南省",
    url: "https://www.henan.gov.cn/",
    children: [
      {
        name: "郑州市",
        url: "http://public.zhengzhou.gov.cn/",
        children: [
          {
            name: "中原区",
            url: ""
          },
          {
            name: "二七区",
            url: ""
          },
          {
            name: "管城回族区",
            url: ""
          },
          {
            name: "金水区",
            url: ""
          },
          {
            name: "上街区",
            url: ""
          },
          {
            name: "惠济区",
            url: ""
          },
          {
            name: "中牟县",
            url: ""
          },
          {
            name: "巩义市",
            url: ""
          },
          {
            name: "荥阳市",
            url: ""
          },
          {
            name: "新密市",
            url: ""
          },
          {
            name: "新郑市",
            url: "https://www.zhengzhou.gov.cn/"
          },
          {
            name: "登封市",
            url: ""
          }
        ]
      },
      {
        name: "开封市",
        url: "https://www.kaifeng.gov.cn/",
        children: [
          {
            name: "龙亭区",
            url: ""
          },
          {
            name: "顺河回族区",
            url: ""
          },
          {
            name: "鼓楼区",
            url: ""
          },
          {
            name: "禹王台区",
            url: ""
          },
          {
            name: "祥符区",
            url: ""
          },
          {
            name: "杞县",
            url: ""
          },
          {
            name: "通许县",
            url: ""
          },
          {
            name: "尉氏县",
            url: ""
          },
          {
            name: "兰考县",
            url: ""
          }
        ]
      },
      {
        name: "洛阳市",
        url: "https://www.ly.gov.cn/",
        children: [
          {
            name: "老城区",
            url: ""
          },
          {
            name: "西工区",
            url: "http://www.xigong.gov.cn/"
          },
          {
            name: "瀍河回族区",
            url: "https://www.chanhe.gov.cn/"
          },
          {
            name: "涧西区",
            url: "http://www.jxq.gov.cn/"
          },
          {
            name: "洛龙区",
            url: "https://www.luolong.gov.cn/"
          },
          {
            name: "孟津区",
            url: "https://www.mengjin.gov.cn/"
          },
          {
            name: "新安县",
            url: ""
          },
          {
            name: "栾川县",
            url: ""
          },
          {
            name: "嵩县",
            url: ""
          },
          {
            name: "汝阳县",
            url: ""
          },
          {
            name: "宜阳县",
            url: ""
          },
          {
            name: "洛宁县",
            url: "http://www.luoning.gov.cn/"
          },
          {
            name: "伊川县",
            url: ""
          },
          {
            name: "偃师区",
            url: "https://www.yanshi.gov.cn/"
          }
        ]
      },
      {
        name: "平顶山市",
        url: "https://www.pds.gov.cn/",
        children: [
          {
            name: "新华区",
            url: "https://www.xinhuaqu.gov.cn/"
          },
          {
            name: "卫东区",
            url: "https://www.weidong.gov.cn/"
          },
          {
            name: "石龙区",
            url: "https://www.shilongqu.gov.cn/"
          },
          {
            name: "湛河区",
            url: "https://www.zhq.gov.cn/"
          },
          {
            name: "宝丰县",
            url: ""
          },
          {
            name: "叶县",
            url: ""
          },
          {
            name: "鲁山县",
            url: "https://www.hnls.gov.cn/"
          },
          {
            name: "郏县",
            url: ""
          },
          {
            name: "舞钢市",
            url: ""
          },
          {
            name: "汝州市",
            url: "https://www.ruzhou.gov.cn/"
          }
        ]
      },
      {
        name: "安阳市",
        url: "https://www.anyang.gov.cn/",
        children: [
          {
            name: "文峰区",
            url: ""
          },
          {
            name: "北关区",
            url: ""
          },
          {
            name: "殷都区",
            url: ""
          },
          {
            name: "龙安区",
            url: ""
          },
          {
            name: "安阳县",
            url: ""
          },
          {
            name: "汤阴县",
            url: ""
          },
          {
            name: "滑县",
            url: ""
          },
          {
            name: "内黄县",
            url: ""
          },
          {
            name: "林州市",
            url: ""
          }
        ]
      },
      {
        name: "鹤壁市",
        url: "https://www.hebi.gov.cn/",
        children: [
          {
            name: "鹤山区",
            url: ""
          },
          {
            name: "山城区",
            url: ""
          },
          {
            name: "淇滨区",
            url: "http://www.hbqbq.gov.cn/"
          },
          {
            name: "浚县",
            url: ""
          },
          {
            name: "淇县",
            url: "http://www.qxzf.gov.cn/"
          }
        ]
      },
      {
        name: "新乡市",
        url: "https://www.xinxiang.gov.cn/",
        children: [
          {
            name: "红旗区",
            url: ""
          },
          {
            name: "卫滨区",
            url: ""
          },
          {
            name: "凤泉区",
            url: ""
          },
          {
            name: "牧野区",
            url: ""
          },
          {
            name: "新乡县",
            url: "http://www.xinxiang.gov.cn/"
          },
          {
            name: "获嘉县",
            url: ""
          },
          {
            name: "原阳县",
            url: ""
          },
          {
            name: "延津县",
            url: ""
          },
          {
            name: "封丘县",
            url: ""
          },
          {
            name: "辉县市",
            url: ""
          },
          {
            name: "卫辉市",
            url: ""
          },
          {
            name: "长垣市",
            url: ""
          }
        ]
      },
      {
        name: "焦作市",
        url: "https://www.jiaozuo.gov.cn/",
        children: [
          {
            name: "解放区",
            url: "https://www.jfq.gov.cn/"
          },
          {
            name: "中站区",
            url: "http://www.jzzzq.gov.cn/"
          },
          {
            name: "马村区",
            url: "http://www.jzmcqzf.gov.cn/"
          },
          {
            name: "山阳区",
            url: "http://www.syq.gov.cn/"
          },
          {
            name: "修武县",
            url: ""
          },
          {
            name: "博爱县",
            url: "http://www.boai.gov.cn/"
          },
          {
            name: "武陟县",
            url: ""
          },
          {
            name: "温县",
            url: "http://www.wenxian.gov.cn/"
          },
          {
            name: "沁阳市",
            url: ""
          },
          {
            name: "孟州市",
            url: ""
          }
        ]
      },
      {
        name: "濮阳市",
        url: "https://caizheng.puyang.gov.cn/",
        children: [
          {
            name: "华龙区",
            url: "http://www.pyhualong.gov.cn/"
          },
          {
            name: "清丰县",
            url: "http://www.qingfeng.gov.cn/"
          },
          {
            name: "南乐县",
            url: "http://www.nanle.gov.cn/"
          },
          {
            name: "范县",
            url: "https://www.puyang.gov.cn/"
          },
          {
            name: "台前县",
            url: "http://www.taiqian.gov.cn/"
          },
          {
            name: "濮阳县",
            url: "http://www.puyangxian.gov.cn/"
          }
        ]
      },
      {
        name: "许昌市",
        url: "https://www.xuchang.gov.cn/",
        children: [
          {
            name: "魏都区",
            url: ""
          },
          {
            name: "建安区",
            url: ""
          },
          {
            name: "鄢陵县",
            url: ""
          },
          {
            name: "襄城县",
            url: ""
          },
          {
            name: "禹州市",
            url: ""
          },
          {
            name: "长葛市",
            url: ""
          }
        ]
      },
      {
        name: "漯河市",
        url: "https://www.luohe.gov.cn/",
        children: [
          {
            name: "源汇区",
            url: ""
          },
          {
            name: "郾城区",
            url: ""
          },
          {
            name: "召陵区",
            url: ""
          },
          {
            name: "舞阳县",
            url: ""
          },
          {
            name: "临颍县",
            url: ""
          }
        ]
      },
      {
        name: "三门峡市",
        url: "https://www.smx.gov.cn/",
        children: [
          {
            name: "湖滨区",
            url: ""
          },
          {
            name: "陕州区",
            url: ""
          },
          {
            name: "渑池县",
            url: ""
          },
          {
            name: "卢氏县",
            url: ""
          },
          {
            name: "义马市",
            url: ""
          },
          {
            name: "灵宝市",
            url: ""
          }
        ]
      },
      {
        name: "南阳市",
        url: "https://www.nanyang.gov.cn/",
        children: [
          {
            name: "宛城区",
            url: ""
          },
          {
            name: "卧龙区",
            url: ""
          },
          {
            name: "南召县",
            url: ""
          },
          {
            name: "方城县",
            url: ""
          },
          {
            name: "西峡县",
            url: ""
          },
          {
            name: "镇平县",
            url: ""
          },
          {
            name: "内乡县",
            url: ""
          },
          {
            name: "淅川县",
            url: ""
          },
          {
            name: "社旗县",
            url: ""
          },
          {
            name: "唐河县",
            url: ""
          },
          {
            name: "新野县",
            url: ""
          },
          {
            name: "桐柏县",
            url: ""
          },
          {
            name: "邓州市",
            url: ""
          }
        ]
      },
      {
        name: "商丘市",
        url: "https://www.shangqiu.gov.cn/",
        children: [
          {
            name: "梁园区",
            url: "https://www.liangyuan.gov.cn/"
          },
          {
            name: "睢阳区",
            url: "https://www.suiyangqu.gov.cn/"
          },
          {
            name: "民权县",
            url: "http://www.minquan.gov.cn/"
          },
          {
            name: "睢县",
            url: "http://www.suixian.gov.cn/"
          },
          {
            name: "宁陵县",
            url: "https://www.ningling.gov.cn/"
          },
          {
            name: "柘城县",
            url: "https://www.zhecheng.gov.cn/"
          },
          {
            name: "虞城县",
            url: "https://www.yuchengxian.gov.cn/"
          },
          {
            name: "夏邑县",
            url: "https://www.xiayi.gov.cn/"
          },
          {
            name: "永城市",
            url: "https://www.ycs.gov.cn/"
          }
        ]
      },
      {
        name: "信阳市",
        url: "https://www.xinyang.gov.cn/",
        children: [
          {
            name: "浉河区",
            url: "http://www.shihe.gov.cn/"
          },
          {
            name: "平桥区",
            url: "http://www.xypingqiao.gov.cn/"
          },
          {
            name: "罗山县",
            url: "http://www.luoshan.gov.cn/"
          },
          {
            name: "光山县",
            url: "http://www.guangshan.gov.cn/"
          },
          {
            name: "新县",
            url: "http://www.hnxx.gov.cn/"
          },
          {
            name: "商城县",
            url: "http://www.hnsc.gov.cn/"
          },
          {
            name: "固始县",
            url: "http://www.gushi.gov.cn/"
          },
          {
            name: "潢川县",
            url: "http://www.huangchuan.gov.cn/"
          },
          {
            name: "淮滨县",
            url: "http://www.huaibin.gov.cn/"
          },
          {
            name: "息县",
            url: "http://www.xixian.gov.cn/"
          }
        ]
      },
      {
        name: "周口市",
        url: "https://www.zhoukou.gov.cn/",
        children: [
          {
            name: "川汇区",
            url: "https://www.chuanhui.gov.cn/"
          },
          {
            name: "淮阳区",
            url: "https://www.hyzww.gov.cn/"
          },
          {
            name: "扶沟县",
            url: "http://www.fugou.gov.cn/"
          },
          {
            name: "西华县",
            url: "http://www.xihua.gov.cn/"
          },
          {
            name: "商水县",
            url: "http://www.shangshui.gov.cn/"
          },
          {
            name: "沈丘县",
            url: "https://www.shenqiu.gov.cn/"
          },
          {
            name: "郸城县",
            url: "http://www.dancheng.gov.cn/"
          },
          {
            name: "太康县",
            url: "http://www.taikang.gov.cn/"
          },
          {
            name: "鹿邑县",
            url: "http://www.zhoukou.gov.cn/"
          },
          {
            name: "项城市",
            url: "http://www.xiangcheng.gov.cn/"
          }
        ]
      },
      {
        name: "驻马店市",
        url: "https://www.zhumadian.gov.cn/",
        children: [
          {
            name: "驿城区",
            url: "http://www.zmdycq.gov.cn/"
          },
          {
            name: "西平县",
            url: "http://www.xiping.gov.cn/"
          },
          {
            name: "上蔡县",
            url: "http://www.shangcai.gov.cn/"
          },
          {
            name: "平舆县",
            url: "http://www.pingyu.gov.cn/"
          },
          {
            name: "正阳县",
            url: "http://www.zhengyang.gov.cn/"
          },
          {
            name: "确山县",
            url: "http://www.queshan.gov.cn/"
          },
          {
            name: "泌阳县",
            url: "http://www.biyang.gov.cn/"
          },
          {
            name: "汝南县",
            url: "http://www.runan.gov.cn/"
          },
          {
            name: "遂平县",
            url: "http://www.suiping.gov.cn/"
          },
          {
            name: "新蔡县",
            url: "https://www.xincai.gov.cn/"
          }
        ]
      },
      {
        name: "济源示范区",
        url: "https://www.jiyuan.gov.cn/"
      }
    ]
  },
  {
    name: "湖北省",
    url: "https://www.hubei.gov.cn/",
    children: [
      {
        name: "武汉市",
        url: "https://www.wuhan.gov.cn/",
        children: [
          {
            name: "江岸区",
            url: "https://www.jiangan.gov.cn/"
          },
          {
            name: "江汉区",
            url: "https://www.jianghan.gov.cn/"
          },
          {
            name: "硚口区",
            url: "https://www.qiaokou.gov.cn/"
          },
          {
            name: "汉阳区",
            url: "https://www.hanyang.gov.cn/"
          },
          {
            name: "武昌区",
            url: "https://www.wuchang.gov.cn/"
          },
          {
            name: "青山区",
            url: ""
          },
          {
            name: "洪山区",
            url: "https://www.wuhan.gov.cn/"
          },
          {
            name: "东西湖区",
            url: ""
          },
          {
            name: "汉南区",
            url: ""
          },
          {
            name: "蔡甸区",
            url: "https://www.caidian.gov.cn/"
          },
          {
            name: "江夏区",
            url: "https://www.jiangxia.gov.cn/"
          },
          {
            name: "黄陂区",
            url: "https://www.huangpi.gov.cn/"
          },
          {
            name: "新洲区",
            url: "https://www.whxinzhou.gov.cn/"
          }
        ]
      },
      {
        name: "黄石市",
        url: "https://www.huangshi.gov.cn/",
        children: [
          {
            name: "黄石港区",
            url: ""
          },
          {
            name: "西塞山区",
            url: ""
          },
          {
            name: "下陆区",
            url: ""
          },
          {
            name: "铁山区",
            url: ""
          },
          {
            name: "阳新县",
            url: ""
          },
          {
            name: "大冶市",
            url: "http://www.huangshi.gov.cn/"
          }
        ]
      },
      {
        name: "十堰市",
        url: "https://www.shiyan.gov.cn/",
        children: [
          {
            name: "茅箭区",
            url: "http://maojian.shiyan.gov.cn/"
          },
          {
            name: "张湾区",
            url: "http://www.zhangwan.gov.cn/"
          },
          {
            name: "郧阳区",
            url: "http://yunyang.shiyan.gov.cn/"
          },
          {
            name: "郧西县",
            url: ""
          },
          {
            name: "竹山县",
            url: ""
          },
          {
            name: "竹溪县",
            url: ""
          },
          {
            name: "房县",
            url: "http://www.fangxian.gov.cn/"
          },
          {
            name: "丹江口市",
            url: ""
          }
        ]
      },
      {
        name: "宜昌市",
        url: "http://www.yichang.gov.cn/",
        children: [
          {
            name: "西陵区",
            url: "http://www.ycxl.gov.cn/"
          },
          {
            name: "伍家岗区",
            url: "http://www.ycwjg.gov.cn/"
          },
          {
            name: "点军区",
            url: "http://www.dianjun.gov.cn/"
          },
          {
            name: "猇亭区",
            url: ""
          },
          {
            name: "夷陵区",
            url: "http://www.yiling.gov.cn/"
          },
          {
            name: "远安县",
            url: "http://www.yuanan.gov.cn/"
          },
          {
            name: "兴山县",
            url: "http://www.xingshan.gov.cn/"
          },
          {
            name: "秭归县",
            url: "http://www.hbzg.gov.cn/"
          },
          {
            name: "长阳土家族自治县",
            url: "http://www.changyang.gov.cn/"
          },
          {
            name: "五峰土家族自治县",
            url: "http://www.hbwf.gov.cn/"
          },
          {
            name: "宜都市",
            url: "http://www.yidu.gov.cn/"
          },
          {
            name: "当阳市",
            url: "http://www.dangyang.gov.cn/"
          },
          {
            name: "枝江市",
            url: ""
          }
        ]
      },
      {
        name: "襄阳市",
        url: "https://www.xiangyang.gov.cn/",
        children: [
          {
            name: "襄城区",
            url: ""
          },
          {
            name: "樊城区",
            url: ""
          },
          {
            name: "襄州区",
            url: ""
          },
          {
            name: "南漳县",
            url: ""
          },
          {
            name: "谷城县",
            url: ""
          },
          {
            name: "保康县",
            url: ""
          },
          {
            name: "老河口市",
            url: ""
          },
          {
            name: "枣阳市",
            url: ""
          },
          {
            name: "宜城市",
            url: ""
          }
        ]
      },
      {
        name: "鄂州市",
        url: "https://www.ezhou.gov.cn/",
        children: [
          {
            name: "梁子湖区",
            url: ""
          },
          {
            name: "华容区",
            url: ""
          },
          {
            name: "鄂城区",
            url: ""
          }
        ]
      },
      {
        name: "荆门市",
        url: "https://www.jingmen.gov.cn/",
        children: [
          {
            name: "东宝区",
            url: ""
          },
          {
            name: "掇刀区",
            url: ""
          },
          {
            name: "沙洋县",
            url: ""
          },
          {
            name: "钟祥市",
            url: ""
          },
          {
            name: "京山市",
            url: "http://www.jingmen.gov.cn/"
          }
        ]
      },
      {
        name: "孝感市",
        url: "https://www.xiaogan.gov.cn/",
        children: [
          {
            name: "孝南区",
            url: "https://www.xiaogan.gov.cn/"
          },
          {
            name: "孝昌县",
            url: "https://www.xiaogan.gov.cn/"
          },
          {
            name: "大悟县",
            url: "http://www.hbdawu.gov.cn/"
          },
          {
            name: "云梦县",
            url: "http://www.yunmeng.gov.cn/"
          },
          {
            name: "应城市",
            url: "http://www.yingcheng.gov.cn/"
          },
          {
            name: "安陆市",
            url: "https://www.xiaogan.gov.cn/"
          },
          {
            name: "汉川市",
            url: "http://www.hanchuan.gov.cn/"
          }
        ]
      },
      {
        name: "荆州市",
        url: "https://www.jingzhou.gov.cn/",
        children: [
          {
            name: "沙市区",
            url: ""
          },
          {
            name: "荆州区",
            url: "http://www.jingzhouqu.gov.cn/"
          },
          {
            name: "公安县",
            url: "http://www.gongan.gov.cn/"
          },
          {
            name: "江陵县",
            url: "http://www.jiangling.gov.cn/"
          },
          {
            name: "松滋市",
            url: "http://www.hbsz.gov.cn/"
          },
          {
            name: "石首市",
            url: ""
          },
          {
            name: "洪湖市",
            url: ""
          },
          {
            name: "监利市",
            url: ""
          }
        ]
      },
      {
        name: "黄冈市",
        url: "https://www.hg.gov.cn/",
        children: [
          {
            name: "黄州区",
            url: "http://www.huangzhou.gov.cn/"
          },
          {
            name: "团风县",
            url: "http://www.tfzf.gov.cn/"
          },
          {
            name: "红安县",
            url: "http://www.hazf.gov.cn/"
          },
          {
            name: "麻城市",
            url: "http://www.macheng.gov.cn/"
          },
          {
            name: "罗田县",
            url: "http://www.luotian.gov.cn/"
          },
          {
            name: "英山县",
            url: "http://www.chinays.gov.cn/"
          },
          {
            name: "浠水县",
            url: "http://www.xishui.gov.cn/"
          },
          {
            name: "蕲春县",
            url: "http://www.qichun.gov.cn/"
          },
          {
            name: "武穴市",
            url: "http://www.wuxue.gov.cn/"
          },
          {
            name: "黄梅县",
            url: "http://www.hm.gov.cn/"
          }
        ]
      },
      {
        name: "咸宁市",
        url: "https://www.xianning.gov.cn/",
        children: [
          {
            name: "咸安区",
            url: ""
          },
          {
            name: "嘉鱼县",
            url: ""
          },
          {
            name: "通城县",
            url: ""
          },
          {
            name: "崇阳县",
            url: ""
          },
          {
            name: "通山县",
            url: ""
          },
          {
            name: "赤壁市",
            url: ""
          }
        ]
      },
      {
        name: "随州市",
        url: "http://www.suizhou.gov.cn/",
        children: [
          {
            name: "曾都区",
            url: ""
          },
          {
            name: "随县",
            url: ""
          },
          {
            name: "广水市",
            url: "http://www.guangshui.gov.cn/"
          }
        ]
      },
      {
        name: "恩施土家族苗族自治州",
        url: "https://www.enshi.gov.cn/",
        children: [
          {
            name: "恩施市",
            url: "http://www.enshi.gov.cn/"
          },
          {
            name: "利川市",
            url: "http://www.lichuan.gov.cn/"
          },
          {
            name: "建始县",
            url: "http://www.hbjs.gov.cn/"
          },
          {
            name: "巴东县",
            url: "http://www.hbbd.gov.cn/"
          },
          {
            name: "宣恩县",
            url: "http://www.xe.gov.cn/"
          },
          {
            name: "咸丰县",
            url: ""
          },
          {
            name: "来凤县",
            url: ""
          },
          {
            name: "鹤峰县",
            url: "http://www.enshi.gov.cn/"
          }
        ]
      },
      {
        name: "仙桃市",
        url: "https://www.xt.gov.cn/"
      },
      {
        name: "潜江市",
        url: "https://www.hbqj.gov.cn/"
      },
      {
        name: "天门市",
        url: "https://www.tianmen.gov.cn/"
      },
      {
        name: "神农架林区",
        url: "https://www.snj.gov.cn/"
      }
    ]
  },
  {
    name: "湖南省",
    url: "https://www.hunan.gov.cn/",
    children: [
      {
        name: "长沙市",
        url: "http://www.changsha.gov.cn/",
        children: [
          {
            name: "芙蓉区",
            url: "http://www.furong.gov.cn/"
          },
          {
            name: "天心区",
            url: "http://www.tianxin.gov.cn/"
          },
          {
            name: "岳麓区",
            url: "http://www.yuelu.gov.cn/"
          },
          {
            name: "开福区",
            url: "http://www.kaifu.gov.cn/"
          },
          {
            name: "雨花区",
            url: "http://www.yuhua.gov.cn/"
          },
          {
            name: "望城区",
            url: "http://www.wangcheng.gov.cn/"
          },
          {
            name: "长沙县",
            url: "http://www.csx.gov.cn/"
          },
          {
            name: "浏阳市",
            url: "http://www.liuyang.gov.cn/"
          },
          {
            name: "宁乡市",
            url: "http://www.ningxiang.gov.cn/"
          }
        ]
      },
      {
        name: "株洲市",
        url: "https://www.zhuzhou.gov.cn/",
        children: [
          {
            name: "荷塘区",
            url: "http://www.zhhtq.gov.cn/"
          },
          {
            name: "芦淞区",
            url: "http://www.lusong.gov.cn/"
          },
          {
            name: "石峰区",
            url: "http://www.zhshfq.gov.cn/"
          },
          {
            name: "天元区",
            url: "http://www.tyq.gov.cn/"
          },
          {
            name: "渌口区",
            url: "http://www.lukou.gov.cn/"
          },
          {
            name: "醴陵市",
            url: "http://www.hnliling.gov.cn/"
          },
          {
            name: "攸县",
            url: "http://www.hnyou.gov.cn/"
          },
          {
            name: "茶陵县",
            url: "http://www.chaling.gov.cn/"
          },
          {
            name: "炎陵县",
            url: "http://www.yanling.gov.cn/"
          }
        ]
      },
      {
        name: "湘潭市",
        url: "https://www.xiangtan.gov.cn/",
        children: [
          {
            name: "雨湖区",
            url: "http://www.xtyh.gov.cn/"
          },
          {
            name: "岳塘区",
            url: "http://www.hnxtyt.gov.cn/"
          },
          {
            name: "湘潭县",
            url: "http://www.xtx.gov.cn/"
          },
          {
            name: "湘乡市",
            url: "http://www.xxs.gov.cn/"
          },
          {
            name: "韶山市",
            url: "https://www.shaoshan.gov.cn/"
          }
        ]
      },
      {
        name: "衡阳市",
        url: "http://www.hy.gov.cn/",
        children: [
          {
            name: "珠晖区",
            url: "https://www.hyzhq.gov.cn/"
          },
          {
            name: "雁峰区",
            url: "https://www.hyyfq.gov.cn/"
          },
          {
            name: "石鼓区",
            url: "https://www.hysgq.gov.cn/"
          },
          {
            name: "蒸湘区",
            url: "https://www.zhengxiang.gov.cn/"
          },
          {
            name: "南岳区",
            url: "https://www.nanyue.gov.cn/"
          },
          {
            name: "衡阳县",
            url: "http://www.hyx.gov.cn/"
          },
          {
            name: "衡南县",
            url: "http://www.hengnan.gov.cn/"
          },
          {
            name: "衡山县",
            url: "http://www.hengshan.gov.cn/"
          },
          {
            name: "衡东县",
            url: "http://www.hengdong.gov.cn/"
          },
          {
            name: "祁东县",
            url: "https://www.qdx.gov.cn/"
          },
          {
            name: "耒阳市",
            url: "http://www.leiyang.gov.cn/"
          },
          {
            name: "常宁市",
            url: "http://www.changning.gov.cn/"
          }
        ]
      },
      {
        name: "邵阳市",
        url: "https://www.shaoyang.gov.cn/",
        children: [
          {
            name: "双清区",
            url: "https://www.shuangqing.gov.cn/"
          },
          {
            name: "大祥区",
            url: "https://www.dxzc.gov.cn/"
          },
          {
            name: "北塔区",
            url: "https://www.beita.gov.cn/"
          },
          {
            name: "新邵县",
            url: "http://www.xinshao.gov.cn/"
          },
          {
            name: "邵阳县",
            url: "http://www.shaoyangxian.gov.cn/"
          },
          {
            name: "隆回县",
            url: "http://www.longhui.gov.cn/"
          },
          {
            name: "洞口县",
            url: "http://www.dongkou.gov.cn/"
          },
          {
            name: "绥宁县",
            url: "http://www.suining.gov.cn/"
          },
          {
            name: "新宁县",
            url: "http://www.xinning.gov.cn/"
          },
          {
            name: "城步苗族自治县",
            url: "http://www.chengbu.gov.cn/"
          },
          {
            name: "武冈市",
            url: "http://www.wugang.gov.cn/"
          },
          {
            name: "邵东市",
            url: "http://www.shaodong.gov.cn/"
          }
        ]
      },
      {
        name: "岳阳市",
        url: "https://www.yueyang.gov.cn/",
        children: [
          {
            name: "岳阳楼区",
            url: "https://www.yylq.gov.cn/"
          },
          {
            name: "云溪区",
            url: "https://www.yunxiqu.gov.cn/"
          },
          {
            name: "君山区",
            url: "https://www.junshan.gov.cn/"
          },
          {
            name: "岳阳县",
            url: "https://www.yyx.gov.cn/"
          },
          {
            name: "华容县",
            url: "https://www.huarong.gov.cn/"
          },
          {
            name: "湘阴县",
            url: "https://www.xiangyin.gov.cn/"
          },
          {
            name: "平江县",
            url: "https://www.pingjiang.gov.cn/"
          },
          {
            name: "汨罗市",
            url: "https://www.miluo.gov.cn/"
          },
          {
            name: "临湘市",
            url: "https://www.linxiang.gov.cn/"
          }
        ]
      },
      {
        name: "常德市",
        url: "https://www.changde.gov.cn/",
        children: [
          {
            name: "武陵区",
            url: "http://www.wuling.gov.cn/"
          },
          {
            name: "鼎城区",
            url: "https://www.dingcheng.gov.cn/"
          },
          {
            name: "安乡县",
            url: "http://www.anxiang.gov.cn/"
          },
          {
            name: "汉寿县",
            url: "http://www.hanshou.gov.cn/"
          },
          {
            name: "澧县",
            url: "http://www.lixian.gov.cn/"
          },
          {
            name: "临澧县",
            url: "http://www.linli.gov.cn/"
          },
          {
            name: "桃源县",
            url: "http://www.taoyuan.gov.cn/"
          },
          {
            name: "石门县",
            url: "http://www.shimen.gov.cn/"
          },
          {
            name: "津市市",
            url: "http://www.jinshishi.gov.cn/"
          }
        ]
      },
      {
        name: "张家界市",
        url: "https://www.zjj.gov.cn/",
        children: [
          {
            name: "永定区",
            url: "http://www.zjjyd.gov.cn/"
          },
          {
            name: "武陵源区",
            url: "http://www.wly.gov.cn/"
          },
          {
            name: "慈利县",
            url: "http://www.cili.gov.cn/"
          },
          {
            name: "桑植县",
            url: "http://www.sangzhi.gov.cn/"
          }
        ]
      },
      {
        name: "益阳市",
        url: "http://www.yy.gov.cn/",
        children: [
          {
            name: "资阳区",
            url: "http://www.hnziyang.gov.cn/"
          },
          {
            name: "赫山区",
            url: "http://www.hnhs.gov.cn/"
          },
          {
            name: "南县",
            url: "http://www.nanxian.gov.cn/"
          },
          {
            name: "桃江县",
            url: "http://www.taojiang.gov.cn/"
          },
          {
            name: "安化县",
            url: "http://www.anhua.gov.cn/"
          },
          {
            name: "沅江市",
            url: "http://www.yuanjiang.gov.cn/"
          }
        ]
      },
      {
        name: "郴州市",
        url: "https://www.czs.gov.cn/",
        children: [
          {
            name: "北湖区",
            url: "https://wap.beihu.gov.cn/"
          },
          {
            name: "苏仙区",
            url: ""
          },
          {
            name: "桂阳县",
            url: "https://www.guiyang.gov.cn/"
          },
          {
            name: "宜章县",
            url: "https://www.yizhang.gov.cn/"
          },
          {
            name: "永兴县",
            url: "https://www.yongxing.gov.cn/"
          },
          {
            name: "嘉禾县",
            url: "https://www.jiahe.gov.cn/"
          },
          {
            name: "临武县",
            url: "https://www.linwu.gov.cn/"
          },
          {
            name: "汝城县",
            url: "https://www.rucheng.gov.cn/"
          },
          {
            name: "桂东县",
            url: "https://www.hngd.gov.cn/"
          },
          {
            name: "安仁县",
            url: "https://www.anren.gov.cn/"
          },
          {
            name: "资兴市",
            url: "https://www.zixing.gov.cn/"
          }
        ]
      },
      {
        name: "永州市",
        url: "https://www.yzcity.gov.cn/",
        children: [
          {
            name: "零陵区",
            url: "http://www.cnll.gov.cn/"
          },
          {
            name: "冷水滩区",
            url: "http://www.lst.gov.cn/"
          },
          {
            name: "东安县",
            url: "http://www.hnda.gov.cn/"
          },
          {
            name: "双牌县",
            url: "http://www.shuangpai.gov.cn/"
          },
          {
            name: "道县",
            url: "http://www.daoxian.gov.cn/"
          },
          {
            name: "江永县",
            url: "http://www.jiangyong.gov.cn/"
          },
          {
            name: "宁远县",
            url: "http://www.nyx.gov.cn/"
          },
          {
            name: "蓝山县",
            url: "http://www.lanshan.gov.cn/"
          },
          {
            name: "新田县",
            url: "http://www.xintian.gov.cn/"
          },
          {
            name: "江华瑶族自治县",
            url: "http://www.jianghua.gov.cn/"
          },
          {
            name: "祁阳市",
            url: "http://www.qy.gov.cn/"
          }
        ]
      },
      {
        name: "怀化市",
        url: "http://www.huaihua.gov.cn/",
        children: [
          {
            name: "鹤城区",
            url: "https://www.hechengqu.gov.cn/"
          },
          {
            name: "中方县",
            url: "http://www.zhongfang.gov.cn/"
          },
          {
            name: "沅陵县",
            url: "https://www.yuanling.gov.cn/"
          },
          {
            name: "辰溪县",
            url: "https://www.chenxi.gov.cn/"
          },
          {
            name: "溆浦县",
            url: "https://www.xupu.gov.cn/"
          },
          {
            name: "会同县",
            url: "https://www.huitong.gov.cn/"
          },
          {
            name: "麻阳苗族自治县",
            url: "https://www.mayang.gov.cn/"
          },
          {
            name: "新晃侗族自治县",
            url: "https://www.xinhuang.gov.cn/"
          },
          {
            name: "芷江侗族自治县",
            url: "https://www.zhijiang.gov.cn/"
          },
          {
            name: "靖州苗族侗族自治县",
            url: "https://www.jzx.gov.cn/"
          },
          {
            name: "通道侗族自治县",
            url: "https://www.tongdao.gov.cn/"
          },
          {
            name: "洪江市",
            url: "https://www.hongjiang.gov.cn/"
          }
        ]
      },
      {
        name: "娄底市",
        url: "https://www.ld.gov.cn/",
        children: [
          {
            name: "娄星区",
            url: "https://www.louxing.gov.cn/"
          },
          {
            name: "双峰县",
            url: "https://www.hnsf.gov.cn/"
          },
          {
            name: "新化县",
            url: "https://www.xinhua.gov.cn/"
          },
          {
            name: "冷水江市",
            url: "http://www.lsj.gov.cn/"
          },
          {
            name: "涟源市",
            url: "https://www.lianyuan.gov.cn/"
          }
        ]
      },
      {
        name: "湘西土家族苗族自治州",
        url: "https://www.xxz.gov.cn/",
        children: [
          {
            name: "吉首市",
            url: "http://www.jishou.gov.cn/"
          },
          {
            name: "泸溪县",
            url: "http://www.lxx.gov.cn/"
          },
          {
            name: "凤凰县",
            url: "http://www.fhx.gov.cn/"
          },
          {
            name: "花垣县",
            url: "http://www.huayuan.gov.cn/"
          },
          {
            name: "保靖县",
            url: "http://www.baojing.gov.cn/"
          },
          {
            name: "古丈县",
            url: "http://www.guzhang.gov.cn/"
          },
          {
            name: "永顺县",
            url: "http://www.yongshun.gov.cn/"
          },
          {
            name: "龙山县",
            url: "http://www.longshan.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "广东省",
    url: "https://www.gd.gov.cn/",
    children: [
      {
        name: "广州市",
        url: "http://www.gz.gov.cn/",
        children: [
          {
            name: "荔湾区",
            url: ""
          },
          {
            name: "越秀区",
            url: "http://www.yuexiu.gov.cn/"
          },
          {
            name: "海珠区",
            url: "https://www.haizhu.gov.cn/"
          },
          {
            name: "天河区",
            url: "http://www.thnet.gov.cn/"
          },
          {
            name: "白云区",
            url: "http://www.by.gov.cn/"
          },
          {
            name: "黄埔区",
            url: "http://www.hp.gov.cn/"
          },
          {
            name: "花都区",
            url: "http://www.huadu.gov.cn/"
          },
          {
            name: "番禺区",
            url: ""
          },
          {
            name: "南沙区",
            url: "http://www.gzns.gov.cn/"
          },
          {
            name: "从化区",
            url: "http://www.conghua.gov.cn/"
          },
          {
            name: "增城区",
            url: "http://www.zc.gov.cn/"
          }
        ]
      },
      {
        name: "韶关市",
        url: "https://www.sg.gov.cn/",
        children: [
          {
            name: "武江区",
            url: ""
          },
          {
            name: "浈江区",
            url: ""
          },
          {
            name: "曲江区",
            url: ""
          },
          {
            name: "始兴县",
            url: ""
          },
          {
            name: "仁化县",
            url: ""
          },
          {
            name: "翁源县",
            url: ""
          },
          {
            name: "乳源瑶族自治县",
            url: ""
          },
          {
            name: "新丰县",
            url: ""
          },
          {
            name: "乐昌市",
            url: ""
          },
          {
            name: "南雄市",
            url: ""
          }
        ]
      },
      {
        name: "深圳市",
        url: "http://www.sz.gov.cn/",
        children: [
          {
            name: "罗湖区",
            url: ""
          },
          {
            name: "福田区",
            url: ""
          },
          {
            name: "南山区",
            url: ""
          },
          {
            name: "宝安区",
            url: ""
          },
          {
            name: "龙岗区",
            url: ""
          },
          {
            name: "盐田区",
            url: ""
          },
          {
            name: "龙华区",
            url: ""
          },
          {
            name: "坪山区",
            url: ""
          },
          {
            name: "光明区",
            url: ""
          }
        ]
      },
      {
        name: "珠海市",
        url: "http://www.zhuhai.gov.cn/",
        children: [
          {
            name: "香洲区",
            url: "http://www.zhxz.gov.cn/"
          },
          {
            name: "斗门区",
            url: ""
          },
          {
            name: "金湾区",
            url: "https://www.jinwan.gov.cn/"
          }
        ]
      },
      {
        name: "汕头市",
        url: "https://www.shantou.gov.cn/",
        children: [
          {
            name: "龙湖区",
            url: "https://www.gdlonghu.gov.cn/"
          },
          {
            name: "金平区",
            url: ""
          },
          {
            name: "濠江区",
            url: ""
          },
          {
            name: "潮阳区",
            url: ""
          },
          {
            name: "潮南区",
            url: "http://www.chaonan.gov.cn/"
          },
          {
            name: "澄海区",
            url: "http://www.chenghai.gov.cn/"
          },
          {
            name: "南澳县",
            url: ""
          }
        ]
      },
      {
        name: "佛山市",
        url: "http://www.foshan.gov.cn/",
        children: [
          {
            name: "禅城区",
            url: ""
          },
          {
            name: "南海区",
            url: ""
          },
          {
            name: "顺德区",
            url: ""
          },
          {
            name: "三水区",
            url: ""
          },
          {
            name: "高明区",
            url: ""
          }
        ]
      },
      {
        name: "江门市",
        url: "http://www.jiangmen.gov.cn/",
        children: [
          {
            name: "蓬江区",
            url: "http://www.pjq.gov.cn/"
          },
          {
            name: "江海区",
            url: "http://www.jianghai.gov.cn/"
          },
          {
            name: "新会区",
            url: "http://www.xinhui.gov.cn/"
          },
          {
            name: "台山市",
            url: "http://www.cnts.gov.cn/"
          },
          {
            name: "开平市",
            url: "http://www.kaiping.gov.cn/"
          },
          {
            name: "鹤山市",
            url: "http://www.heshan.gov.cn/"
          },
          {
            name: "恩平市",
            url: "http://www.enping.gov.cn/"
          }
        ]
      },
      {
        name: "湛江市",
        url: "https://www.zhanjiang.gov.cn/",
        children: [
          {
            name: "赤坎区",
            url: ""
          },
          {
            name: "霞山区",
            url: ""
          },
          {
            name: "坡头区",
            url: ""
          },
          {
            name: "麻章区",
            url: ""
          },
          {
            name: "遂溪县",
            url: ""
          },
          {
            name: "徐闻县",
            url: ""
          },
          {
            name: "廉江市",
            url: ""
          },
          {
            name: "雷州市",
            url: ""
          },
          {
            name: "吴川市",
            url: ""
          }
        ]
      },
      {
        name: "茂名市",
        url: "http://www.maoming.gov.cn/",
        children: [
          {
            name: "茂南区",
            url: "http://www.maonan.gov.cn/"
          },
          {
            name: "电白区",
            url: "http://www.dianbai.gov.cn/"
          },
          {
            name: "高州市",
            url: "http://www.gaozhou.gov.cn/"
          },
          {
            name: "化州市",
            url: "http://www.huazhou.gov.cn/"
          },
          {
            name: "信宜市",
            url: "http://www.xinyi.gov.cn/"
          }
        ]
      },
      {
        name: "肇庆市",
        url: "http://www.zhaoqing.gov.cn/",
        children: [
          {
            name: "端州区",
            url: ""
          },
          {
            name: "鼎湖区",
            url: ""
          },
          {
            name: "高要区",
            url: ""
          },
          {
            name: "广宁县",
            url: ""
          },
          {
            name: "怀集县",
            url: ""
          },
          {
            name: "封开县",
            url: ""
          },
          {
            name: "德庆县",
            url: ""
          },
          {
            name: "四会市",
            url: ""
          }
        ]
      },
      {
        name: "惠州市",
        url: "http://www.huizhou.gov.cn/",
        children: [
          {
            name: "惠城区",
            url: ""
          },
          {
            name: "惠阳区",
            url: ""
          },
          {
            name: "博罗县",
            url: ""
          },
          {
            name: "惠东县",
            url: ""
          },
          {
            name: "龙门县",
            url: ""
          }
        ]
      },
      {
        name: "梅州市",
        url: "https://www.meizhou.gov.cn/",
        children: [
          {
            name: "梅江区",
            url: ""
          },
          {
            name: "梅县区",
            url: ""
          },
          {
            name: "大埔县",
            url: ""
          },
          {
            name: "丰顺县",
            url: ""
          },
          {
            name: "五华县",
            url: ""
          },
          {
            name: "平远县",
            url: ""
          },
          {
            name: "蕉岭县",
            url: ""
          },
          {
            name: "兴宁市",
            url: ""
          }
        ]
      },
      {
        name: "汕尾市",
        url: "http://www.shanwei.gov.cn/",
        children: [
          {
            name: "城区",
            url: ""
          },
          {
            name: "海丰县",
            url: "http://www.gdhf.gov.cn/"
          },
          {
            name: "陆丰市",
            url: ""
          },
          {
            name: "陆河县",
            url: "http://www.luhe.gov.cn/"
          }
        ]
      },
      {
        name: "河源市",
        url: "http://www.heyuan.gov.cn/",
        children: [
          {
            name: "源城区",
            url: ""
          },
          {
            name: "紫金县",
            url: ""
          },
          {
            name: "龙川县",
            url: ""
          },
          {
            name: "连平县",
            url: ""
          },
          {
            name: "和平县",
            url: ""
          },
          {
            name: "东源县",
            url: ""
          }
        ]
      },
      {
        name: "阳江市",
        url: "http://www.yangjiang.gov.cn/",
        children: [
          {
            name: "江城区",
            url: ""
          },
          {
            name: "阳东区",
            url: ""
          },
          {
            name: "阳西县",
            url: ""
          },
          {
            name: "阳春市",
            url: ""
          }
        ]
      },
      {
        name: "清远市",
        url: "http://www.gdqy.gov.cn/",
        children: [
          {
            name: "清城区",
            url: ""
          },
          {
            name: "清新区",
            url: ""
          },
          {
            name: "佛冈县",
            url: ""
          },
          {
            name: "阳山县",
            url: ""
          },
          {
            name: "连山壮族瑶族自治县",
            url: ""
          },
          {
            name: "连南瑶族自治县",
            url: ""
          },
          {
            name: "英德市",
            url: ""
          },
          {
            name: "连州市",
            url: ""
          }
        ]
      },
      {
        name: "东莞市",
        url: "http://www.dg.gov.cn/"
      },
      {
        name: "中山市",
        url: "http://www.zs.gov.cn/"
      },
      {
        name: "潮州市",
        url: "http://www.chaozhou.gov.cn/",
        children: [
          {
            name: "湘桥区",
            url: "http://www.xiangqiao.gov.cn/"
          },
          {
            name: "潮安区",
            url: ""
          },
          {
            name: "饶平县",
            url: "http://www.raoping.gov.cn/"
          }
        ]
      },
      {
        name: "揭阳市",
        url: "http://www.jieyang.gov.cn/",
        children: [
          {
            name: "榕城区",
            url: ""
          },
          {
            name: "揭东区",
            url: ""
          },
          {
            name: "揭西县",
            url: "http://www.jiexi.gov.cn/"
          },
          {
            name: "惠来县",
            url: "http://www.huilai.gov.cn/"
          },
          {
            name: "普宁市",
            url: ""
          }
        ]
      },
      {
        name: "云浮市",
        url: "https://www.yunfu.gov.cn/",
        children: [
          {
            name: "云城区",
            url: "http://www.yfyunchengqu.gov.cn/"
          },
          {
            name: "云安区",
            url: "http://www.yunan.gov.cn/"
          },
          {
            name: "新兴县",
            url: ""
          },
          {
            name: "郁南县",
            url: ""
          },
          {
            name: "罗定市",
            url: "http://www.luoding.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "广西壮族自治区",
    url: "https://www.gxzf.gov.cn/",
    children: [
      {
        name: "南宁市",
        url: "https://nncz.nanning.gov.cn/",
        children: [
          {
            name: "兴宁区",
            url: "http://www.nnxn.gov.cn/"
          },
          {
            name: "青秀区",
            url: ""
          },
          {
            name: "江南区",
            url: ""
          },
          {
            name: "西乡塘区",
            url: ""
          },
          {
            name: "良庆区",
            url: "http://www.liangqing.gov.cn/"
          },
          {
            name: "邕宁区",
            url: ""
          },
          {
            name: "武鸣区",
            url: "http://www.wuming.gov.cn/"
          },
          {
            name: "隆安县",
            url: "http://www.lax.gov.cn/"
          },
          {
            name: "马山县",
            url: "http://www.nnms.gov.cn/"
          },
          {
            name: "上林县",
            url: "http://www.shanglin.gov.cn/"
          },
          {
            name: "宾阳县",
            url: ""
          },
          {
            name: "横州市",
            url: "http://www.gxhx.gov.cn/"
          }
        ]
      },
      {
        name: "柳州市",
        url: "http://lzscz.liuzhou.gov.cn/",
        children: [
          {
            name: "城中区",
            url: "http://www.czq.gov.cn/"
          },
          {
            name: "鱼峰区",
            url: "http://dsyjs.yun.liuzhou.gov.cn/"
          },
          {
            name: "柳南区",
            url: "http://dsyjs.yun.liuzhou.gov.cn/"
          },
          {
            name: "柳北区",
            url: "http://dsyjs.yun.liuzhou.gov.cn/"
          },
          {
            name: "柳江区",
            url: "http://dsyjs.yun.liuzhou.gov.cn/"
          },
          {
            name: "柳城县",
            url: "http://dsyjs.yun.liuzhou.gov.cn/"
          },
          {
            name: "鹿寨县",
            url: "http://dsyjs.yun.liuzhou.gov.cn/"
          },
          {
            name: "融安县",
            url: "http://dsyjs.yun.liuzhou.gov.cn/"
          },
          {
            name: "融水苗族自治县",
            url: "http://dsyjs.yun.liuzhou.gov.cn/"
          },
          {
            name: "三江侗族自治县",
            url: "http://dsyjs.yun.liuzhou.gov.cn/"
          }
        ]
      },
      {
        name: "桂林市",
        url: "https://www.guilin.gov.cn/",
        children: [
          {
            name: "秀峰区",
            url: ""
          },
          {
            name: "叠彩区",
            url: "http://www.glsdcqzf.gov.cn/"
          },
          {
            name: "象山区",
            url: ""
          },
          {
            name: "七星区",
            url: "http://www.glqx.gov.cn/"
          },
          {
            name: "雁山区",
            url: "http://www.glyszf.gov.cn/"
          },
          {
            name: "临桂区",
            url: "http://www.lingui.gov.cn/"
          },
          {
            name: "阳朔县",
            url: "http://www.yangshuo.gov.cn/"
          },
          {
            name: "灵川县",
            url: "http://www.lcxzf.gov.cn/"
          },
          {
            name: "全州县",
            url: "http://www.glqz.gov.cn/"
          },
          {
            name: "兴安县",
            url: "http://www.xazf.gov.cn/"
          },
          {
            name: "永福县",
            url: "http://www.yfzf.gov.cn/"
          },
          {
            name: "灌阳县",
            url: "http://www.guanyang.gov.cn/"
          },
          {
            name: "龙胜各族自治县",
            url: ""
          },
          {
            name: "资源县",
            url: ""
          },
          {
            name: "平乐县",
            url: "http://www.pingle.gov.cn/"
          },
          {
            name: "恭城瑶族自治县",
            url: ""
          },
          {
            name: "荔浦市",
            url: "http://www.lipu.gov.cn/"
          }
        ]
      },
      {
        name: "梧州市",
        url: "https://www.wuzhou.gov.cn/",
        children: [
          {
            name: "万秀区",
            url: ""
          },
          {
            name: "长洲区",
            url: ""
          },
          {
            name: "龙圩区",
            url: "http://www.wzlxq.gov.cn/"
          },
          {
            name: "苍梧县",
            url: "http://www.cangwu.gov.cn/"
          },
          {
            name: "藤县",
            url: ""
          },
          {
            name: "蒙山县",
            url: ""
          },
          {
            name: "岑溪市",
            url: ""
          }
        ]
      },
      {
        name: "北海市",
        url: "http://www.beihai.gov.cn/",
        children: [
          {
            name: "海城区",
            url: "http://www.bhhc.gov.cn/"
          },
          {
            name: "银海区",
            url: "http://www.yinhai.gov.cn/"
          },
          {
            name: "铁山港区",
            url: "http://www.bhtsg.gov.cn/"
          },
          {
            name: "合浦县",
            url: "http://www.hepu.gov.cn/"
          }
        ]
      },
      {
        name: "防城港市",
        url: "https://www.fcgs.gov.cn/",
        children: [
          {
            name: "港口区",
            url: "http://www.gkq.gov.cn/"
          },
          {
            name: "防城区",
            url: "http://www.fcq.gov.cn/"
          },
          {
            name: "上思县",
            url: "http://www.shangsi.gov.cn/"
          },
          {
            name: "东兴市",
            url: "http://www.dxzf.gov.cn/"
          }
        ]
      },
      {
        name: "钦州市",
        url: "https://www.qinzhou.gov.cn/",
        children: [
          {
            name: "钦南区",
            url: "http://www.gxqn.gov.cn/"
          },
          {
            name: "钦北区",
            url: "http://www.qinbei.gov.cn/"
          },
          {
            name: "灵山县",
            url: ""
          },
          {
            name: "浦北县",
            url: "http://www.gxpb.gov.cn/"
          }
        ]
      },
      {
        name: "贵港市",
        url: "http://www.gxgg.gov.cn/",
        children: [
          {
            name: "港北区",
            url: ""
          },
          {
            name: "港南区",
            url: ""
          },
          {
            name: "覃塘区",
            url: ""
          },
          {
            name: "平南县",
            url: ""
          },
          {
            name: "桂平市",
            url: ""
          }
        ]
      },
      {
        name: "玉林市",
        url: "https://www.yulin.gov.cn/",
        children: [
          {
            name: "玉州区",
            url: "http://www.ylyz.gov.cn/"
          },
          {
            name: "福绵区",
            url: "http://www.ylfm.gov.cn/"
          },
          {
            name: "容县",
            url: "http://www.rxzf.gov.cn/"
          },
          {
            name: "陆川县",
            url: "http://www.luchuan.gov.cn/"
          },
          {
            name: "博白县",
            url: "http://www.bobai.gov.cn/"
          },
          {
            name: "兴业县",
            url: "http://www.xingye.gov.cn/"
          },
          {
            name: "北流市",
            url: "http://www.beiliu.gov.cn/"
          }
        ]
      },
      {
        name: "百色市",
        url: "https://www.baise.gov.cn/",
        children: [
          {
            name: "右江区",
            url: ""
          },
          {
            name: "田阳区",
            url: "http://www.gxty.gov.cn/"
          },
          {
            name: "田东县",
            url: ""
          },
          {
            name: "德保县",
            url: "http://www.debao.gov.cn/"
          },
          {
            name: "那坡县",
            url: "http://www.napo.gov.cn/"
          },
          {
            name: "凌云县",
            url: "http://www.lingyun.gov.cn/"
          },
          {
            name: "乐业县",
            url: "http://www.leye.gov.cn/"
          },
          {
            name: "田林县",
            url: "http://www.tianlin.gov.cn/"
          },
          {
            name: "西林县",
            url: "http://www.gxxl.gov.cn/"
          },
          {
            name: "隆林各族自治县",
            url: "http://www.gxll.gov.cn/"
          },
          {
            name: "靖西市",
            url: "http://www.jingxi.gov.cn/"
          },
          {
            name: "平果市",
            url: ""
          }
        ]
      },
      {
        name: "贺州市",
        url: "http://www.gxhz.gov.cn/",
        children: [
          {
            name: "八步区",
            url: "http://www.gxbabu.gov.cn/"
          },
          {
            name: "平桂区",
            url: "http://www.pinggui.gov.cn/"
          },
          {
            name: "昭平县",
            url: "http://www.gxzp.gov.cn/"
          },
          {
            name: "钟山县",
            url: "http://www.gxzs.gov.cn/"
          },
          {
            name: "富川瑶族自治县",
            url: "http://www.gxfc.gov.cn/"
          }
        ]
      },
      {
        name: "河池市",
        url: "https://www.hc.gov.cn/",
        children: [
          {
            name: "金城江区",
            url: ""
          },
          {
            name: "宜州区",
            url: ""
          },
          {
            name: "南丹县",
            url: ""
          },
          {
            name: "天峨县",
            url: ""
          },
          {
            name: "凤山县",
            url: ""
          },
          {
            name: "东兰县",
            url: ""
          },
          {
            name: "罗城仫佬族自治县",
            url: ""
          },
          {
            name: "环江毛南族自治县",
            url: ""
          },
          {
            name: "巴马瑶族自治县",
            url: ""
          },
          {
            name: "都安瑶族自治县",
            url: ""
          },
          {
            name: "大化瑶族自治县",
            url: ""
          }
        ]
      },
      {
        name: "来宾市",
        url: "https://www.laibin.gov.cn/",
        children: [
          {
            name: "兴宾区",
            url: "http://www.xingbin.gov.cn/"
          },
          {
            name: "象州县",
            url: ""
          },
          {
            name: "武宣县",
            url: ""
          },
          {
            name: "忻城县",
            url: "http://www.gxxc.gov.cn/"
          },
          {
            name: "金秀瑶族自治县",
            url: ""
          },
          {
            name: "合山市",
            url: "http://www.heshanshi.gov.cn/"
          }
        ]
      },
      {
        name: "崇左市",
        url: "http://www.chongzuo.gov.cn/",
        children: [
          {
            name: "江州区",
            url: ""
          },
          {
            name: "扶绥县",
            url: "http://www.fusui.gov.cn/"
          },
          {
            name: "宁明县",
            url: "http://www.ningming.gov.cn/"
          },
          {
            name: "龙州县",
            url: ""
          },
          {
            name: "大新县",
            url: ""
          },
          {
            name: "天等县",
            url: "http://www.tiandeng.gov.cn/"
          },
          {
            name: "凭祥市",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "海南省",
    url: "https://www.hainan.gov.cn/",
    children: [
      {
        name: "海口市",
        url: "http://www.haikou.gov.cn/",
        children: [
          {
            name: "秀英区",
            url: ""
          },
          {
            name: "龙华区",
            url: ""
          },
          {
            name: "琼山区",
            url: ""
          },
          {
            name: "美兰区",
            url: ""
          }
        ]
      },
      {
        name: "三亚市",
        url: "https://www.sanya.gov.cn/",
        children: [
          {
            name: "海棠区",
            url: ""
          },
          {
            name: "吉阳区",
            url: ""
          },
          {
            name: "天涯区",
            url: ""
          },
          {
            name: "崖州区",
            url: ""
          }
        ]
      },
      {
        name: "三沙市",
        url: "https://www.sansha.gov.cn/"
      },
      {
        name: "儋州市",
        url: "https://www.danzhou.gov.cn/"
      },
      {
        name: "五指山市",
        url: "https://www.wzs.gov.cn/"
      },
      {
        name: "文昌市",
        url: "https://www.wenchang.gov.cn/"
      },
      {
        name: "琼海市",
        url: "https://qionghai.hainan.gov.cn/"
      },
      {
        name: "万宁市",
        url: "https://www.wanning.gov.cn/"
      },
      {
        name: "东方市",
        url: "https://www.dongfang.gov.cn/"
      },
      {
        name: "定安县",
        url: "https://www.dingan.gov.cn/"
      },
      {
        name: "屯昌县",
        url: "https://www.tunchang.gov.cn/"
      },
      {
        name: "澄迈县",
        url: "https://www.chengmai.gov.cn/"
      },
      {
        name: "临高县",
        url: "https://www.lingao.gov.cn/"
      },
      {
        name: "白沙黎族自治县",
        url: "https://www.baisha.gov.cn/"
      },
      {
        name: "昌江黎族自治县",
        url: "https://www.changjiang.gov.cn/"
      },
      {
        name: "乐东黎族自治县",
        url: "https://www.ledong.gov.cn/"
      },
      {
        name: "陵水黎族自治县",
        url: "https://www.lingshui.gov.cn/"
      },
      {
        name: "保亭黎族苗族自治县",
        url: "https://www.baoting.gov.cn/"
      },
      {
        name: "琼中黎族苗族自治县",
        url: "https://www.qiongzhong.gov.cn/"
      }
    ]
  },
  {
    name: "四川省",
    url: "https://www.sc.gov.cn/",
    children: [
      {
        name: "成都市",
        url: "https://cdcz.chengdu.gov.cn/",
        children: [
          {
            name: "锦江区",
            url: "http://www.cdjinjiang.gov.cn/"
          },
          {
            name: "青羊区",
            url: "http://www.cdqingyang.gov.cn/"
          },
          {
            name: "金牛区",
            url: "http://gk.chengdu.gov.cn/"
          },
          {
            name: "武侯区",
            url: "http://www.cdwh.gov.cn/"
          },
          {
            name: "成华区",
            url: "http://www.chenghua.gov.cn/"
          },
          {
            name: "龙泉驿区",
            url: "http://www.longquanyi.gov.cn/"
          },
          {
            name: "青白江区",
            url: "http://www.qbj.gov.cn/"
          },
          {
            name: "新都区",
            url: "http://www.xindu.gov.cn/"
          },
          {
            name: "温江区",
            url: "http://www.wenjiang.gov.cn/"
          },
          {
            name: "双流区",
            url: "http://www.shuangliu.gov.cn/"
          },
          {
            name: "郫都区",
            url: "http://www.pidu.gov.cn/"
          },
          {
            name: "新津区",
            url: "http://www.xinjin.gov.cn/"
          },
          {
            name: "都江堰市",
            url: "http://www.djy.gov.cn/"
          },
          {
            name: "彭州市",
            url: "http://www.pengzhou.gov.cn/"
          },
          {
            name: "邛崃市",
            url: "http://www.qionglai.gov.cn/"
          },
          {
            name: "崇州市",
            url: "http://www.chongzhou.gov.cn/"
          },
          {
            name: "简阳市",
            url: "http://www.scjy.gov.cn/"
          },
          {
            name: "金堂县",
            url: "http://www.jintang.gov.cn/"
          },
          {
            name: "大邑县",
            url: "http://www.day.gov.cn/"
          },
          {
            name: "蒲江县",
            url: "http://www.pujiang.gov.cn/"
          }
        ]
      },
      {
        name: "自贡市",
        url: "http://www.zg.gov.cn/",
        children: [
          {
            name: "自流井区",
            url: "http://www.zlj.gov.cn/"
          },
          {
            name: "贡井区",
            url: "http://www.gj.gov.cn/"
          },
          {
            name: "大安区",
            url: "http://www.zgda.gov.cn/"
          },
          {
            name: "沿滩区",
            url: "http://www.zgyt.gov.cn/"
          },
          {
            name: "荣县",
            url: "http://www.rongzhou.gov.cn/"
          },
          {
            name: "富顺县",
            url: "http://www.fsxzf.gov.cn/"
          }
        ]
      },
      {
        name: "攀枝花市",
        url: "http://www.panzhihua.gov.cn/",
        children: [
          {
            name: "东区",
            url: "http://www.scdongqu.gov.cn/"
          },
          {
            name: "西区",
            url: "http://www.pzhsxq.gov.cn/"
          },
          {
            name: "仁和区",
            url: "http://www.screnhe.gov.cn/"
          },
          {
            name: "米易县",
            url: "http://www.scmiyi.gov.cn/"
          },
          {
            name: "盐边县",
            url: "http://www.scyanbian.gov.cn/"
          }
        ]
      },
      {
        name: "泸州市",
        url: "http://www.luzhou.gov.cn/",
        children: [
          {
            name: "江阳区",
            url: "http://www.jiangyang.gov.cn/"
          },
          {
            name: "纳溪区",
            url: "http://www.naxi.gov.cn/"
          },
          {
            name: "龙马潭区",
            url: "http://www.longmatan.gov.cn/"
          },
          {
            name: "泸县",
            url: "http://www.luxian.gov.cn/"
          },
          {
            name: "合江县",
            url: "http://www.hejiang.gov.cn/"
          },
          {
            name: "叙永县",
            url: ""
          },
          {
            name: "古蔺县",
            url: "http://www.gulin.gov.cn/"
          }
        ]
      },
      {
        name: "德阳市",
        url: "http://www.deyang.gov.cn/",
        children: [
          {
            name: "旌阳区",
            url: "http://www.tfjy.gov.cn/"
          },
          {
            name: "罗江区",
            url: "http://www.luojiang.gov.cn/"
          },
          {
            name: "广汉市",
            url: "http://www.guanghan.gov.cn/"
          },
          {
            name: "什邡市",
            url: "http://www.shifang.gov.cn/"
          },
          {
            name: "绵竹市",
            url: "https://www.mz.gov.cn/"
          },
          {
            name: "中江县",
            url: "http://www.zhongjiang.gov.cn/"
          }
        ]
      },
      {
        name: "绵阳市",
        url: "http://www.my.gov.cn/",
        children: [
          {
            name: "涪城区",
            url: "http://www.myfc.gov.cn/"
          },
          {
            name: "游仙区",
            url: "http://www.youxian.gov.cn/"
          },
          {
            name: "安州区",
            url: "http://www.anzhou.gov.cn/"
          },
          {
            name: "江油市",
            url: "http://www.jiangyou.gov.cn/"
          },
          {
            name: "三台县",
            url: "http://www.santai.gov.cn/"
          },
          {
            name: "盐亭县",
            url: "http://www.yanting.gov.cn/"
          },
          {
            name: "梓潼县",
            url: "http://www.zitong.gov.cn/"
          },
          {
            name: "北川羌族自治县",
            url: "http://www.beichuan.gov.cn/"
          },
          {
            name: "平武县",
            url: "http://www.pingwu.gov.cn/"
          }
        ]
      },
      {
        name: "广元市",
        url: "http://www.cngy.gov.cn/",
        children: [
          {
            name: "利州区",
            url: "http://lzq.gov.cn/"
          },
          {
            name: "昭化区",
            url: "http://www.zhaohua.gov.cn/"
          },
          {
            name: "朝天区",
            url: "http://www.gyct.gov.cn/"
          },
          {
            name: "旺苍县",
            url: "http://www.scgw.gov.cn/"
          },
          {
            name: "青川县",
            url: "http://www.cnqc.gov.cn/"
          },
          {
            name: "剑阁县",
            url: "http://www.cnjg.gov.cn/"
          },
          {
            name: "苍溪县",
            url: "http://www.cncx.gov.cn/"
          }
        ]
      },
      {
        name: "遂宁市",
        url: "http://www.suining.gov.cn/",
        children: [
          {
            name: "船山区",
            url: "http://www.chuanshan.gov.cn/"
          },
          {
            name: "安居区",
            url: "http://www.scanju.gov.cn/"
          },
          {
            name: "蓬溪县",
            url: "http://www.pengxi.gov.cn/"
          },
          {
            name: "大英县",
            url: "http://www.daying.gov.cn/"
          },
          {
            name: "射洪市",
            url: "http://www.shehong.gov.cn/"
          }
        ]
      },
      {
        name: "内江市",
        url: "http://www.neijiang.gov.cn/",
        children: [
          {
            name: "市中区",
            url: "http://www.lsszq.gov.cn/"
          },
          {
            name: "东兴区",
            url: "http://www.scnjdx.gov.cn/"
          },
          {
            name: "威远县",
            url: "http://www.weiyuan.gov.cn/"
          },
          {
            name: "资中县",
            url: "http://zizhong.gov.cn/"
          },
          {
            name: "隆昌市",
            url: "http://www.longchang.gov.cn/"
          }
        ]
      },
      {
        name: "乐山市",
        url: "https://www.leshan.gov.cn/",
        children: [
          {
            name: "市中区",
            url: ""
          },
          {
            name: "五通桥区",
            url: "http://www.wtq.gov.cn/"
          },
          {
            name: "沙湾区",
            url: "http://www.shawan.gov.cn/"
          },
          {
            name: "金口河区",
            url: "http://www.jkh.gov.cn/"
          },
          {
            name: "峨眉山市",
            url: "http://www.emeishan.gov.cn/"
          },
          {
            name: "犍为县",
            url: "http://www.qianwei.gov.cn/"
          },
          {
            name: "井研县",
            url: "http://www.jingyan.gov.cn/"
          },
          {
            name: "夹江县",
            url: "http://www.jiajiang.gov.cn/"
          },
          {
            name: "沐川县",
            url: "http://www.muchuan.gov.cn/"
          },
          {
            name: "峨边彝族自治县",
            url: "http://www.eb.gov.cn/"
          },
          {
            name: "马边彝族自治县",
            url: "http://www.mabian.gov.cn/"
          }
        ]
      },
      {
        name: "南充市",
        url: "http://www.nanchong.gov.cn/",
        children: [
          {
            name: "顺庆区",
            url: "http://www.shunqing.gov.cn/"
          },
          {
            name: "高坪区",
            url: "http://www.gaoping.gov.cn/"
          },
          {
            name: "嘉陵区",
            url: "http://www.jialing.gov.cn/"
          },
          {
            name: "南部县",
            url: "http://www.scnanbu.gov.cn/"
          },
          {
            name: "营山县",
            url: "http://www.yingshan.gov.cn/"
          },
          {
            name: "蓬安县",
            url: "http://www.pengan.gov.cn/"
          },
          {
            name: "仪陇县",
            url: "http://www.yilong.gov.cn/"
          },
          {
            name: "西充县",
            url: "http://www.xichong.gov.cn/"
          },
          {
            name: "阆中市",
            url: "http://www.langzhong.gov.cn/"
          }
        ]
      },
      {
        name: "眉山市",
        url: "http://www.ms.gov.cn/",
        children: [
          {
            name: "东坡区",
            url: "http://www.dp.gov.cn/"
          },
          {
            name: "彭山区",
            url: "http://www.scps.gov.cn/"
          },
          {
            name: "仁寿县",
            url: "http://www.rs.gov.cn/"
          },
          {
            name: "洪雅县",
            url: "http://www.schy.gov.cn/"
          },
          {
            name: "丹棱县",
            url: "http://www.scdl.gov.cn/"
          },
          {
            name: "青神县",
            url: "http://www.scqs.gov.cn/"
          }
        ]
      },
      {
        name: "宜宾市",
        url: "http://www.yibin.gov.cn/",
        children: [
          {
            name: "翠屏区",
            url: "http://www.cuiping.gov.cn/"
          },
          {
            name: "叙州区",
            url: "http://www.ybxz.gov.cn/"
          },
          {
            name: "南溪区",
            url: "http://www.scnx.gov.cn/"
          },
          {
            name: "江安县",
            url: "http://www.ybja.gov.cn/"
          },
          {
            name: "长宁县",
            url: "http://www.sccn.gov.cn/"
          },
          {
            name: "高县",
            url: "http://www.gaoxian.gov.cn/"
          },
          {
            name: "筠连县",
            url: "http://www.scjlx.gov.cn/"
          },
          {
            name: "珙县",
            url: "http://www.gongxian.gov.cn/"
          },
          {
            name: "兴文县",
            url: "http://www.scxw.gov.cn/"
          },
          {
            name: "屏山县",
            url: "http://www.ybps.gov.cn/"
          }
        ]
      },
      {
        name: "广安市",
        url: "https://www.guang-an.gov.cn/",
        children: [
          {
            name: "广安区",
            url: "https://www.guanganqu.gov.cn/"
          },
          {
            name: "前锋区",
            url: "https://www.qf.gov.cn/"
          },
          {
            name: "岳池县",
            url: "https://www.scyc.gov.cn/"
          },
          {
            name: "武胜县",
            url: "https://www.wusheng.gov.cn/"
          },
          {
            name: "邻水县",
            url: "https://www.scls.gov.cn/"
          },
          {
            name: "华蓥市",
            url: "https://www.hys.gov.cn/"
          }
        ]
      },
      {
        name: "达州市",
        url: "http://www.dazhou.gov.cn/",
        children: [
          {
            name: "通川区",
            url: "http://www.tchuan.gov.cn/"
          },
          {
            name: "达川区",
            url: "http://www.dachuan.gov.cn/"
          },
          {
            name: "宣汉县",
            url: "http://xuanhan.gov.cn/"
          },
          {
            name: "开江县",
            url: "http://www.kaijiang.gov.cn/"
          },
          {
            name: "大竹县",
            url: "http://www.dazhu.gov.cn/"
          },
          {
            name: "渠县",
            url: "http://www.quxian.gov.cn/"
          },
          {
            name: "万源市",
            url: "http://www.wanyuan.gov.cn/"
          }
        ]
      },
      {
        name: "雅安市",
        url: "http://www.yaan.gov.cn/",
        children: [
          {
            name: "雨城区",
            url: "http://www.yayc.gov.cn/"
          },
          {
            name: "名山区",
            url: "http://www.scms.gov.cn/"
          },
          {
            name: "荥经县",
            url: "http://www.yingjing.gov.cn/"
          },
          {
            name: "汉源县",
            url: "http://www.hanyuan.gov.cn/"
          },
          {
            name: "石棉县",
            url: "http://www.shimian.gov.cn/"
          },
          {
            name: "天全县",
            url: "http://www.tqx.gov.cn/"
          },
          {
            name: "芦山县",
            url: "http://www.yals.gov.cn/"
          },
          {
            name: "宝兴县",
            url: "http://www.baoxing.gov.cn/"
          }
        ]
      },
      {
        name: "巴中市",
        url: "https://www.cnbz.gov.cn/",
        children: [
          {
            name: "巴州区",
            url: "http://www.bzqzf.gov.cn/"
          },
          {
            name: "恩阳区",
            url: "http://www.scey.gov.cn/"
          },
          {
            name: "通江县",
            url: "http://www.tjxzf.gov.cn/"
          },
          {
            name: "南江县",
            url: "http://www.scnj.gov.cn/"
          },
          {
            name: "平昌县",
            url: "http://www.scpc.gov.cn/"
          }
        ]
      },
      {
        name: "资阳市",
        url: "http://www.ziyang.gov.cn/",
        children: [
          {
            name: "雁江区",
            url: "http://www.yanjiang.gov.cn/"
          },
          {
            name: "安岳县",
            url: "http://www.aysc.gov.cn/"
          },
          {
            name: "乐至县",
            url: "http://zdxx.lezhi.gov.cn/"
          }
        ]
      },
      {
        name: "阿坝藏族羌族自治州",
        url: "http://www.abazhou.gov.cn/",
        children: [
          {
            name: "马尔康市",
            url: "http://www.maerkang.gov.cn/"
          },
          {
            name: "汶川县",
            url: "http://www.wenchuan.gov.cn/"
          },
          {
            name: "理县",
            url: "http://www.ablixian.gov.cn/"
          },
          {
            name: "茂县",
            url: "http://www.maoxian.gov.cn/"
          },
          {
            name: "松潘县",
            url: "http://www.songpan.gov.cn/"
          },
          {
            name: "九寨沟县",
            url: "http://www.jzg.gov.cn/"
          },
          {
            name: "金川县",
            url: "http://www.abjinchuan.gov.cn/"
          },
          {
            name: "小金县",
            url: "https://www.xiaojin.gov.cn/"
          },
          {
            name: "黑水县",
            url: "http://www.heishui.gov.cn/"
          },
          {
            name: "壤塘县",
            url: "http://www.rangtang.gov.cn/"
          },
          {
            name: "阿坝县",
            url: "http://www.abaxian.gov.cn/"
          },
          {
            name: "若尔盖县",
            url: "http://www.ruoergai.gov.cn/"
          },
          {
            name: "红原县",
            url: "http://www.hongyuan.gov.cn/"
          }
        ]
      },
      {
        name: "甘孜藏族自治州",
        url: "http://www.gzz.gov.cn/",
        children: [
          {
            name: "康定市",
            url: "http://www.kangding.gov.cn/"
          },
          {
            name: "泸定县",
            url: "http://www.luding.gov.cn/"
          },
          {
            name: "丹巴县",
            url: "http://www.danba.gov.cn/"
          },
          {
            name: "九龙县",
            url: "http://www.scjl.gov.cn/"
          },
          {
            name: "雅江县",
            url: "http://www.yajiang.gov.cn/"
          },
          {
            name: "道孚县",
            url: "http://www.gzdf.gov.cn/"
          },
          {
            name: "炉霍县",
            url: "http://www.luhuo.gov.cn/"
          },
          {
            name: "甘孜县",
            url: "http://www.ganzi.gov.cn/"
          },
          {
            name: "新龙县",
            url: "http://www.gzxl.gov.cn/"
          },
          {
            name: "德格县",
            url: "http://www.dege.gov.cn/"
          },
          {
            name: "白玉县",
            url: "http://www.baiyu.gov.cn/"
          },
          {
            name: "石渠县",
            url: "http://www.shiqu.gov.cn/"
          },
          {
            name: "色达县",
            url: "http://www.gzzsdxrmzf.gov.cn/"
          },
          {
            name: "理塘县",
            url: "http://www.gzlt.gov.cn/"
          },
          {
            name: "巴塘县",
            url: "http://www.batang.gov.cn/"
          },
          {
            name: "乡城县",
            url: "http://www.xcx.gov.cn/"
          },
          {
            name: "稻城县",
            url: "http://www.daocheng.gov.cn/"
          },
          {
            name: "得荣县",
            url: "http://www.gzdr.gov.cn/"
          }
        ]
      },
      {
        name: "凉山彝族自治州",
        url: "http://www.lsz.gov.cn/",
        children: [
          {
            name: "西昌市",
            url: "http://www.xichang.gov.cn/"
          },
          {
            name: "木里藏族自治县",
            url: "http://www.muli.gov.cn/"
          },
          {
            name: "盐源县",
            url: "http://www.yanyuan.gov.cn/"
          },
          {
            name: "德昌县",
            url: "http://www.lsdc.gov.cn/"
          },
          {
            name: "会理市",
            url: "http://www.huili.gov.cn/"
          },
          {
            name: "会东县",
            url: "http://www.schd.gov.cn/"
          },
          {
            name: "宁南县",
            url: "http://www.ningnan.gov.cn/"
          },
          {
            name: "普格县",
            url: "http://www.pgx.gov.cn/"
          },
          {
            name: "布拖县",
            url: "http://www.bt.gov.cn/"
          },
          {
            name: "金阳县",
            url: "http://www.jinyang.gov.cn/"
          },
          {
            name: "昭觉县",
            url: "http://www.zhaojue.gov.cn/"
          },
          {
            name: "喜德县",
            url: "http://www.scxd.gov.cn/"
          },
          {
            name: "冕宁县",
            url: "http://www.mn.gov.cn/"
          },
          {
            name: "越西县",
            url: "http://www.scyx.gov.cn/"
          },
          {
            name: "甘洛县",
            url: "http://www.ganluo.gov.cn/"
          },
          {
            name: "美姑县",
            url: "http://www.meigu.gov.cn/"
          },
          {
            name: "雷波县",
            url: "http://www.lbx.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "贵州省",
    url: "https://www.guizhou.gov.cn/",
    children: [
      {
        name: "贵阳市",
        url: "https://www.guiyang.gov.cn/",
        children: [
          {
            name: "南明区",
            url: ""
          },
          {
            name: "云岩区",
            url: ""
          },
          {
            name: "花溪区",
            url: ""
          },
          {
            name: "乌当区",
            url: ""
          },
          {
            name: "白云区",
            url: ""
          },
          {
            name: "观山湖区",
            url: ""
          },
          {
            name: "开阳县",
            url: ""
          },
          {
            name: "息烽县",
            url: ""
          },
          {
            name: "修文县",
            url: ""
          },
          {
            name: "清镇市",
            url: "https://www.gzqz.gov.cn/"
          }
        ]
      },
      {
        name: "六盘水市",
        url: "https://www.lps.gov.cn/",
        children: [
          {
            name: "钟山区",
            url: ""
          },
          {
            name: "六枝特区",
            url: ""
          },
          {
            name: "水城区",
            url: ""
          },
          {
            name: "盘州市",
            url: ""
          }
        ]
      },
      {
        name: "遵义市",
        url: "https://www.zunyi.gov.cn/",
        children: [
          {
            name: "红花岗区",
            url: ""
          },
          {
            name: "汇川区",
            url: ""
          },
          {
            name: "播州区",
            url: ""
          },
          {
            name: "桐梓县",
            url: ""
          },
          {
            name: "绥阳县",
            url: "https://www.suiyang.gov.cn/"
          },
          {
            name: "正安县",
            url: ""
          },
          {
            name: "道真仡佬族苗族自治县",
            url: ""
          },
          {
            name: "务川仡佬族苗族自治县",
            url: ""
          },
          {
            name: "凤冈县",
            url: ""
          },
          {
            name: "湄潭县",
            url: ""
          },
          {
            name: "余庆县",
            url: ""
          },
          {
            name: "习水县",
            url: ""
          },
          {
            name: "赤水市",
            url: ""
          },
          {
            name: "仁怀市",
            url: ""
          }
        ]
      },
      {
        name: "安顺市",
        url: "http://www.anshun.gov.cn/",
        children: [
          {
            name: "西秀区",
            url: ""
          },
          {
            name: "平坝区",
            url: ""
          },
          {
            name: "普定县",
            url: ""
          },
          {
            name: "镇宁布依族苗族自治县",
            url: ""
          },
          {
            name: "关岭布依族苗族自治县",
            url: ""
          },
          {
            name: "紫云苗族布依族自治县",
            url: ""
          }
        ]
      },
      {
        name: "毕节市",
        url: "https://www.bijie.gov.cn/",
        children: [
          {
            name: "七星关区",
            url: ""
          },
          {
            name: "大方县",
            url: "http://www.gzdafang.gov.cn/"
          },
          {
            name: "黔西市",
            url: ""
          },
          {
            name: "金沙县",
            url: ""
          },
          {
            name: "织金县",
            url: "http://www.gzzhijin.gov.cn/"
          },
          {
            name: "纳雍县",
            url: ""
          },
          {
            name: "威宁彝族回族苗族自治县",
            url: ""
          },
          {
            name: "赫章县",
            url: ""
          }
        ]
      },
      {
        name: "铜仁市",
        url: "https://www.tongren.gov.cn/",
        children: [
          {
            name: "碧江区",
            url: ""
          },
          {
            name: "万山区",
            url: ""
          },
          {
            name: "江口县",
            url: ""
          },
          {
            name: "玉屏侗族自治县",
            url: ""
          },
          {
            name: "石阡县",
            url: ""
          },
          {
            name: "思南县",
            url: ""
          },
          {
            name: "印江土家族苗族自治县",
            url: ""
          },
          {
            name: "德江县",
            url: ""
          },
          {
            name: "沿河土家族自治县",
            url: ""
          },
          {
            name: "松桃苗族自治县",
            url: ""
          }
        ]
      },
      {
        name: "黔西南布依族苗族自治州",
        url: "https://www.qxn.gov.cn/",
        children: [
          {
            name: "兴义市",
            url: ""
          },
          {
            name: "兴仁市",
            url: ""
          },
          {
            name: "普安县",
            url: ""
          },
          {
            name: "晴隆县",
            url: ""
          },
          {
            name: "贞丰县",
            url: ""
          },
          {
            name: "望谟县",
            url: ""
          },
          {
            name: "册亨县",
            url: ""
          },
          {
            name: "安龙县",
            url: ""
          }
        ]
      },
      {
        name: "黔东南苗族侗族自治州",
        url: "https://www.qdn.gov.cn/",
        children: [
          {
            name: "凯里市",
            url: ""
          },
          {
            name: "黄平县",
            url: ""
          },
          {
            name: "施秉县",
            url: ""
          },
          {
            name: "三穗县",
            url: ""
          },
          {
            name: "镇远县",
            url: ""
          },
          {
            name: "岑巩县",
            url: ""
          },
          {
            name: "天柱县",
            url: ""
          },
          {
            name: "锦屏县",
            url: ""
          },
          {
            name: "剑河县",
            url: ""
          },
          {
            name: "台江县",
            url: ""
          },
          {
            name: "黎平县",
            url: ""
          },
          {
            name: "榕江县",
            url: ""
          },
          {
            name: "从江县",
            url: ""
          },
          {
            name: "雷山县",
            url: ""
          },
          {
            name: "麻江县",
            url: ""
          },
          {
            name: "丹寨县",
            url: ""
          }
        ]
      },
      {
        name: "黔南布依族苗族自治州",
        url: "http://www.qiannan.gov.cn/",
        children: [
          {
            name: "都匀市",
            url: ""
          },
          {
            name: "福泉市",
            url: ""
          },
          {
            name: "荔波县",
            url: ""
          },
          {
            name: "贵定县",
            url: ""
          },
          {
            name: "瓮安县",
            url: ""
          },
          {
            name: "独山县",
            url: ""
          },
          {
            name: "平塘县",
            url: ""
          },
          {
            name: "罗甸县",
            url: ""
          },
          {
            name: "长顺县",
            url: ""
          },
          {
            name: "龙里县",
            url: ""
          },
          {
            name: "惠水县",
            url: ""
          },
          {
            name: "三都水族自治县",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "云南省",
    url: "https://www.yn.gov.cn/",
    children: [
      {
        name: "昆明市",
        url: "https://www.km.gov.cn/",
        children: [
          {
            name: "五华区",
            url: ""
          },
          {
            name: "盘龙区",
            url: "http://www.kmpl.gov.cn/"
          },
          {
            name: "官渡区",
            url: ""
          },
          {
            name: "西山区",
            url: ""
          },
          {
            name: "东川区",
            url: ""
          },
          {
            name: "呈贡区",
            url: "http://www.kmcg.gov.cn/"
          },
          {
            name: "晋宁区",
            url: ""
          },
          {
            name: "富民县",
            url: ""
          },
          {
            name: "宜良县",
            url: "http://www.kmyl.gov.cn/"
          },
          {
            name: "石林彝族自治县",
            url: "http://www.kmsl.gov.cn/"
          },
          {
            name: "嵩明县",
            url: "http://www.kmsm.gov.cn/"
          },
          {
            name: "禄劝彝族苗族自治县",
            url: ""
          },
          {
            name: "寻甸回族彝族自治县",
            url: ""
          },
          {
            name: "安宁市",
            url: ""
          }
        ]
      },
      {
        name: "曲靖市",
        url: "https://www.qj.gov.cn/",
        children: [
          {
            name: "麒麟区",
            url: ""
          },
          {
            name: "沾益区",
            url: ""
          },
          {
            name: "马龙区",
            url: ""
          },
          {
            name: "陆良县",
            url: ""
          },
          {
            name: "师宗县",
            url: ""
          },
          {
            name: "罗平县",
            url: ""
          },
          {
            name: "富源县",
            url: ""
          },
          {
            name: "会泽县",
            url: ""
          },
          {
            name: "宣威市",
            url: ""
          }
        ]
      },
      {
        name: "玉溪市",
        url: "https://www.yuxi.gov.cn/",
        children: [
          {
            name: "红塔区",
            url: "http://www.hongta.gov.cn/"
          },
          {
            name: "江川区",
            url: ""
          },
          {
            name: "通海县",
            url: ""
          },
          {
            name: "华宁县",
            url: "http://www.huaning.gov.cn/"
          },
          {
            name: "易门县",
            url: ""
          },
          {
            name: "峨山彝族自治县",
            url: ""
          },
          {
            name: "新平彝族傣族自治县",
            url: ""
          },
          {
            name: "元江哈尼族彝族傣族自治县",
            url: ""
          },
          {
            name: "澄江市",
            url: ""
          }
        ]
      },
      {
        name: "保山市",
        url: "https://www.baoshan.gov.cn/",
        children: [
          {
            name: "隆阳区",
            url: ""
          },
          {
            name: "施甸县",
            url: ""
          },
          {
            name: "龙陵县",
            url: ""
          },
          {
            name: "昌宁县",
            url: ""
          },
          {
            name: "腾冲市",
            url: ""
          }
        ]
      },
      {
        name: "昭通市",
        url: "https://www.zt.gov.cn/",
        children: [
          {
            name: "昭阳区",
            url: ""
          },
          {
            name: "鲁甸县",
            url: ""
          },
          {
            name: "巧家县",
            url: ""
          },
          {
            name: "盐津县",
            url: ""
          },
          {
            name: "大关县",
            url: ""
          },
          {
            name: "永善县",
            url: ""
          },
          {
            name: "绥江县",
            url: ""
          },
          {
            name: "镇雄县",
            url: ""
          },
          {
            name: "彝良县",
            url: ""
          },
          {
            name: "威信县",
            url: ""
          },
          {
            name: "水富市",
            url: ""
          }
        ]
      },
      {
        name: "丽江市",
        url: "https://www.lijiang.gov.cn/",
        children: [
          {
            name: "古城区",
            url: ""
          },
          {
            name: "玉龙纳西族自治县",
            url: ""
          },
          {
            name: "永胜县",
            url: ""
          },
          {
            name: "华坪县",
            url: ""
          },
          {
            name: "宁蒗彝族自治县",
            url: ""
          }
        ]
      },
      {
        name: "普洱市",
        url: "https://www.puershi.gov.cn/",
        children: [
          {
            name: "思茅区",
            url: ""
          },
          {
            name: "宁洱哈尼族彝族自治县",
            url: ""
          },
          {
            name: "墨江哈尼族自治县",
            url: ""
          },
          {
            name: "景东彝族自治县",
            url: ""
          },
          {
            name: "景谷傣族彝族自治县",
            url: ""
          },
          {
            name: "镇沅彝族哈尼族拉祜族自治县",
            url: ""
          },
          {
            name: "江城哈尼族彝族自治县",
            url: ""
          },
          {
            name: "孟连傣族拉祜族佤族自治县",
            url: ""
          },
          {
            name: "澜沧拉祜族自治县",
            url: ""
          },
          {
            name: "西盟佤族自治县",
            url: ""
          }
        ]
      },
      {
        name: "临沧市",
        url: "http://lincang.gov.cn/",
        children: [
          {
            name: "临翔区",
            url: ""
          },
          {
            name: "凤庆县",
            url: ""
          },
          {
            name: "云县",
            url: ""
          },
          {
            name: "永德县",
            url: ""
          },
          {
            name: "镇康县",
            url: ""
          },
          {
            name: "双江拉祜族佤族布朗族傣族自治县",
            url: ""
          },
          {
            name: "耿马傣族佤族自治县",
            url: ""
          },
          {
            name: "沧源佤族自治县",
            url: ""
          }
        ]
      },
      {
        name: "楚雄彝族自治州",
        url: "http://www.chuxiong.gov.cn/",
        children: [
          {
            name: "楚雄市",
            url: ""
          },
          {
            name: "双柏县",
            url: ""
          },
          {
            name: "牟定县",
            url: ""
          },
          {
            name: "南华县",
            url: ""
          },
          {
            name: "姚安县",
            url: ""
          },
          {
            name: "大姚县",
            url: ""
          },
          {
            name: "永仁县",
            url: ""
          },
          {
            name: "元谋县",
            url: ""
          },
          {
            name: "武定县",
            url: ""
          },
          {
            name: "禄丰市",
            url: ""
          }
        ]
      },
      {
        name: "红河哈尼族彝族自治州",
        url: "http://www.hh.gov.cn/",
        children: [
          {
            name: "个旧市",
            url: ""
          },
          {
            name: "开远市",
            url: ""
          },
          {
            name: "蒙自市",
            url: ""
          },
          {
            name: "弥勒市",
            url: ""
          },
          {
            name: "屏边苗族自治县",
            url: ""
          },
          {
            name: "建水县",
            url: ""
          },
          {
            name: "石屏县",
            url: ""
          },
          {
            name: "泸西县",
            url: ""
          },
          {
            name: "元阳县",
            url: ""
          },
          {
            name: "红河县",
            url: ""
          },
          {
            name: "金平苗族瑶族傣族自治县",
            url: ""
          },
          {
            name: "绿春县",
            url: ""
          },
          {
            name: "河口瑶族自治县",
            url: ""
          }
        ]
      },
      {
        name: "文山壮族苗族自治州",
        url: "https://www.ws.gov.cn/",
        children: [
          {
            name: "文山市",
            url: ""
          },
          {
            name: "砚山县",
            url: ""
          },
          {
            name: "西畴县",
            url: ""
          },
          {
            name: "麻栗坡县",
            url: ""
          },
          {
            name: "马关县",
            url: ""
          },
          {
            name: "丘北县",
            url: ""
          },
          {
            name: "广南县",
            url: ""
          },
          {
            name: "富宁县",
            url: ""
          }
        ]
      },
      {
        name: "西双版纳傣族自治州",
        url: "https://www.xsbn.gov.cn/",
        children: [
          {
            name: "景洪市",
            url: ""
          },
          {
            name: "勐海县",
            url: ""
          },
          {
            name: "勐腊县",
            url: ""
          }
        ]
      },
      {
        name: "大理白族自治州",
        url: "http://www.dali.gov.cn/",
        children: [
          {
            name: "大理市",
            url: ""
          },
          {
            name: "漾濞彝族自治县",
            url: ""
          },
          {
            name: "祥云县",
            url: ""
          },
          {
            name: "宾川县",
            url: ""
          },
          {
            name: "弥渡县",
            url: ""
          },
          {
            name: "南涧彝族自治县",
            url: ""
          },
          {
            name: "巍山彝族回族自治县",
            url: ""
          },
          {
            name: "永平县",
            url: ""
          },
          {
            name: "云龙县",
            url: ""
          },
          {
            name: "洱源县",
            url: ""
          },
          {
            name: "剑川县",
            url: ""
          },
          {
            name: "鹤庆县",
            url: ""
          }
        ]
      },
      {
        name: "德宏傣族景颇族自治州",
        url: "https://www.dh.gov.cn/",
        children: [
          {
            name: "瑞丽市",
            url: ""
          },
          {
            name: "芒市",
            url: ""
          },
          {
            name: "梁河县",
            url: ""
          },
          {
            name: "盈江县",
            url: ""
          },
          {
            name: "陇川县",
            url: ""
          }
        ]
      },
      {
        name: "怒江傈僳族自治州",
        url: "https://www.nujiang.gov.cn/",
        children: [
          {
            name: "泸水市",
            url: ""
          },
          {
            name: "福贡县",
            url: ""
          },
          {
            name: "贡山独龙族怒族自治县",
            url: ""
          },
          {
            name: "兰坪白族普米族自治县",
            url: ""
          }
        ]
      },
      {
        name: "迪庆藏族自治州",
        url: "http://www.diqing.gov.cn/",
        children: [
          {
            name: "香格里拉市",
            url: ""
          },
          {
            name: "德钦县",
            url: ""
          },
          {
            name: "维西傈僳族自治县",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "西藏自治区",
    url: "https://www.xizang.gov.cn/",
    children: [
      {
        name: "拉萨市",
        url: "https://www.lasa.gov.cn/",
        children: [
          {
            name: "城关区",
            url: ""
          },
          {
            name: "堆龙德庆区",
            url: ""
          },
          {
            name: "达孜区",
            url: ""
          },
          {
            name: "林周县",
            url: ""
          },
          {
            name: "当雄县",
            url: ""
          },
          {
            name: "尼木县",
            url: ""
          },
          {
            name: "曲水县",
            url: ""
          },
          {
            name: "墨竹工卡县",
            url: ""
          }
        ]
      },
      {
        name: "日喀则市",
        url: "https://www.rikaze.gov.cn/",
        children: [
          {
            name: "桑珠孜区",
            url: ""
          },
          {
            name: "南木林县",
            url: ""
          },
          {
            name: "江孜县",
            url: ""
          },
          {
            name: "定日县",
            url: ""
          },
          {
            name: "萨迦县",
            url: ""
          },
          {
            name: "拉孜县",
            url: ""
          },
          {
            name: "昂仁县",
            url: ""
          },
          {
            name: "谢通门县",
            url: ""
          },
          {
            name: "白朗县",
            url: ""
          },
          {
            name: "仁布县",
            url: ""
          },
          {
            name: "康马县",
            url: ""
          },
          {
            name: "定结县",
            url: ""
          },
          {
            name: "仲巴县",
            url: ""
          },
          {
            name: "亚东县",
            url: ""
          },
          {
            name: "吉隆县",
            url: ""
          },
          {
            name: "聂拉木县",
            url: ""
          },
          {
            name: "萨嘎县",
            url: ""
          },
          {
            name: "岗巴县",
            url: ""
          }
        ]
      },
      {
        name: "昌都市",
        url: "https://www.changdu.gov.cn/",
        children: [
          {
            name: "卡若区",
            url: ""
          },
          {
            name: "江达县",
            url: ""
          },
          {
            name: "贡觉县",
            url: ""
          },
          {
            name: "类乌齐县",
            url: ""
          },
          {
            name: "丁青县",
            url: ""
          },
          {
            name: "察雅县",
            url: ""
          },
          {
            name: "八宿县",
            url: ""
          },
          {
            name: "左贡县",
            url: ""
          },
          {
            name: "芒康县",
            url: ""
          },
          {
            name: "洛隆县",
            url: ""
          },
          {
            name: "边坝县",
            url: ""
          }
        ]
      },
      {
        name: "林芝市",
        url: "http://www.czj.linzhi.gov.cn/",
        children: [
          {
            name: "巴宜区",
            url: ""
          },
          {
            name: "工布江达县",
            url: ""
          },
          {
            name: "米林市",
            url: ""
          },
          {
            name: "墨脱县",
            url: ""
          },
          {
            name: "波密县",
            url: ""
          },
          {
            name: "察隅县",
            url: "http://www.chayu.gov.cn/"
          },
          {
            name: "朗县",
            url: ""
          }
        ]
      },
      {
        name: "山南市",
        url: "https://www.shannan.gov.cn/",
        children: [
          {
            name: "乃东区",
            url: ""
          },
          {
            name: "扎囊县",
            url: ""
          },
          {
            name: "贡嘎县",
            url: ""
          },
          {
            name: "桑日县",
            url: ""
          },
          {
            name: "琼结县",
            url: ""
          },
          {
            name: "曲松县",
            url: ""
          },
          {
            name: "措美县",
            url: ""
          },
          {
            name: "洛扎县",
            url: ""
          },
          {
            name: "加查县",
            url: ""
          },
          {
            name: "隆子县",
            url: ""
          },
          {
            name: "错那市",
            url: ""
          },
          {
            name: "浪卡子县",
            url: ""
          }
        ]
      },
      {
        name: "那曲市",
        url: "http://www.nq.gov.cn/",
        children: [
          {
            name: "色尼区",
            url: ""
          },
          {
            name: "嘉黎县",
            url: ""
          },
          {
            name: "比如县",
            url: ""
          },
          {
            name: "聂荣县",
            url: ""
          },
          {
            name: "安多县",
            url: ""
          },
          {
            name: "申扎县",
            url: ""
          },
          {
            name: "索县",
            url: ""
          },
          {
            name: "班戈县",
            url: ""
          },
          {
            name: "巴青县",
            url: ""
          },
          {
            name: "尼玛县",
            url: ""
          },
          {
            name: "双湖县",
            url: ""
          }
        ]
      },
      {
        name: "阿里地区",
        url: "https://www.ali.gov.cn/",
        children: [
          {
            name: "普兰县",
            url: ""
          },
          {
            name: "札达县",
            url: ""
          },
          {
            name: "噶尔县",
            url: ""
          },
          {
            name: "日土县",
            url: ""
          },
          {
            name: "革吉县",
            url: ""
          },
          {
            name: "改则县",
            url: ""
          },
          {
            name: "措勤县",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "陕西省",
    url: "https://www.shaanxi.gov.cn/",
    children: [
      {
        name: "西安市",
        url: "http://www.xa.gov.cn/",
        children: [
          {
            name: "新城区",
            url: ""
          },
          {
            name: "碑林区",
            url: "http://www.beilin.gov.cn/"
          },
          {
            name: "莲湖区",
            url: ""
          },
          {
            name: "灞桥区",
            url: ""
          },
          {
            name: "未央区",
            url: ""
          },
          {
            name: "雁塔区",
            url: ""
          },
          {
            name: "阎良区",
            url: ""
          },
          {
            name: "临潼区",
            url: ""
          },
          {
            name: "长安区",
            url: ""
          },
          {
            name: "高陵区",
            url: ""
          },
          {
            name: "鄠邑区",
            url: ""
          },
          {
            name: "蓝田县",
            url: ""
          },
          {
            name: "周至县",
            url: ""
          }
        ]
      },
      {
        name: "铜川市",
        url: "http://www.tongchuan.gov.cn/",
        children: [
          {
            name: "王益区",
            url: ""
          },
          {
            name: "印台区",
            url: ""
          },
          {
            name: "耀州区",
            url: ""
          },
          {
            name: "宜君县",
            url: ""
          }
        ]
      },
      {
        name: "宝鸡市",
        url: "http://www.baoji.gov.cn/",
        children: [
          {
            name: "渭滨区",
            url: ""
          },
          {
            name: "金台区",
            url: ""
          },
          {
            name: "陈仓区",
            url: ""
          },
          {
            name: "凤翔区",
            url: ""
          },
          {
            name: "岐山县",
            url: ""
          },
          {
            name: "扶风县",
            url: ""
          },
          {
            name: "眉县",
            url: ""
          },
          {
            name: "陇县",
            url: ""
          },
          {
            name: "千阳县",
            url: ""
          },
          {
            name: "麟游县",
            url: ""
          },
          {
            name: "凤县",
            url: ""
          },
          {
            name: "太白县",
            url: ""
          }
        ]
      },
      {
        name: "咸阳市",
        url: "http://www.xianyang.gov.cn/",
        children: [
          {
            name: "秦都区",
            url: ""
          },
          {
            name: "渭城区",
            url: ""
          },
          {
            name: "兴平市",
            url: ""
          },
          {
            name: "武功县",
            url: ""
          },
          {
            name: "乾县",
            url: ""
          },
          {
            name: "礼泉县",
            url: ""
          },
          {
            name: "泾阳县",
            url: ""
          },
          {
            name: "三原县",
            url: ""
          },
          {
            name: "永寿县",
            url: "http://www.yongshou.gov.cn/"
          },
          {
            name: "彬州市",
            url: ""
          },
          {
            name: "长武县",
            url: ""
          },
          {
            name: "旬邑县",
            url: ""
          },
          {
            name: "淳化县",
            url: ""
          }
        ]
      },
      {
        name: "渭南市",
        url: "http://www.weinan.gov.cn/",
        children: [
          {
            name: "临渭区",
            url: ""
          },
          {
            name: "华州区",
            url: ""
          },
          {
            name: "潼关县",
            url: ""
          },
          {
            name: "大荔县",
            url: ""
          },
          {
            name: "合阳县",
            url: ""
          },
          {
            name: "澄城县",
            url: ""
          },
          {
            name: "蒲城县",
            url: ""
          },
          {
            name: "白水县",
            url: ""
          },
          {
            name: "富平县",
            url: ""
          },
          {
            name: "华阴市",
            url: ""
          }
        ]
      },
      {
        name: "延安市",
        url: "http://www.yanan.gov.cn/",
        children: [
          {
            name: "宝塔区",
            url: ""
          },
          {
            name: "安塞区",
            url: ""
          },
          {
            name: "延长县",
            url: ""
          },
          {
            name: "延川县",
            url: ""
          },
          {
            name: "子长市",
            url: ""
          },
          {
            name: "志丹县",
            url: ""
          },
          {
            name: "吴起县",
            url: ""
          },
          {
            name: "甘泉县",
            url: ""
          },
          {
            name: "富县",
            url: ""
          },
          {
            name: "洛川县",
            url: ""
          },
          {
            name: "宜川县",
            url: ""
          },
          {
            name: "黄龙县",
            url: ""
          },
          {
            name: "黄陵县",
            url: ""
          }
        ]
      },
      {
        name: "汉中市",
        url: "http://www.hanzhong.gov.cn/",
        children: [
          {
            name: "汉台区",
            url: ""
          },
          {
            name: "南郑区",
            url: ""
          },
          {
            name: "城固县",
            url: ""
          },
          {
            name: "洋县",
            url: ""
          },
          {
            name: "西乡县",
            url: ""
          },
          {
            name: "勉县",
            url: ""
          },
          {
            name: "宁强县",
            url: ""
          },
          {
            name: "略阳县",
            url: ""
          },
          {
            name: "镇巴县",
            url: ""
          },
          {
            name: "留坝县",
            url: ""
          },
          {
            name: "佛坪县",
            url: ""
          }
        ]
      },
      {
        name: "榆林市",
        url: "https://www.yl.gov.cn/",
        children: [
          {
            name: "榆阳区",
            url: ""
          },
          {
            name: "横山区",
            url: ""
          },
          {
            name: "府谷县",
            url: ""
          },
          {
            name: "靖边县",
            url: ""
          },
          {
            name: "定边县",
            url: ""
          },
          {
            name: "绥德县",
            url: "http://www.sxsd.gov.cn/"
          },
          {
            name: "米脂县",
            url: ""
          },
          {
            name: "佳县",
            url: "http://www.sxjiaxian.gov.cn/"
          },
          {
            name: "吴堡县",
            url: ""
          },
          {
            name: "清涧县",
            url: "http://www.qjzhf.gov.cn/"
          },
          {
            name: "子洲县",
            url: ""
          },
          {
            name: "神木市",
            url: ""
          }
        ]
      },
      {
        name: "安康市",
        url: "http://www.ankang.gov.cn/",
        children: [
          {
            name: "汉滨区",
            url: ""
          },
          {
            name: "汉阴县",
            url: ""
          },
          {
            name: "石泉县",
            url: ""
          },
          {
            name: "宁陕县",
            url: ""
          },
          {
            name: "紫阳县",
            url: ""
          },
          {
            name: "岚皋县",
            url: ""
          },
          {
            name: "平利县",
            url: ""
          },
          {
            name: "镇坪县",
            url: ""
          },
          {
            name: "旬阳市",
            url: ""
          },
          {
            name: "白河县",
            url: ""
          }
        ]
      },
      {
        name: "商洛市",
        url: "http://www.shangluo.gov.cn/",
        children: [
          {
            name: "商州区",
            url: ""
          },
          {
            name: "洛南县",
            url: ""
          },
          {
            name: "丹凤县",
            url: ""
          },
          {
            name: "商南县",
            url: ""
          },
          {
            name: "山阳县",
            url: ""
          },
          {
            name: "镇安县",
            url: ""
          },
          {
            name: "柞水县",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "甘肃省",
    url: "https://www.gansu.gov.cn/",
    children: [
      {
        name: "兰州市",
        url: "https://www.lanzhou.gov.cn/",
        children: [
          {
            name: "城关区",
            url: ""
          },
          {
            name: "七里河区",
            url: ""
          },
          {
            name: "西固区",
            url: ""
          },
          {
            name: "安宁区",
            url: ""
          },
          {
            name: "红古区",
            url: ""
          },
          {
            name: "永登县",
            url: ""
          },
          {
            name: "皋兰县",
            url: ""
          },
          {
            name: "榆中县",
            url: ""
          }
        ]
      },
      {
        name: "嘉峪关市",
        url: "https://www.jyg.gov.cn/"
      },
      {
        name: "金昌市",
        url: "https://www.jc.gov.cn/",
        children: [
          {
            name: "金川区",
            url: ""
          },
          {
            name: "永昌县",
            url: ""
          }
        ]
      },
      {
        name: "白银市",
        url: "http://www.baiyin.gov.cn/",
        children: [
          {
            name: "白银区",
            url: ""
          },
          {
            name: "平川区",
            url: ""
          },
          {
            name: "靖远县",
            url: ""
          },
          {
            name: "会宁县",
            url: ""
          },
          {
            name: "景泰县",
            url: ""
          }
        ]
      },
      {
        name: "天水市",
        url: "http://www.tianshui.gov.cn/",
        children: [
          {
            name: "秦州区",
            url: ""
          },
          {
            name: "麦积区",
            url: ""
          },
          {
            name: "清水县",
            url: ""
          },
          {
            name: "秦安县",
            url: ""
          },
          {
            name: "甘谷县",
            url: ""
          },
          {
            name: "武山县",
            url: ""
          },
          {
            name: "张家川回族自治县",
            url: ""
          }
        ]
      },
      {
        name: "武威市",
        url: "https://www.ww.gov.cn/",
        children: [
          {
            name: "凉州区",
            url: ""
          },
          {
            name: "民勤县",
            url: ""
          },
          {
            name: "古浪县",
            url: ""
          },
          {
            name: "天祝藏族自治县",
            url: ""
          }
        ]
      },
      {
        name: "张掖市",
        url: "http://www.zhangye.gov.cn/",
        children: [
          {
            name: "甘州区",
            url: ""
          },
          {
            name: "肃南裕固族自治县",
            url: ""
          },
          {
            name: "民乐县",
            url: ""
          },
          {
            name: "临泽县",
            url: ""
          },
          {
            name: "高台县",
            url: ""
          },
          {
            name: "山丹县",
            url: ""
          }
        ]
      },
      {
        name: "平凉市",
        url: "https://www.pingliang.gov.cn/",
        children: [
          {
            name: "崆峒区",
            url: ""
          },
          {
            name: "泾川县",
            url: "http://www.jingchuan.gov.cn/"
          },
          {
            name: "灵台县",
            url: ""
          },
          {
            name: "崇信县",
            url: ""
          },
          {
            name: "庄浪县",
            url: ""
          },
          {
            name: "静宁县",
            url: ""
          },
          {
            name: "华亭市",
            url: "http://www.gsht.gov.cn/"
          }
        ]
      },
      {
        name: "酒泉市",
        url: "https://www.jiuquan.gov.cn/",
        children: [
          {
            name: "肃州区",
            url: ""
          },
          {
            name: "金塔县",
            url: ""
          },
          {
            name: "瓜州县",
            url: ""
          },
          {
            name: "肃北蒙古族自治县",
            url: ""
          },
          {
            name: "阿克塞哈萨克族自治县",
            url: ""
          },
          {
            name: "玉门市",
            url: ""
          },
          {
            name: "敦煌市",
            url: ""
          }
        ]
      },
      {
        name: "庆阳市",
        url: "https://www.qy.gov.cn/",
        children: [
          {
            name: "西峰区",
            url: ""
          },
          {
            name: "庆城县",
            url: ""
          },
          {
            name: "环县",
            url: ""
          },
          {
            name: "华池县",
            url: ""
          },
          {
            name: "合水县",
            url: ""
          },
          {
            name: "正宁县",
            url: ""
          },
          {
            name: "宁县",
            url: ""
          },
          {
            name: "镇原县",
            url: ""
          }
        ]
      },
      {
        name: "定西市",
        url: "https://www.dingxi.gov.cn/",
        children: [
          {
            name: "安定区",
            url: ""
          },
          {
            name: "通渭县",
            url: ""
          },
          {
            name: "陇西县",
            url: ""
          },
          {
            name: "渭源县",
            url: ""
          },
          {
            name: "临洮县",
            url: ""
          },
          {
            name: "漳县",
            url: ""
          },
          {
            name: "岷县",
            url: ""
          }
        ]
      },
      {
        name: "陇南市",
        url: "https://www.longnan.gov.cn/",
        children: [
          {
            name: "武都区",
            url: ""
          },
          {
            name: "成县",
            url: ""
          },
          {
            name: "文县",
            url: ""
          },
          {
            name: "宕昌县",
            url: ""
          },
          {
            name: "康县",
            url: ""
          },
          {
            name: "西和县",
            url: ""
          },
          {
            name: "礼县",
            url: ""
          },
          {
            name: "徽县",
            url: ""
          },
          {
            name: "两当县",
            url: ""
          }
        ]
      },
      {
        name: "临夏回族自治州",
        url: "https://www.linxia.gov.cn/",
        children: [
          {
            name: "临夏市",
            url: ""
          },
          {
            name: "临夏县",
            url: ""
          },
          {
            name: "康乐县",
            url: ""
          },
          {
            name: "永靖县",
            url: ""
          },
          {
            name: "广河县",
            url: ""
          },
          {
            name: "和政县",
            url: ""
          },
          {
            name: "东乡族自治县",
            url: ""
          },
          {
            name: "积石山保安族东乡族撒拉族自治县",
            url: ""
          }
        ]
      },
      {
        name: "甘南藏族自治州",
        url: "http://www.gnzrmzf.gov.cn/",
        children: [
          {
            name: "合作市",
            url: ""
          },
          {
            name: "临潭县",
            url: ""
          },
          {
            name: "卓尼县",
            url: ""
          },
          {
            name: "舟曲县",
            url: ""
          },
          {
            name: "迭部县",
            url: ""
          },
          {
            name: "玛曲县",
            url: ""
          },
          {
            name: "碌曲县",
            url: ""
          },
          {
            name: "夏河县",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "青海省",
    url: "https://www.qinghai.gov.cn/",
    children: [
      {
        name: "西宁市",
        url: "https://www.xining.gov.cn/",
        children: [
          {
            name: "城东区",
            url: ""
          },
          {
            name: "城中区",
            url: ""
          },
          {
            name: "城西区",
            url: ""
          },
          {
            name: "城北区",
            url: ""
          },
          {
            name: "湟中区",
            url: ""
          },
          {
            name: "大通回族土族自治县",
            url: ""
          },
          {
            name: "湟源县",
            url: ""
          }
        ]
      },
      {
        name: "海东市",
        url: "https://www.haidong.gov.cn/",
        children: [
          {
            name: "乐都区",
            url: ""
          },
          {
            name: "平安区",
            url: ""
          },
          {
            name: "民和回族土族自治县",
            url: ""
          },
          {
            name: "互助土族自治县",
            url: ""
          },
          {
            name: "化隆回族自治县",
            url: ""
          },
          {
            name: "循化撒拉族自治县",
            url: ""
          }
        ]
      },
      {
        name: "海北藏族自治州",
        url: "https://www.haibei.gov.cn/",
        children: [
          {
            name: "门源回族自治县",
            url: ""
          },
          {
            name: "祁连县",
            url: ""
          },
          {
            name: "海晏县",
            url: ""
          },
          {
            name: "刚察县",
            url: ""
          }
        ]
      },
      {
        name: "黄南藏族自治州",
        url: "https://www.huangnan.gov.cn/",
        children: [
          {
            name: "同仁市",
            url: ""
          },
          {
            name: "尖扎县",
            url: ""
          },
          {
            name: "泽库县",
            url: ""
          },
          {
            name: "河南蒙古族自治县",
            url: ""
          }
        ]
      },
      {
        name: "海南藏族自治州",
        url: "https://www.hainanzhou.gov.cn/",
        children: [
          {
            name: "共和县",
            url: ""
          },
          {
            name: "同德县",
            url: ""
          },
          {
            name: "贵德县",
            url: ""
          },
          {
            name: "兴海县",
            url: ""
          },
          {
            name: "贵南县",
            url: ""
          }
        ]
      },
      {
        name: "果洛藏族自治州",
        url: "https://www.guoluo.gov.cn/",
        children: [
          {
            name: "玛沁县",
            url: ""
          },
          {
            name: "班玛县",
            url: ""
          },
          {
            name: "甘德县",
            url: ""
          },
          {
            name: "达日县",
            url: ""
          },
          {
            name: "久治县",
            url: ""
          },
          {
            name: "玛多县",
            url: ""
          }
        ]
      },
      {
        name: "玉树藏族自治州",
        url: "http://www.yushu.gov.cn/",
        children: [
          {
            name: "玉树市",
            url: ""
          },
          {
            name: "杂多县",
            url: ""
          },
          {
            name: "称多县",
            url: ""
          },
          {
            name: "治多县",
            url: ""
          },
          {
            name: "囊谦县",
            url: ""
          },
          {
            name: "曲麻莱县",
            url: ""
          }
        ]
      },
      {
        name: "海西蒙古族藏族自治州",
        url: "https://www.haixi.gov.cn/",
        children: [
          {
            name: "格尔木市",
            url: ""
          },
          {
            name: "德令哈市",
            url: ""
          },
          {
            name: "茫崖市",
            url: ""
          },
          {
            name: "乌兰县",
            url: ""
          },
          {
            name: "都兰县",
            url: ""
          },
          {
            name: "天峻县",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "宁夏回族自治区",
    url: "https://www.nx.gov.cn/",
    children: [
      {
        name: "银川市",
        url: "https://www.yinchuan.gov.cn/",
        children: [
          {
            name: "兴庆区",
            url: ""
          },
          {
            name: "西夏区",
            url: ""
          },
          {
            name: "金凤区",
            url: ""
          },
          {
            name: "永宁县",
            url: "http://www.nxyn.gov.cn/"
          },
          {
            name: "贺兰县",
            url: ""
          },
          {
            name: "灵武市",
            url: ""
          }
        ]
      },
      {
        name: "石嘴山市",
        url: "https://www.shizuishan.gov.cn/",
        children: [
          {
            name: "大武口区",
            url: ""
          },
          {
            name: "惠农区",
            url: ""
          },
          {
            name: "平罗县",
            url: ""
          }
        ]
      },
      {
        name: "吴忠市",
        url: "https://www.wuzhong.gov.cn/",
        children: [
          {
            name: "利通区",
            url: ""
          },
          {
            name: "红寺堡区",
            url: ""
          },
          {
            name: "盐池县",
            url: ""
          },
          {
            name: "同心县",
            url: ""
          },
          {
            name: "青铜峡市",
            url: ""
          }
        ]
      },
      {
        name: "固原市",
        url: "https://www.nxgy.gov.cn/",
        children: [
          {
            name: "原州区",
            url: ""
          },
          {
            name: "西吉县",
            url: ""
          },
          {
            name: "隆德县",
            url: ""
          },
          {
            name: "泾源县",
            url: ""
          },
          {
            name: "彭阳县",
            url: ""
          }
        ]
      },
      {
        name: "中卫市",
        url: "https://www.nxzw.gov.cn/",
        children: [
          {
            name: "沙坡头区",
            url: ""
          },
          {
            name: "中宁县",
            url: ""
          },
          {
            name: "海原县",
            url: ""
          }
        ]
      }
    ]
  },
  {
    name: "新疆维吾尔自治区",
    url: "https://www.xinjiang.gov.cn/",
    children: [
      {
        name: "乌鲁木齐市",
        url: "http://www.urumqi.gov.cn/",
        children: [
          {
            name: "天山区",
            url: "http://www.xjtsq.gov.cn/"
          },
          {
            name: "沙依巴克区",
            url: "http://www.sayibak.gov.cn/"
          },
          {
            name: "新市区",
            url: "http://www.uhdz.gov.cn/"
          },
          {
            name: "水磨沟区",
            url: "http://www.xjsmgq.gov.cn/"
          },
          {
            name: "头屯河区",
            url: "http://www.uetd.gov.cn/"
          },
          {
            name: "达坂城区",
            url: "http://www.dabancheng.gov.cn/"
          },
          {
            name: "米东区",
            url: "http://www.xjmd.gov.cn/"
          },
          {
            name: "乌鲁木齐县",
            url: "http://www.wlmqx.gov.cn/"
          }
        ]
      },
      {
        name: "克拉玛依市",
        url: "https://www.klmy.gov.cn/",
        children: [
          {
            name: "独山子区",
            url: "http://www.dsz.gov.cn/"
          },
          {
            name: "克拉玛依区",
            url: "http://www.klmyq.gov.cn/"
          },
          {
            name: "白碱滩区",
            url: "http://www.bjtq.gov.cn/"
          },
          {
            name: "乌尔禾区",
            url: "http://www.weh.gov.cn/"
          }
        ]
      },
      {
        name: "吐鲁番市",
        url: "https://www.tlf.gov.cn/",
        children: [
          {
            name: "高昌区",
            url: "http://gcq.tlf.gov.cn/"
          },
          {
            name: "鄯善县",
            url: "http://www.xjss.gov.cn/"
          },
          {
            name: "托克逊县",
            url: "http://tkx.gov.cn/"
          }
        ]
      },
      {
        name: "哈密市",
        url: "https://www.hami.gov.cn/",
        children: [
          {
            name: "伊州区",
            url: "http://www.yizhou.gov.cn/"
          },
          {
            name: "巴里坤哈萨克自治县",
            url: "http://www.xjblk.gov.cn/"
          },
          {
            name: "伊吾县",
            url: "http://www.xjyiwu.gov.cn/"
          }
        ]
      },
      {
        name: "昌吉回族自治州",
        url: "https://www.cj.gov.cn/",
        children: [
          {
            name: "昌吉市",
            url: "https://www.cjs.gov.cn/"
          },
          {
            name: "阜康市",
            url: "https://www.fk.gov.cn/"
          },
          {
            name: "呼图壁县",
            url: "http://www.htb.gov.cn/"
          },
          {
            name: "玛纳斯县",
            url: "https://www.mns.gov.cn/"
          },
          {
            name: "奇台县",
            url: "http://www.xjqt.gov.cn/"
          },
          {
            name: "吉木萨尔县",
            url: "https://www.jmser.gov.cn/"
          },
          {
            name: "木垒哈萨克自治县",
            url: "https://www.mlx.gov.cn/"
          }
        ]
      },
      {
        name: "博尔塔拉蒙古自治州",
        url: "https://www.xjboz.gov.cn/",
        children: [
          {
            name: "博乐市",
            url: "http://www.xjbl.gov.cn/"
          },
          {
            name: "阿拉山口市",
            url: "http://www.alsk.gov.cn/"
          },
          {
            name: "精河县",
            url: "https://www.xjjh.gov.cn/"
          },
          {
            name: "温泉县",
            url: "http://www.xjwq.gov.cn/"
          }
        ]
      },
      {
        name: "巴音郭楞蒙古自治州",
        url: "http://www.xjbz.gov.cn/",
        children: [
          {
            name: "库尔勒市",
            url: "https://www.xjkel.gov.cn/"
          },
          {
            name: "轮台县",
            url: "http://www.xjlt.gov.cn/"
          },
          {
            name: "尉犁县",
            url: "http://www.yuli.gov.cn/"
          },
          {
            name: "若羌县",
            url: "https://www.xjrq.gov.cn/"
          },
          {
            name: "且末县",
            url: "https://www.xjqmx.gov.cn/"
          },
          {
            name: "焉耆回族自治县",
            url: "https://www.xjyq.gov.cn/"
          },
          {
            name: "和静县",
            url: "http://www.xjhj.gov.cn/"
          },
          {
            name: "和硕县",
            url: "https://www.hoxut.gov.cn/"
          },
          {
            name: "博湖县",
            url: "https://www.xjbh.gov.cn/"
          }
        ]
      },
      {
        name: "阿克苏地区",
        url: "https://www.aks.gov.cn/",
        children: [
          {
            name: "阿克苏市",
            url: "https://www.akss.gov.cn/"
          },
          {
            name: "库车市",
            url: "https://www.xjkc.gov.cn/"
          },
          {
            name: "温宿县",
            url: "https://www.wszf.gov.cn/"
          },
          {
            name: "沙雅县",
            url: "https://www.xjsy.gov.cn/"
          },
          {
            name: "新和县",
            url: ""
          },
          {
            name: "拜城县",
            url: "https://www.xjbc.gov.cn/"
          },
          {
            name: "乌什县",
            url: "https://www.ws.gov.cn/"
          },
          {
            name: "阿瓦提县",
            url: "https://www.xjawt.gov.cn/"
          },
          {
            name: "柯坪县",
            url: "https://www.xjkpx.gov.cn/"
          }
        ]
      },
      {
        name: "克孜勒苏柯尔克孜自治州",
        url: "https://www.xjkz.gov.cn/",
        children: [
          {
            name: "阿图什市",
            url: "https://www.xjats.gov.cn/"
          },
          {
            name: "阿克陶县",
            url: "https://www.xjakt.gov.cn/"
          },
          {
            name: "阿合奇县",
            url: "https://www.xjahq.gov.cn/"
          },
          {
            name: "乌恰县",
            url: "http://www.xjwqx.gov.cn/"
          }
        ]
      },
      {
        name: "喀什地区",
        url: "http://www.kashi.gov.cn/",
        children: [
          {
            name: "喀什市",
            url: "http://www.xjks.gov.cn/"
          },
          {
            name: "疏附县",
            url: "http://www.xjsf.gov.cn/"
          },
          {
            name: "疏勒县",
            url: "http://www.shule.gov.cn/"
          },
          {
            name: "英吉沙县",
            url: "http://www.yjs.gov.cn/"
          },
          {
            name: "泽普县",
            url: "http://www.xjzp.gov.cn/"
          },
          {
            name: "莎车县",
            url: "http://www.shache.gov.cn/"
          },
          {
            name: "叶城县",
            url: "http://www.xjyc.gov.cn/"
          },
          {
            name: "麦盖提县",
            url: "http://www.mgt.gov.cn/"
          },
          {
            name: "岳普湖县",
            url: "http://www.yph.gov.cn/"
          },
          {
            name: "伽师县",
            url: "http://www.xjjsx.gov.cn/"
          },
          {
            name: "巴楚县",
            url: "http://www.bachu.gov.cn/"
          },
          {
            name: "塔什库尔干塔吉克自治县",
            url: "http://www.tskeg.gov.cn/"
          }
        ]
      },
      {
        name: "和田地区",
        url: "https://www.xjht.gov.cn/",
        children: [
          {
            name: "和田市",
            url: "https://www.hts.gov.cn/"
          },
          {
            name: "和田县",
            url: "http://www.htx.gov.cn/"
          },
          {
            name: "墨玉县",
            url: "http://www.myx.gov.cn/"
          },
          {
            name: "皮山县",
            url: "http://ps.gov.cn/"
          },
          {
            name: "洛浦县",
            url: "https://www.xjlpx.gov.cn/"
          },
          {
            name: "策勒县",
            url: "http://www.xjcl.gov.cn/"
          },
          {
            name: "于田县",
            url: "https://www.xjyt.gov.cn/"
          },
          {
            name: "民丰县",
            url: "https://www.mfx.gov.cn/"
          }
        ]
      },
      {
        name: "伊犁哈萨克自治州",
        url: "https://www.xjyl.gov.cn/",
        children: [
          {
            name: "伊宁市",
            url: "https://www.yining.gov.cn/"
          },
          {
            name: "奎屯市",
            url: "https://www.xjkuitun.gov.cn/"
          },
          {
            name: "霍尔果斯市",
            url: "http://www.xjhegs.gov.cn/"
          },
          {
            name: "伊宁县",
            url: "http://www.xjyn.gov.cn/"
          },
          {
            name: "察布查尔锡伯自治县",
            url: "http://www.xjcbcr.gov.cn/"
          },
          {
            name: "霍城县",
            url: "http://www.xjhc.gov.cn/"
          },
          {
            name: "巩留县",
            url: "https://www.xjgl.gov.cn/"
          },
          {
            name: "新源县",
            url: "https://www.xinyuan.gov.cn/"
          },
          {
            name: "昭苏县",
            url: "http://www.zhaosu.gov.cn/"
          },
          {
            name: "特克斯县",
            url: "http://www.zgtks.gov.cn/"
          },
          {
            name: "尼勒克县",
            url: "http://www.xjnlk.gov.cn/"
          }
        ]
      },
      {
        name: "塔城地区",
        url: "https://www.xjtc.gov.cn/",
        children: [
          {
            name: "塔城市",
            url: "http://www.xjtcsh.gov.cn/"
          },
          {
            name: "乌苏市",
            url: "http://www.xjem.gov.cn/"
          },
          {
            name: "额敏县",
            url: "https://www.xjws.gov.cn/"
          },
          {
            name: "沙湾市",
            url: "https://www.xjsw.gov.cn/"
          },
          {
            name: "托里县",
            url: "http://www.xjtl.gov.cn/"
          },
          {
            name: "裕民县",
            url: "http://www.xjym.gov.cn/"
          },
          {
            name: "和布克赛尔蒙古自治县",
            url: "http://www.xjhbk.gov.cn/"
          }
        ]
      },
      {
        name: "阿勒泰地区",
        url: "http://wap.xjalt.gov.cn/",
        children: [
          {
            name: "阿勒泰市",
            url: "https://www.alt.gov.cn/"
          },
          {
            name: "布尔津县",
            url: "https://www.brj.gov.cn/"
          },
          {
            name: "富蕴县",
            url: "http://www.xjfy.gov.cn/"
          },
          {
            name: "福海县",
            url: "https://www.xjfhx.gov.cn/"
          },
          {
            name: "哈巴河县",
            url: "https://www.hbh.gov.cn/"
          },
          {
            name: "青河县",
            url: "http://www.xjqh.gov.cn/"
          },
          {
            name: "吉木乃县",
            url: "https://www.jmn.gov.cn/"
          }
        ]
      }
    ]
  },
  {
    name: "新疆生产建设兵团",
    url: "http://www.xjbt.gov.cn/"
  },
  {
    name: "香港特别行政区",
    url: "https://www.gov.hk/"
  },
  {
    name: "澳门特别行政区",
    url: "https://www.gov.mo/"
  }
];
