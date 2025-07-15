import React, { useState } from "react";
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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag } from "@fortawesome/free-regular-svg-icons";

import {
  faEdit,
  faTrash,
  faBookmark as faBookmarkSolid,
  faBookmark as faBookmarkRegular,
  faFlag as faFlagSolid,
  faEllipsisV,
  faReply,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  updateReview,
  updateReviewImage,
  deleteReviewUser,
} from "../../api/reviewAPI";
import { toast } from "react-toastify";
import { useCurrentUser } from "../../context/userContext";
import ReviewReply from "../ReviewReply/ReviewReply";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";

import userRoles from "@/constants/userRole";

dayjs.extend(relativeTime);

const MAX_IMAGES = 5;
const MAX_DESCRIPTION_LENGTH = 100;

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
    content = "",
    rating,
    images = [],
    updatedAt,
    _id: reviewIdProp,
  } = reviewData;

  const { hasRole } = useCurrentUser();
  const isOwner = hasRole(userRoles.owner);

  const [newContent, setNewContent] = useState(content);
  const [newRating, setNewRating] = useState(rating);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newImages, setNewImages] = useState(
    images.map((img) => ({ ...img, isDeleted: false }))
  );
  const [newFiles, setNewFiles] = useState([]);

  const { t, i18n } = useTranslation("boardingHouseDetail");
  const { darkMode } = useTheme();
  const currentLanguage = i18n.language;
  dayjs.locale(currentLanguage);

  const formattedRelativeTime = updatedAt
    ? dayjs(updatedAt).fromNow()
    : "undefined";
  const { user } = useCurrentUser();
  const isCurrentUserReview = user?._id === accountId?._id;
  const isLoggedIn = Boolean(user);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const isOwnerBH = user?._id === boardingHouse?.ownerId?._id;
  const hasReply = Boolean(reviewData?.replyContent);
  const [isReplying, setIsReplying] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    return truncated.substring(0, truncated.lastIndexOf(" ")) + "...";
  };

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
      status: "done",
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
        content: newContent.trim() === "" ? null : newContent.trim(),
        rating: newRating,
        images: allImageUrls.map((imageUrl) => ({ imageUrl })),
      });

      setIsModalVisible(false);
      toast.success(t("reviewCard.updateSuccess"));
      onReviewUpdated();
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error(error.response.data.message || t("reviewCard.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t("reviewCard.confirmDelete"),
      content: t("reviewCard.deleteConfirmMessage"),
      okText: t("reviewCard.delete"),
      cancelText: t("reviewCard.cancel"),
      onOk: async () => {
        setLoadingDelete(true);
        try {
          await deleteReviewUser(reviewIdProp);
          toast.success(t("reviewCard.deleteSuccess"));
          onReviewUpdated();
        } catch (error) {
          console.error("Error deleting review:", error);
          toast.error(t("reviewCard.deleteFailed"));
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
    if (!hasReply) {
      setIsReplying((prev) => !prev);
    }
  };
  const handleCancelReply = () => {
    setIsReplying(false); // Close input immediately when cancel is clicked
  };

  const menu = (
    <Menu theme={darkMode ? "dark" : "light"}>
      {isLoggedIn && isCurrentUserReview && (
        <>
          <Menu.Item key="edit" onClick={showModal}>
            <FontAwesomeIcon icon={faEdit} className="text-blue-500 text-xl" />
            <span className="ml-2">{t("reviewCard.update")}</span>
          </Menu.Item>
          <Menu.Item
            key="delete"
            onClick={handleDelete}
            disabled={loadingDelete}
          >
            <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
            <span className="ml-2">{t("reviewCard.delete")}</span>
          </Menu.Item>
        </>
      )}

      {(!isLoggedIn || !isCurrentUserReview) && (
        <Menu.Item
          key="report"
          onClick={handleReport}
          disabled={isOwner || isReported}
        >
          <Tooltip
            placement="left"
            title={
              isReported
                ? t("reviewCard.alreadyReported")
                : t("reviewCard.reportReview")
            }
          >
            <FontAwesomeIcon
              icon={isReported ? faFlagSolid : faFlag}
              className="text-red-500 text-xl"
            />
            <span className="ml-2">{t("reviewCard.report")}</span>
          </Tooltip>
        </Menu.Item>
      )}
      {isOwnerBH && (
        <>
          <Menu.Item key="reply" onClick={handleReply}>
            <Tooltip
              placement="left"
              title={
                hasReply
                  ? t("reviewCard.alreadyReplied")
                  : t("reviewCard.replyToReview")
              }
            >
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faReply}
                  className={`text-xl ${hasReply ? "text-blue-500" : "text-gray-500"
                    }`}
                />
                <span
                  className={`ml-2 ${hasReply
                      ? darkMode
                        ? "text-gray-400 opacity-50"
                        : "text-gray-400 opacity-50"
                      : darkMode
                        ? "text-gray-200"
                        : "text-black"
                    }`}
                >
                  {hasReply ? t("reviewCard.replied") : t("reviewCard.reply")}
                </span>
              </div>
            </Tooltip>
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <Card
      style={{ marginBottom: 16 }}
      className={darkMode ? "bg-gray-800 text-white border-gray-700" : ""}
    >
      <div style={{ position: "absolute", top: 10, right: 10 }}>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button
            type="text"
            className={
              darkMode ? "text-gray-300 hover:text-white" : "text-gray-600"
            }
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </Button>
        </Dropdown>
      </div>
      <Card.Meta
        avatar={<Avatar src={accountId?.avatarImage?.url} size="large" />}
        title={
          <span className={darkMode ? "text-white" : ""}>
            {accountId?.fullname || t("reviewCard.anonymous")}
          </span>
        }
        description={
          <>
            <Rate disabled value={rating} />
            <div
              style={{ fontSize: "12px", marginTop: "4px" }}
              className={darkMode ? "text-gray-400" : "text-gray-500"}
            >
              {dayjs(updatedAt).fromNow()}
            </div>
          </>
        }
      />
      <p
        className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"
          } text-justify 
        ${isExpanded ? "max-h-[300px] overflow-auto" : "overflow-hidden"} 
        break-words leading-relaxed`}
      >
        {isExpanded ? content : content.slice(0, MAX_DESCRIPTION_LENGTH)}
        {content.length > MAX_DESCRIPTION_LENGTH && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 ml-1 cursor-pointer bg-none border-none"
          >
            {isExpanded ? t("reviewCard.showLess") : t("reviewCard.readMore")}
          </button>
        )}
      </p>

      {images.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "10px",
          }}
        >
          {images.map((image, index) => (
            <Image
              key={index}
              src={image.imageUrl}
              width={100}
              height={100}
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
          ))}
        </div>
      )}
      {(isReplying || hasReply) && (
        <ReviewReply
          reviewId={reviewIdProp}
          currentReply={reviewData?.replyContent || {}}
          replyId={reviewData?.replyContent?._id}
          onReviewUpdated={onReviewUpdated}
          onCancelReply={handleCancelReply}
          isReplying={isReplying}
          setIsReplying={setIsReplying}
          isOwner={isOwner}
          darkMode={darkMode}
        />
      )}
      <Divider className={darkMode ? "border-gray-700" : "border-gray-200"} />
      <Modal
        title={
          <span
            style={{
              color: darkMode ? "#fff" : "#333",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {t("reviewCard.updateReview")}
          </span>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            {t("reviewCard.cancel")}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleUpdate}
          >
            {t("reviewCard.update")}
          </Button>,
        ]}
        className={darkMode ? "ant-modal-dark" : ""}
        // Adding custom styles for dark mode
        styles={
          darkMode
            ? {
              mask: { backgroundColor: "rgba(0, 0, 0, 0.65)" },
              content: {
                backgroundColor: "#1f2937",
                color: "#fff",
              },
            }
            : {}
        }
      >
        <h2
          style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}
          className={darkMode ? "text-white" : ""}
        >
          {t("reviewCard.description")}
        </h2>
        <Input.TextArea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={t("reviewCard.enterUpdatedReview")}
          rows={4}
          className={darkMode ? "bg-gray-700 text-white border-gray-600" : ""}
        />
        <h2
          style={{
            fontWeight: "bold",
            fontSize: 16,
            marginTop: 16,
            marginBottom: 10,
          }}
          className={darkMode ? "text-white" : ""}
        >
          {t("reviewCard.rating")}
        </h2>
        <Rate
          value={newRating}
          onChange={(value) => setNewRating(value)}
          style={{ marginBottom: "16px" }}
        />
        <div className="flex flex-col">
          <div className="flex flex-col mb-4">
            <h2
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginTop: 16,
                marginBottom: 10,
              }}
              className={darkMode ? "text-white" : ""}
            >
              {t("reviewCard.yourReviewImages")}
            </h2>
            <div className="flex flex-wrap">
              {newImages.map(
                (image, index) =>
                  !image.isDeleted && (
                    <div
                      key={index}
                      className="relative group ml-4"
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: "8px",
                      }}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={`${t("reviewCard.image")} ${index + 1}`}
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
                    <div style={{ marginTop: 8 }}>{t("reviewCard.upload")}</div>
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
