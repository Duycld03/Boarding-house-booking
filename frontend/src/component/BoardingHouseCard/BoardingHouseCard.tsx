import React, { useState } from 'react';
import { Card, List, Typography, Image, Button } from 'antd';
import { LeftOutlined, RightOutlined, StarFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';

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

  return (
    <Link to={`/boarding-house/${id}`} style={{ width: '100%' }}>
      <Card
        hoverable
        cover={
          <Image
            alt={name}
            src={img}
            style={{
              width: '100%',
              height: '200px', // Cố định kích thước ảnh
              objectFit: 'cover',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
            }}
          />
        }
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '8px',
          border: '2px solid #ddd', // Tăng độ lớn border
          height: '370px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginRight: '10px', // Thêm margin-right
        }}
      >
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Typography.Title level={5} style={{ fontSize: '20px' }}>
            {name}
          </Typography.Title>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            {[...Array(validRating)].map((_, index) => (
              <StarFilled
                key={index}
                style={{ color: 'gold', fontSize: '20px' }}
              />
            ))}
          </div>
          <Typography.Text
            style={{
              color: '#f57c00',
              fontWeight: '700', // Tăng độ đậm
              fontSize: '18px', // Tăng kích thước chữ
              marginTop: '12px',
              marginBottom: '12px',
            }}
          >
            {price} VND/month
          </Typography.Text>
          <Typography.Text strong style={{ display: 'block', marginTop: 8 }}>
            {detail} - {timeAgo}
          </Typography.Text>
        </div>
      </Card>
    </Link>
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
          gutter: 20, // Tăng khoảng cách giữa các card
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
          display: 'flex',
          justifyContent: 'flex-end',
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
