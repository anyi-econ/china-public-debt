import http from 'http';
import https from 'https';

// ── helper ──
function fetch(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const opts = { timeout, headers: { 'User-Agent': 'Mozilla/5.0' } };
    if (url.startsWith('https')) opts.rejectUnauthorized = false;
    try {
      const req = mod.get(url, opts, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          resolve({ ok: false, status: res.statusCode, redirect: res.headers.location });
          res.resume();
          return;
        }
        if (res.statusCode >= 400) {
          resolve({ ok: false, status: res.statusCode });
          res.resume();
          return;
        }
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve({ ok: true, data, len: data.length }));
      });
      req.on('error', (e) => resolve({ ok: false, err: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, err: 'timeout' }); });
    } catch (e) { resolve({ ok: false, err: e.message }); }
  });
}

async function tryUrls(urls) {
  for (const url of urls) {
    const r = await fetch(url, 6000);
    if (r.ok && r.len > 500) return url;
    if (!r.ok && r.redirect) {
      const redir = r.redirect.startsWith('http') ? r.redirect : new URL(r.redirect, url).href;
      const r2 = await fetch(redir, 6000);
      if (r2.ok && r2.len > 500) return redir;
    }
  }
  return '';
}

// ═══════════════════════════════════════════════════════════════
// DATA: provinces → cities → counties
// county data based on standard 2023 admin divisions
// ═══════════════════════════════════════════════════════════════

