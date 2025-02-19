import { Empty, List, Typography, Rate, Progress } from "antd";
import ReviewCard from "../../../component/ReviewCard/ReviewCard";
import { getReviewsUser } from "../../../api/ReviewManagement";
const { Text } = Typography;

const ReviewList = ({
  reviews,
  rating,
  onReport,
  setReviewId,
  reportedReviews,
}) => {
  if (!reviews || reviews.length === 0) {
    return <Empty description="There are no reviews yet." />;
  }
  const handleReviewUpdated = async () => {
    try {
      const updatedReviews = await getReviewsUser();
      setReviewsId(updatedReviews);
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  const allRatings = [5, 4, 3, 2, 1];

  return (
    <div className="mx-52">
      <div className="flex flex-wrap flex-1 my-16 items-center gap-10">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Progress
            type="circle"
            strokeColor={"#40BFFF"}
            percent={rating * 20}
            size={200}
            format={() => `${rating.toFixed(1)}/5`}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          {allRatings.map((star) => (
            <div key={star} className="flex mt-3 items-center">
              <Text className="md:w-16 md:text-4xl">
                {ratingCounts[star] || 0}
              </Text>
              <Rate disabled defaultValue={star} className="md:text-5xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách review */}
      <List
        dataSource={reviews}
        renderItem={(review) => (
          <ReviewCard
            onReviewUpdated={handleReviewUpdated}
            key={review._id}
            reviewData={review}
            onReport={onReport}
            setReviewId={setReviewId}
            reviewId={review._id}
            isReported={reportedReviews.includes(review._id)}
          />
        )}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default ReviewList;
