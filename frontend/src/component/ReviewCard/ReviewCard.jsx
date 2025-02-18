import {
  Card,
  Avatar,
  Rate,
  Image,
  Button,
  Dropdown,
  Menu,
  Tooltip,
  Divider,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark as faBookmarkSolid,
  faBookmark as faBookmarkRegular,
  faFlag,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // Ngôn ngữ tiếng Việt

dayjs.extend(relativeTime);
dayjs.locale("en");

const MAX_VISIBLE_IMAGES = 6;
const MAX_DESCRIPTION_LENGTH = 150; // Giới hạn ký tự mô tả

const ReviewCard = ({ reviewData, onReport, setReviewId, reviewId }) => {
  if (!reviewData) return null;

  const {
    accountId = {},
    content = "",
    rating,
    images = [],
    updatedAt,
  } = reviewData;
  const [showAll, setShowAll] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const visibleImages = showAll ? images : images.slice(0, MAX_VISIBLE_IMAGES);
  const formattedRelativeTime = updatedAt
    ? dayjs(updatedAt).fromNow()
    : "undefined";

  const handleReport = () => {
    setReviewId(reviewId);
    onReport();
  };

  const menu = (
    <Menu>
      <Menu.Item key="report" onClick={handleReport}>
        <Tooltip placement="left" title="Report this review">
          <FontAwesomeIcon icon={faFlag} className="text-red-500 text-xl" />
          <span className="ml-2">Report</span>
        </Tooltip>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Card
        style={{
          marginBottom: 16,
          position: "relative",
        }}
        className="mx-auto"
      >
        {/* Dropdown Menu ở góc trên phải */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
          }}
        >
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button type="text">
              <FontAwesomeIcon icon={faEllipsisV} className="text-gray-600" />
            </Button>
          </Dropdown>
        </div>

        <Card.Meta
          avatar={<Avatar src={accountId?.avatarImage?.url} size="large" />}
          title={accountId?.fullname || "Anonymous"}
          description={
            <>
              <Rate disabled value={rating} />
              <div
                style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
              >
                Written: {formattedRelativeTime}
              </div>
            </>
          }
        />

        {/* Mô tả với hiệu ứng "Xem thêm" */}
        <p
          style={{
            marginTop: 10,
            color: "#595959",
            textAlign: "justify",
          }}
        >
          {showFullDescription || content.length <= MAX_DESCRIPTION_LENGTH
            ? content
            : `${content.substring(0, MAX_DESCRIPTION_LENGTH)}... `}
          {content.length > MAX_DESCRIPTION_LENGTH && (
            <Button
              type="link"
              onClick={() => setShowFullDescription(!showFullDescription)}
              style={{ padding: 0 }}
            >
              {showFullDescription ? "Hide" : "Show more"}
            </Button>
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
            className="md:max-w-[350px]"
          >
            {visibleImages.map((image, index) => (
              <Image
                key={index}
                src={image?.imageUrl}
                alt={`Review Image ${index + 1}`}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ))}
          </div>
        )}

        {images.length > MAX_VISIBLE_IMAGES && (
          <Button
            type="link"
            onClick={() => setShowAll(!showAll)}
            style={{ marginTop: "8px" }}
          >
            {showAll
              ? "Hide"
              : `Show more (${images.length - MAX_VISIBLE_IMAGES})`}
          </Button>
        )}
      </Card>
      <Divider className="border-gray-700" />
    </>
  );
};

export default ReviewCard;
