import { useState, useEffect } from "react";
import { Empty, List, Typography, Rate, Progress, Button } from "antd";
import ReviewCard from "../../../component/ReviewCard/ReviewCard";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";

import { getReviewByBhId } from "../../../api/ownerUser/boardingHouseAPI";

const { Text } = Typography;

const ReviewList = ({
  reviews,
  onReport,
  setReviewId,
  reportedReviews,
  fetchReviews,
  boardingHouse,
  onPageChange,
  onLoadMore,
  loading,
  hasMore,
}) => {
  const [rating, setRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { darkMode } = useTheme();
  const { t } = useTranslation("boardingHouseDetail");

  // Fetch review counts when component mounts
  useEffect(() => {
    const fetchReviewCounts = async () => {
      try {
        // Fetch ALL reviews to calculate rating distribution
        const response = await getReviewByBhId(boardingHouse._id, {
          currentPage: 1,
          limit: 1000, // Get all reviews for statistics
        });
        const allReviews = response.data;

        // Calculate rating counts
        const counts = allReviews.reduce((acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        }, {});

        // Calculate average rating
        const totalRating = allReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating =
          allReviews.length > 0 ? totalRating / allReviews.length : 0;

        setRatingCounts(counts);
        setRating(averageRating);
      } catch (error) {
        console.error("Error fetching review counts:", error);
      }
    };

    if (boardingHouse?._id) {
      fetchReviewCounts();
    }
  }, [boardingHouse?._id]);

  // Add handleLoadMore function
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error("Error loading more reviews:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

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

  // List of ratings from 5 to 1
  const allRatings = [5, 4, 3, 2, 1];
  // Update LoadMoreButton component
  const LoadMoreButton = () => {
    // Hiển thị thông báo khi đã tải hết reviews
    if (!hasMore || reviews?.length === 1) {
      return (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {t?.("reviewList.allReviewsLoaded") || "All reviews loaded"}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center mt-10 mb-6">
        <Button
          onClick={onLoadMore}
          loading={isLoadingMore}
          size="large"
          className={`
            group relative px-10 py-4 h-auto font-semibold text-2xl
            rounded-xl shadow-lg hover:shadow-xl
            transform transition-all duration-300 ease-out
            hover:scale-105 active:scale-95
            ${
              darkMode
                ? `bg-gradient-to-r from-blue-600 to-blue-700 
                 hover:from-blue-700 hover:to-blue-800 
                 text-white border-0 shadow-blue-500/25 hover:shadow-blue-500/40`
                : `bg-gradient-to-r from-blue-500 to-blue-600 
                 hover:from-blue-600 hover:to-blue-700 
                 text-white border-0 shadow-blue-500/30 hover:shadow-blue-500/50`
            }
            disabled:transform-none disabled:shadow-md disabled:opacity-70
          `}
          disabled={isLoadingMore}
        >
          <div className="flex items-center space-x-3">
            {isLoadingMore ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t?.("reviewList.loading") || "Loading..."}</span>
              </>
            ) : (
              <>
                <span>{t?.("reviewList.loadMore") || "Load More Reviews"}</span>
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </>
            )}
          </div>

          {/* Hiệu ứng shine */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
        </Button>
      </div>
    );
  };

  return (
    <div className={`lg:mx-52 mx-0 ${darkMode ? "text-white" : ""}`}>
      <div className="flex flex-wrap flex-1 justify-center sm:justify-start my-16 items-center gap-10">
        <div className="flex items-center mb-4">
          <Progress
            type="circle"
            strokeColor={"#40BFFF"}
            percent={rating * 20}
            size={200}
            format={() => (
              <span className={darkMode ? "text-white" : ""}>
                {rating.toFixed(1)}/5
              </span>
            )}
            className={darkMode ? "dark-progress" : ""}
            styles={
              darkMode
                ? {
                    trail: { stroke: "#1f2937" },
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
              <Rate disabled defaultValue={star} className="md:text-5xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className={darkMode ? "review-list-dark" : ""}>
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
          className={darkMode ? "ant-list-dark" : ""}
        />

        {/* Load More Button */}
        <LoadMoreButton />
      </div>

      {/* CSS for dark mode */}
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

          .ant-list-dark .ant-list-item {
            border-bottom-color: #374151;
          }
        `}</style>
      )}
    </div>
  );
};

export default ReviewList;
