import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';

const NotFoundPage = () => {
  return (
    <PageWrapper>
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go to Home</Link>
    </PageWrapper>
  );
};

export default NotFoundPage;
