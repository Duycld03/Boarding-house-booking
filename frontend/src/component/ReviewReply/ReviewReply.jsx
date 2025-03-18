import React, { useState } from 'react';
import { Input, Button, Card } from 'antd';
import { toast } from 'react-toastify';
import { replyReview } from '../../api/ReviewManagement';

const MAX_LENGTH = 100;

const ReviewReply = ({
  reviewId,
  currentReply = '',
  onReviewUpdated,
  onCancelReply,
  isReplying,
  setIsReplying, // Nhận hàm từ ReviewCard
}) => {
  const [replyContent, setReplyContent] = useState(currentReply || '');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const submitReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply content cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await replyReview({ parentId: reviewId, content: replyContent.trim() });
      toast.success('Reply sent successfully!');
      onReviewUpdated();
      setIsReplying(false); // Ẩn ô nhập sau khi gửi thành công
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 max-w-full">
      {currentReply && (
        <Card className="bg-gray-100 rounded-lg border-l-4 border-blue-500 p-3 mb-3 max-w-full break-words">
          <strong className="text-blue-500">Owner Reply:</strong>
          <p className="mt-1 text-gray-800 text-justify break-words">
            {isExpanded ? currentReply : currentReply.slice(0, MAX_LENGTH)}
            {currentReply.length > MAX_LENGTH && (
              <>
                {!isExpanded && <span>...</span>}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-500 ml-2 hover:underline"
                >
                  {isExpanded ? 'See less' : 'See more'}
                </button>
              </>
            )}
          </p>
        </Card>
      )}

      {isReplying && (
        <>
          <Input.TextArea
            rows={3}
            placeholder="Enter your reply here..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="mt-2 rounded-lg border border-gray-300 p-2 text-sm w-full max-w-full"
            style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
          />
          <div className="mt-2 flex flex-wrap gap-4">
            <Button
              type="primary"
              onClick={submitReply}
              loading={loading}
              className="rounded-md px-4 py-2"
            >
              Send Reply
            </Button>
            <Button
              onClick={() => setIsReplying(false)}
              disabled={loading}
              className="bg-red-500 border-red-500 text-white rounded-md px-4 py-2"
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
