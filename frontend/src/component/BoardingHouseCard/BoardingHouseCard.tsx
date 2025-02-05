import React, { useState } from 'react';
import { Card, List, Typography, Image, Button } from 'antd';
import { LeftOutlined, RightOutlined, StarFilled } from '@ant-design/icons';

interface BoardingHouseCardProps {
  id: number;
  name: string;
  price: string | number;
  location: string;
  rating: number;
  img: string;
}

interface BoardingHouseGridProps {
  data: BoardingHouseCardProps[];
}

const ITEMS_PER_PAGE = 9;

const BoardingHouseCard = ({
  name,
  price,
  location,
  rating,
  img,
}: BoardingHouseCardProps) => {
  // Round the rating to the nearest integer
  const roundedRating = Math.round(rating);

  return (
    <Card
      hoverable
      cover={
        <div
          style={{
            borderTop: '2px solid #ddd',
            borderRadius: 8,
            padding: 4,
          }}
        >
          <Image alt={name} src={img} />
        </div>
      }
      style={{ width: '100%', maxWidth: '400px' }}
    >
      <Typography.Title level={5}>{name}</Typography.Title>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
        {/* Render the number of stars based on roundedRating */}
        {[...Array(roundedRating)].map((_, index) => (
          <StarFilled key={index} style={{ color: 'gold' }} />
        ))}
        <Typography.Text style={{ marginLeft: 5 }}></Typography.Text>
      </div>
      <Typography.Text type="secondary" style={{ display: 'block' }}>
        ${price}/month
      </Typography.Text>
      <Typography.Text strong style={{ display: 'block', marginTop: 4 }}>
        {location}
      </Typography.Text>
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
          sm: 2,
          md: 3,
          lg: 4,
          xl: 3,
        }}
        dataSource={paginatedData}
        renderItem={(item) => (
          <List.Item style={{ marginBottom: 10, padding: 0, marginTop: 20 }}>
            <BoardingHouseCard {...item} />
          </List.Item>
        )}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end', // Căn bên phải
          alignItems: 'center',
          marginTop: 16,
          gap: 10,
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
