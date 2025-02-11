import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout, Spin, Empty, Button, Tag } from "antd";
import { getBoardingHouseDetail } from "../../../api/ownerUser/boardingHouse";
import BoardingHouseGallery from "./BoardingHouseGallery";
import formatAmount from "../../../utils/formatAmount";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

const { Content } = Layout;

function BoardingHouseDetail() {
  const { id } = useParams();
  const [boardingHouse, setBoardingHouse] = useState(null);
  const [loading, setLoading] = useState(true);

  //like
  const [isLiked, setIsLiked] = useState(false);

  const [expanded, setExpanded] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  useEffect(() => {
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

    if (id) fetchData();
  }, [id]);

  return (
    <Content className="md:max-w-screen-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : boardingHouse ? (
        <>
          {/* BH image */}
          <BoardingHouseGallery images={boardingHouse?.images || []} />

          {/* BH content */}
          <div className="mt-6">
            {/* Name and price range */}
            <div className="flex  justify-between items-start gap-4 w-full">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold">
                {boardingHouse?.name}
              </p>

              <div className="flex  items-start sm:items-center gap-2 sm:gap-4">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-orange-500">
                  {formatAmount(boardingHouse?.priceRange) + "(VND)/month"}
                </p>
                <Button
                  className="text-white bg-orange-500 flex-shrink-0 px-4 py-2 md:text-2xl font-bold sm:text-base"
                  size="large"
                >
                  Select room
                </Button>
              </div>
            </div>
            {/* Boarding house type*/}
            <Tag color="blue" className="md:text-2xl md:mt-3">
              {boardingHouse?.boardingHouseType?.name}
            </Tag>

            <div className="flex items-center gap-2 cursor-pointer select-none text-lg sm:text-xl md:text-4xl md:mt-5">
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

            <div className="md:mt-10">
              <p className="font-bold text-3xl">Description</p>
              <div className="bg-gray-300 p-4 rounded-lg mt-3">
                <div
                  className={`text-gray-800 text-sm sm:text-base md:text-2xl leading-relaxed transition-all duration-300 ${
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

            <div className="md:mt-10">
              <p className="font-bold text-3xl">
                Available room type in boarding house
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-60">
          <Empty description="Không tìm thấy thông tin nhà trọ" />
        </div>
      )}
    </Content>
  );
}

export default BoardingHouseDetail;
