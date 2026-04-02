"use client";

import { useMemo, useState } from "react";

interface FiscalRegion {
  code: string;
  name: string;
  url: string;
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
  { code: "shaanxi", name: "陕西省", url: "https://czt.shaanxi.gov.cn" },
  { code: "gansu", name: "甘肃省", url: "https://czt.gansu.gov.cn" },
  { code: "qinghai", name: "青海省", url: "https://czt.qinghai.gov.cn" },
  { code: "ningxia", name: "宁夏回族自治区", url: "https://czt.nx.gov.cn" },
  { code: "xinjiang", name: "新疆维吾尔自治区", url: "https://czt.xinjiang.gov.cn" },
  { code: "xinjiang-bingtuan", name: "新疆生产建设兵团", url: "https://czj.xjbt.gov.cn" },
  { code: "hongkong", name: "香港特别行政区", url: "https://www.fso.gov.hk/chi/" },
  { code: "macao", name: "澳门特别行政区", url: "https://www.dsf.gov.mo/" }
];

const CITY_BY_PROVINCE: Record<string, FiscalRegion[]> = {
  zhejiang: [
    { code: "hz", name: "杭州市", url: "https://czj.hangzhou.gov.cn" },
    { code: "nb", name: "宁波市", url: "https://czj.ningbo.gov.cn" },
    { code: "wz", name: "温州市", url: "https://czj.wenzhou.gov.cn" },
    { code: "jx", name: "嘉兴市", url: "https://czj.jiaxing.gov.cn" },
    { code: "huz", name: "湖州市", url: "https://czj.huzhou.gov.cn" },
    { code: "sx", name: "绍兴市", url: "https://www.shaoxing.gov.cn" },
    { code: "jh", name: "金华市", url: "https://www.jinhua.gov.cn" },
    { code: "qz", name: "衢州市", url: "https://www.quzhou.gov.cn" },
    { code: "zs", name: "舟山市", url: "https://www.zhoushan.gov.cn" },
    { code: "tz", name: "台州市", url: "https://czj.taizhou.gov.cn" },
    { code: "ls", name: "丽水市", url: "https://www.lishui.gov.cn" }
  ]
};

export function FiscalBudgetNav() {
  const [activeProvinceCode, setActiveProvinceCode] = useState<string | null>(null);

  const activeProvince = useMemo(
    () => PROVINCES.find((province) => province.code === activeProvinceCode) ?? null,
    [activeProvinceCode]
  );

  const cities = activeProvinceCode ? CITY_BY_PROVINCE[activeProvinceCode] ?? [] : [];

  return (
    <article className="info-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="section-title mb-0 border-b-0 pb-0">
          财政预决算导航
          <span className="section-sub">{activeProvince ? `${activeProvince.name} 地级市` : "省级地区"}</span>
        </h3>
        {activeProvince ? (
          <button
            type="button"
            className="rounded border border-[var(--color-border)] px-3 py-1 text-[0.82rem] text-[var(--color-link)] hover:bg-[var(--color-surface)]"
            onClick={() => setActiveProvinceCode(null)}
          >
            返回省级列表
          </button>
        ) : null}
      </div>

      {!activeProvince ? (
        <div className="grid grid-cols-5 gap-2">
          {PROVINCES.map((province) => (
            <button
              key={province.code}
              type="button"
              className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 text-center text-[0.9rem] font-semibold leading-tight transition hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
              onClick={() => setActiveProvinceCode(province.code)}
            >
              {province.name}
            </button>
          ))}
        </div>
      ) : cities.length > 0 ? (
        <div className="space-y-3">
          <a
            href={activeProvince.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.9rem] font-semibold hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
          >
            {activeProvince.name}
          </a>
          <div className="grid grid-cols-5 gap-2">
            {cities.map((city) => (
              <a
                key={city.code}
                href={city.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 text-center text-[0.9rem] font-semibold leading-tight transition hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
              >
                {city.name}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <a
            href={activeProvince.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.9rem] font-semibold hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
          >
            {activeProvince.name}
          </a>
          <div className="rounded border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-6 text-center text-[0.86rem] text-[var(--color-muted)]">
            当前仅已录入浙江省地级市列表。
          </div>
        </div>
      )}
    </article>
  );
}
