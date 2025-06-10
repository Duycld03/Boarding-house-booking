import React, { useState } from "react";
import { Modal, Upload, Button, Rate, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { updateReviewImage, addReview } from "../../../api/reviewAPI";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../context/userContext";
const { TextArea } = Input;
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";

const AddReview = ({
  visible,
  onClose,
  onSubmit,
  boardingHouseId,
  onReport,
}) => {
  const [reviewData, setReviewData] = useState({
    content: "",
    rating: 0,
    imageUrls: [],
    files: [],
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { t } = useTranslation("boardingHouseDetail");
  const { darkMode } = useTheme();

  const handleChange = (key, value) => {
    setReviewData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (file) => {
    setReviewData((prev) => ({
      ...prev,
      files: [...prev.files, file],
    }));
    return false;
  };

  const handleRemoveImage = (fileToRemove) => {
    setReviewData((prev) => ({
      ...prev,
      files: prev.files.filter((file) => file.uid !== fileToRemove.uid),
      imageUrls: prev.imageUrls.filter(
        (url, index) => prev.files[index].uid !== fileToRemove.uid
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      message.error(t("addReview.loginRequired"));
      return navigate("/login");
    }
    if (reviewData.rating === 0) {
      return message.error(t("addReview.ratingRequired"));
    }

    setUploading(true);

    try {
      const uploadedImageUrls = [];

      for (const file of reviewData.files) {
        const imageData = await updateReviewImage(file);
        if (imageData && imageData.imageUrl) {
          uploadedImageUrls.push(imageData.imageUrl);
        } else {
          console.error("Unexpected response format:", imageData);
          throw new Error(
            `${t("addReview.uploadFailed")}: ${file.name}. ${t(
              "addReview.unexpectedFormat"
            )}`
          );
        }
      }

      const reviewDataToSend = {
        boardingHouseId,
        content: reviewData.content,
        rating: reviewData.rating,
        images: uploadedImageUrls.map((imageUrl) => ({ imageUrl })),
      };

      const reviewResponse = await addReview(reviewDataToSend);
      console.log("Response1:", reviewResponse.success);

      if (reviewResponse.success === true) {
        toast.success(t("addReview.successMessage"));

        setReviewData((prevState) => ({
          ...prevState,
          content: "",
          rating: 0,
          imageUrls: [],
          files: [],
        }));

        onClose();
        await onSubmit();
      } else {
        console.error("Add Review Error:", reviewResponse);
        message.error(
          reviewResponse?.data?.message || t("addReview.failedToAdd")
        );
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || t("addReview.failed"));
    } finally {
      setUploading(false);
    }
  };

  // Custom styles for dark mode
  const modalStyles = {
    header: {
      backgroundColor: darkMode ? "#1f1f1f" : "#fff",
      color: darkMode ? "#fff" : "#000",
    },
    body: {
      backgroundColor: darkMode ? "#1f1f1f" : "#fff",
      color: darkMode ? "#fff" : "#000",
    },
    footer: {
      backgroundColor: darkMode ? "#1f1f1f" : "#fff",
    },
    mask: {
      backgroundColor: darkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.45)",
    },
    closeIcon: {
      color: darkMode ? "#fff" : undefined,
    },
  };

  const textStyles = {
    color: darkMode ? "#fff" : "#000",
  };

  return (
    <Modal
      title={
        <span className="font-bold text-4xl" style={textStyles}>
          {t("addReview.title")}
        </span>
      }
      visible={visible}
      onCancel={onClose}
      onReport={onReport}
      onOk={handleSubmit}
      okText={uploading ? t("addReview.uploading") : t("addReview.submit")}
      cancelText={t("addReview.cancel")}
      confirmLoading={uploading}
      styles={modalStyles}
      className={darkMode ? "dark-mode-modal" : ""}
    >
      <p className="mb-2 mt-6 text-2xl font-bold" style={textStyles}>
        {t("addReview.ratingLabel")}
      </p>
      <Rate
        value={reviewData.rating}
        onChange={(value) => handleChange("rating", value)}
        className={darkMode ? "dark-rate" : ""}
      />
      <p className="mb-2 mt-6 text-2xl font-bold" style={textStyles}>
        {t("addReview.descriptionLabel")}
      </p>

      <TextArea
        rows={4}
        placeholder={t("addReview.reviewPlaceholder")}
        value={reviewData.content}
        onChange={(e) => handleChange("content", e.target.value)}
        className={`mt-4 ${darkMode ? "dark-textarea" : ""}`}
        style={
          darkMode
            ? {
                backgroundColor: "#2d2d2d",
                color: "#fff",
                borderColor: "#444",
              }
            : {}
        }
        placeholderStyle={
          darkMode ? { color: "rgba(255, 255, 255, 0.45)" } : {}
        }
      />
      <p className="mb-2 mt-6 text-2xl font-bold" style={textStyles}>
        {t("addReview.imagesLabel")}
      </p>

      <Upload
        listType="picture-card"
        multiple
        beforeUpload={handleImageUpload}
        onRemove={handleRemoveImage}
        className={darkMode ? "dark-upload" : ""}
      >
        {reviewData.files.length < 5 && (
          <div>
            <PlusOutlined style={darkMode ? { color: "#fff" } : {}} />
            <div
              style={{ marginTop: 8, ...(darkMode ? { color: "#fff" } : {}) }}
            >
              {t("addReview.upload")}
            </div>
          </div>
        )}
      </Upload>

      {/* Custom CSS for dark mode */}
      {darkMode && (
        <style jsx>{`
          .dark-mode-modal .ant-modal-content {
            background-color: #1f1f1f;
            color: #fff;
          }
          .dark-mode-modal .ant-modal-header {
            background-color: #1f1f1f;
            border-bottom: 1px solid #333;
          }
          .dark-mode-modal .ant-modal-title {
            color: #fff;
          }
          .dark-mode-modal .ant-modal-close {
            color: #fff;
          }
          .dark-mode-modal .ant-modal-close-x {
            color: rgba(255, 255, 255, 0.65);
          }
          .dark-mode-modal .ant-modal-close:hover .ant-modal-close-x {
            color: #fff;
          }
          .dark-mode-modal .ant-modal-footer {
            border-top: 1px solid #333;
          }
          .dark-textarea .ant-input {
            background-color: #2d2d2d;
            color: #fff;
            border-color: #444;
          }
          .dark-textarea .ant-input::placeholder {
            color: rgba(255, 255, 255, 0.45);
          }
          .dark-textarea .ant-input:focus {
            border-color: #177ddc;
            box-shadow: 0 0 0 2px rgba(23, 125, 220, 0.2);
          }
          .dark-upload .ant-upload-list-item {
            border-color: #444;
          }
          .dark-upload .ant-upload.ant-upload-select-picture-card {
            background-color: #2d2d2d;
            border-color: #444;
          }
          /* Star rating in dark mode */
          .dark-rate
            .ant-rate-star:not(.ant-rate-star-full)
            .ant-rate-star-first,
          .dark-rate
            .ant-rate-star:not(.ant-rate-star-full)
            .ant-rate-star-second {
            color: rgba(255, 255, 255, 0.25);
          }
          .dark-rate .ant-rate-star-first,
          .dark-rate .ant-rate-star-second {
            color: rgba(255, 255, 255, 0.45);
          }
          .dark-rate .ant-rate-star-full .ant-rate-star-first,
          .dark-rate .ant-rate-star-full .ant-rate-star-second {
            color: #fadb14;
          }
        `}</style>
      )}
    </Modal>
  );
};

export default AddReview;
