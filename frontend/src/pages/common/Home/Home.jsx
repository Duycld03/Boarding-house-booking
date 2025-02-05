import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Styles from './Home.module.css';
import BoardingHouseGrid from '../../../component/BoardingHouseCard';
import { Tabs } from 'antd';
import { getAllBHHome } from '../../../api/BoardingHManagement';
import { toast } from 'react-toastify';

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

      const baseUrl = import.meta.env.VITE_BASE_URL;

      const formattedData = res.map((item) => {
        const imgPath =
          item.images?.find((img) => img.isPrimary)?.imageUrl || '';
        const imgUrl = imgPath ? `${baseUrl}${imgPath}` : '';
        const createdAt = new Date(item.createdAt || new Date()).getTime();
        const now = new Date().getTime();
        const hoursAgo = Math.floor((now - createdAt) / 3600000);

        let timeAgoText = 'Just posted';

        if (hoursAgo >= 24) {
          const daysAgo = Math.floor(hoursAgo / 24);
          timeAgoText = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
        } else if (hoursAgo > 1) {
          timeAgoText = `${hoursAgo} hours ago`;
        } else if (hoursAgo === 1) {
          timeAgoText = '1 hour ago';
        }

        return {
          id: item._id?.$oid || item._id,
          name: item.name,
          price: item.priceRange,
          detail: item.address?.province || 'No address provided',
          rating: item.rating || 0,
          img: imgUrl,
          createdAt: item.createdAt,
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
  const newestData = [...data].sort((a, b) => b.id - a.id);
  const highRatingData = [...data].sort((a, b) => b.rating - a.rating);

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
