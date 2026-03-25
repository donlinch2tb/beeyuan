import Team from '../components/Team';
import SEO from '../components/SEO';

export default function AboutPage() {
  return (
    <div className="pt-20">
      <SEO
        title="團隊介紹 | 蜂緣 BeeYuan"
        description="認識蜂緣 BeeYuan 團隊與顧問陣容，了解我們在生態防治、技術整合與永續實踐上的專業背景。"
        keywords="蜂緣團隊,BeeYuan,顧問,生態防治團隊,永續團隊"
      />
      <Team />
    </div>
  );
}
