import { POLICY_URL_MAP } from '../../data/website-policy';
import { GOV_WEBSITES } from '../../data/website-gov';
const SKIP = new Set(['香港特别行政区','澳门特别行政区','台湾省']);
let prov=0,city=0,cnty=0,pHas=0,cHas=0,nHas=0;
for(const p of GOV_WEBSITES){if(SKIP.has(p.name))continue;prov++;if(POLICY_URL_MAP[p.name])pHas++;
  for(const c of (p.children||[])){city++;const k=p.name+'/'+c.name;if(POLICY_URL_MAP[k])cHas++;
    for(const n of (c.children||[])){cnty++;const nk=p.name+'/'+c.name+'/'+n.name;if(POLICY_URL_MAP[nk])nHas++;}}}
console.log('province',pHas+'/'+prov);
console.log('city',cHas+'/'+city);
console.log('county',nHas+'/'+cnty);
console.log('total entries',Object.keys(POLICY_URL_MAP).length);
