import React, { useState } from 'react';
import { Input, Button, Card } from 'antd';
import { toast } from 'react-toastify';

interface ReviewReplyProps {
  currentReply?: string;
}

const ReviewReply: React.FC<ReviewReplyProps> = ({ currentReply = '' }) => {
  const [replyContent, setReplyContent] = useState<string>(currentReply);
  const [isReplied, setIsReplied] = useState<boolean>(!!currentReply); // Kiểm tra nếu đã có phản hồi

  const submitReply = () => {
    if (!replyContent.trim()) return;
    toast.success('Reply sent successfully!');
    setIsReplied(true); // Giả lập đã gửi phản hồi
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
