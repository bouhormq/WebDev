import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import CustomTooltip from './CustomTooltip';
import { MessageSquare, ShieldCheck, Search, Settings } from 'lucide-react';
import styles from './styles/HorizontalNavBar.module.css';

const HorizontalNavBar = () => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Open Forum', path: '/forum/open', icon: MessageSquare, requiresAuth: true },
    { name: 'Closed Forum', path: '/forum/closed', icon: ShieldCheck, requiresAuth: true, adminOnly: true },
    { name: 'Search', path: '/search', icon: Search, requiresAuth: true },
    { name: 'Admin Panel', path: '/admin', icon: Settings, requiresAuth: true, adminOnly: true },
  ];

  if (!currentUser?.isApproved && location.pathname !== '/' && !location.pathname.startsWith('/profile')) {
    return null; 
  }

  return (
    <nav className={styles.navBar}>
      {navItems.map((item) => {
        if (item.adminOnly && !isAdmin) return null;

        return (
          <CustomTooltip key={item.name} text={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive: navLinkIsActive }) => 
                `${styles.navLink} ${navLinkIsActive ? styles.navLinkActive : ''} ${navLinkIsActive ? styles.activeNavIcon : ''}`
              }
            >
              <item.icon className={styles.icon} />
            </NavLink>
          </CustomTooltip>
        );
      })}
    </nav>
  );
};

export default HorizontalNavBar;