import React from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import useAuth from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DashBoardPage = () => {
  const { currentUser, isAdmin } = useAuth();

  // --- Inline Styles ---
  // space-y-4 lost
  const h2Style = { fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.02em', marginBottom: '1rem' }; // text-3xl font-bold tracking-tight (added margin)
  const pStyle = { color: 'var(--muted-foreground)', marginBottom: '1rem' }; // text-muted-foreground (added margin)
  // grid layout lost, using flex wrap fallback
  const cardContainerStyle = { display: 'flex', flexWrap: 'wrap', gap: '1rem' }; // gap-4
  // --- End Inline Styles ---

  return (
    <PageWrapper>
      {/* space-y-4 lost */}
      <div>
        <h2 style={h2Style}>Dashboard</h2>
        <p style={pStyle}>
          Welcome back, {currentUser?.username || 'User'}!
        </p>

        {/* grid layout lost */}
        <div style={cardContainerStyle}>
          {/* Open Forum Card */}
          <Card style={{ flexBasis: 'calc(33.33% - 1rem)' }}> {/* Approx lg:col-span-1 */}
            <CardHeader>
              <CardTitle>Open Forum</CardTitle>
              <CardDescription>Discuss with all members.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link to="/forum/open">Go to Open Forum</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card style={{ flexBasis: 'calc(33.33% - 1rem)' }}> {/* Approx lg:col-span-1 */}
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>View and manage your details.</CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser && (
                <Button asChild size="sm">
                  <Link to={`/profile/${currentUser._id || currentUser.id}`}>Go to My Profile</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Closed Forum Card (Admin Only) */}
          {isAdmin && (
            <Card style={{ flexBasis: 'calc(33.33% - 1rem)' }}> {/* Approx lg:col-span-1 */}
              <CardHeader>
                <CardTitle>Closed Forum</CardTitle>
                <CardDescription>Admin-only discussions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm">
                  <Link to="/forum/closed">Go to Closed Forum</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Panel Card (Admin Only) */}
          {isAdmin && (
            <Card style={{ flexBasis: 'calc(33.33% - 1rem)' }}> {/* Approx lg:col-span-1 */}
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Manage users and settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm">
                  <Link to="/admin">Go to Admin Panel</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Search Card */}
          <Card style={{ flexBasis: 'calc(33.33% - 1rem)' }}> {/* Approx lg:col-span-1 */}
            <CardHeader>
              <CardTitle>Search Messages</CardTitle>
              <CardDescription>Find specific messages.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link to="/search">Go to Search</Link>
              </Button>
            </CardContent>
          </Card>

        </div>
        {/* TODO: Add more dashboard elements if needed */}
      </div>
    </PageWrapper>
  );
};

export default DashBoardPage;