const PROVINCES = {
  河北省: {
    石家庄市: { domain: 'sjz', counties: ['长安区','桥西区','新华区','井陉矿区','裕华区','藁城区','鹿泉区','栾城区','井陉县','正定县','行唐县','灵寿县','高邑县','深泽县','赞皇县','无极县','平山县','元氏县','赵县','辛集市','晋州市','新乐市'] },
    唐山市: { domain: 'tangshan', counties: ['路南区','路北区','古冶区','开平区','丰南区','丰润区','曹妃甸区','滦南县','乐亭县','迁西县','玉田县','遵化市','迁安市','滦州市'] },
    秦皇岛市: { domain: 'qhd', counties: ['海港区','山海关区','北戴河区','抚宁区','青龙满族自治县','昌黎县','卢龙县'] },
    邯郸市: { domain: 'hd', counties: ['邯山区','丛台区','复兴区','峰峰矿区','肥乡区','永年区','临漳县','成安县','大名县','涉县','磁县','邱县','鸡泽县','广平县','馆陶县','魏县','曲周县','武安市'] },
    邢台市: { domain: 'xingtai', counties: ['襄都区','信都区','任泽区','南和区','临城县','内丘县','柏乡县','隆尧县','宁晋县','巨鹿县','新河县','广宗县','平乡县','威县','清河县','临西县','南宫市','沙河市'] },
    保定市: { domain: 'bd', counties: ['竞秀区','莲池区','满城区','清苑区','徐水区','涞水县','阜平县','定兴县','唐县','高阳县','容城县','涞源县','望都县','安新县','易县','曲阳县','蠡县','顺平县','博野县','雄县','涿州市','定州市','安国市','高碑店市'] },
    张家口市: { domain: 'zjk', counties: ['桥东区','桥西区','宣化区','下花园区','万全区','崇礼区','张北县','康保县','沽源县','尚义县','蔚县','阳原县','怀安县','怀来县','涿鹿县','赤城县'] },
    承德市: { domain: 'chengde', counties: ['双桥区','双滦区','鹰手营子矿区','承德县','兴隆县','滦平县','隆化县','丰宁满族自治县','宽城满族自治县','围场满族蒙古族自治县','平泉市'] },
    沧州市: { domain: 'cangzhou', counties: ['新华区','运河区','沧县','青县','东光县','海兴县','盐山县','肃宁县','南皮县','吴桥县','献县','孟村回族自治县','泊头市','任丘市','黄骅市','河间市'] },
    廊坊市: { domain: 'lf', counties: ['安次区','广阳区','固安县','永清县','香河县','大城县','文安县','大厂回族自治县','霸州市','三河市'] },
    衡水市: { domain: '衡水', counties: ['桃城区','冀州区','枣强县','武邑县','武强县','饶阳县','安平县','故城县','景县','阜城县','深州市'] },
  },
  山西省: {
    太原市: { domain: 'taiyuan', counties: ['小店区','迎泽区','杏花岭区','尖草坪区','万柏林区','晋源区','清徐县','阳曲县','娄烦县','古交市'] },
    大同市: { domain: 'dt', counties: ['新荣区','平城区','云冈区','云州区','阳高县','天镇县','广灵县','灵丘县','浑源县','左云县'] },
    阳泉市: { domain: 'yq', counties: ['城区','矿区','郊区','平定县','盂县'] },
    长治市: { domain: 'changzhi', counties: ['潞州区','上党区','屯留区','潞城区','襄垣县','平顺县','黎城县','壶关县','长子县','武乡县','沁县','沁源县'] },
    晋城市: { domain: 'jcgov', counties: ['城区','沁水县','阳城县','陵川县','泽州县','高平市'] },
    朔州市: { domain: 'shuozhou', counties: ['朔城区','平鲁区','怀仁市','山阴县','应县','右玉县'] },
    晋中市: { domain: 'jinzhong', counties: ['榆次区','太谷区','榆社县','左权县','和顺县','昔阳县','寿阳县','祁县','平遥县','灵石县','介休市'] },
    运城市: { domain: 'yuncheng', counties: ['盐湖区','临猗县','万荣县','闻喜县','稷山县','新绛县','绛县','垣曲县','夏县','平陆县','芮城县','永济市','河津市'] },
    忻州市: { domain: 'xinzhou', counties: ['忻府区','定襄县','五台县','代县','繁峙县','宁武县','静乐县','神池县','五寨县','岢岚县','河曲县','保德县','偏关县','原平市'] },
    临汾市: { domain: 'linfen', counties: ['尧都区','曲沃县','翼城县','襄汾县','洪洞县','古县','安泽县','浮山县','吉县','乡宁县','大宁县','隰县','永和县','蒲县','汾西县','侯马市','霍州市'] },
    吕梁市: { domain: 'lvliang', counties: ['离石区','文水县','交城县','兴县','临县','柳林县','石楼县','岚县','方山县','中阳县','交口县','孝义市','汾阳市'] },
  },
  辽宁省: {
    沈阳市: { domain: 'shenyang', counties: ['和平区','沈河区','大东区','皇姑区','铁西区','苏家屯区','浑南区','沈北新区','于洪区','辽中区','康平县','法库县','新民市'] },
    大连市: { domain: 'dl', counties: ['中山区','西岗区','沙河口区','甘井子区','旅顺口区','金州区','普兰店区','长海县','瓦房店市','庄河市'] },
    鞍山市: { domain: 'anshan', counties: ['铁东区','铁西区','立山区','千山区','台安县','岫岩满族自治县','海城市'] },
    抚顺市: { domain: 'fushun', counties: ['新抚区','东洲区','望花区','顺城区','抚顺县','新宾满族自治县','清原满族自治县'] },
    本溪市: { domain: 'benxi', counties: ['平山区','溪湖区','明山区','南芬区','本溪满族自治县','桓仁满族自治县'] },
    丹东市: { domain: 'dandong', counties: ['元宝区','振兴区','振安区','宽甸满族自治县','东港市','凤城市'] },
    锦州市: { domain: 'jz', counties: ['古塔区','凌河区','太和区','义县','黑山县','北镇市','凌海市'] },
    营口市: { domain: 'yingkou', counties: ['站前区','西市区','鲅鱼圈区','老边区','盖州市','大石桥市'] },
    阜新市: { domain: 'fuxin', counties: ['海州区','新邱区','太平区','清河门区','细河区','阜新蒙古族自治县','彰武县'] },
    辽阳市: { domain: 'liaoyang', counties: ['白塔区','文圣区','宏伟区','弓长岭区','太子河区','辽阳县','灯塔市'] },
    盘锦市: { domain: 'panjin', counties: ['双台子区','兴隆台区','大洼区','盘山县'] },
    铁岭市: { domain: 'tieling', counties: ['银州区','清河区','铁岭县','西丰县','昌图县','调兵山市','开原市'] },
    朝阳市: { domain: 'chaoyang', counties: ['双塔区','龙城区','朝阳县','建平县','喀喇沁左翼蒙古族自治县','北票市','凌源市'] },
    葫芦岛市: { domain: 'hld', counties: ['连山区','龙港区','南票区','绥中县','建昌县','兴城市'] },
  },
  吉林省: {
    长春市: { domain: 'changchun', counties: ['南关区','宽城区','朝阳区','二道区','绿园区','双阳区','九台区','农安县','榆树市','德惠市','公主岭市'] },
    吉林市: { domain: 'jlcity', counties: ['昌邑区','龙潭区','船营区','丰满区','永吉县','蛟河市','桦甸市','舒兰市','磐石市'] },
    四平市: { domain: 'siping', counties: ['铁西区','铁东区','梨树县','伊通满族自治县','公主岭市','双辽市'] },
    辽源市: { domain: 'liaoyuan', counties: ['龙山区','西安区','东丰县','东辽县'] },
    通化市: { domain: 'tonghua', counties: ['东昌区','二道江区','通化县','辉南县','柳河县','梅河口市','集安市'] },
    白山市: { domain: 'baishan', counties: ['浑江区','江源区','抚松县','靖宇县','长白朝鲜族自治县','临江市'] },
    松原市: { domain: 'songyuan', counties: ['宁江区','前郭尔罗斯蒙古族自治县','长岭县','乾安县','扶余市'] },
    白城市: { domain: 'baicheng', counties: ['洮北区','镇赉县','通榆县','洮南市','大安市'] },
    延边朝鲜族自治州: { domain: 'yanbian', counties: ['延吉市','图们市','敦化市','珲春市','龙井市','和龙市','汪清县','安图县'] },
  },
  黑龙江省: {
    哈尔滨市: { domain: 'harbin', counties: ['道里区','南岗区','道外区','平房区','松北区','香坊区','呼兰区','阿城区','双城区','依兰县','方正县','宾县','巴彦县','木兰县','通河县','延寿县','尚志市','五常市'] },
    齐齐哈尔市: { domain: 'qqhr', counties: ['龙沙区','建华区','铁锋区','昂昂溪区','富拉尔基区','碾子山区','梅里斯达斡尔族区','龙江县','依安县','泰来县','甘南县','富裕县','克山县','克东县','拜泉县','讷河市'] },
    鸡西市: { domain: 'jixi', counties: ['鸡冠区','恒山区','滴道区','梨树区','城子河区','麻山区','鸡东县','虎林市','密山市'] },
    鹤岗市: { domain: 'hegang', counties: ['向阳区','工农区','南山区','兴安区','东山区','兴山区','萝北县','绥滨县'] },
    双鸭山市: { domain: 'shuangyashan', counties: ['尖山区','岭东区','四方台区','宝山区','集贤县','友谊县','宝清县','饶河县'] },
    大庆市: { domain: 'daqing', counties: ['萨尔图区','龙凤区','让胡路区','红岗区','大同区','肇州县','肇源县','林甸县','杜尔伯特蒙古族自治县'] },
    伊春市: { domain: 'yichun', counties: ['伊美区','乌翠区','友好区','金林区','铁力市','嘉荫县','汤旺县','丰林县','大箐山县','南岔县'] },
    佳木斯市: { domain: 'jms', counties: ['向阳区','前进区','东风区','郊区','桦南县','桦川县','汤原县','同江市','富锦市','抚远市'] },
    七台河市: { domain: 'qth', counties: ['新兴区','桃山区','茄子河区','勃利县'] },
    牡丹江市: { domain: 'mdj', counties: ['东安区','阳明区','爱民区','西安区','林口县','东宁市','绥芬河市','海林市','宁安市','穆棱市'] },
    黑河市: { domain: 'heihe', counties: ['爱辉区','逊克县','孙吴县','北安市','五大连池市','嫩江市'] },
    绥化市: { domain: 'suihua', counties: ['北林区','望奎县','兰西县','青冈县','庆安县','明水县','绥棱县','安达市','肇东市','海伦市'] },
    大兴安岭地区: { domain: 'dxal', counties: ['加格达奇区','松岭区','新林区','呼中区','呼玛县','塔河县','漠河市'] },
  },
  安徽省: {
    合肥市: { domain: 'hefei', counties: ['瑶海区','庐阳区','蜀山区','包河区','长丰县','肥东县','肥西县','庐江县','巢湖市'] },
    芜湖市: { domain: 'wuhu', counties: ['镜湖区','弋江区','鸠江区','湾沚区','繁昌区','南陵县','无为市'] },
    蚌埠市: { domain: 'bengbu', counties: ['龙子湖区','蚌山区','禹会区','淮上区','怀远县','五河县','固镇县'] },
    淮南市: { domain: 'huainan', counties: ['大通区','田家庵区','谢家集区','八公山区','潘集区','凤台县','寿县'] },
    马鞍山市: { domain: 'mas', counties: ['花山区','雨山区','博望区','当涂县','含山县','和县'] },
    淮北市: { domain: 'huaibei', counties: ['杜集区','相山区','烈山区','濉溪县'] },
    铜陵市: { domain: 'tl', counties: ['铜官区','义安区','郊区','枞阳县'] },
    安庆市: { domain: 'anqing', counties: ['迎江区','大观区','宜秀区','怀宁县','太湖县','宿松县','望江县','岳西县','桐城市','潜山市'] },
    黄山市: { domain: 'huangshan', counties: ['屯溪区','黄山区','徽州区','歙县','休宁县','黟县','祁门县'] },
    滁州市: { domain: 'chuzhou', counties: ['琅琊区','南谯区','来安县','全椒县','定远县','凤阳县','天长市','明光市'] },
    阜阳市: { domain: 'fy', counties: ['颍州区','颍东区','颍泉区','临泉县','太和县','阜南县','颍上县','界首市'] },
    宿州市: { domain: 'suzhou-ah', counties: ['埇桥区','砀山县','萧县','灵璧县','泗县'] },
    六安市: { domain: 'luan', counties: ['金安区','裕安区','叶集区','霍邱县','舒城县','金寨县','霍山县'] },
    亳州市: { domain: 'bozhou', counties: ['谯城区','涡阳县','蒙城县','利辛县'] },
    池州市: { domain: 'chizhou', counties: ['贵池区','东至县','石台县','青阳县'] },
    宣城市: { domain: 'xuancheng', counties: ['宣州区','郎溪县','泾县','绩溪县','旌德县','宁国市','广德市'] },
  },
  福建省: {
    福州市: { domain: 'fuzhou-fj', counties: ['鼓楼区','台江区','仓山区','马尾区','晋安区','长乐区','闽侯县','连江县','罗源县','闽清县','永泰县','平潭县','福清市'] },
    厦门市: { domain: 'xm', counties: ['思明区','海沧区','湖里区','集美区','同安区','翔安区'] },
    莆田市: { domain: 'putian', counties: ['城厢区','涵江区','荔城区','秀屿区','仙游县'] },
    三明市: { domain: 'sm', counties: ['三元区','沙县区','明溪县','清流县','宁化县','大田县','尤溪县','将乐县','泰宁县','建宁县','永安市'] },
    泉州市: { domain: 'quanzhou', counties: ['鲤城区','丰泽区','洛江区','泉港区','惠安县','安溪县','永春县','德化县','金门县','石狮市','晋江市','南安市'] },
    漳州市: { domain: 'zhangzhou', counties: ['芗城区','龙文区','龙海区','云霄县','漳浦县','诏安县','长泰区','东山县','南靖县','平和县','华安县'] },
    南平市: { domain: 'np', counties: ['延平区','建阳区','顺昌县','浦城县','光泽县','松溪县','政和县','邵武市','武夷山市','建瓯市'] },
    龙岩市: { domain: 'longyan', counties: ['新罗区','永定区','长汀县','上杭县','武平县','连城县','漳平市'] },
    宁德市: { domain: 'ningde', counties: ['蕉城区','霞浦县','古田县','屏南县','寿宁县','周宁县','柘荣县','福安市','福鼎市'] },
  },
  江西省: {
    南昌市: { domain: 'nc', counties: ['东湖区','西湖区','青云谱区','青山湖区','新建区','红谷滩区','南昌县','安义县','进贤县'] },
    景德镇市: { domain: 'jdz', counties: ['昌江区','珠山区','浮梁县','乐平市'] },
    萍乡市: { domain: 'pingxiang', counties: ['安源区','湘东区','莲花县','上栗县','芦溪县'] },
    九江市: { domain: 'jiujiang', counties: ['濂溪区','浔阳区','柴桑区','武宁县','修水县','永修县','德安县','都昌县','湖口县','彭泽县','瑞昌市','共青城市','庐山市'] },
    新余市: { domain: 'xinyu', counties: ['渝水区','分宜县'] },
    鹰潭市: { domain: 'yingtan', counties: ['月湖区','余江区','贵溪市'] },
    赣州市: { domain: 'ganzhou', counties: ['章贡区','南康区','赣县区','信丰县','大余县','上犹县','崇义县','安远县','定南县','全南县','宁都县','于都县','兴国县','会昌县','寻乌县','石城县','瑞金市','龙南市'] },
    吉安市: { domain: 'jian', counties: ['吉州区','青原区','吉安县','吉水县','峡江县','新干县','永丰县','泰和县','遂川县','万安县','安福县','永新县','井冈山市'] },
    宜春市: { domain: 'yichun-jx', counties: ['袁州区','奉新县','万载县','上高县','宜丰县','靖安县','铜鼓县','丰城市','樟树市','高安市'] },
    抚州市: { domain: 'fuzhou-jx', counties: ['临川区','东乡区','南城县','黎川县','南丰县','崇仁县','乐安县','宜黄县','金溪县','资溪县','广昌县'] },
    上饶市: { domain: 'shangrao', counties: ['信州区','广丰区','广信区','玉山县','铅山县','横峰县','弋阳县','余干县','鄱阳县','万年县','婺源县','德兴市'] },
  },
  山东省: {
    济南市: { domain: 'jinan', counties: ['历下区','市中区','槐荫区','天桥区','历城区','长清区','章丘区','济阳区','莱芜区','钢城区','平阴县','商河县'] },
    青岛市: { domain: 'qingdao', counties: ['市南区','市北区','黄岛区','崂山区','李沧区','城阳区','即墨区','胶州市','平度市','莱西市'] },
    淄博市: { domain: 'zibo', counties: ['淄川区','张店区','博山区','临淄区','周村区','桓台县','高青县','沂源县'] },
    枣庄市: { domain: 'zaozhuang', counties: ['市中区','薛城区','峄城区','台儿庄区','山亭区','滕州市'] },
    东营市: { domain: 'dongying', counties: ['东营区','河口区','垦利区','利津县','广饶县'] },
    烟台市: { domain: 'yantai', counties: ['芝罘区','福山区','牟平区','莱山区','蓬莱区','龙口市','莱阳市','莱州市','招远市','栖霞市','海阳市'] },
    潍坊市: { domain: 'weifang', counties: ['潍城区','寒亭区','坊子区','奎文区','临朐县','昌乐县','青州市','诸城市','寿光市','安丘市','高密市','昌邑市'] },
    济宁市: { domain: 'jining', counties: ['任城区','兖州区','微山县','鱼台县','金乡县','嘉祥县','汶上县','泗水县','梁山县','曲阜市','邹城市'] },
    泰安市: { domain: 'taian', counties: ['泰山区','岱岳区','宁阳县','东平县','新泰市','肥城市'] },
    威海市: { domain: 'weihai', counties: ['环翠区','文登区','荣成市','乳山市'] },
    日照市: { domain: 'rizhao', counties: ['东港区','岚山区','五莲县','莒县'] },
    临沂市: { domain: 'linyi', counties: ['兰山区','罗庄区','河东区','沂南县','郯城县','沂水县','兰陵县','费县','平邑县','莒南县','蒙阴县','临沭县'] },
    德州市: { domain: 'dezhou', counties: ['德城区','陵城区','宁津县','庆云县','临邑县','齐河县','平原县','夏津县','武城县','禹城市','乐陵市'] },
    聊城市: { domain: 'liaocheng', counties: ['东昌府区','茌平区','阳谷县','莘县','东阿县','冠县','高唐县','临清市'] },
    滨州市: { domain: 'binzhou', counties: ['滨城区','沾化区','惠民县','阳信县','无棣县','博兴县','邹平市'] },
    菏泽市: { domain: 'heze', counties: ['牡丹区','定陶区','曹县','单县','成武县','巨野县','郓城县','鄄城县','东明县'] },
  },
};

