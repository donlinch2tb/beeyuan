import Team from '../components/Team';
import Competitive from '../components/Competitive';
import BusinessModel from '../components/BusinessModel';
import Roadmap from '../components/Roadmap';

export default function AboutPage() {
  return (
    <div className="pt-20">
      <Competitive />
      <BusinessModel />
      <Team />
      <Roadmap />
    </div>
  );
}
