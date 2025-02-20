import React, { useState } from "react";
import { Modal, Upload, Button, Rate, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { updateReviewImage, addReview } from "../../../api/ReviewManagement"; // Import addReview
import { toast } from "react-toastify";

const { TextArea } = Input;

const AddReview = ({ visible, onClose, onSubmit, boardingHouseId }) => {
    const [reviewData, setReviewData] = useState({
        content: "",
        rating: 0,
        imageUrls: [],
        files: [],
    });
    const [uploading, setUploading] = useState(false);

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
            imageUrls: prev.imageUrls.filter((url, index) => prev.files[index].uid !== fileToRemove.uid)
        }));
    };

    const handleSubmit = async () => {
        if (reviewData.rating === 0) {
            return message.error("Please provide rating before submitting.");
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
                    throw new Error(`Failed to upload image: ${file.name}. Unexpected response format.`);
                }
            }

            const reviewDataToSend = {
                boardingHouseId,
                content: reviewData.content,
                rating: reviewData.rating,
                images: uploadedImageUrls.map(imageUrl => ({ imageUrl })),
            };

            const reviewResponse = await addReview(reviewDataToSend);
            console.log("Response1:", reviewResponse.success);

            if (reviewResponse.success === true) {
                message.success("Review added successfully!");

                setReviewData(prevState => ({
                    ...prevState,
                    content: "",
                    rating: 0,
                    imageUrls: [],
                    files: []
                }));

                onClose();
                onSubmit();

            } else {
                console.error("Add Review Error:", reviewResponse);
                message.error(reviewResponse?.data?.message || "Failed to add review.");
            }

        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error(error.response.data?.message || "Failed");

        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal
            title="Write Your Review"
            visible={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            okText={uploading ? "Uploading..." : "Submit"}
            confirmLoading={uploading}
        >
            <Rate value={reviewData.rating} onChange={(value) => handleChange("rating", value)} />
            <TextArea
                rows={4}
                placeholder="Write your review here..."
                value={reviewData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                className="mt-4"
            />
            <Upload
                listType="picture-card"
                multiple
                beforeUpload={handleImageUpload}
                onRemove={handleRemoveImage}
            >
                {reviewData.files.length < 5 && (
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