import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import CustomTooltip from './CustomTooltip';
import { MessageSquare, ShieldCheck, Search, Settings, User } from 'lucide-react';

const HorizontalNavBar = () => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Open Forum', path: '/forum/open', icon: MessageSquare, requiresAuth: true },
    { name: 'Closed Forum', path: '/forum/closed', icon: ShieldCheck, requiresAuth: true, adminOnly: true },
    { name: 'Search', path: '/search', icon: Search, requiresAuth: true },
    { name: 'Admin Panel', path: '/admin', icon: Settings, requiresAuth: true, adminOnly: true },
  ];

  const navBarStyle = {
    backgroundColor: 'var(--card-background, #ffffff)',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1rem',
    borderBottom: '1px solid var(--border-alpha, #e5e7eb)',
    position: 'sticky',
    top: '3.5rem',
    zIndex: 40,
  };

  const navLinkStyle = (isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.5rem',
    color: isActive ? 'var(--primary-color, #007bff)' : 'var(--muted-foreground, #6c757d)',
    textDecoration: 'none',
    borderRadius: '0.375rem',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
  });

  const iconStyle = {
    width: '1.5rem',
    height: '1.5rem',
  };

  if (!currentUser?.isApproved && location.pathname !== '/' && !location.pathname.startsWith('/profile')) {
    return null; 
  }

  return (
    <nav style={navBarStyle}>
      {navItems.map((item) => {
        if (item.adminOnly && !isAdmin) return null;
        if (item.needsCurrentUser && (!currentUser?._id && !currentUser?.id)) return null;

        const isActive = item.name === 'My Profile' 
          ? location.pathname.startsWith('/profile') 
          : location.pathname === item.path;

        return (
          <CustomTooltip key={item.name} text={item.name}>
            <NavLink
              to={item.path}
              style={navLinkStyle(isActive)}
              className={({ isActive }) => isActive ? 'active-nav-icon' : ''}
            >
              <item.icon style={iconStyle} />
            </NavLink>
          </CustomTooltip>
        );
      })}
    </nav>
  );
};

export default HorizontalNavBar; 