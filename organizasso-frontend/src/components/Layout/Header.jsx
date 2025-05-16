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
  const { isLoggedIn, isAdmin, logout, currentUser } = useAuth();

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    width: '100%',
    borderBottom: '1px solid var(--border-alpha)',
    backgroundColor: 'var(--background-alpha95)',
  };
  const containerStyle = {
    display: 'flex',
    height: '3.5rem',
    maxWidth: '64rem',
    alignItems: 'center',
    margin: '0 auto',
    padding: '0 1rem',
  };
  const logoLinkStyle = { marginRight: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' };
  const logoSpanStyle = { fontWeight: 'bold', fontSize: '1.125rem' };
  const navMenuStyle = { display: 'none' };
  const iconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' };
  const buttonContainerStyle = { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' };
  const profileButtonStyle = { display: 'none' };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <Link to="/" style={logoLinkStyle}>
          <span style={logoSpanStyle}>Organiz'asso</span>
        </Link>

        {isLoggedIn && currentUser?.isApproved && (
          <NavigationMenu style={navMenuStyle}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavLink to="/forum/open" style={{ display: 'flex', alignItems: 'center' }}>
                  <MessageSquare style={iconStyle} /> Open Forum
                </NavLink>
              </NavigationMenuItem>
              {isAdmin && (
                <NavigationMenuItem>
                  <NavLink to="/forum/closed" style={{ display: 'flex', alignItems: 'center' }}>
                    <ShieldCheck style={iconStyle} /> Closed Forum
                  </NavLink>
                </NavigationMenuItem>
              )}
              <NavigationMenuItem>
                <NavLink to="/search" style={{ display: 'flex', alignItems: 'center' }}>
                  <Search style={iconStyle} /> Search
                </NavLink>
              </NavigationMenuItem>
              {isAdmin && (
                <NavigationMenuItem>
                  <NavLink to="/admin" style={{ display: 'flex', alignItems: 'center' }}>
                    <Settings style={iconStyle} /> Admin Panel
                  </NavLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        <div style={buttonContainerStyle}>
          {isLoggedIn ? (
            <>
              {currentUser && (
                <Button asChild variant="ghost" size="sm" style={profileButtonStyle}>
                  <NavLink
                    to={`/profile/${currentUser._id || currentUser.id}`}
                    style={{ display: 'flex', alignItems: 'center' }}
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
