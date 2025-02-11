import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark as faBookmarkRegular,
  faFlag,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBookmark as faBookmarkSolid, // Filled
} from "@fortawesome/free-solid-svg-icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import { Tooltip } from "antd";

const BoardingHouseGallery = ({ images, onReport, onSave }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isReported, setIsReported] = useState(false);

  if (!images || images.length === 0) return <p>Không có ảnh</p>;

  const sortedImages = [
    ...images.filter((img) => img.isPrimary),
    ...images.filter((img) => !img.isPrimary),
  ];

  return (
    <div className="flex flex-col mx-auto w-full md:w-3/4 relative">
      {/* Toggle Icons */}
      <div className="absolute top-10 right-14 flex gap-10 z-10">
        <Tooltip
          placement="left"
          title={isSaved ? "Saved!" : "Save this boardinghouse"}
        >
          <button onClick={() => setIsSaved(!isSaved)}>
            <FontAwesomeIcon
              icon={isSaved ? faBookmarkSolid : faBookmarkRegular}
              className="md:text-5xl text-yellow-500"
            />
          </button>
        </Tooltip>
        <Tooltip placement="left" title={"Report this boarding house"}>
          <button onClick={() => onReport()}>
            <FontAwesomeIcon icon={faFlag} className={`md:text-5xl`} />
          </button>
        </Tooltip>
      </div>

      {/* Main Swiper */}
      <Swiper
        modules={[Navigation, Pagination, Thumbs, FreeMode]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        loop
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
