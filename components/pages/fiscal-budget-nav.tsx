interface FiscalRegion {
  code: string;
  name: string;
  url: string;
}

interface FiscalCity {
  name: string;
  url: string;
  domain: string;
}

const PROVINCES: FiscalRegion[] = [
  { code: "beijing", name: "北京市", url: "https://czj.beijing.gov.cn" },
  { code: "tianjin", name: "天津市", url: "https://cz.tj.gov.cn" },
  { code: "hebei", name: "河北省", url: "https://czt.hebei.gov.cn" },
  { code: "shanxi", name: "山西省", url: "https://czt.shanxi.gov.cn" },
  { code: "neimenggu", name: "内蒙古自治区", url: "https://czt.nmg.gov.cn" },
  { code: "liaoning", name: "辽宁省", url: "https://czt.ln.gov.cn" },
  { code: "jilin", name: "吉林省", url: "https://czt.jl.gov.cn" },
  { code: "heilongjiang", name: "黑龙江省", url: "https://czt.hlj.gov.cn" },
  { code: "shanghai", name: "上海市", url: "https://czj.sh.gov.cn" },
  { code: "jiangsu", name: "江苏省", url: "https://czt.jiangsu.gov.cn" },
  { code: "zhejiang", name: "浙江省", url: "https://czt.zj.gov.cn" },
  { code: "anhui", name: "安徽省", url: "https://czt.ah.gov.cn" },
  { code: "fujian", name: "福建省", url: "https://czt.fujian.gov.cn" },
  { code: "jiangxi", name: "江西省", url: "https://czt.jiangxi.gov.cn" },
  { code: "shandong", name: "山东省", url: "https://czt.shandong.gov.cn" },
  { code: "henan", name: "河南省", url: "https://czt.henan.gov.cn" },
  { code: "hubei", name: "湖北省", url: "https://czt.hubei.gov.cn" },
  { code: "hunan", name: "湖南省", url: "https://czt.hunan.gov.cn" },
  { code: "guangdong", name: "广东省", url: "https://czt.gd.gov.cn" },
  { code: "guangxi", name: "广西壮族自治区", url: "https://czt.gxzf.gov.cn" },
  { code: "hainan", name: "海南省", url: "https://mof.hainan.gov.cn" },
  { code: "chongqing", name: "重庆市", url: "https://czj.cq.gov.cn" },
  { code: "sichuan", name: "四川省", url: "https://czt.sc.gov.cn" },
  { code: "guizhou", name: "贵州省", url: "https://czt.guizhou.gov.cn" },
  { code: "yunnan", name: "云南省", url: "https://czt.yn.gov.cn" },
  { code: "xizang", name: "西藏自治区", url: "https://czt.xizang.gov.cn" },
  { code: "shanxi2", name: "陕西省", url: "https://czt.shaanxi.gov.cn" },
  { code: "gansu", name: "甘肃省", url: "https://czt.gansu.gov.cn" },
  { code: "qinghai", name: "青海省", url: "https://czt.qinghai.gov.cn" },
  { code: "ningxia", name: "宁夏回族自治区", url: "https://czt.nx.gov.cn" },
  { code: "xinjiang", name: "新疆维吾尔自治区", url: "https://czt.xinjiang.gov.cn" },
  { code: "xinjiang-bingtuan", name: "新疆生产建设兵团", url: "https://czj.xjbt.gov.cn" },
  { code: "hongkong", name: "香港特别行政区", url: "https://www.fso.gov.hk/chi/" },
  { code: "macao", name: "澳门特别行政区", url: "https://www.dsf.gov.mo/" }
];

