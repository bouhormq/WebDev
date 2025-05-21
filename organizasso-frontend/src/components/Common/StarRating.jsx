import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ totalLikes }) => {
  const MAX_STARS = 5;

  const yellow400 = "rgb(250, 204, 21)"; // Tailwind's yellow-400: #facc15
  const gray400 = "rgb(156, 163, 175)";   // Tailwind's gray-400: #9ca3af

  // Assuming default 1rem = 16px, h-6/w-6 from Tailwind is 1.5rem = 24px
  const starStyle = { height: '30px', width: '30px' };

  const fullStars = Math.floor(totalLikes / 2);
  const hasHalfStar = totalLikes % 2 === 1 && fullStars < MAX_STARS;
  
  const stars = [];

  // Full Stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} style={starStyle} fill={yellow400} stroke={yellow400} />);
  }

  // Half Star
  if (hasHalfStar) {
    stars.push(<StarHalf key="half" style={starStyle} fill={yellow400} stroke={yellow400} />);
  }

  // Empty Stars
  const emptyStarsCount = MAX_STARS - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStarsCount; i++) {
    stars.push(<Star key={`empty-${i}`} style={starStyle} fill="none" stroke={gray400} />);
  }

  return <div className="flex items-center space-x-1">{stars}</div>;
};

export default StarRating;
