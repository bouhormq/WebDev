import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';
import { Button } from '@/components/ui/button';
import styles from './styles/NotFoundPage.module.css'; 

const NotFoundPage = () => {

  useEffect(() => {
    document.title = 'Page Not Found | Organizasso';
  }, []);

  return (
    <PageWrapper>
      <div className={styles.containerStyle}>
        <h2 className={styles.h2Style}>404</h2>
        <h3 className={styles.h3Style}>Page Not Found</h3>
        <p className={styles.pStyle}>Sorry, the page you are looking for does not exist or has been moved.</p>
        <Button asChild size="sm">
           <Link to="/forum/open">Go to Open Forum</Link>
        </Button>
      </div>
    </PageWrapper>
  );
};

export default NotFoundPage;
