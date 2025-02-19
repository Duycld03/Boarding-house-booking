import React, { useState } from "react";
import { Modal, Input, Rate, Upload, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const AddReview = ({ visible, onClose, onSubmit, accountId, boardingHouseId }) => {
    const [reviewContent, setReviewContent] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [imageFiles, setImageFiles] = useState([]);

    // Xử lý upload hình ảnh
    const handleImageUpload = ({ file }) => {
        setImageFiles((prev) => [...prev, file]);
    };

    // Xóa hình ảnh đã chọn
    const handleRemoveImage = (fileToRemove) => {
        setImageFiles((prev) => prev.filter((file) => file.uid !== fileToRemove.uid));
    };

    // Xử lý submit review
    const handleSubmit = async () => {
        if (!reviewContent || reviewRating === 0) {
            message.error("Please fill out all fields before submitting the review.");
            return;
        }

        const formData = {
            boardingHouseId,
            content: reviewContent,
            rating: reviewRating,
            images: imageFiles,
        };

        await onSubmit(formData);
    };

    return (
        <Modal
            title="Write Your Review"
            visible={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            okText="Submit"
            cancelText="Cancel"
        >
            <div className="mb-4">
                <Rate
                    value={reviewRating}
                    onChange={(value) => setReviewRating(value)}
                />
            </div>
            <TextArea
                rows={4}
                placeholder="Write your review here..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="mb-4"
            />
            <Upload
                listType="picture-card"
                multiple
                beforeUpload={(file) => {
                    handleImageUpload({ file });
                    return false; // Ngăn tự động upload
                }}
                onRemove={handleRemoveImage}
            >
                {imageFiles.length < 5 && (
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                )}
            </Upload>
        </Modal>
    );
};

export default AddReview;