import React from 'react';
import MessageItem from '../Forum/MessageItem';
import { format, parseISO } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import styles from './styles/SearchResults.module.css'; // Import CSS module

const SearchResults = ({ results, currentUserId, searchParams }) => {

  const highlightKeywords = (text, keywords) => {
    if (!keywords || !text || typeof text !== 'string') return text;
    const escapedKeywords = keywords.trim().split(/\s+/).map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!escapedKeywords) return text;
    const regex = new RegExp(`(${escapedKeywords})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (typeof part !== 'string') return null;
      // Apply class to mark tag
      return regex.test(part) ? <mark key={index} className={styles.highlight}>{part}</mark> : part;
    }).filter(Boolean);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      console.warn(`Failed to parse date string: ${dateString}`, error);
      return dateString;
    }
  };

  const buildDescription = () => {
    let desc = `Found ${results.length} message${results.length !== 1 ? 's' : ''}`;
    if (searchParams?.keywords) desc += ` matching keywords: "${searchParams.keywords}"`;
    if (searchParams?.author) desc += `${searchParams.keywords ? ';' : ''} by author: "${searchParams.author}"`;
    if (searchParams?.startDate || searchParams?.endDate) {
      const start = searchParams.startDate ? formatDate(searchParams.startDate) : '';
      const end = searchParams.endDate ? formatDate(searchParams.endDate) : '';
      desc += `${searchParams.keywords || searchParams.author ? ';' : ''} within date range: `;
      if (start && end) desc += `${start} - ${end}`;
      else if (start) desc += `from ${start}`;
      else if (end) desc += `until ${end}`;
    }
    return desc + '.';
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Search Results</div>
      {searchParams && (
        <div className={styles.description}>{buildDescription()}</div>
      )}
      {results.length === 0 ? (
        <div className={styles.emptyResults}>
          <p>No messages found matching your criteria.</p>
        </div>
      ) : (
        <div className={styles.resultsListContainer}>
          {results.map((message, index) => (
            <React.Fragment key={message._id}>
              <MessageItem
                message={{
                  ...message,
                  content: highlightKeywords(message.content, searchParams?.keywords) || message.content,
                }}
                isOwnMessage={message.authorId === currentUserId}
                onDelete={null} // Assuming onDelete is intentionally null for search results
              />
              {index < results.length - 1 && <Separator className={styles.separator} />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
