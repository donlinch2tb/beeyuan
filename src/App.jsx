import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SolutionsPage from './pages/SolutionsPage';
import ESGPage from './pages/ESGPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="bg-surface text-on-surface font-body">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/esg" element={<ESGPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
        <CookieConsent />
      </div>
    </BrowserRouter>
  );
}

export default App;
