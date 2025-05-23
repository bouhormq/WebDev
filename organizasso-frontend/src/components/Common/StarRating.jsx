import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import styles from './styles/StarRating.module.css';

const StarRating = ({ totalLikes }) => {
  const MAX_STARS = 5;

  const fullStars = Math.floor(totalLikes / 2);
  const hasHalfStar = totalLikes % 2 === 1 && fullStars < MAX_STARS;
  
  const stars = [];

  // Full Stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className={`${styles.starIcon} ${styles.fullStar}`} />);
  }

  // Half Star
  if (hasHalfStar) {
    stars.push(<StarHalf key="half" className={`${styles.starIcon} ${styles.halfStar}`} />);
  }

  // Empty Stars
  const emptyStarsCount = MAX_STARS - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStarsCount; i++) {
    stars.push(<Star key={`empty-${i}`} className={`${styles.starIcon} ${styles.emptyStar}`} />);
  }

  return <div className="flex items-center space-x-1">{stars}</div>;
};

export default StarRating;
