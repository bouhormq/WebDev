import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Button } from "@/components/ui/button";
import { LogOut, User } from 'lucide-react';
import styles from './styles/Header.module.css';

const Header = () => {
  const { isLoggedIn, logout, currentUser } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <span className={styles.logo}>Organizasso</span>

        <div className={styles.buttonContainer}>
          {isLoggedIn ? (
            <>
              {currentUser && (
                <Button asChild variant="outline" size="sm" style={{ marginRight: '0.5rem' }}>
                  <NavLink
                    to={`/profile/${currentUser._id || currentUser.id}`}
                    className={styles.profileLink}
                  >
                    <User className={styles.icon} /> My Profile
                  </NavLink>
                </Button>
              )}
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className={styles.icon} /> Logout
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
