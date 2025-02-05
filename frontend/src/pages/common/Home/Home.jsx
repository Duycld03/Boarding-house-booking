import { useState } from 'react';
import classNames from 'classnames/bind';
import Styles from './Home.module.css';
import BoardingHouseGrid from '../../../component/BoardingHouseCard';
import { Tabs } from 'antd';

const boardingHouses = [
  {
    id: 1,
    name: 'Cozy Apartment',
    price: 500,
    location: 'New York',
    rating: 4.5,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product37.png`,
  },
  {
    id: 2,
    name: 'Luxury Condo',
    price: 1200,
    location: 'Los Angeles',
    rating: 4.8,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product39.png`,
  },
  {
    id: 3,
    name: 'Affordable ',
    price: 700,
    location: 'San Francisco',
    rating: 4.2,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product40.png`,
  },
  {
    id: 4,
    name: 'Cozy Apartment',
    price: 500,
    location: 'New York',
    rating: 4.5,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product37.png`,
  },
  {
    id: 5,
    name: 'Luxury Condo',
    price: 1200,
    location: 'Los Angeles',
    rating: 4.8,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product39.png`,
  },
  {
    id: 6,
    name: 'Affordable ',
    price: 700,
    location: 'San Francisco',
    rating: 4.2,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product40.png`,
  },
  {
    id: 7,
    name: 'Luxury Condo',
    price: 1200,
    location: 'Los Angeles',
    rating: 4.8,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product39.png`,
  },
  {
    id: 8,
    name: 'Affordable ',
    price: 700,
    location: 'San Francisco',
    rating: 4.2,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product40.png`,
  },
  {
    id: 9,
    name: 'Cozy Apartment',
    price: 500,
    location: 'New York',
    rating: 4.5,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product37.png`,
  },
  {
    id: 10,
    name: 'Luxury Condo',
    price: 1200,
    location: 'Los Angeles',
    rating: 4.8,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product39.png`,
  },
  {
    id: 11,
    name: 'Affordable ',
    price: 700,
    location: 'San Francisco',
    rating: 4.2,
    img: `${import.meta.env.VITE_BASE_URL}images/products/product40.png`,
  },
  // Thêm nhiều dữ liệu hơn nếu cần
];

const cx = classNames.bind(Styles);

function Home() {
  const [data] = useState(boardingHouses);

  // Dữ liệu cho từng tab
  const allData = data;
  // "Newest" giả sử là sắp xếp theo id giảm dần (các bản ghi mới có id cao hơn)
  const newestData = [...data].sort((a, b) => b.id - a.id);
  // "High rating" sắp xếp theo rating giảm dần
  const highRatingData = [...data].sort((a, b) => b.rating - a.rating);

  return (
    <div className={cx('home-container')}>
      <div className={cx('content')}>
        {/* Sidebar bên trái */}
        <div className={cx('filter')}>
          <h2>Filter option</h2>
          {/* Thêm các bộ lọc tại đây nếu cần */}
        </div>

        {/* Grid bên phải */}
        <div className={cx('grid')}>
          <Tabs defaultActiveKey="all">
            <Tabs.TabPane tab="Tất cả" key="all">
              <BoardingHouseGrid data={allData} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Newest" key="newest">
              <BoardingHouseGrid data={newestData} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="High rating" key="highRating">
              <BoardingHouseGrid data={highRatingData} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Home;
