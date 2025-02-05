import classNames from 'classnames/bind';
import Styles from './Home.module.css';
import BoardingHouseGrid from '../../../component/BoardingHouseCard';
import { useState } from 'react';

// Dữ liệu giả lập (Bạn có thể thay bằng dữ liệu thực từ API)
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

  return (
    <div className={cx('home-container')}>
      <div className={cx('content')}>
        {/* Sidebar bên trái */}
        <div className={cx('filter')}>
          <h2>Filter option</h2>
          {/* Thêm các bộ lọc tại đây */}
        </div>

        {/* Grid bên phải */}
        <div className={cx('grid')}>
          <BoardingHouseGrid data={data} />
        </div>
      </div>
    </div>
  );
}
export default Home;
