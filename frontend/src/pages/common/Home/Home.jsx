import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import Styles from "./Home.module.css";
import BoardingHouseGrid from "../../../component/BoardingHouseCard";
import { Tabs } from "antd";
import { getAllBHHome } from "../../../api/BoardingHManagement";
import { toast } from "react-toastify";
import formatAmount from "../../../utils/formatAmount";
import { formatTimeAgo } from "../../../utils/timeUtils";
import truncateDetail from "../../../utils/truncateDetail";

const cx = classNames.bind(Styles);

function Home() {
  const [originalData, setOriginalData] = useState([]); // Lưu dữ liệu gốc
  const [activeTab, setActiveTab] = useState("all");
  const [loadingTabs, setLoadingTabs] = useState({
    all: false,
    newest: false,
    highRating: false,
  });

  const fetchData = async (tab) => {
    setLoadingTabs((prev) => ({ ...prev, [tab]: true }));
    try {
      const res = await getAllBHHome();

      const baseUrl = "http://localhost:3000";

      const formattedData = res.map((item) => {
        const imgPath =
          item.images?.find((img) => img.isPrimary)?.imageUrl ||
          item.images?.[0]?.imageUrl ||
          "";
        const imgUrl = imgPath ? `${baseUrl}${imgPath}` : "";

        return {
          id: item._id?.$oid || item._id,
          name: item.name,
          price: formatAmount(item.priceRange),
          detail: truncateDetail(
            item.address?.province || "No address provided"
          ),
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0, // Bổ sung để tránh lỗi
          img: imgUrl,
          updatedAt: item.updatedAt,
          timeAgo: formatTimeAgo(item.updatedAt),
        };
      });

      setOriginalData(formattedData); // Lưu trữ dữ liệu gốc
    } catch (error) {
      console.error("Failed to fetch boarding houses:", error);
      toast.error("Failed to fetch boarding houses. Please try again later.");
      setOriginalData([]);
    } finally {
      setLoadingTabs((prev) => ({ ...prev, [tab]: false }));
    }
  };
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const allData = [...originalData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const newestData = [...originalData]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10);

  const highRatingData = [...originalData]
    .filter((item) => item.rating >= 3)
    .sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount;
      }
      return b.rating - a.rating;
    })
    .slice(0, 10);

  return (
    <div className={cx("home-container")}>
      <div className={cx("content")}>
        <div className={cx("filter")}>
          <h2>Filter option</h2>
        </div>

        <div className={cx("grid")}>
          <Tabs defaultActiveKey="all" onChange={(key) => setActiveTab(key)}>
            <Tabs.TabPane tab="All" key="all">
              <BoardingHouseGrid data={allData} loading={loadingTabs.all} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Newest" key="newest">
              <BoardingHouseGrid
                data={newestData}
                loading={loadingTabs.newest}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="High rating" key="highRating">
              <BoardingHouseGrid
                data={highRatingData}
                loading={loadingTabs.highRating}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Home;
