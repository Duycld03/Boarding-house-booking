import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookmark as faBookmarkRegular,
  faFlag,
} from '@fortawesome/free-regular-svg-icons';
import { faFlag as faFlagSolid } from '@fortawesome/free-solid-svg-icons';
import {
  faBookmark as faBookmarkSolid,
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Navigation,
  Pagination,
  Thumbs,
  FreeMode,
  Autoplay,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import { Dropdown, Menu, Tooltip, message } from 'antd';
import {
  getWatchLater,
  createWatchLater,
} from '../../../api/watchLaterManagement.js';
import { useParams } from 'react-router-dom';

const BoardingHouseGallery = ({ images, onReport, onSave, isReported }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  if (!images || images.length === 0) return <p>Không có ảnh</p>;

  const boardingHouseId = images[0]?._id; // Lấy ID của ảnh đầu tiên

  // Fetch trạng thái "Saved" khi component được mount
  useEffect(() => {
    const fetchWatchLaterStatus = async () => {
      try {
        const response = await getWatchLater(id);
        setIsSaved(response.isWatchLater); // Cập nhật trạng thái từ API
      } catch (error) {
        console.error('Error fetching watch later status:', error);
      }
    };

    if (id) {
      fetchWatchLaterStatus();
    }
  }, [id]);

  // Xử lý khi click vào Save
  const handleSaveClick = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await createWatchLater(id);
      setIsSaved(response.isWatchLater);
    } catch (error) {
      console.error('Error saving watch later:', error);
      message.error('Failed to save boarding house');
    } finally {
      setLoading(false);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="save" onClick={handleSaveClick} disabled={loading}>
        <Tooltip
          placement="left"
          title={isSaved ? 'Saved!' : 'Save this boarding house'}
        >
          <FontAwesomeIcon
            icon={isSaved ? faBookmarkSolid : faBookmarkRegular}
            className="text-yellow-500 text-2xl"
          />
          <span className="ml-2">{isSaved ? 'Saved' : 'Save'}</span>
        </Tooltip>
      </Menu.Item>
      <Menu.Item key="report" onClick={() => onReport()} disabled={isReported}>
        <Tooltip
          placement="left"
          title={
            isReported
              ? 'You have reported this boarding house. Please wait for admin to process.'
              : 'Report this boarding house'
          }
        >
          <FontAwesomeIcon
            icon={isReported ? faFlagSolid : faFlag}
            className="text-red-500 text-2xl"
          />
          <span className="ml-2">Report</span>
        </Tooltip>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="flex flex-col mx-auto w-full md:w-3/4 relative">
      <div className="absolute top-10 right-14 z-10">
        <Dropdown overlay={menu} trigger={['click']}>
          <button>
            <FontAwesomeIcon
              icon={faEllipsisV}
              className="text-5xl text-white"
            />
          </button>
        </Dropdown>
      </div>

      {/* Main Swiper with autoplay */}
      <Swiper
        modules={[Navigation, Pagination, Thumbs, FreeMode, Autoplay]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        loop
        autoplay={{ delay: 2500, disableOnInteraction: false }} // Thêm autoplay
        thumbs={{ swiper: thumbsSwiper }}
        className="w-full"
      >
        {images.map((image) => (
          <SwiperSlide key={image._id}>
            <img
              src={image.imageUrl}
              alt="Boarding House"
              className="w-full md:h-[500px] object-cover rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails Swiper */}
      <Swiper
        modules={[Thumbs, FreeMode]}
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode
        watchSlidesProgress
        className="w-full mt-4"
      >
        {images.map((image) => (
          <SwiperSlide key={image._id} className="cursor-pointer">
            <img
              src={image.imageUrl}
              alt="Thumbnail"
              className="w-full h-52 object-cover rounded-md border border-gray-300"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BoardingHouseGallery;
