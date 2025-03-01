import React, { useState, useEffect } from 'react';
import { Input, Button, Card } from 'antd';
import { toast } from 'react-toastify';
import { replyReview, getReplyContent } from '../../api/ReviewManagement';

interface ReviewReplyProps {
  reviewId: string;
  onReplyUpdated: () => void;
}

const ReviewReply: React.FC<ReviewReplyProps> = ({
  reviewId,
  onReplyUpdated,
}) => {
  const [replyContent, setReplyContent] = useState<string>('');
  const [isReplied, setIsReplied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // useEffect(() => {
  //   const fetchReply = async () => {
  //     try {
  //       const response = await getReplyContent(reviewId);
  //       console.log('Fetched Reply:', response); // Kiểm tra response
  //       if (response && response.content) {
  //         setReplyContent(response.content);
  //         setIsReplied(true);
  //       } else {
  //         setReplyContent('');
  //         setIsReplied(false);
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch reply:', error);
  //     }
  //   };

  //   fetchReply();
  // }, [reviewId]);

  const submitReply = async () => {
    setLoading(true);
    try {
      const response = await replyReview({
        parentId: reviewId,
        content: replyContent.trim(), // Content will still be trimmed, but no check for emptiness
      });

      console.log('API Response:', response);
      toast.success('Reply sent successfully!');

      setIsReplied(true);
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {isReplied ? (
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
          <p style={{ margin: '6px 0', color: '#333' }}>{replyContent}</p>
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
