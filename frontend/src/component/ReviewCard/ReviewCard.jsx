import React, { useState } from 'react';
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
  Upload,
  Tooltip,
  Divider,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-regular-svg-icons';

import {
  faEdit,
  faTrash,
  faBookmark as faBookmarkSolid,
  faBookmark as faBookmarkRegular,
  faFlag as faFlagSolid,
  faEllipsisV,
  faReply,
} from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  updateReview,
  updateReviewImage,
  deleteReviewUser,
} from '../../api/ReviewManagement';
import { toast } from 'react-toastify';
import { useCurrentUser } from '../../context/userContext';
import ReviewReply from '../ReviewReply/ReviewReply';

dayjs.extend(relativeTime);
dayjs.locale('en');

const MAX_IMAGES = 5;
const MAX_DESCRIPTION_LENGTH = 150;

const ReviewCard = ({
  reviewData,
  onReviewUpdated,
  onReport,
  setReviewId,
  isReported,
  boardingHouse,
}) => {
  if (!reviewData) return null;

  const {
    accountId = {},
    content = '',
    rating,
    images = [],
    updatedAt,
    _id: reviewIdProp,
  } = reviewData;

  const [newContent, setNewContent] = useState(content);
  const [newRating, setNewRating] = useState(rating);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newImages, setNewImages] = useState(
    images.map((img) => ({ ...img, isDeleted: false }))
  );
  const [newFiles, setNewFiles] = useState([]);

  const formattedRelativeTime = updatedAt
    ? dayjs(updatedAt).fromNow()
    : 'undefined';
  const { user } = useCurrentUser();
  const isCurrentUserReview = user?._id === accountId?._id;
  const isLoggedIn = Boolean(user);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const isOwner = user?._id === boardingHouse?.ownerId._id;
  const hasReply = Boolean(reviewData?.replyContent);
  const [isReplying, setIsReplying] = useState(false);

  const handleRemoveImage = (index) => {
    setNewImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, isDeleted: true } : img))
    );
  };

  const handleRemoveFile = (file) => {
    setNewFiles((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const uploadProps = {
    multiple: true,
    beforeUpload: (file) => {
      file.uid = file.uid || `${file.name}-${new Date().getTime()}`;
      setNewFiles((prev) => [...prev, file]);
      return false;
    },
    onRemove: handleRemoveFile,
    fileList: newFiles.map((file) => ({
      uid: file.uid,
      name: file.name,
      status: 'done',
      url: URL.createObjectURL(file),
    })),
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const uploadedImageUrls = [];
      for (const file of newFiles) {
        const imageData = await updateReviewImage(file);
        if (imageData?.imageUrl) {
          uploadedImageUrls.push(imageData.imageUrl);
        } else {
          throw new Error(`Failed to upload image: ${file.name}`);
        }
      }

      const allImageUrls = [
        ...newImages
          .filter((img) => !img.isDeleted && img.imageUrl)
          .map((img) => img.imageUrl),
        ...uploadedImageUrls,
      ];

      await updateReview(reviewIdProp, {
        content: newContent.trim() === '' ? null : newContent.trim(),
        rating: newRating,
        images: allImageUrls.map((imageUrl) => ({ imageUrl })),
      });

      setIsModalVisible(false);
      toast.success('Review updated successfully!');
      onReviewUpdated();
    } catch (error) {
      console.error('Failed to update review:', error);
      toast.error(error.response.data.message || 'Failed to update review.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this review?',
      okText: 'Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoadingDelete(true);
        try {
          await deleteReviewUser(reviewIdProp);
          toast.success('Review deleted successfully.');
          onReviewUpdated();
        } catch (error) {
          console.error('Error deleting review:', error);
          toast.error('Failed to delete review.');
        } finally {
          setLoadingDelete(false);
        }
      },
    });
  };

  const handleReport = () => {
    setReviewId(reviewIdProp);
    onReport();
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewFiles([]);
    setNewImages(images.map((img) => ({ ...img, isDeleted: false })));
  };
  const handleReply = () => {
    console.log('Opening reply form...');
    setIsReplying((prev) => !prev); // Toggle trạng thái
  };

  const menu = (
    <Menu>
      {isLoggedIn && isCurrentUserReview && (
        <>
          <Menu.Item key="edit" onClick={showModal}>
            <FontAwesomeIcon icon={faEdit} className="text-blue-500 text-xl" />
            <span className="ml-2">Update</span>
          </Menu.Item>
          <Menu.Item
            key="delete"
            onClick={handleDelete}
            disabled={loadingDelete}
          >
            <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
            <span className="ml-2">Delete</span>
          </Menu.Item>
        </>
      )}

      {(!isLoggedIn || !isCurrentUserReview) && (
        <Menu.Item key="report" onClick={handleReport} disabled={isReported}>
          <Tooltip
            placement="left"
            title={
              isReported
                ? 'You have reported this review. Please wait for admin to process.'
                : 'Report this review'
            }
          >
            <FontAwesomeIcon
              icon={isReported ? faFlagSolid : faFlag}
              className="text-red-500 text-xl"
            />
            <span className="ml-2">Report</span>
          </Tooltip>
        </Menu.Item>
      )}
      {isOwner && (
        <>
          <Menu.Item key="reply" onClick={handleReply}>
            <Tooltip
              placement="left"
              title={
                hasReply
                  ? 'You have replied to this review.'
                  : 'Reply to this review'
              }
            >
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faReply}
                  className={`text-xl ${
                    hasReply ? 'text-blue-500' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`ml-2 ${
                    hasReply ? 'text-gray-400 opacity-50' : 'text-black'
                  }`}
                >
                  {hasReply ? 'Replied' : 'Reply'}
                </span>
              </div>
            </Tooltip>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
  console.log('Review Data:', reviewData);

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type="text">
            <FontAwesomeIcon icon={faEllipsisV} className="text-gray-600" />
          </Button>
        </Dropdown>
      </div>
      <Card.Meta
        avatar={<Avatar src={accountId?.avatarImage?.url} size="large" />}
        title={accountId?.fullname || 'Anonymous'}
        description={
          <>
            <Rate disabled value={rating} />
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              {dayjs(updatedAt).fromNow()}
            </div>
          </>
        }
      />

      <p style={{ marginTop: 10, color: '#595959', textAlign: 'justify' }}>
        {content.length <= MAX_DESCRIPTION_LENGTH
          ? content
          : `${content.substring(0, MAX_DESCRIPTION_LENGTH)}... `}
      </p>

      {images.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '10px',
          }}
        >
          {images.map((image, index) => (
            <Image
              key={index}
              src={image.imageUrl}
              width={100}
              height={100}
              style={{ objectFit: 'cover', borderRadius: '8px' }}
            />
          ))}
        </div>
      )}
      {isReplying && (
        <ReviewReply
          reviewId={reviewIdProp}
          currentReply={reviewData?.replyContent}
          onReplyUpdated={onReviewUpdated}
        />
      )}
      {hasReply && (
        <ReviewReply
          reviewId={reviewIdProp}
          currentReply={reviewData?.replyContent}
          onReplyUpdated={onReviewUpdated}
        />
      )}

      <Divider className="border-gray-700" />

      <Modal
        title={
          <span style={{ color: '#333', fontSize: 20, fontWeight: 'bold' }}>
            Update Review
          </span>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleUpdate}
          >
            Update
          </Button>,
        ]}
      >
        <h2 style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
          Description
        </h2>
        <Input.TextArea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Enter your updated review"
          rows={4}
        />
        <h2
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            marginTop: 16,
            marginBottom: 10,
          }}
        >
          Rating
        </h2>
        <Rate
          value={newRating}
          onChange={(value) => setNewRating(value)}
          style={{ marginBottom: '16px' }}
        />
        <div className="flex flex-col">
          <div className="flex flex-col mb-4">
            <h2
              style={{
                fontWeight: 'bold',
                fontSize: 16,
                marginTop: 16,
                marginBottom: 10,
              }}
            >
              Your Review Image
            </h2>
            <div className="flex flex-wrap">
              {newImages.map(
                (image, index) =>
                  !image.isDeleted && (
                    <div
                      key={index}
                      className="relative group ml-4 "
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: '8px',
                      }}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={`Image ${index + 1}`}
                        style={{
                          width: 96,
                          height: 96,
                        }}
                        preview={{
                          mask: (
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                type="button"
                                className="bg-white border border-red-600 text-red-600 text-sm rounded-full shadow-md hover:bg-red-600 hover:text-white transition-colors duration-300 flex items-center justify-center w-8 h-8"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          ),
                        }}
                      />
                    </div>
                  )
              )}
            </div>
          </div>
          <div className="flex">
            <Upload {...uploadProps} listType="picture-card">
              {newFiles.length +
                newImages.filter((img) => !img.isDeleted).length <
                MAX_IMAGES && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default ReviewCard;
