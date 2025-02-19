import {
  Card,
  Avatar,
  Rate,
  Image,
  Button,
  Dropdown,
  Menu,
  Modal,
  Input,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { updateReview, deleteReview } from "../../api/ReviewManagement"; // Import API
import { toast } from "react-toastify";
dayjs.extend(relativeTime);
dayjs.locale("en");

const MAX_VISIBLE_IMAGES = 6;

const ReviewCard = ({ reviewData, onReviewUpdated }) => {
  if (!reviewData) return null;

  const { accountId = {}, content = "", rating, images = [], updatedAt, _id: reviewId } = reviewData;
  const [newContent, setNewContent] = useState(content);
  const [newRating, setNewRating] = useState(rating);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newImages, setNewImages] = useState(images);
  const [newFiles, setNewFiles] = useState([]);
  const formattedRelativeTime = updatedAt ? dayjs(updatedAt).fromNow() : "undefined";

  // 📝 Xử lý cập nhật review
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const uploadedImageUrls = [];

      // 1. Upload new images and get URLs
      for (const file of newFiles) {
        const imageData = await updateReviewImage(file);
        if (imageData && imageData.imageUrl) {
          uploadedImageUrls.push(imageData.imageUrl);
        } else {
          console.error("Unexpected response format:", imageData);
          throw new Error(`Failed to upload image: ${file.name}. Unexpected response format.`);
        }
      }

      // 2. Combine existing image URLs with newly uploaded URLs
      const allImageUrls = [...newImages.map(img => img.imageUrl), ...uploadedImageUrls];

      // 3. Update the review with content, rating, and all image URLs
      await updateReview(reviewId, {
        content: newContent,
        rating: newRating,
        images: allImageUrls.map(imageUrl => ({ imageUrl })), // Send as array of objects
      });

      setIsEditing(false);
      onReviewUpdated(); // Refresh reviews in parent
      toast.success("Review updated successfully!");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error(error.response?.data?.message || "Failed to update review.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    setNewFiles((prev) => ({
      ...prev,
      [file.uid]: file, // Store files by UID for easy access
    }));
    return false; // Prevent default upload behavior
  };

  const handleRemoveImage = (file) => {
    setNewFiles((prev) => {
      const updatedFiles = { ...prev };
      delete updatedFiles[file.uid];
      return updatedFiles;
    });
  };

  // 🗑️ Xử lý xóa mềm review
  const handleDelete = () => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa đánh giá này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteReview(reviewId);
          onReviewUpdated(); // Cập nhật UI
        } catch (error) {
          console.error("Lỗi khi xóa review:", error);
        }
      },
    });
  };
  const previewStyle = {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    margin: '4px',
    borderRadius: '4px'
  };
  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={() => setIsEditing(true)}>
        <FontAwesomeIcon icon={faEdit} className="text-blue-500 text-xl" />
        <span className="ml-2">Chỉnh sửa</span>
      </Menu.Item>
      <Menu.Item key="delete" onClick={handleDelete}>
        <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
        <span className="ml-2">Xóa</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Card style={{ marginBottom: 16, position: "relative" }} className="mx-auto">
        {/* Dropdown Menu ở góc trên phải */}
        {accountId?.fullname && accountId.fullname !== "Anonymous" && (
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
            <Dropdown overlay={menu} trigger={["click"]}>
              <Button type="text">
                <FontAwesomeIcon icon={faEllipsisV} className="text-gray-600" />
              </Button>
            </Dropdown>
          </div>
        )}


        <Card.Meta
          avatar={<Avatar src={accountId?.avatarImage?.url} size="large" />}
          title={accountId?.fullname || "Anonymous"}
          description={
            <>
              <Rate disabled value={rating} />
              <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                Đã viết: {formattedRelativeTime}
              </div>
            </>
          }
        />

        {/* Mô tả Review */}
        <p style={{ marginTop: 10, color: "#595959", textAlign: "justify" }}>{content}</p>

        {images.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
            {images.slice(0, MAX_VISIBLE_IMAGES).map((image, index) => (
              <Image
                key={index}
                src={image?.imageUrl}
                alt={`Review Image ${index + 1}`}
                width={100}
                height={100}
                style={{ objectFit: "cover", borderRadius: "8px" }}
              />
            ))}
          </div>
        )}
      </Card>

      {/* 🆕 Modal chỉnh sửa review */}
      <Modal
        title="Chỉnh sửa đánh giá"
        open={isEditing}
        onCancel={() => setIsEditing(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditing(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" loading={loading} onClick={handleUpdate}>
            Lưu
          </Button>,
        ]}
      >
        <p>Cập nhật đánh giá của bạn:</p>
        <Rate value={newRating} onChange={setNewRating} />
        <Input.TextArea
          rows={4}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default ReviewCard;
