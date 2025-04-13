import React from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import useAuth from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from 'react-router-dom';

const DashBoardPage = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <PageWrapper>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.username || 'User'}!
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Example Card for Open Forum */}
          <Card>
            <CardHeader>
              <CardTitle>Open Forum</CardTitle>
              <CardDescription>Discuss with all members.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/forum/open" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                Go to Open Forum
              </Link>
            </CardContent>
          </Card>

          {/* Example Card for Profile */}
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>View and manage your details.</CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser && (
                <Link to={`/profile/${currentUser.id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Go to My Profile
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Example Card for Closed Forum (Admin Only) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Closed Forum</CardTitle>
                <CardDescription>Admin-only discussions.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Link to="/forum/closed" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                   Go to Closed Forum
                </Link>
              </CardContent>
            </Card>
          )}
          
           {/* Example Card for Admin Panel (Admin Only) */}
           {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Manage users and settings.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Link to="/admin" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                   Go to Admin Panel
                </Link>
              </CardContent>
            </Card>
          )}

           {/* Example Card for Search */}
           <Card>
            <CardHeader>
              <CardTitle>Search Messages</CardTitle>
              <CardDescription>Find specific messages.</CardDescription>
            </CardHeader>
            <CardContent>
               <Link to="/search" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                 Go to Search
              </Link>
            </CardContent>
          </Card>

        </div>
        {/* TODO: Add more dashboard elements if needed */}
      </div>
    </PageWrapper>
  );
};

export default DashBoardPage;
