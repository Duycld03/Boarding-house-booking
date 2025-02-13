import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark as faBookmarkRegular,
  faFlag,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBookmark as faBookmarkSolid,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Thumbs,
  FreeMode,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import { Dropdown, Menu, Tooltip } from "antd";

const BoardingHouseGallery = ({ images, onReport, onSave }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isReported, setIsReported] = useState(false);

  if (!images || images.length === 0) return <p>Không có ảnh</p>;

  const sortedImages = [
    ...images.filter((img) => img.isPrimary),
    ...images.filter((img) => !img.isPrimary),
  ];

  const menu = (
    <Menu>
      <Menu.Item key="save" onClick={() => setIsSaved(!isSaved)}>
        <Tooltip
          placement="left"
          title={isSaved ? "Saved!" : "Save this boarding house"}
        >
          <FontAwesomeIcon
            icon={isSaved ? faBookmarkSolid : faBookmarkRegular}
            className="text-yellow-500 text-2xl"
          />
          <span className="ml-2">{isSaved ? "Saved" : "Save"}</span>
        </Tooltip>
      </Menu.Item>
      <Menu.Item key="report" onClick={() => onReport()}>
        <Tooltip placement="left" title="Report this boarding house">
          <FontAwesomeIcon icon={faFlag} className="text-red-500 text-2xl" />
          <span className="ml-2">Report</span>
        </Tooltip>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="flex flex-col mx-auto w-full md:w-3/4 relative">
      <div className="absolute top-10 right-14 z-10">
        <Dropdown overlay={menu} trigger={["click"]}>
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
        {sortedImages.map((image) => (
          <SwiperSlide key={image._id}>
            <img
              src={`${import.meta.env.VITE_BASE_URL}${image.imageUrl}`}
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
        {sortedImages.map((image) => (
          <SwiperSlide key={image._id} className="cursor-pointer">
            <img
              src={`${import.meta.env.VITE_BASE_URL}${image.imageUrl}`}
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