// ── known / pre-resolved city URLs ──
const KNOWN_URLS = {
  // 河北
  '石家庄市': 'http://czj.sjz.gov.cn/col/1584429767498/index.html',
  // 辽宁
  '沈阳市': 'https://www.shenyang.gov.cn/zwgk/fdzdgknr/ysjs/',
  // 安徽
  '合肥市': 'https://www.hefei.gov.cn/zwgk/site/tpl/1541',
  // 福建
  '福州市': 'http://www.fuzhou.gov.cn/zgfzzt/czzj/',
  '厦门市': 'http://cz.xm.gov.cn/',
  '莆田市': 'http://czj.putian.gov.cn/',
  '三明市': 'http://cz.sm.gov.cn/',
  '泉州市': 'http://czj.quanzhou.gov.cn/',
  '漳州市': 'http://czj.zhangzhou.gov.cn/',
  '南平市': 'http://czj.np.gov.cn/',
  '龙岩市': 'http://czj.longyan.gov.cn/',
  '宁德市': 'http://czj.ningde.gov.cn/',
  // 山东
  '济南市': 'http://jncz.jinan.gov.cn/col/col115040',
};

// ── URL candidates to try for each city ──
function getCandidateUrls(cityName, domain, province) {
  // Remove 市 suffix for patterns
  const d = domain;
  const urls = [];

  // Common patterns for city fiscal bureau or government fiscal section
  urls.push(`http://czj.${d}.gov.cn/`);
  urls.push(`https://czj.${d}.gov.cn/`);
  urls.push(`http://czt.${d}.gov.cn/`);
  urls.push(`http://www.${d}.gov.cn/zwgk/czzj/`);
  urls.push(`https://www.${d}.gov.cn/zwgk/czzj/`);
  urls.push(`http://www.${d}.gov.cn/zwgk/czxx/`);
  urls.push(`https://www.${d}.gov.cn/zwgk/czxx/`);

  return urls;
}

