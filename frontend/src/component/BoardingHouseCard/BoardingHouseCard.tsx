import React, { useState } from 'react';
import { Card, List, Typography, Image, Button } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  StarFilled,
  HeartFilled,
} from '@ant-design/icons';
import { Link } from 'react-router-dom'; // Import Link for navigation

interface BoardingHouseCardProps {
  id: number;
  name: string;
  price: string | number;
  detail: string;
  rating: number;
  img: string;
  timeAgo: number;
}

interface BoardingHouseGridProps {
  data: BoardingHouseCardProps[];
}

const ITEMS_PER_PAGE = 9;

const BoardingHouseCard = ({
  id,
  name,
  price,
  detail,
  rating,
  img,
  timeAgo,
}: BoardingHouseCardProps) => {
  const validRating = Number.isFinite(rating) ? Math.round(rating) : 0;

  // State for heart icon toggling
  const [liked, setLiked] = useState(false);

  // Handle heart icon click
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to the Link
    setLiked((prevLiked) => !prevLiked); // Toggle liked state
  };

  return (
    <Card
      hoverable
      style={{
        width: '100%',
        maxWidth: '400px',
        borderRadius: '8px',
        height: '380px', // Fixed height for the Card
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Image wrapped with Link for navigation */}
      <Link to={`/boarding-house/${id}`} style={{ width: '100%' }}>
        <Image
          alt={name}
          src={img}
          style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
        />

        {/* Content below image */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '10px' }}>
          <Typography.Title level={5}>{name}</Typography.Title>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
            {[...Array(validRating)].map((_, index) => (
              <StarFilled
                key={index}
                style={{ color: 'gold', fontSize: '20px' }}
              />
            ))}
          </div>
          <Typography.Text type="secondary">{price} VND/month</Typography.Text>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
              marginBottom: 4,
            }}
          >
            <Typography.Text strong>
              {detail} - {timeAgo}
            </Typography.Text>
          </div>
        </div>
      </Link>
    </Card>
  );
};

const BoardingHouseGrid = ({ data }: BoardingHouseGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = data.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div>
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
          <List.Item
            style={{
              marginBottom: 10,
              padding: 0,
              marginTop: 20,
              marginRight: 20,
            }}
          >
            <BoardingHouseCard {...item} />
          </List.Item>
        )}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end', // Align to the right
          alignItems: 'center',
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
    </div>
  );
};

export default BoardingHouseGrid;
