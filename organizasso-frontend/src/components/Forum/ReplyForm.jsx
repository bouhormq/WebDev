import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Spinner from '../Common/Spinner';
import { Send } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
      <div>
        <Textarea 
          id="reply-content"
          placeholder="Type your reply here... (min 10 characters)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          minLength={10}
          rows={4}
          disabled={isLoading}
          className="mt-1 resize-y min-h-[80px]"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || content.trim().length < 10} size="sm">
          {isLoading ? <Spinner size="sm" className="mr-2"/> : <Send className="mr-2 h-4 w-4" />}
          Post Reply
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
