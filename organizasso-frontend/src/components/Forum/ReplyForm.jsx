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

  // --- Inline Styles ---
  const formStyle = { padding: '1.5rem' }; // p-6 (space-y-4 lost)
  const textareaStyle = { marginTop: '0.25rem', resize: 'vertical', minHeight: '80px' }; // mt-1 resize-y min-h-[80px]
  const buttonDivStyle = { display: 'flex', justifyContent: 'flex-end' }; // flex justify-end
  const iconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' }; // mr-2 h-4 w-4
  const spinnerStyle = { ...iconStyle }; // mr-2 h-4 w-4
  // --- End Inline Styles ---

  return (
    // space-y-4 was on form, would need margin on children
    <form onSubmit={handleSubmit} style={formStyle}>
      {/* Add marginBottom to simulate space-y-4 */}
      <div style={{ marginBottom: '1rem' }}>
        <Textarea
          id="reply-content"
          placeholder="Type your reply here... (min 10 characters)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          minLength={10}
          rows={4}
          disabled={isLoading}
          style={textareaStyle}
        />
      </div>
      <div style={buttonDivStyle}>
        <Button type="submit" disabled={isLoading || content.trim().length < 10} size="sm">
          {isLoading ? <Spinner size="sm" style={spinnerStyle}/> : <Send style={iconStyle} />}
          Post Reply
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
