import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SolutionsPage from './pages/SolutionsPage';
import ESGPage from './pages/ESGPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import MemberPage from './pages/MemberPage';
import ActivatePage from './pages/ActivatePage';
import AdminCodesPage from './pages/AdminCodesPage';
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/member" element={<MemberPage />} />
            <Route path="/activate" element={<ActivatePage />} />
            <Route path="/admin/codes" element={<AdminCodesPage />} />
          </Routes>
        </main>
        <Footer />
        <CookieConsent />
      </div>
    </BrowserRouter>
  );
}

export default App;
