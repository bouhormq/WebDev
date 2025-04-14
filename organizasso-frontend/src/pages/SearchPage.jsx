import React, { useState } from 'react';
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

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Search Messages</h1>
          <p className="text-muted-foreground">Find messages by keyword, author, or date range.</p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        <div className="mt-6 min-h-[200px]">
          {isLoading ? (
             <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>
          ) : error ? (
             <div className="flex justify-center items-center h-full">
               <Card className="w-full max-w-md text-center p-6">
                 <CardHeader>
                    <CardTitle className="text-xl font-semibold text-destructive">Search Error</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground">{error}</p>
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
             <div className="flex justify-center items-center h-full">
               <Card className="w-full max-w-md text-center p-6 border-dashed">
                 <CardHeader>
                    <CardTitle className="text-lg font-semibold">Start Searching</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground">Enter your search criteria above to find messages.</p>
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
