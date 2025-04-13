import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Spinner from '../Common/Spinner';

const ReplyForm = ({ threadId, onReplySubmit, isLoading }) => { // eslint-disable-line no-unused-vars
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    const success = await onReplySubmit(content);
    if (success) {
      setContent(''); // Clear form on successful submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
      <div>
        <Label htmlFor="reply-content" className="text-lg font-semibold">Post a Reply</Label>
        <Textarea 
          id="reply-content"
          placeholder="Type your reply here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          disabled={isLoading}
          className="mt-2"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? <Spinner /> : 'Post Reply'}
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
