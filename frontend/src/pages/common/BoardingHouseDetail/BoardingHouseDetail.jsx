import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Modal, Layout, Spin, Empty, Button, Tag, Divider } from "antd";
import {
  getBoardingHouseDetail,
  getReviewByBhId,
  getRoomTypeByBhId,
} from "../../../api/ownerUser/boardingHouse";
import BoardingHouseGallery from "./BoardingHouseGallery";
import formatAmount from "../../../utils/formatAmount";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RoomCard from "../../../component/RoomTypeCard/RoomTypeCard";
import ReviewList from "./ReviewList";
import OwnerInfo from "./OwnerInfo";
import ReportModal from "./ReportModal";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../context/userContext";

const { Content } = Layout;

function BoardingHouseDetail() {
  const { isLogin } = useCurrentUser();
  const navigate = useNavigate();

  const { id } = useParams();
  const [boardingHouse, setBoardingHouse] = useState(null);
  const [roomTypes, setRoomType] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reviewId, setReviewId] = useState("");

  // Ref cho room type section
  const roomTypeRef = useRef(null);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  //BH data
  const fetchData = async () => {
    try {
      const response = await getBoardingHouseDetail(id);
      setBoardingHouse(response);
    } catch (error) {
      console.error("Error fetching boarding house details:", error);
    } finally {
      setLoading(false);
    }
  };

  //Room type
  const fetchRoomTypes = async () => {
    try {
      const response = await getRoomTypeByBhId(id);
      setRoomType(response?.data);
    } catch (error) {
      console.error("Error fetching boarding house room type:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await getReviewByBhId(id);
      setReviews(response);
    } catch (error) {
      console.error("Error fetching boarding house review:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
      fetchRoomTypes();
      fetchReviews();
    }
  }, [id]);

  // Hàm scroll đến room type
  const scrollToRoomType = () => {
    roomTypeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpen = () => {
    if (!isLogin) {
      Modal.confirm({
        title: " You need to log in",
        content: "Please log in to report.",
        okText: " Log in",
        cancelText: "Cancel",
        onOk: () => navigate("/login"),
      });
      return;
    }
    setReportModalVisible(true);
  };

  return (
    <div className="md:max-w-screen-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : boardingHouse ? (
        <>
          <BoardingHouseGallery
            images={boardingHouse?.images || []}
            onReport={() => handleOpen()}
          />

          <div className="mt-8 px-10">
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

            {/* Water price and electric price */}
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
            <div className="md:mt-14">
              <p className="font-bold text-4xl">Description</p>
              <div className="bg-gray-300 p-4 rounded-lg mt-3">
                <div
                  className={`text-gray-800 text-sm sm:text-base md:text-2xl leading-relaxed text-justify transition-all duration-300 ${
                    expanded ? "max-h-full" : "max-h-60 overflow-hidden"
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

            {/* Room Type Section */}
            <div className="md:mt-14" ref={roomTypeRef}>
              <p className="font-bold text-4xl">
                Available room type in boarding house
              </p>
              {roomTypes.map((rType, index) => (
                <RoomCard key={index} roomData={rType} />
              ))}
            </div>
            <Divider className="border-gray-500" />

            {/* Review */}
            <div className="md:my-14">
              <p className="font-bold mb-10 text-4xl">Rating & Review</p>
              <ReviewList
                reviews={reviews}
                rating={boardingHouse?.rating}
                onReport={() => handleOpen()}
                setReviewId={setReviewId}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-60">
          <Empty description="Không tìm thấy thông tin nhà trọ" />
        </div>
      )}
      <ReportModal
        visible={reportModalVisible}
        toggleVisible={setReportModalVisible}
        boardingHouseId={id}
        reviewId={reviewId}
        setReviewId={setReviewId}
      />
    </div>
  );
}

export default BoardingHouseDetail;
