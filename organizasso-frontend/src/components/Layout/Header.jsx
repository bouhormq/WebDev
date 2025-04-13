import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Header = () => {
  const { isLoggedIn, isAdmin, logout, currentUser } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    cn(
      navigationMenuTriggerStyle(),
      isActive ? "bg-accent text-accent-foreground" : "",
      "text-sm font-medium"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          {/* <Icons.logo className="h-6 w-6" /> Can add logo later */}
          <span className="font-bold sm:inline-block">
            Organiz'asso
          </span>
        </Link>
        <NavigationMenu className="hidden md:flex flex-grow">
          <NavigationMenuList>
            {isLoggedIn && currentUser?.isApproved && (
              <>
                <NavigationMenuItem>
                  <NavLink to="/dashboard" className={navLinkClasses}>
                    Dashboard
                  </NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink to="/forum/open" className={navLinkClasses}>
                    Open Forum
                  </NavLink>
                </NavigationMenuItem>
                {isAdmin && (
                  <NavigationMenuItem>
                    <NavLink to="/forum/closed" className={navLinkClasses}>
                      Closed Forum
                    </NavLink>
                  </NavigationMenuItem>
                )}
                 <NavigationMenuItem>
                  <NavLink to="/search" className={navLinkClasses}>
                    Search
                  </NavLink>
                </NavigationMenuItem>
                {isAdmin && (
                  <NavigationMenuItem>
                    <NavLink to="/admin" className={navLinkClasses}>
                      Admin Panel
                    </NavLink>
                  </NavigationMenuItem>
                )}
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {isLoggedIn ? (
            <>
              {currentUser && (
                 <NavLink 
                   to={`/profile/${currentUser.id}`} 
                   className={cn(navLinkClasses({ isActive: false }), "hidden sm:inline-flex")} // Basic styling for profile link
                 >
                    My Profile
                  </NavLink>
              )}
              <Button onClick={logout} variant="outline" size="sm">Logout</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                 <Link to="/login">Login</Link>
              </Button>
               <Button asChild size="sm">
                 <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
        {/* Add Mobile Menu button here later */}
      </div>
    </header>
  );
};

export default Header;
