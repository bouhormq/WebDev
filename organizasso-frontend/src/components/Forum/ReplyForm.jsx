import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Spinner from '../Common/Spinner';
import { Send, Paperclip } from 'lucide-react';
import styles from './styles/ReplyForm.module.css'; // Import the CSS module

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

  const fileInputId = `reply-image-upload-${threadId}-${parentId || 'root'}`;

  return (
    <form onSubmit={handleSubmit} className={styles.formStyle}>
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
          className={styles.textareaStyle}
        />
      </div>

      <div className={styles.fileInputContainerStyle}>
        <Label htmlFor={fileInputId} className={styles.fileInputLabelStyle}>
          <Paperclip className={styles.paperclipIcon} />
          Attach Image (Optional)
          {fileName && <span className={styles.fileNameStyle}>{fileName}</span>}
        </Label>
        <Input
          type="file"
          id={fileInputId}
          accept="image/*"
          className={styles.hiddenFileInputStyle}
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

      <div className={styles.buttonDivStyle}>
        <Button type="submit" disabled={isLoading || content.trim().length < 10} size="sm">
          {isLoading ? <Spinner size="sm" className={styles.spinnerStyle}/> : <Send className={styles.iconStyle} />}
          Post Reply
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
