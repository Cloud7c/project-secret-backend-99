import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PostAd from './pages/PostAd';
import ManageListing from './pages/ManageListing';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavFooter = location.pathname.startsWith('/manage-listing');
  
  return (
    <>
      {!hideNavFooter && <Navbar />}
      {children}
      {!hideNavFooter && <Footer />}
      <BackToTopButton />
    </>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<CategoryPage key="vehicles" title="Vehicles" category="vehicles" />} />
          <Route path="/machinery" element={<CategoryPage key="machinery" title="Machinery" category="machinery" />} />
          <Route path="/spares" element={<CategoryPage key="spares" title="Spares & Parts" category="spares" />} />
          <Route path="/equipment" element={<CategoryPage key="equipment" title="Farming Equipment" category="equipment" />} />
          <Route path="/livestock" element={<CategoryPage key="livestock" title="Livestock" category="livestock" />} />
          <Route path="/produce" element={<CategoryPage key="produce" title="Crops & Produce" category="produce" />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/manage-listing/:id" element={<ManageListing />} />
          <Route path="/post-ad" element={<PostAd />} />
          <Route path="/account" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
