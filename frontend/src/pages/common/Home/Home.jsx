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
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBHHome();

      const baseUrl = import.meta.env.VITE_BASE_URL;

      const formattedData = res.map((item) => {
        const imgPath =
          item.images?.find((img) => img.isPrimary)?.imageUrl || '';
        const imgUrl = imgPath ? `${baseUrl}${imgPath}` : '';
        const createdAt = new Date(item.createdAt || new Date()).getTime(); // Chuyển đổi thời gian tạo
        const now = new Date().getTime();
        const hoursAgo = Math.floor((now - createdAt) / 3600000); // Tính số giờ trước

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
          timeAgo: timeAgoText, // Thêm hiển thị thời gian
        };
      });

      setData(formattedData);
    } catch (error) {
      console.error('Failed to fetch boarding houses:', error);
      toast.error('Failed to fetch boarding houses. Please try again later.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Dữ liệu cho từng tab
  const allData = data;
  const newestData = [...data].sort((a, b) => b.id - a.id);
  const highRatingData = [...data].sort((a, b) => b.rating - a.rating);

  return (
    <div className={cx('home-container')}>
      <div className={cx('content')}>
        {/* Sidebar bên trái */}
        <div className={cx('filter')}>
          <h2>Filter option</h2>
        </div>

        {/* Grid bên phải */}
        <div className={cx('grid')}>
          <Tabs defaultActiveKey="all">
            <Tabs.TabPane tab="Tất cả" key="all">
              <BoardingHouseGrid data={allData} loading={loading} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Newest" key="newest">
              <BoardingHouseGrid data={newestData} loading={loading} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="High rating" key="highRating">
              <BoardingHouseGrid data={highRatingData} loading={loading} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Home;
