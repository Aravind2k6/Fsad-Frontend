import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PieChart, PlusCircle, LogOut, BookOpen, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const { currentUser } = useApp();

    const studentLinks = [
        { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={18} />, end: true },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} />, end: true },
        { name: 'Analytics', path: '/admin/analysis', icon: <PieChart size={18} /> },
    ];

    const links = role === 'student' ? studentLinks : adminLinks;
    const userLabel = role === 'student' ? 'Student' : 'Admin';

    // Dynamic user details
    const userName = (currentUser && currentUser.name) ? currentUser.name : (role === 'student' ? 'Student' : 'Admin User');
    const userInitial = userName && userName.length > 0 ? userName.charAt(0).toUpperCase() : (role === 'student' ? 'S' : 'A');

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon"><BookOpen size={18} color="#fff" strokeWidth={2.5} /></div>
                <span>EduFeedback</span>
            </div>

            {/* User card */}
            <div className="sidebar-user-card">
                <div className="sidebar-user-avatar">{userInitial}</div>
                <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{userName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)' }}>{userLabel} Account</div>
                </div>
            </div>

            <div className="sidebar-divider" />
            <p className="sidebar-section-label">Navigation</p>

            <nav className="nav-links">
                {links.map(link => (
                    <NavLink key={link.path} to={link.path} end={!!link.end}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        {link.icon}
                        <span style={{ flex: 1 }}>{link.name}</span>
                        <ChevronRight size={13} style={{ opacity: 0.4 }} />
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-divider" />
                <button onClick={() => navigate('/')} className="nav-link" style={{ color: 'var(--error)', width: '100%' }}>
                    <LogOut size={18} /><span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
