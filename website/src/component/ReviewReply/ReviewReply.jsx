import React, { useState } from "react";
import { Input, Button, Card, Dropdown, Menu } from "antd";
import { toast } from "react-toastify";
import {
  replyReview,
  updateReplyReview,
  softDeleteReplyReview,
} from "../../api/ReviewManagement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { ConfirmModal } from "@/component";

const MAX_LENGTH = 100;

const ReviewReply = ({
  reviewId,
  replyId,
  currentReply = "",
  onReviewUpdated,
  isReplying,
  setIsReplying,
  isOwner,
}) => {
  const [replyContent, setReplyContent] = useState(currentReply || "");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // ✅ Xóa mềm reply
  const handleDeleteReply = async () => {
    if (!replyId) {
      toast.error("Reply ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const response = await softDeleteReplyReview(replyId);
      if (response.success) {
        toast.success("Reply deleted successfully.");
        onReviewUpdated();
      } else {
        toast.error(response.data?.message || "Failed to delete reply.");
      }
    } catch (error) {
      console.error("❌ Failed to delete reply:", error);
      toast.error(error.response?.data?.message || "Failed to delete reply.");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleUpdateReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Reply content cannot be empty.");
      return;
    }
    if (!replyId) {
      toast.error("Reply ID is missing.");
      return;
    }

    setLoading(true);
    try {
      await updateReplyReview({
        replyId,
        content: replyContent.trim(),
      });

      toast.success("Reply updated successfully!");
      onReviewUpdated();
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Failed to update reply:", error);
      toast.error(error.response?.data?.message || "Failed to update reply.");
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Reply content cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      await replyReview({ parentId: reviewId, content: replyContent.trim() });
      toast.success("Reply sent successfully!");
      onReviewUpdated();
      setIsReplying(false);
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast.error("Failed to send reply. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setReplyContent(currentReply);
      setIsEditing(false);
    } else {
      setReplyContent("");
      setIsReplying(false);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={() => setIsEditing(true)}>
        <FontAwesomeIcon icon={faEdit} className="text-blue-500 text-xl" />
        <span className="ml-2">Edit Reply</span>
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => setIsDeleteModalOpen(true)}>
        <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
        <span className="ml-2">Delete Reply</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="mt-2 max-w-full">
      {currentReply && !isEditing && (
        <Card className="bg-gray-100 rounded-lg border-l-4 border-blue-500 p-3 mb-3 max-w-full break-words">
          <div className="flex justify-between items-center">
            <strong className="text-blue-500">Owner Reply:</strong>
            {isOwner && (
              <div className="absolute top-0 right-0 mt-[-2px] mr-[-5px]">
                <Dropdown overlay={menu} trigger={["click"]}>
                  <Button type="text">
                    <FontAwesomeIcon
                      icon={faEllipsisV}
                      className="text-gray-600"
                    />
                  </Button>
                </Dropdown>
              </div>
            )}
          </div>
          <p className="mt-1 text-gray-800 text-justify break-words">
            {isExpanded
              ? currentReply
              : currentReply?.content?.slice(0, MAX_LENGTH)}
            {currentReply.length > MAX_LENGTH && (
              <>
                {!isExpanded && <span>...</span>}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-500 ml-2 hover:underline"
                >
                  {isExpanded ? "See less" : "See more"}
                </button>
              </>
            )}
          </p>
        </Card>
      )}

      {(isReplying || isEditing) && (
        <>
          <Input.TextArea
            rows={3}
            placeholder="Enter your reply here..."
            value={replyContent?.content}
            onChange={(e) => setReplyContent(e.target.value)}
            className="mt-2 rounded-lg border border-gray-300 p-2 text-sm w-full max-w-full"
            style={{
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
              height: "100px",
              fontSize: "16px",
            }}
          />
          <div className="mt-2 flex flex-wrap gap-4">
            <Button
              type="primary"
              onClick={isEditing ? handleUpdateReply : submitReply}
              loading={loading}
              className="rounded-md px-4 py-2"
            >
              {isEditing ? "Update Reply" : "Send Reply"}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading}
              className="bg-red-500 border-red-500 text-white rounded-md px-4 py-2"
            >
              Cancel
            </Button>
          </div>
        </>
      )}

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        title="Confirm Deletion"
        content="Are you sure you want to delete this reply?"
        onOk={handleDeleteReply}
        onCancel={() => setIsDeleteModalOpen(false)}
        isOpen={isDeleteModalOpen}
      />
    </div>
  );
};

export default ReviewReply;
