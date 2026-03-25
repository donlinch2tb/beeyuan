import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PainPoints from './components/PainPoints';
import Solution from './components/Solution';
import ESGCircular from './components/ESGCircular';
import DataPanel from './components/DataPanel';
import Competitive from './components/Competitive';
import BusinessModel from './components/BusinessModel';
import Team from './components/Team';
import Roadmap from './components/Roadmap';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-surface text-on-surface font-body">
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <Solution />
        <ESGCircular />
        <DataPanel />
        <Competitive />
        <BusinessModel />
        <Team />
        <Roadmap />
      </main>
      <Footer />
    </div>
  );
}

export default App;
