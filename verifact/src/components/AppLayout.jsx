import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdvisoryBanner from './AdvisoryBanner';
import './AppLayout.css';

const Icon = ({ paths, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
)

const icons = {
  dashboard:    ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  upload:       ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  reports:      ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
  certificates: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3'],
  classes:      ['M22 10l-10-5-10 5 10 5 10-5z', 'M6 12v5c0 0 3 3 6 3s6-3 6-3v-5'],
  profile:      ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  home:         ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  chevronLeft:  ['M15 18l-6-6 6-6'],
  chevronRight: ['M9 18l6-6-6-6'],
  menu:         ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  x:            ['M18 6L6 18', 'M6 6l12 12'],
}

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard',    label: 'Dashboard',    icon: icons.dashboard },
    { path: '/upload',       label: 'Upload',       icon: icons.upload },
    { path: '/reports',      label: 'Reports',      icon: icons.reports },
    { path: '/certificates', label: 'Certificates', icon: icons.certificates },
    { path: '/classes',      label: 'Classes',      icon: icons.classes },
    { path: '/profile',      label: 'Profile',      icon: icons.profile },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => handleNav('/')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">V</div>
            <span className="brand-text">Verifact</span>
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Icon paths={sidebarOpen ? icons.chevronLeft : icons.chevronRight} size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="nav-icon"><Icon paths={item.icon} size={20} /></span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-footer-btn" onClick={() => { logout(); navigate('/'); }}>
            <span className="nav-icon"><Icon paths={icons.home} size={20} /></span>
            <span className="footer-label">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <div className="top-bar">
          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} style={{ background: 'none', color: '#64748B', marginRight: 'auto', padding: '4px' }}>
            <Icon paths={icons.menu} size={22} />
          </button>

          <div className="top-bar-greeting">
            {user?.full_name && <><strong>{user.full_name}</strong>&nbsp;</>}
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', background: '#F1F5F9', padding: '2px 10px', borderRadius: '100px', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <div className="top-bar-avatar">{user?.full_name?.[0]?.toUpperCase() || 'U'}</div>
        </div>

        <div className="content-area">
          <AdvisoryBanner />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
