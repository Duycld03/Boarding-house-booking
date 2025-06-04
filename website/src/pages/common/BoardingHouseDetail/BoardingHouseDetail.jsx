import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Modal,
  Layout,
  Spin,
  Empty,
  Button,
  Tag,
  Divider,
  Pagination,
} from "antd";
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
import ReportModal from "./ReportModal";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../context/userContext";
import { checkReportExist } from "../../../api/reportManagement";
import { toast } from "react-toastify";
import { addFavorite, getFavorite } from "../../../api/favoriteManagement";
import LocationPicker from "@/component/LocationPicker";
import userRoles from "@/constants/userRole";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import coverBhType from "@/utils/coverBhType";

function BoardingHouseDetail() {
  const { hasRole } = useCurrentUser();
  const isOwner = hasRole(userRoles.owner);

  const { t } = useTranslation("boardingHouseDetail");
  const { darkMode } = useTheme();

  const currentLanguage = i18n.language;

  const { isLogin } = useCurrentUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const [boardingHouse, setBoardingHouse] = useState(null);
  const [roomTypes, setRoomType] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reviewId, setReviewId] = useState("");
  const [reportedReviews, setReportedReviews] = useState([]);
  const [reportedBoardingHouse, setReportedBoardingHouse] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 2,
    loadedItems: 0,
  });

  console.log("bh data: ", boardingHouse);

  const roomTypeRef = useRef(null);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const response = await getFavorite();
        if (response && Array.isArray(response.favorites)) {
          setIsLiked(response.favorites.some((fav) => fav.id === id));
        }
      } catch (error) {
        console.error("Error fetching favorite status:", error);
      }
    };

    if (id) {
      fetchFavoriteStatus();
    }
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await addFavorite(id);
      if (response && typeof response.isFavorite !== "undefined") {
        setIsLiked(response.isFavorite);
        setBoardingHouse((prev) => ({
          ...prev,
          likes: response.isFavorite ? prev.likes + 1 : prev.likes - 1,
        }));
      } else {
        console.error("Invalid response structure:", response);
        toast.error(t("invalidResponseData"));
      }
    } catch (error) {
      navigate(`/login`);
    }
  };

  const onLoadMore = async () => {
    const fetchReviews = async () => {
      try {
        const response = await getReviewByBhId(id, {
          currentPage: pagination.currentPage + 1,
          limit: pagination.limit + 2,
        });
        setPagination({
          ...pagination,
          totalItems: response?.pagination?.totalItems,
          limit: response?.pagination?.limit,
        });
        setReviews(response.data);
        console.log("Load more pagination ", response?.pagination);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  };

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

  const fetchReportStatus = async (reviewsData) => {
    try {
      const reviewIds = reviewsData.map((review) => review._id);
      const res = await checkReportExist(reviewIds, id);
      setReportedReviews(res.reportedReviews);
      setReportedBoardingHouse(res.boardingHouseReported);
    } catch (error) {
      console.error("Error fetching review reports:", error);
    }
  };

  const fetchReviews = async (
    page = 1,
    limit = pagination.limit,
    shouldAppend = false
  ) => {
    setReviewsLoading(true);
    try {
      const paginationParams = {
        currentPage: page,
        limit: limit,
      };

      const response = await getReviewByBhId(id, paginationParams);

      if (response && response.data) {
        console.log("Default pagination: ", response?.pagination);

        const newReviews = shouldAppend
          ? [...reviews, ...response.data]
          : response.data;
        setReviews(newReviews);

        // Update pagination info
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalItems: response.totalItems || 0,
          totalPages: response.totalPages || 1,
          limit: limit,
          loadedItems: newReviews.length,
        }));

        // Fetch report status for current reviews
        await fetchReportStatus(shouldAppend ? newReviews : response.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (error.response && error.response.status === 404) {
        if (!shouldAppend) {
          setReviews([]);
          setPagination((prev) => ({
            ...prev,
            totalItems: 0,
            totalPages: 1,
            loadedItems: 0,
          }));
        }
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReportStatus = () => {
    fetchReportStatus(reviews);
  };

  useEffect(() => {
    if (id) {
      fetchBoardingHouse();
      fetchRoomTypes();
    }
  }, [id]);

  // Separate useEffect for reviews to avoid infinite loop
  useEffect(() => {
    if (id) {
      fetchReviews(1); // Always start from page 1 when component mounts
    }
  }, [id]);

  // Xử lý submit review
  const handleAddReview = async (formData) => {
    try {
      const response = await addReview(formData);
      if (response.status === 201 && response.data.success) {
        toast.success(t("reviewAddedSuccessfully"));
        setIsModalOpen(false);
        // Reset to page 1 when adding new review
        await fetchReviews(1);
      } else {
        toast.error(response.data.message || t("failedToAddReview"));
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error(t("failedToAddReviewTryAgain"));
    }
  };

  // Xử lý khi nhấn nút Write a Review
  const handleWriteReview = () => {
    setIsModalOpen(true);
  };

  // Scroll đến room type
  const scrollToRoomType = () => {
    roomTypeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpen = () => {
    if (!isLogin) {
      Modal.confirm({
        title: t("needToLogin"),
        content: t("pleaseLoginToReport"),
        okText: t("login"),
        cancelText: t("cancel"),
        onOk: () => navigate("/login"),
      });
      return;
    }
    setReportModalVisible(true);
  };

  const handleOpenAddReview = () => {
    if (!isLogin) {
      Modal.confirm({
        title: t("needToLogin"),
        content: t("pleaseLoginToAddReview"),
        okText: t("login"),
        cancelText: t("cancel"),
        onOk: () => navigate("/login"),
      });
      return;
    }
    setIsModalOpen(true);
  };

  // Handle page change for reviews
  const handlePageChange = (page) => {
    fetchReviews(page);
  };

  const likeFormat = (amount) => {
    if (amount >= 1e9) {
      return (amount / 1e9).toFixed(1) + "B";
    } else if (amount >= 1e6) {
      return (amount / 1e6).toFixed(1) + "M";
    } else if (amount >= 1e3) {
      return (amount / 1e3).toFixed(1) + "K";
    }
    return amount;
  };

  return (
    <div
      className={`md:max-w-screen-xl mx-auto p-6 ${
        darkMode
          ? "bg-background-dark text-text-dark"
          : "bg-background-light text-text-light"
      } shadow-lg rounded-lg`}
    >
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : boardingHouse ? (
        <>
          <BoardingHouseGallery
            images={boardingHouse?.images || []}
            onReport={() => handleOpen()}
            isReported={reportedBoardingHouse}
          />

          <div className="mt-8 px-5 sm:px-10">
            {/* Header */}
            <div className="flex justify-between lg:gap-0 md:gap-0 sm:gap-[100px] flex-wrap items-start w-full">
              <p
                className={`text-4xl font-bold ${
                  darkMode ? "text-text-dark" : "text-text-light"
                }`}
              >
                {boardingHouse?.name}
              </p>

              <div className="flex items-center md:mt-0 sm:mt-0 mt-5 gap-4 sm:gap-5">
                <p className="lg:text-4xl md:text-3xl sm:text-xl sm:gap-3 font-bold text-orange-500">
                  {formatAmount(boardingHouse?.priceRange, currentLanguage) +
                    t("vndPerMonth")}
                </p>
                <Button
                  onClick={scrollToRoomType}
                  className="text-white bg-orange-500 hover:bg-orange-600 flex-shrink-0 px-4 py-2 md:text-2xl font-bold sm:text-base"
                  size="large"
                >
                  {t("selectRoom")}
                </Button>
              </div>
            </div>

            {/* Address and Owner */}
            <div className="flex flex-wrap justify-between mt-5 sm:mt-0">
              <div>
                <Tag color="blue" className="md:text-2xl md:mt-3">
                  {coverBhType(
                    boardingHouse?.boardingHouseType?.codeName,
                    currentLanguage
                  )}
                </Tag>
                <div className="mt-5 flex gap-4">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="md:text-3xl text-red-500"
                  />
                  <p
                    className={`text-2xl ${
                      darkMode ? "text-text-dark" : "text-text-light"
                    }`}
                  >
                    {boardingHouse?.address
                      ? `${boardingHouse.address.detail}, ${boardingHouse.address.ward}, ${boardingHouse.address.district}, ${boardingHouse.address.province}`
                      : t("addressNotAvailable")}
                  </p>
                </div>
                <div className="flex items-center gap-2 cursor-pointer select-none text-4xl mt-5 sm:mt-0">
                  <button
                    onClick={handleLike}
                    disabled={isOwner}
                    className="focus:outline-none"
                  >
                    {isLiked ? (
                      <HeartFilled className="text-red-500 transition-transform duration-300 scale-110" />
                    ) : (
                      <HeartOutlined
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        } hover:text-red-500 transition-colors duration-300`}
                      />
                    )}
                  </button>

                  <span
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } font-semibold`}
                  >
                    {formatAmount(boardingHouse?.likes, "vi", {
                      showCurrency: false,
                    })}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 font-bold items-center">
                <Tag color="#f50" className="text-lg sm:text-3xl">
                  {t("owner")}:
                </Tag>
                <OwnerInfo ownerData={boardingHouse?.ownerId} />
              </div>
            </div>

            {/* Extra Prices */}
            <div
              className={`mt-10 p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-md border w-full max-w-sm ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3
                className={`text-3xl font-semibold ${
                  darkMode ? "text-gray-100" : "text-gray-800"
                } mb-4`}
              >
                {t("extraPrice")}
              </h3>
              <div className="flex justify-between items-center mb-3">
                <span
                  className={`font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {t("electricityPrice")}:
                </span>
                <span
                  className={`${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  } font-semibold`}
                >
                  {formatAmount(
                    boardingHouse?.electricityPrice,
                    currentLanguage
                  )}
                  /{t("kWh")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {t("waterPrice")}:
                </span>
                <span
                  className={`${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  } font-semibold`}
                >
                  {formatAmount(boardingHouse?.waterPrice, currentLanguage)}/m³
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-14">
              <p
                className={`font-bold text-4xl ${
                  darkMode ? "text-text-dark" : "text-text-light"
                }`}
              >
                {t("description")}
              </p>
              <div
                className={`${
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                } p-4 rounded-lg mt-3`}
              >
                <div
                  className={`${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  } text-lg sm:text-2xl leading-relaxed text-justify transition-all duration-300 ${
                    expanded ? "max-h-full" : "max-h-60 overflow-hidden"
                  }`}
                >
                  {boardingHouse?.description || t("noDescriptionAvailable")}
                </div>
                {boardingHouse?.description &&
                  boardingHouse?.description.split(" ").length > 50 && (
                    <div className="mt-3">
                      <Button
                        type="link"
                        onClick={() => setExpanded(!expanded)}
                        className={`${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        } text-sm sm:text-base md:text-3xl`}
                      >
                        {expanded ? t("collapse") : t("showMore")}
                      </Button>
                    </div>
                  )}
              </div>
            </div>

            {/* Map */}
            <div className="mt-14">
              <p
                className={`font-bold text-4xl ${
                  darkMode ? "text-text-dark" : "text-text-light"
                }`}
              >
                {t("location")}
              </p>
              <div className="mt-3">
                <LocationPicker
                  initialPosition={
                    boardingHouse?.location
                      ? [
                          boardingHouse.location?.lat,
                          boardingHouse.location?.lon,
                        ]
                      : null
                  }
                  readOnly
                />
              </div>
            </div>
            <Divider
              className={darkMode ? "border-gray-600" : "border-gray-500"}
            />

            {/* Room Types */}
            <div className="mt-14" ref={roomTypeRef}>
              <p
                className={`font-bold text-4xl ${
                  darkMode ? "text-text-dark" : "text-text-light"
                }`}
              >
                {t("availableRoomTypes")}
              </p>
              {roomTypes.map((rType, index) => (
                <RoomCard
                  key={index}
                  roomData={rType}
                  boardingHouse={boardingHouse}
                />
              ))}
            </div>
            <Divider
              className={darkMode ? "border-gray-600" : "border-gray-500"}
            />

            {/* Reviews Section */}
            <div className="my-14">
              <p
                className={`font-bold mb-10 text-4xl ${
                  darkMode ? "text-text-dark" : "text-text-light"
                }`}
              >
                {t("ratingAndReview")}
              </p>
              <Button
                className={`${
                  darkMode
                    ? "bg-primary text-white hover:bg-blue-700"
                    : "bg-primary text-white hover:bg-primary-700"
                } font-medium rounded-lg px-5 py-2.5 mr-2 mb-2 h-20 w-60`}
                onClick={handleOpenAddReview}
                disabled={isOwner}
              >
                {t("writeAReview")}
              </Button>

              <ReviewList
                reviews={reviews}
                loading={reviewsLoading}
                rating={boardingHouse?.rating}
                onReport={() => handleOpen()}
                setReviewId={setReviewId}
                reportedReviews={reportedReviews}
                fetchReviews={() => fetchReviews(1)}
                boardingHouse={boardingHouse}
                onPageChange={handlePageChange}
                onLoadMore={onLoadMore}
                hasMore={pagination?.limit !== pagination?.totalItems}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-60">
          <Empty description={t("boardingHouseNotFound")} />
        </div>
      )}

      {/* Add Review Modal */}
      <AddReview
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddReview}
        boardingHouseId={id}
      />
      <ReportModal
        visible={reportModalVisible}
        toggleVisible={setReportModalVisible}
        boardingHouseId={id}
        reviewId={reviewId}
        setReviewId={setReviewId}
        handleReportStatus={handleReportStatus}
      />
    </div>
  );
}

export default BoardingHouseDetail;
