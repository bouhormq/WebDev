import React from 'react';
import MessageItem from '../Forum/MessageItem'; // Reuse MessageItem
import { Link } from 'react-router-dom'; // Link to threads
import { format, parseISO } from 'date-fns'; // Import date-fns
import { Separator } from "@/components/ui/separator"; // Import Separator

const SearchResults = ({ results, currentUserId, searchParams }) => {

  // --- Inline Styles ---
  const markStyle = {
    backgroundColor: '#FEF08A', // bg-yellow-200
    borderRadius: '0.125rem', // rounded
    padding: '0 0.125rem', // px-0.5 py-0
    // dark:bg-yellow-700 lost
  };
  const containerStyle = { marginTop: '1.5rem', width: '100%' };
  const titleStyle = { fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' };
  const descStyle = { color: 'var(--muted-foreground)', marginBottom: '1rem', fontSize: '0.95rem' };
  const emptyDivStyle = { padding: '1.5rem', textAlign: 'center', color: 'var(--muted-foreground)' };
  // --- End Inline Styles ---

  // Function to highlight keywords (simple implementation)
  const highlightKeywords = (text, keywords) => {
    if (!keywords || !text || typeof text !== 'string') return text; // Ensure text is a string
    // Escape special regex characters in keywords
    const escapedKeywords = keywords.trim().split(/\s+/).map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!escapedKeywords) return text; // No keywords to highlight
    const regex = new RegExp(`(${escapedKeywords})`, 'gi');
    const parts = text.split(regex);

    // Ensure parts are strings or valid React elements before rendering
    return parts.map((part, index) => {
      if (typeof part !== 'string') return null; // Skip non-string parts if any somehow occur
      // Apply inline style to mark tag
      return regex.test(part) ? <mark key={index} style={markStyle}>{part}</mark> : part;
    }).filter(Boolean); // Filter out nulls
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'PPP'); // Format as Oct 20th, 2023
    } catch (error) {
      console.warn(`Failed to parse date string: ${dateString}`, error);
      return dateString; // Return original if parsing fails
    }
  };

  // Build description string
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
    <div style={containerStyle}>
      <div style={titleStyle}>Search Results</div>
      {searchParams && (
        <div style={descStyle}>{buildDescription()}</div>
      )}
      {results.length === 0 ? (
        <div style={emptyDivStyle}>
          <p>No messages found matching your criteria.</p>
        </div>
      ) : (
        <div>
          {results.map((message, index) => (
            <React.Fragment key={message._id}>
              <MessageItem
                message={{
                  ...message,
                  content: highlightKeywords(message.content, searchParams?.keywords) || message.content,
                }}
                isOwnMessage={message.authorId === currentUserId}
                onDelete={null}
              />
              {index < results.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