const ZHEJIANG_CITIES: FiscalCity[] = [
  { name: "杭州市", url: "https://czj.hangzhou.gov.cn", domain: "hangzhou.gov.cn" },
  { name: "宁波市", url: "https://czj.ningbo.gov.cn", domain: "ningbo.gov.cn" },
  { name: "温州市", url: "https://czj.wenzhou.gov.cn", domain: "wenzhou.gov.cn" },
  { name: "嘉兴市", url: "https://czj.jiaxing.gov.cn", domain: "jiaxing.gov.cn" },
  { name: "湖州市", url: "https://czj.huzhou.gov.cn", domain: "huzhou.gov.cn" },
  { name: "绍兴市", url: "https://www.shaoxing.gov.cn", domain: "shaoxing.gov.cn" },
  { name: "金华市", url: "https://www.jinhua.gov.cn", domain: "jinhua.gov.cn" },
  { name: "衢州市", url: "https://www.quzhou.gov.cn", domain: "quzhou.gov.cn" },
  { name: "舟山市", url: "https://www.zhoushan.gov.cn", domain: "zhoushan.gov.cn" },
  { name: "台州市", url: "https://czj.taizhou.gov.cn", domain: "taizhou.gov.cn" },
  { name: "丽水市", url: "https://www.lishui.gov.cn", domain: "lishui.gov.cn" }
];

function buildSearchLink(query: string) {
  return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
}

function buildSiteBudgetQuery(name: string, site: string) {
  return `${name} 预决算公开 site:${site}`;
}

const NATIONAL_ENTRIES = [
  {
    title: "财政部预算司（预决算公开平台）",
    url: "https://yss.mof.gov.cn/",
    description: "全国财政预决算公开统一入口，可继续下钻到各省与基层单位。"
  },
  {
    title: "中国政府网：中央预决算公开检索",
    url: buildSearchLink("中央 预决算公开 site:gov.cn"),
    description: "检索中央部门预算、决算公开与说明材料。"
  },
  {
    title: "全国地方预决算公开检索",
    url: buildSearchLink("地方 财政 预决算公开 site:gov.cn"),
    description: "按地区筛选地方财政公开目录、预算草案与决算报告。"
  }
];

export function FiscalBudgetNav() {
  return (
    <div className="space-y-4">
      <article className="info-card p-4">
        <h3 className="section-title">全国统一入口</h3>
        <div className="space-y-3">
          {NATIONAL_ENTRIES.map((entry) => (
            <div key={entry.title} className="list-row pb-3 last:border-b-0 last:pb-0">
              <div className="event-title">{entry.title}</div>
              <div className="event-summary mt-1">{entry.description}</div>
              <div className="event-sources">
                <a href={entry.url} target="_blank" rel="noreferrer">
                  打开入口 ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="info-card p-4">
        <h3 className="section-title">省级财政预决算导航（官网直达）</h3>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {PROVINCES.map((province) => (
            <div key={province.code} className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <p className="font-semibold text-[0.95rem]">{province.name}</p>
              <div className="event-sources mt-1 flex flex-wrap gap-3 text-[0.86rem]">
                <a href={province.url} target="_blank" rel="noreferrer">
                  财政部门官网 ↗
                </a>
                <a href={buildSearchLink(buildSiteBudgetQuery(province.name, "gov.cn"))} target="_blank" rel="noreferrer">
                  预决算公开检索 ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="info-card p-4">
        <h3 className="section-title">浙江省地级市财政预决算入口（11市）</h3>
        <div className="event-summary mb-3">
          已覆盖杭州、宁波、温州、嘉兴、湖州、绍兴、金华、衢州、舟山、台州、丽水，优先给财政官网直达；无法稳定识别财政局域名的城市先给市政府站点并附预决算公开检索。
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {ZHEJIANG_CITIES.map((city) => (
            <div key={city.name} className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <p className="font-semibold text-[0.95rem]">{city.name}</p>
              <div className="event-sources mt-1 flex flex-wrap gap-3 text-[0.86rem]">
                <a href={city.url} target="_blank" rel="noreferrer">
                  官网直达 ↗
                </a>
                <a href={buildSearchLink(buildSiteBudgetQuery(city.name, city.domain))} target="_blank" rel="noreferrer">
                  预决算公开检索 ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
