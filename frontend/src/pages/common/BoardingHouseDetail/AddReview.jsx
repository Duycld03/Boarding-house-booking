import React, { useState } from "react";
import { Modal, Upload, Button, Rate, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { updateReviewImage, addReview } from "../../../api/ReviewManagement"; // Import addReview
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from '../../../context/userContext';
const { TextArea } = Input;

const AddReview = ({ visible, onClose, onSubmit, boardingHouseId }) => {
    const [reviewData, setReviewData] = useState({
        content: "",
        rating: 0,
        imageUrls: [],
        files: [],
    });
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    const { user } = useCurrentUser();
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
        if (!user) {
            message.error("You must be logged in to write a review.");
            return navigate("/login");
        }
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
            title={<span className="font-bold text-4xl">Rating and Review</span>}
            visible={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            okText={uploading ? "Uploading..." : "Submit"}
            confirmLoading={uploading}
            className="font-bold mb-10 text-4xl"
        >
            <p className=" mb-2 mt-6 text-2xl">Rating </p>
            <Rate value={reviewData.rating} onChange={(value) => handleChange("rating", value)} />
            <p className=" mb-2 mt-6 text-2xl">Desciption </p>

            <TextArea
                rows={4}
                placeholder="Write your review here..."
                value={reviewData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                className="mt-4"
            />
            <p className=" mb-2 mt-6 text-2xl">Images </p>

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