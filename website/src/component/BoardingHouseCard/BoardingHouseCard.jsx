import React, { useEffect, useState } from "react";
import { Card, List, Typography, Image, Button, Spin } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  StarFilled,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addFavorite, getFavorite } from "../../api/favoriteManagement"; // Import API
import { useCurrentUser } from "@/context/userContext";
import userRoles from "@/constants/userRole";

const ITEMS_PER_PAGE = 9;

const BoardingHouseCard = ({
  id,
  name,
  price,
  detail,
  rating,
  img,
  timeAgo,
  isFavorite: initialFavorite = false,
}) => {
  const { hasRole } = useCurrentUser();
  const isOwner = hasRole(userRoles.owner);

  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const validRating = Number.isFinite(rating) ? Math.round(rating) : 0;

  // Điều hướng khi click vào card
  const handleCardClick = () => {
    navigate(`/boarding-house/${id}`);
  };

  // Xử lý thêm/xóa yêu thích
  const handleFavoriteClick = async (event) => {
    event.stopPropagation(); // Ngăn chặn click vào card

    try {
      console.log("Calling API with id:", id);
      const response = await addFavorite(id); // Gọi API
      console.log("API Response:", response);

      if (response && typeof response.isFavorite !== "undefined") {
        setIsFavorite(response.isFavorite); // Cập nhật trạng thái
      } else {
        console.error("Invalid response structure:", response);
        toast.error("Dữ liệu phản hồi không hợp lệ!");
      }
    } catch (error) {
      navigate(`/login`);
    }
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      cover={
        <Image
          alt={name}
          src={img}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        />
      }
      style={{
        width: "100%",
        maxWidth: "400px",
        borderRadius: "8px",
        border: "2px solid #ddd",
        height: "370px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        marginRight: "10px",
      }}
    >
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Typography.Title level={5} style={{ fontSize: "20px" }}>
          {name}
        </Typography.Title>

        {/* Hiển thị rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          {[...Array(validRating)].map((_, index) => (
            <StarFilled
              key={index}
              style={{ color: "gold", fontSize: "20px" }}
            />
          ))}
        </div>

        {/* Giá tiền */}
        <Typography.Text
          style={{
            color: "#f57c00",
            fontWeight: "700",
            fontSize: "18px",
            marginTop: "12px",
            marginBottom: "12px",
          }}
        >
          {price} VND/month
        </Typography.Text>

        {/* Detail + TimeAgo + Icon Heart */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <Typography.Text strong>
            {detail} - {timeAgo}
          </Typography.Text>

          {/* Icon heart */}
          <Button
            type="text"
            onClick={handleFavoriteClick}
            disabled={isOwner}
            icon={
              isFavorite ? (
                <HeartFilled style={{ color: "red", fontSize: "22px" }} />
              ) : (
                <HeartOutlined style={{ fontSize: "22px" }} />
              )
            }
          />
        </div>
      </div>
    </Card>
  );
};

const BoardingHouseGrid = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách phòng yêu thích khi trang tải
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await getFavorite();
        if (response && Array.isArray(response.favorites)) {
          setFavoriteIds(response.favorites.map((fav) => fav.id)); // Lưu danh sách ID yêu thích
        }
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = data
    .slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
    .map((item) => ({
      ...item,
      isFavorite: favoriteIds.includes(item.id), // Kiểm tra xem có trong danh sách yêu thích không
    }));

  return (
    <div>
      {loading ? (
        <Spin
          size="large"
          style={{ display: "block", textAlign: "center", margin: "20px" }}
        />
      ) : (
        <>
          <List
            grid={{
              gutter: 10,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 3,
            }}
            dataSource={paginatedData}
            renderItem={(item) => (
              <List.Item style={{ padding: 0 }}>
                <BoardingHouseCard {...item} />
              </List.Item>
            )}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: 16,
              gap: 10,
              marginRight: 20,
              marginBottom: 20,
            }}
          >
            <Button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              icon={<LeftOutlined />}
            />
            <Typography.Text>
              {currentPage + 1} / {totalPages}
            </Typography.Text>
            <Button
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              icon={<RightOutlined />}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BoardingHouseGrid;
