import React, { useState, useEffect } from 'react';
import { Input, Button, Card } from 'antd';
import { toast } from 'react-toastify';
import { replyReview } from '../../api/ReviewManagement';

interface ReviewReplyProps {
  reviewId: string;
  currentReply?: string; // Nhận phản hồi hiện tại nếu có
  onReplyUpdated: () => void;
}

const ReviewReply: React.FC<ReviewReplyProps> = ({
  reviewId,
  currentReply = '',
  onReplyUpdated,
}) => {
  const [replyContent, setReplyContent] = useState<string>(currentReply);
  const [loading, setLoading] = useState<boolean>(false);

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
      onReplyUpdated(); // Cập nhật lại review sau khi gửi phản hồi
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply. Please try again later.');
    } finally {
      setLoading(false);
    }
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
      ) : (
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
            }}
          />
          <Button
            type="primary"
            className="mt-2"
            onClick={submitReply}
            loading={loading}
            style={{
              marginTop: '10px',
              borderRadius: '6px',
              padding: '8px 16px',
            }}
          >
            Send Reply
          </Button>
        </>
      )}
    </div>
  );
};

export default ReviewReply;
