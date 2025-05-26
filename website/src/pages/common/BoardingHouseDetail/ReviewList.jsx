import { useState, useEffect } from "react";
import { Empty, List, Typography, Rate, Progress } from "antd";
import ReviewCard from "../../../component/ReviewCard/ReviewCard";
import { useTheme } from "@/context/ThemeContext"; // Import useTheme context
import { useTranslation } from "react-i18next"; // Import i18n nếu cần

const { Text } = Typography;

const ReviewList = ({
  reviews,
  onReport,
  setReviewId,
  reportedReviews,
  fetchReviews,
  boardingHouse,
}) => {
  const [rating, setRating] = useState(0);
  const { darkMode } = useTheme(); // Sử dụng darkMode từ context
  const { t } = useTranslation("boardingHouseDetail"); // Thêm i18n nếu cần

  useEffect(() => {
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;
      setRating(averageRating);
    } else {
      setRating(0);
    }
  }, [reviews]);

  if (!reviews || reviews.length === 0) {
    return (
      <Empty
        description={
          <span className={darkMode ? "text-white" : ""}>
            {t?.("reviewList.noReviewsYet") || "There are no reviews yet."}
          </span>
        }
        className={darkMode ? "text-white" : ""}
      />
    );
  }

  // Calculate the number of reviews per rating
  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  // List of ratings from 5 to 1
  const allRatings = [5, 4, 3, 2, 1];

  return (
    <div className={`lg:mx-52 mx-0 ${darkMode ? "text-white" : ""}`}>
      <div className="flex flex-wrap flex-1 justify-center sm:justify-start my-16 items-center gap-10">
        <div className="flex items-center mb-4">
          <Progress
            type="circle"
            strokeColor={"#40BFFF"} // Giữ nguyên màu xanh cho cả dark mode và light mode
            percent={rating * 20}
            size={200}
            format={() => (
              <span className={darkMode ? "text-white" : ""}>
                {rating.toFixed(1)}/5
              </span>
            )}
            // Thêm style cho darkmode
            className={darkMode ? "dark-progress" : ""}
            // Thêm trường styles để tùy chỉnh màu nền trong dark mode
            styles={
              darkMode
                ? {
                    trail: { stroke: "#1f2937" }, // Màu nền đậm hơn cho dark mode
                  }
                : {}
            }
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          {allRatings.map((star) => (
            <div key={star} className="flex mt-3 gap-3 items-center">
              <Text
                className={`md:w-16 md:text-4xl ${
                  darkMode ? "text-white" : ""
                }`}
              >
                {ratingCounts[star] || 0}
              </Text>
              <Rate
                disabled
                defaultValue={star}
                className="md:text-5xl"
                // Không cần thay đổi màu cho Rate vì mặc định sẽ là màu vàng
              />
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      <List
        dataSource={reviews}
        renderItem={(review) => (
          <ReviewCard
            key={review._id}
            reviewData={review}
            onReport={onReport}
            setReviewId={setReviewId}
            reviewId={review._id}
            isReported={reportedReviews.includes(review._id)}
            onReviewUpdated={fetchReviews}
            boardingHouse={boardingHouse}
          />
        )}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          // Thêm style cho pagination trong dark mode
          className: darkMode ? "ant-pagination-dark" : "",
        }}
        // Thêm className cho List trong dark mode
        className={darkMode ? "review-list-dark" : ""}
      />

      {/* Thêm CSS inline cho các thành phần dark mode của Ant Design */}
      {darkMode && (
        <style jsx global>{`
          .ant-pagination-dark .ant-pagination-item {
            background-color: #1f2937;
            border-color: #374151;
          }

          .ant-pagination-dark .ant-pagination-item a {
            color: #e5e7eb;
          }

          .ant-pagination-dark .ant-pagination-item-active {
            background-color: #3b82f6;
            border-color: #3b82f6;
          }

          .ant-pagination-dark .ant-pagination-item-active a {
            color: white;
          }

          .ant-pagination-dark .ant-pagination-prev button,
          .ant-pagination-dark .ant-pagination-next button {
            color: #e5e7eb;
            background-color: #1f2937;
            border-color: #374151;
          }

          .review-list-dark .ant-list-empty-text {
            color: #e5e7eb;
          }

          .dark-progress .ant-progress-text {
            color: #e5e7eb;
          }
        `}</style>
      )}
    </div>
  );
};

export default ReviewList;
