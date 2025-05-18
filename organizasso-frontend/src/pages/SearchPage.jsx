import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import SearchForm from '../components/Search/SearchForm';
import SearchResults from '../components/Search/SearchResults';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { searchMessages } from '../services/searchService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SearchPage = () => {
  const { currentUser } = useAuth();
  const [results, setResults] = useState(null); // null: initial, []: no results, [...]: results
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchParams, setLastSearchParams] = useState(null);

  useEffect(() => {
    document.title = 'Search | Organizasso';
  }, []);

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

      // Ensure createdAt is a Date object for MessageItem/SearchResults formatting
      const formattedResults = searchResults.map(msg => ({
          ...msg,
          _id: msg._id,
          createdAt: msg.createdAt ? new Date(msg.createdAt) : null
      }));

      setResults(formattedResults);
      if (formattedResults.length === 0) {
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

  // --- Inline Styles ---
  // space-y-6 lost
  const headerDivStyle = { marginBottom: '1.5rem' }; // mb-6
  const h1Style = { fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.02em' }; // text-3xl font-bold tracking-tight (sm size lost)
  const pMutedStyle = { color: 'var(--muted-foreground)' }; // text-muted-foreground
  const resultsContainerStyle = { marginTop: '1.5rem', minHeight: '200px' }; // mt-6 min-h-[200px]
  const centeredFlexStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' };
  const feedbackCardStyle = { width: '100%', maxWidth: '32rem', textAlign: 'center', padding: '1.5rem' }; // w-full max-w-md text-center p-6
  const errorTitleStyle = { fontSize: '1.25rem', fontWeight: 600, color: 'var(--destructive)' }; // text-xl font-semibold text-destructive
  const initialCardStyle = { ...feedbackCardStyle, borderStyle: 'dashed' }; // border-dashed
  const initialTitleStyle = { fontSize: '1.125rem', fontWeight: 600 }; // text-lg font-semibold
  // --- End Inline Styles ---

  return (
    <PageWrapper>
      <div>
        <div style={headerDivStyle}>
          <h1 style={h1Style}>Search Messages</h1>
          <p style={pMutedStyle}>Find messages by keyword, author, or date range.</p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        <div style={resultsContainerStyle}>
          {isLoading ? (
            <div style={centeredFlexStyle}><Spinner size="lg" /></div>
          ) : error ? (
            <div style={centeredFlexStyle}>
              <Card style={feedbackCardStyle}>
                <CardHeader>
                  <CardTitle style={errorTitleStyle}>Search Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={pMutedStyle}>{error}</p>
                </CardContent>
              </Card>
            </div>
          ) : results !== null ? (
            <SearchResults 
              results={results} 
              currentUserId={currentUser?._id}
              searchParams={lastSearchParams} 
            />
          ) : ( 
            <div style={centeredFlexStyle}>
              <Card style={initialCardStyle}>
                <CardHeader>
                  <CardTitle style={initialTitleStyle}>Start Searching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={pMutedStyle}>Enter your search criteria above to find messages.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default SearchPage;
