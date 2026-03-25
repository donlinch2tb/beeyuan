import Solution from '../components/Solution';
import Competitive from '../components/Competitive';
import SEO from '../components/SEO';

export default function SolutionsPage() {
  return (
    <div className="pt-20">
      <SEO
        title="防治解決方案 | 蜂緣 BeeYuan"
        description="了解蜂緣 BeeYuan 的虎頭蜂防治流程、誘捕技術與競品差異，從風險預防到高效率管理的一站式解決方案。"
        keywords="虎頭蜂防治方案,誘捕技術,蜂害風險管理,生態防治,蜂緣"
      />
      <Solution />
      <Competitive />
    </div>
  );
}
