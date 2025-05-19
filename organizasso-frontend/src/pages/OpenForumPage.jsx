import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import ThreadList from '../components/Forum/ThreadList'; 
import NewThreadForm from '../components/Forum/NewThreadForm';
import { createThread, getOpenForumThreads } from '../services/forumService';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner'; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OpenForumPage = () => {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmittingThread, setIsSubmittingThread] = useState(false); // For new thread form loading state
  const [openThreadIds, setOpenThreadIds] = useState(new Set()); // Changed from selectedThreadId

  useEffect(() => {
    document.title = 'Open Forum | Organizasso';
  }, []);

  const fetchThreads = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('OpenForumPage: Fetching threads from API...');
        const fetchedThreads = await getOpenForumThreads();
        console.log('OpenForumPage: Raw fetched threads:', fetchedThreads);
        const formattedThreads = fetchedThreads.map(thread => ({
            ...thread,
            createdAt: thread.createdAt ? new Date(thread.createdAt) : null,
            lastPostTime: thread.lastReplyAt ? new Date(thread.lastReplyAt) : (thread.createdAt ? new Date(thread.createdAt) : null)
        }));
        setThreads(formattedThreads);
      } catch (err) {
        const message = err.message || "Failed to fetch open forum threads.";
        console.error(message, err);
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleCreateThread = async (values) => {
    setIsSubmittingThread(true);
    try {
      console.log("Submitting new thread:", values);
      const newThread = await createThread('open', values.title, values.content);
      toast.success(`Thread "${newThread.title}" created successfully!`);
      await fetchThreads(); // Refresh the thread list
    } catch (err) {
      const message = err.message || "Failed to create thread.";
      console.error("Thread creation failed:", err);
      toast.error(message);
    } finally {
      setIsSubmittingThread(false);
    }
  };

  const handleInlineThreadView = (threadId) => {
    setOpenThreadIds(prevOpenThreadIds => {
      const newOpenThreadIds = new Set(prevOpenThreadIds);
      if (newOpenThreadIds.has(threadId)) {
        newOpenThreadIds.delete(threadId);
      } else {
        newOpenThreadIds.add(threadId);
      }
      return newOpenThreadIds;
    });
  };

  // --- Inline Styles ---
  const h1Style = { fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.02em' };
  const pMutedStyle = { color: 'var(--muted-foreground)' };
  const listContainerStyle = { marginTop: '1rem', minHeight: '300px' };
  const centeredFlexStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' };
  const feedbackCardStyle = { width: '100%', maxWidth: '32rem', textAlign: 'center', padding: '1.5rem' };
  const errorTitleStyle = { fontSize: '1.25rem', fontWeight: 600, color: 'var(--destructive)' };
  const emptyTitleStyle = { fontSize: '1.125rem', fontWeight: 600 };
  const emptyContentStyle = {};
  // --- End Inline Styles ---

  return (
    <PageWrapper>
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        position: 'relative',
        zIndex: 0
      }}>
        <div>
          <h1 style={h1Style}>Open Forum</h1>
          <p style={pMutedStyle}>Discuss topics relevant to all members.</p>
        </div>
      </div>

      {/* New Thread Form */}
      <NewThreadForm onSubmit={handleCreateThread} isLoading={isSubmittingThread} />

      {/* Separator Line - Attempting full-width breakout */}
      <hr 
        style={{
          width: 'calc(100% + 2rem)', // Counteract 1rem padding on each side of mainStyle
          marginLeft: '-1rem',      // Pull left by 1rem
          marginRight: '-1rem',     // Pull right by 1rem (though width might handle this)
          marginTop: '2rem',
          marginBottom: '2rem',
          borderColor: 'var(--border)',
          borderWidth: '0 0 0.5px 0', // Only bottom border, if preferred for <hr>
          borderStyle: 'solid'
        }}
      />

      {/* Thread List */}
      <div style={listContainerStyle}>
        {isLoading && !isSubmittingThread ? (
          <div style={centeredFlexStyle}><Spinner size="lg" /></div>
        ) : error ? (
          <div style={centeredFlexStyle}>
            <Card style={feedbackCardStyle}>
              <CardHeader>
                <CardTitle style={errorTitleStyle}>Error Loading Forum</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={pMutedStyle}>{error}</p>
              </CardContent>
            </Card>
          </div>
        ) : threads.length > 0 ? (
          <ThreadList 
            threads={threads} 
            onThreadClick={handleInlineThreadView} 
            openThreadIds={openThreadIds}
          />
        ) : (
          <div style={centeredFlexStyle}>
            <Card style={feedbackCardStyle}>
              <CardHeader>
                <CardTitle style={emptyTitleStyle}>No Threads Yet</CardTitle>
              </CardHeader>
              <CardContent style={emptyContentStyle}>
                <p style={{ ...pMutedStyle, marginBottom: '1rem' }}>Be the first to start a discussion using the form above.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default OpenForumPage;
