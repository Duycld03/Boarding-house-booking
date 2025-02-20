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
  Upload
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { updateReview, updateReviewImage, deleteReviewUser } from "../../api/ReviewManagement";
import { toast } from "react-toastify";
import { useCurrentUser } from '../../context/userContext';
dayjs.extend(relativeTime);
dayjs.locale("en");

const MAX_IMAGES = 5;

const ReviewCard = ({ reviewData, onReviewUpdated }) => {
  if (!reviewData) return null;

  const { accountId = {}, content = "", rating, images = [], updatedAt, _id: reviewId } = reviewData;
  const [newContent, setNewContent] = useState(content);
  const [newRating, setNewRating] = useState(rating);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newImages, setNewImages] = useState(images);
  const [newFiles, setNewFiles] = useState({});
  const formattedRelativeTime = updatedAt ? dayjs(updatedAt).fromNow() : "undefined";
  const { user } = useCurrentUser();
  const isCurrentUserReview = user?._id === accountId?._id;
  const isLoggedIn = user !== null && user !== undefined;
  // Xử lý cập nhật review
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const uploadedImageUrls = [];

      for (const file of Object.values(newFiles)) {
        const imageData = await updateReviewImage(file);
        if (imageData?.imageUrl) {
          uploadedImageUrls.push(imageData.imageUrl);
        } else {
          throw new Error(`Fail to update image: ${file.name}`);
        }
      }

      // Cập nhật lại danh sách ảnh để không lưu ảnh bị xóa
      const allImageUrls = newImages
        .filter(img => !img.isPreview)
        .map(img => img.imageUrl)
        .concat(uploadedImageUrls);

      await updateReview(reviewId, {
        content: newContent.trim() === "" ? null : newContent.trim(),
        rating: newRating,
        images: allImageUrls.map(imageUrl => ({ imageUrl })),
      });


      setIsEditing(false);
      onReviewUpdated();
      toast.success("Update review successfull!");
    } catch (error) {
      console.error("Fail to update review:", error);
      toast.error(error.message || "Fail to update review.");
    } finally {
      setLoading(false);
    }
  };


  // Xử lý upload ảnh
  const handleImageUpload = (file) => {
    const totalImages = newImages.length;
    if (totalImages >= MAX_IMAGES) {
      toast.error(`You must upload maximum ${MAX_IMAGES} images.`);
      return false;
    }
    const previewUrl = URL.createObjectURL(file);
    setNewFiles(prev => ({
      ...prev,
      [file.uid]: file
    }));
    setNewImages(prev => [...prev, { imageUrl: previewUrl, isPreview: true }]);
    return false;
  };



  // Xóa ảnh cũ đã có trên server
  const handleRemoveImage = (imageUrl) => {
    setNewImages(prev => prev.filter(img => img.imageUrl !== imageUrl));

    setNewFiles(prev => {
      const updatedFiles = { ...prev };
      Object.keys(updatedFiles).forEach(key => {
        const fileObjectUrl = URL.createObjectURL(updatedFiles[key]);
        if (fileObjectUrl === imageUrl) {
          delete updatedFiles[key];
        }
      });
      return updatedFiles;
    });
  };


  // Xóa review
  const handleDelete = () => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this review?",
      okText: "Delete",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteReviewUser(reviewId);
          onReviewUpdated();
        } catch (error) {
          console.error("Error deleting review:", error);
        }
      },
    });
  };


  const menu = (
    <Menu>
      {isCurrentUserReview && (
        <Menu.Item key="edit" onClick={() => setIsEditing(true)}>
          <FontAwesomeIcon icon={faEdit} className="text-blue-500 text-xl" />
          <span className="ml-2">Update</span>
        </Menu.Item>
      )}
      <Menu.Item key="delete" onClick={handleDelete}>
        <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
        <span className="ml-2">Delete</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <>

      <Card style={{ marginBottom: 16, position: "relative" }}>
        {isCurrentUserReview && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
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
                Written: {formattedRelativeTime}
              </div>
            </>
          }
        />

        <p style={{ marginTop: 10, color: "#595959", textAlign: "justify" }}>{content}</p>

        {images.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
            {images.map((image, index) => (
              <Image key={index} src={image.imageUrl} width={100} height={100} style={{ objectFit: "cover", borderRadius: "8px" }} />
            ))}
          </div>
        )}
      </Card>

      {/* Modal chỉnh sửa review */}
      <Modal
        title="Update Review"
        open={isEditing}
        onCancel={() => setIsEditing(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={loading} onClick={handleUpdate}>
            Submit
          </Button>,
        ]}
      >
        <Rate value={newRating} onChange={setNewRating} />
        <Input.TextArea
          rows={4}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          style={{ marginBottom: 4 }}
        />


        <Upload
          listType="picture-card"
          fileList={newImages.map((img, index) => ({
            uid: index.toString(),
            name: `Image ${index + 1}`,
            url: img.imageUrl,
            thumbUrl: img.imageUrl
          }))}
          onRemove={(file) => handleRemoveImage(file.url)}
          beforeUpload={handleImageUpload}
        >
          {newImages.length >= MAX_IMAGES ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      </Modal>
    </>
  );
};

export default ReviewCard;
