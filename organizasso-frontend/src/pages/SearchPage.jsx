import { useState, useEffect } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import SearchForm from '../components/Search/SearchForm';
import SearchResults from '../components/Search/SearchResults';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { searchMessages } from '../services/searchService';
import { CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert and AlertDescription
import styles from './styles/SearchPage.module.css'; // Import the new CSS module

const SearchPage = () => {
  const { currentUser } = useAuth();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchParams, setLastSearchParams] = useState(null);

  useEffect(() => {
    document.title = 'Search | Organizasso';
  }, []);

  const handleSearch = async (searchParams) => {
    const backendParams = {
      query: searchParams.keywords,
      author: searchParams.author,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    };

    setIsLoading(true);
    setError(null);
    setResults(null); // Keep as null to distinguish from empty results array
    setLastSearchParams(searchParams);

    // Frontend validation: Prevent API call if keywords are empty and no other criteria are set
    if (!backendParams.query && !backendParams.author && !backendParams.startDate && !backendParams.endDate) {
      toast.info("Please enter keywords or specify other search criteria.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("SearchPage: Performing search with params:", backendParams);
      const searchResults = await searchMessages(backendParams);
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
      toast.error("Search Error", { description: message });
      setResults([]); // Set to empty array on error to clear previous results
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerDiv}>
          <h1 className={styles.h1Style}>
            <span role="img" aria-label="forum">🔍</span> Search Messages 
          </h1>
          <p className={styles.pMuted}>Find messages by keyword, author, or date range.</p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        <Separator className={styles.separator} />

        {/* Conditional rendering for loading, error, results, or initial state */}
        {isLoading ? (
          <div className={styles.spinnerContainer}>
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Alert className={styles.errorAlert}>
            <AlertDescription className={styles.errorAlertDesc}>{error}</AlertDescription>
          </Alert>
        ) : results !== null ? ( // results is not null, meaning a search has been attempted
          <SearchResults 
            results={results} 
            currentUserId={currentUser?._id}
            searchParams={lastSearchParams} 
          />
        ) : ( 
          // Initial state: results is null (no search performed yet)
          <div className={styles.initialMessageContainer}>
            <CardTitle className={styles.initialTitleStyle}>Start Searching</CardTitle>
            <p className={styles.pMuted}>Enter your query above to find messages.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default SearchPage;