async function main() {
  const results = {};
  let totalChecked = 0;
  let totalFound = 0;

  for (const [province, cities] of Object.entries(PROVINCES)) {
    results[province] = {};
    for (const [cityName] of Object.entries(cities)) {
      if (KNOWN_URLS[cityName]) {
        results[province][cityName] = KNOWN_URLS[cityName];
        totalFound++;
        console.error(`✓ ${cityName}: ${KNOWN_URLS[cityName]} (known)`);
      }
    }
  }

  // Try URL patterns for unknown cities
  const tasks = [];
  for (const [province, cities] of Object.entries(PROVINCES)) {
    for (const [cityName, info] of Object.entries(cities)) {
      if (KNOWN_URLS[cityName]) continue;
      tasks.push({ province, cityName, info });
    }
  }

  // Process in batches of 5
  for (let i = 0; i < tasks.length; i += 5) {
    const batch = tasks.slice(i, i + 5);
    const promises = batch.map(async ({ province, cityName, info }) => {
      const candidates = getCandidateUrls(cityName, info.domain, province);
      const url = await tryUrls(candidates);
      totalChecked++;
      if (url) {
        results[province][cityName] = url;
        totalFound++;
        console.error(`✓ ${cityName}: ${url}`);
      } else {
        results[province][cityName] = '';
        console.error(`✗ ${cityName}: not found`);
      }
    });
    await Promise.all(promises);
  }

  console.error(`\nChecked ${totalChecked} cities, found ${totalFound} URLs`);

  // Generate TypeScript output
  for (const [province, cities] of Object.entries(PROVINCES)) {
    console.log(`  // --- ${province} cities+counties ---`);
    for (const [cityName, info] of Object.entries(cities)) {
      const url = results[province]?.[cityName] || '';
      const counties = info.counties;
      const urlStr = url ? `"${url}"` : '""';
      console.log(`      {`);
      console.log(`        name: "${cityName}",`);
      console.log(`        url: ${urlStr},`);
      console.log(`        children: [`);
      for (const county of counties) {
        console.log(`          { name: "${county}", url: "" },`);
      }
      console.log(`        ],`);
      console.log(`      },`);
    }
    console.log('');
  }
}

main().catch(e => console.error(e));
