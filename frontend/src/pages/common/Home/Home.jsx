import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Styles from './Home.module.css';
import BoardingHouseGrid from '../../../component/BoardingHouseCard';
import { Tabs } from 'antd';
import { getAllBHHome } from '../../../api/BoardingHManagement';
import { toast } from 'react-toastify';
import formatAmount from '../../../utils/formatAmount';
import { formatTimeAgo } from '../../../utils/timeUtils';
import truncateDetail from '../../../utils/truncateDetail';

const cx = classNames.bind(Styles);

function Home() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loadingTabs, setLoadingTabs] = useState({
    all: false,
    newest: false,
    highRating: false,
  });

  const fetchData = async (tab) => {
    setLoadingTabs((prev) => ({ ...prev, [tab]: true }));
    try {
      const res = await getAllBHHome();

      const baseUrl = 'http://localhost:3000';

      const formattedData = res.map((item) => {
        const imgPath =
          item.images?.find((img) => img.isPrimary)?.imageUrl || '';
        const imgUrl = imgPath ? `${baseUrl}${imgPath}` : '';
        const timeAgoText = formatTimeAgo(item.updatedAt);

        return {
          id: item._id?.$oid || item._id,
          name: item.name,
          price: formatAmount(item.priceRange),
          detail: truncateDetail(
            item.address?.province || 'No address provided'
          ),
          rating: item.rating || 0,
          img: imgUrl,
          updatedAt: item.updatedAt,
          timeAgo: timeAgoText,
        };
      });

      setData(formattedData);
    } catch (error) {
      console.error('Failed to fetch boarding houses:', error);
      toast.error('Failed to fetch boarding houses. Please try again later.');
      setData([]);
    } finally {
      setLoadingTabs((prev) => ({ ...prev, [tab]: false }));
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const allData = [...data].sort((a, b) => a.name.localeCompare(b.name));
  const newestData = [...data]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Sắp xếp giảm dần theo updatedAt
    .slice(0, 10); // Giới hạn top 10

  // Sort by rating and limit to the top 4
  const highRatingData = [...data]
    .sort((a, b) => b.rating - a.rating) // Sort descending by rating
    .slice(0, 4); // Limit to the top 4

  return (
    <div className={cx('home-container')}>
      <div className={cx('content')}>
        <div className={cx('filter')}>
          <h2>Filter option</h2>
        </div>

        <div className={cx('grid')}>
          <Tabs defaultActiveKey="all" onChange={(key) => setActiveTab(key)}>
            <Tabs.TabPane tab="Tất cả" key="all">
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
