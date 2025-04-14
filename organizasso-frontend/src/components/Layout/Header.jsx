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
import { LogOut, User, Settings, Search, MessageSquare, ShieldCheck } from 'lucide-react';

const Header = () => {
  const { isLoggedIn, isAdmin, logout, currentUser } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    cn(
      navigationMenuTriggerStyle(),
      "h-9",
      isActive
        ? "bg-accent text-accent-foreground"
        : "hover:bg-accent/50 hover:text-accent-foreground",
      "text-sm font-medium transition-colors"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-5xl items-center mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold sm:inline-block text-lg">
            Organiz'asso
          </span>
        </Link>

        {isLoggedIn && currentUser?.isApproved && (
            <NavigationMenu className="hidden md:flex flex-grow">
              <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavLink to="/forum/open" className={navLinkClasses}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Open Forum
                    </NavLink>
                  </NavigationMenuItem>
                  {isAdmin && (
                    <NavigationMenuItem>
                      <NavLink to="/forum/closed" className={navLinkClasses}>
                         <ShieldCheck className="mr-2 h-4 w-4" /> Closed Forum
                      </NavLink>
                    </NavigationMenuItem>
                  )}
                   <NavigationMenuItem>
                    <NavLink to="/search" className={navLinkClasses}>
                       <Search className="mr-2 h-4 w-4" /> Search
                    </NavLink>
                  </NavigationMenuItem>
                  {isAdmin && (
                    <NavigationMenuItem>
                      <NavLink to="/admin" className={navLinkClasses}>
                         <Settings className="mr-2 h-4 w-4" /> Admin Panel
                      </NavLink>
                    </NavigationMenuItem>
                  )}
              </NavigationMenuList>
            </NavigationMenu>
        )}

        <div className="flex flex-1 items-center justify-end space-x-2">
          {isLoggedIn ? (
            <>
              {currentUser && (
                 <NavLink 
                   to={`/profile/${currentUser._id}`} 
                   className={cn(navLinkClasses({ isActive: false }), "hidden sm:inline-flex items-center")}
                 >
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </NavLink>
              )}
              <Button onClick={logout} variant="outline" size="sm">
                 <LogOut className="mr-2 h-4 w-4" /> Logout
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
