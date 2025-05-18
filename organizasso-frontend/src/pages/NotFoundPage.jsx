import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {

  useEffect(() => {
    document.title = 'Page Not Found | Organizasso';
  }, []);

  // --- Inline Styles ---
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '3rem 0', // py-12
    // minHeight calculation lost
    minHeight: 'calc(100vh - 14rem)', // Fallback height
  };
  const h2Style = { fontSize: '2.25rem', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--destructive)', marginBottom: '1rem' }; // text-4xl font-bold tracking-tight text-destructive mb-4
  const h3Style = { fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }; // text-2xl font-semibold mb-2
  const pStyle = { color: 'var(--muted-foreground)', marginBottom: '1.5rem' }; // text-muted-foreground mb-6
  // --- End Inline Styles ---

  return (
    <PageWrapper>
      <div style={containerStyle}>
        <h2 style={h2Style}>404</h2>
        <h3 style={h3Style}>Page Not Found</h3>
        <p style={pStyle}>Sorry, the page you are looking for does not exist or has been moved.</p>
        <Button asChild size="sm">
           <Link to="/forum/open">Go to Open Forum</Link>
        </Button>
      </div>
    </PageWrapper>
  );
};

export default NotFoundPage;
