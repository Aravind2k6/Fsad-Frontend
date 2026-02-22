import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyzeFeedback from './pages/admin/AnalyzeFeedback';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Layout = ({ children, role }) => (
  <div className="app-container">
    <Sidebar role={role} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {role === 'student' && <Navbar role={role} />}
      <main className="content-wrapper animate-fade-in" style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  </div>
);

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route path="/student" element={<Layout role="student"><StudentDashboard /></Layout>} />

          {/* Admin */}
          <Route path="/admin" element={<Layout role="admin"><AdminDashboard /></Layout>} />
          <Route path="/admin/analysis" element={<Layout role="admin"><AnalyzeFeedback /></Layout>} />

          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
