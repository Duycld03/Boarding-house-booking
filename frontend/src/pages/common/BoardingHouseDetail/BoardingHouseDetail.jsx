import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout, Spin, Empty, Button, Tag, Divider, message } from "antd";
import {
  getBoardingHouseDetail,
  getReviewByBhId,
  getRoomTypeByBhId,
} from "../../../api/ownerUser/boardingHouse";
import { addReview } from "../../../api/ReviewManagement";
import BoardingHouseGallery from "./BoardingHouseGallery";
import formatAmount from "../../../utils/formatAmount";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RoomCard from "../../../component/RoomTypeCard/RoomTypeCard";
import ReviewList from "./ReviewList";
import OwnerInfo from "./OwnerInfo";
import AddReview from "./AddReview";

const { Content } = Layout;

function BoardingHouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); // Điều hướng nếu cần
  const [boardingHouse, setBoardingHouse] = useState(null);
  const [roomTypes, setRoomType] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái mở/đóng modal
  const roomTypeRef = useRef(null);

  // Giả sử bạn lấy accountId từ localStorage hoặc bất kỳ nguồn nào
  const accountId = localStorage.getItem("accountId") || null;

  // Xử lý like
  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // Fetch dữ liệu boarding house
  const fetchBoardingHouse = async () => {
    try {
      const response = await getBoardingHouseDetail(id);
      setBoardingHouse(response);
    } catch (error) {
      console.error("Error fetching boarding house details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch room types
  const fetchRoomTypes = async () => {
    try {
      const response = await getRoomTypeByBhId(id);
      setRoomType(response?.data || []);
    } catch (error) {
      console.error("Error fetching room types:", error);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await getReviewByBhId(id);
      setReviews(response || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBoardingHouse();
      fetchRoomTypes();
      fetchReviews();
    }
  }, [id]);

  // Xử lý submit review
  const handleAddReview = async (formData) => {
    try {
      const response = await addReview(formData);
      console.log("formdata: ", formData) // Gửi dữ liệu review qua API

      if (response.success) {
        message.success("Review added successfully!");
        fetchReviews(); // Làm mới danh sách review
        setIsModalOpen(false); // Đóng modal
      } else {
        message.error(response.message || "Failed to add review.");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      message.error("Failed to add review. Please try again.");
    }
  };

  // Xử lý khi nhấn nút Write a Review
  const handleWriteReview = () => {
    // if (!accountId) {
    //   message.error("User is not logged in. Please log in to write a review.");
    //   return;
    // }

    setIsModalOpen(true); // Hiển thị popup
  };

  // Scroll đến room type
  const scrollToRoomType = () => {
    roomTypeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="md:max-w-screen-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : boardingHouse ? (
        <>
          <BoardingHouseGallery images={boardingHouse?.images || []} />

          <div className="mt-8 px-10">
            {/* Header */}
            <div className="flex justify-between items-start gap-4 w-full">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold">
                {boardingHouse?.name}
              </p>

              <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-orange-500">
                  {formatAmount(boardingHouse?.priceRange) + "(VND)/month"}
                </p>
                <Button
                  onClick={scrollToRoomType}
                  className="text-white bg-orange-500 flex-shrink-0 px-4 py-2 md:text-2xl font-bold sm:text-base"
                  size="large"
                >
                  Select room
                </Button>
              </div>
            </div>

            {/* Address and Owner */}
            <div className="flex flex-wrap justify-between ">
              <div>
                <Tag color="blue" className="md:text-2xl md:mt-3">
                  {boardingHouse?.boardingHouseType?.name}
                </Tag>
                <div className="mt-5 flex gap-4">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="md:text-3xl text-red-500"
                  />
                  <p className="text-2xl">
                    {boardingHouse?.address
                      ? `${boardingHouse.address.detail}, ${boardingHouse.address.ward}, ${boardingHouse.address.district}, ${boardingHouse.address.province}`
                      : "Address not available"}
                  </p>
                </div>
                <div className="flex items-center gap-2 cursor-pointer select-none text-lg sm:text-xl md:text-4xl md:mt-7">
                  <button onClick={handleLike} className="focus:outline-none">
                    {isLiked ? (
                      <HeartFilled className="text-red-500 transition-transform duration-300 scale-110" />
                    ) : (
                      <HeartOutlined className="text-gray-600 hover:text-red-500 transition-colors duration-300" />
                    )}
                  </button>
                  <span className="text-gray-700 font-semibold">
                    {formatAmount(boardingHouse?.likes)}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 font-bold items-center">
                <Tag color="#f50" className="text-3xl">
                  Owner:
                </Tag>
                <OwnerInfo ownerData={boardingHouse?.ownerId} />
              </div>
            </div>

            {/* Extra Prices */}
            <div className="mt-10 p-6 bg-white rounded-lg shadow-md border w-full max-w-sm">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">
                Extra price
              </h3>
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-600">
                  Electricity Price:
                </span>
                <span className="text-gray-900 font-semibold">
                  {formatAmount(boardingHouse?.electricityPrice)} kWh (VND)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Water Price:</span>
                <span className="text-gray-900 font-semibold">
                  {formatAmount(boardingHouse?.waterPrice)} m³ (VND)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="md:mt-14">
              <p className="font-bold text-4xl">Description</p>
              <div className="bg-gray-300 p-4 rounded-lg mt-3">
                <div
                  className={`text-gray-800 text-sm sm:text-base md:text-2xl leading-relaxed text-justify transition-all duration-300 ${expanded ? "max-h-full" : "max-h-60 overflow-hidden"
                    }`}
                >
                  {boardingHouse?.description || "No description available."}
                </div>
                {boardingHouse?.description &&
                  boardingHouse?.description.split(" ").length > 50 && (
                    <div className="mt-3">
                      <Button
                        type="link"
                        onClick={() => setExpanded(!expanded)}
                        className="text-blue-600 text-sm sm:text-base md:text-3xl"
                      >
                        {expanded ? "Collapse" : "Show more"}
                      </Button>
                    </div>
                  )}
              </div>
            </div>
            <Divider className="border-gray-500" />

            {/* Room Types */}
            <div className="md:mt-14" ref={roomTypeRef}>
              <p className="font-bold text-4xl">
                Available room type in boarding house
              </p>
              {roomTypes.map((rType, index) => (
                <RoomCard key={index} roomData={rType} />
              ))}
            </div>
            <Divider className="border-gray-500" />

            {/* Reviews Section */}
            <div className="md:my-14">
              <p className="font-bold mb-10 text-4xl">Rating & Review</p>
              <ReviewList reviews={reviews} rating={boardingHouse?.rating} />
              <Button
                type="primary"
                size="large"
                className="mt-4"
                onClick={handleWriteReview}
              >
                Write a Review
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-60">
          <Empty description="Boarding house not found" />
        </div>
      )}

      {/* Add Review Modal */}
      <AddReview
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddReview}
        boardingHouseId={id}
      />
    </div>
  );
}

export default BoardingHouseDetail;