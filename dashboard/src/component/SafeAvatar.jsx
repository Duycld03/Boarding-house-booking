import React, { useEffect } from "react";
import { Avatar } from "antd";
import { useImageValidation } from "../hooks/useImageValidation";
import DefaultAvatar from "../assets/images/none_avatar.png";

/**
 * SafeAvatar Component - Avatar với kiểm tra đường dẫn ảnh tự động
 * @param {Object} props - Props của component
 * @param {string|Object} props.src - Đường dẫn ảnh (string hoặc object có property url)
 * @param {string} props.size - Kích thước avatar
 * @param {string} props.shape - Hình dạng avatar
 * @param {string} props.className - Class CSS
 * @param {string} props.fallback - Ảnh dự phòng tùy chỉnh
 * @param {Function} props.onError - Callback khi có lỗi
 * @param {Function} props.onLoad - Callback khi load thành công
 * @returns {JSX.Element} SafeAvatar component
 */
const SafeAvatar = ({
  src,
  size = "large",
  shape = "circle",
  className = "",
  fallback = DefaultAvatar,
  onError = null,
  onLoad = null,
  ...props
}) => {
  // Xử lý src (có thể là string hoặc object)
  const imageSrc = typeof src === "object" ? src?.url : src;

  // Sử dụng custom hook
  const {
    src: validSrc,
    isValid,
    isLoading,
  } = useImageValidation(imageSrc, fallback);

  // Gọi callback khi có lỗi
  useEffect(() => {
    if (!isValid && onError) {
      onError();
    }
  }, [isValid, onError]);

  // Gọi callback khi load thành công
  useEffect(() => {
    if (isValid && !isLoading && onLoad) {
      onLoad();
    }
  }, [isValid, isLoading, onLoad]);

  return (
    <Avatar
      src={validSrc}
      shape={shape}
      size={size}
      className={`${className} ${isLoading ? "opacity-50" : ""}`}
      {...props}
    />
  );
};

export default SafeAvatar;
