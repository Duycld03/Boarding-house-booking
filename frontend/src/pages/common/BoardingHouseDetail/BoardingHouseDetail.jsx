import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout, Spin, Empty } from "antd";
import { getBoardingHouseDetail } from "../../../api/ownerUser/boardingHouse";
import BoardingHouseGallery from "./BoardingHouseGallery";

const { Content } = Layout;

function BoardingHouseDetail() {
  const { id } = useParams();
  const [boardingHouse, setBoardingHouse] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <div className="md:mt-6">
            <div className="">
              <p className="text-3xl font-bold">{boardingHouse?.name}</p>
              <div className="flex">
                <p>{boardingHouse?.priceRange + "(VND)/month"}</p>
              </div>
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
