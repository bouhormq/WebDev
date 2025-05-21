import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Spinner from '../Common/Spinner';
import { Send, Paperclip } from 'lucide-react';

const ReplyForm = ({ threadId, parentId = null, onReplySubmit, isLoading }) => {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[ReplyForm] handleSubmit called"); // Debug log
    console.log("[ReplyForm] isLoading:", isLoading); // Debug log
    console.log("[ReplyForm] content.trim().length:", content.trim().length); // Debug log

    if (isLoading || content.trim().length === 0) {
      console.log("[ReplyForm] Submission blocked: isLoading or empty content"); // Debug log
      return;
    }

    const success = await onReplySubmit(content, parentId, imageFile);
    if (success) {
      setContent(''); // Clear form on successful submission
      setImageFile(null);
      setFileName('');
      const fileInput = document.getElementById(`reply-image-upload-${threadId}-${parentId || 'root'}`);
      if (fileInput) fileInput.value = '';
    }
  };

  // --- Inline Styles ---
  const formStyle = { padding: '1.5rem' };
  const textareaStyle = { marginTop: '0.25rem', resize: 'vertical', minHeight: '80px' };
  const buttonDivStyle = { display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' };
  const iconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' };
  const spinnerStyle = { ...iconStyle };
  const fileInputContainerStyle = { marginTop: '0.75rem' };
  const fileInputLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#555',
    fontSize: '0.9rem',
    padding: '0.25rem 0',
  };
  const hiddenFileInputStyle = {
    display: 'none',
  };
  const fileNameStyle = {
    marginLeft: '0.5rem',
    fontStyle: 'italic',
    color: '#333',
  };
  // --- End Inline Styles ---

  const fileInputId = `reply-image-upload-${threadId}-${parentId || 'root'}`;

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
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

      <div style={fileInputContainerStyle}>
        <Label htmlFor={fileInputId} style={fileInputLabelStyle}>
          <Paperclip style={{ ...iconStyle, marginRight: '0.25rem' }} />
          Attach Image (Optional)
          {fileName && <span style={fileNameStyle}>{fileName}</span>}
        </Label>
        <Input
          type="file"
          id={fileInputId}
          accept="image/*"
          style={hiddenFileInputStyle}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              setFileName(file.name);
            } else {
              setImageFile(null);
              setFileName('');
            }
          }}
          disabled={isLoading}
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
