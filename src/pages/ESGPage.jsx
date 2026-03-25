import ESGCircular from '../components/ESGCircular';
import DataPanel from '../components/DataPanel';
import BusinessModel from '../components/BusinessModel';
import Roadmap from '../components/Roadmap';
import SEO from '../components/SEO';

export default function ESGPage() {
  return (
    <div className="pt-16">
      <SEO
        title="ESG 與循環經濟 | 蜂緣 BeeYuan"
        description="蜂緣 BeeYuan 以 ESG 與循環經濟思維，將虎頭蜂防治結合數據監測、資源再利用與永續商業模式。"
        keywords="ESG,循環經濟,永續發展,生態治理,虎頭蜂防治,蜂緣"
      />
      <ESGCircular />
      <BusinessModel />
      <Roadmap />
      <DataPanel />
    </div>
  );
}
