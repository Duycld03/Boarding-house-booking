import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import Styles from "./Home.module.css";
import BoardingHouseGrid from "../../../component/BoardingHouseCard";
import { Tabs } from "antd";
import { toast } from "react-toastify";
import formatAmount from "@/utils/formatAmount";
import { formatTimeAgo } from "../../../utils/timeUtils";
import truncateDetail from "../../../utils/truncateDetail";
import SearchBar from "./SearchBar";
import { getBhByArea } from "../../../api/ownerUser/boardingHouse";
import FilterBoardingHouseUser from "./FilterBoardingHouseUser";

const cx = classNames.bind(Styles);

function Home() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState(null);
  const [filterResults, setFilterResults] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fetchBhByArea = async () => {
      setLoading(true);
      try {
        const res = await getBhByArea({});
        const formattedData = res.map((item) => ({
          id: item._id?.$oid || item._id,
          name: item.name,
          price: formatAmount(item.priceRange),
          detail: truncateDetail(item.address?.province || "No address provided"),
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          img: item.images?.[0]?.imageUrl || "",
          updatedAt: item.updatedAt,
          timeAgo: formatTimeAgo(item.updatedAt),
        }));
        setOriginalData(formattedData);
        setFilteredData(null);
      } catch (error) {
        toast.error("Failed to fetch boarding houses.");
        setOriginalData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBhByArea();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    if (!filterResults && !searchResults) {
      setFilteredData(originalData);
    } else if (filterResults && !searchResults) {
      setFilteredData(filterResults);
    } else if (!filterResults && searchResults) {
      setFilteredData(searchResults);
    } else {
      setFilteredData(filterResults.filter((item) => searchResults.some((searchItem) => searchItem.id === item.id)));
    }
  }, [filterResults, searchResults, originalData]);

  return (
    <div>
      <SearchBar setSearchResults={setSearchResults} />

      <div className={cx("home-container")}>
        <div className={cx("content")}>
          {!isMobile && (
            <div className="w-full max-w-sm p-4 bg-white shadow-md rounded-md">
              <FilterBoardingHouseUser setFilterValue={setFilterResults || (() => { })} />
            </div>
          )}
          <div className={cx("grid")}>
            <Tabs defaultActiveKey="all">
              <Tabs.TabPane tab="All" key="all">
                {filteredData?.length > 0 ? (
                  <BoardingHouseGrid data={filteredData} loading={loading} />
                ) : (
                  <p className="text-center text-gray-500">No boarding houses available.</p>
                )}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Newest" key="newest">
                {filteredData?.length > 0 ? (
                  <BoardingHouseGrid data={filteredData.slice(0, 10)} loading={loading} />
                ) : (
                  <p className="text-center text-gray-500">No new listings available.</p>
                )}
              </Tabs.TabPane>
              <Tabs.TabPane tab="High rating" key="highRating">
                {filteredData?.filter((item) => item.rating >= 3).length > 0 ? (
                  <BoardingHouseGrid data={filteredData.filter((item) => item.rating >= 3)} loading={loading} />
                ) : (
                  <p className="text-center text-gray-500">No high-rated listings available.</p>
                )}
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;