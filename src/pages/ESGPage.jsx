import ESGCircular from '../components/ESGCircular';
import DataPanel from '../components/DataPanel';
import BusinessModel from '../components/BusinessModel';
import Roadmap from '../components/Roadmap';

export default function ESGPage() {
  return (
    <div className="pt-20">
      <ESGCircular />
      <DataPanel />
      <BusinessModel />
      <Roadmap />
    </div>
  );
}
