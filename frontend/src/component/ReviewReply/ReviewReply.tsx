import React, { useState } from 'react';
import { Input, Button, Card } from 'antd';
import { toast } from 'react-toastify';
import { replyReview } from '../../api/ReviewManagement';

interface ReviewReplyProps {
  reviewId: string;
  currentReply?: string;
  onReplyUpdated: () => void;
  onCancelReply?: () => void;
}

const ReviewReply: React.FC<ReviewReplyProps> = ({
  reviewId,
  currentReply = '',
  onReplyUpdated,
  onCancelReply,
}) => {
  const [replyContent, setReplyContent] = useState<string>(currentReply || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [isReplying, setIsReplying] = useState<boolean>(!Boolean(currentReply)); // Fix lỗi tự động mở ô nhập lại sau khi Cancel

  const submitReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply content cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await replyReview({
        parentId: reviewId,
        content: replyContent.trim(),
      });

      toast.success('Reply sent successfully!');
      onReplyUpdated();
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setReplyContent(currentReply); // Reset nội dung
    setIsReplying(false);
    onCancelReply?.(); // Đặt về false để nhấn Reply một lần là hiển thị ngay
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {currentReply ? (
        <Card
          style={{
            background: '#f9f9f9',
            borderRadius: '8px',
            borderLeft: '4px solid #1890ff',
            padding: '12px',
            marginBottom: '12px',
          }}
        >
          <strong style={{ color: '#1890ff' }}>Owner Reply:</strong>
          <p style={{ margin: '6px 0', color: '#333' }}>{currentReply}</p>
        </Card>
      ) : null}

      {isReplying && (
        <>
          <Input.TextArea
            rows={3}
            placeholder="Enter your reply here..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            style={{
              borderRadius: '8px',
              borderColor: '#d9d9d9',
              padding: '10px',
              fontSize: '14px',
              marginTop: '10px',
            }}
          />
          <div style={{ marginTop: '10px', display: 'flex', gap: '16px' }}>
            <Button
              type="primary"
              onClick={submitReply}
              loading={loading}
              style={{
                borderRadius: '6px',
                padding: '8px 16px',
              }}
            >
              Send Reply
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading}
              style={{
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f',
                color: 'white',
                borderRadius: '6px',
                padding: '8px 16px',
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewReply;
