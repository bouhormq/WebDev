import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { LogOut, User, Settings, Search, MessageSquare, ShieldCheck } from 'lucide-react';

const Header = () => {
  const { isLoggedIn, logout, currentUser } = useAuth();

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    width: '100%',
    borderBottom: '1px solid var(--border-alpha)',
    backgroundColor: 'var(--background)',
  };
  const containerStyle = {
    display: 'flex',
    height: '3.5rem',
    maxWidth: '64rem',
    alignItems: 'center',
    margin: '0 auto',
    padding: '0 1rem',
  };
  const iconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' };
  const buttonContainerStyle = { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <span style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: '600', fontSize: '1.375rem', color: '#2D3748', verticalAlign: 'middle' }}>Organizasso</span>

        <div style={buttonContainerStyle}>
          {isLoggedIn ? (
            <>
              {currentUser && (
                <Button asChild variant="outline" size="sm" style={{ marginRight: '0.5rem' }}>
                  <NavLink
                    to={`/profile/${currentUser._id || currentUser.id}`}
                    style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', height: '2.25rem' }}
                  >
                    <User style={iconStyle} /> My Profile
                  </NavLink>
                </Button>
              )}
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut style={iconStyle} /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" variant="default">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
