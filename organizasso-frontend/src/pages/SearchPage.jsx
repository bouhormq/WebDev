import React, { useState } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import SearchForm from '../components/Search/SearchForm';
import SearchResults from '../components/Search/SearchResults';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { searchMessages } from '../services/searchService';

const SearchPage = () => {
  const { currentUser } = useAuth();
  const [results, setResults] = useState(null); // null: initial, []: no results, [...]: results
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchParams, setLastSearchParams] = useState(null);

  const handleSearch = async (searchParams) => {
    // Rename keywords to query for backend compatibility
    const backendParams = {
      query: searchParams.keywords, // Map frontend 'keywords' to backend 'query'
      author: searchParams.author, // Author search is TODO on backend
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    };

    setIsLoading(true);
    setError(null);
    setResults(null);
    setLastSearchParams(searchParams); // Store original frontend params for display

    try {
      console.log("SearchPage: Performing search with params:", backendParams);
      const searchResults = await searchMessages(backendParams);

      // TODO: Fetch author usernames if backend doesn't provide them
      // For now, results will lack authorName unless backend changes

      setResults(searchResults);
      if (searchResults.length === 0) {
         toast.info("No messages found matching your criteria.");
      }
    } catch (err) {
      const message = err.message || "Failed to perform search.";
      console.error("Search failed:", err);
      setError(message);
      toast.error(message);
      setResults([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Search Messages</h2>
        
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && <div className="flex justify-center pt-8"><Spinner /></div>}
        
        {error && <p className="text-destructive text-center pt-8">Error: {error}</p>}
        
        {results !== null && !isLoading && (
          <SearchResults 
            results={results} 
            currentUserId={currentUser?._id} // Use _id from MongoDB
            searchParams={lastSearchParams} 
          />
        )}
        
        {results === null && !isLoading && !error && ( 
          <p className="text-muted-foreground text-center pt-8">Enter search criteria above to find messages.</p>
        )}
      </div>
    </PageWrapper>
  );
};

export default SearchPage;
