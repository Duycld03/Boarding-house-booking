import React, { useState } from 'react';
import { Card, List, Typography, Image, Button } from 'antd';
import { LeftOutlined, RightOutlined, StarFilled } from '@ant-design/icons';

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
  name,
  price,
  detail,
  rating,
  img,
  timeAgo,
}: BoardingHouseCardProps) => {
  // Kiểm tra và xử lý giá trị rating
  const validRating = Number.isFinite(rating) ? Math.round(rating) : 0;

  return (
    <Card
      hoverable
      cover={
        <Image
          alt={name}
          src={img}
          style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
        />
      }
      style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }} // Đảm bảo bo tròn card
    >
      <Typography.Title level={5}>{name}</Typography.Title>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
        {/* Render stars chỉ khi validRating hợp lệ */}
        {[...Array(validRating)].map((_, index) => (
          <StarFilled key={index} style={{ color: 'gold' }} />
        ))}
      </div>
      <Typography.Text type="secondary">${price}/month</Typography.Text>
      <Typography.Text strong style={{ display: 'block', marginTop: 4 }}>
        {detail} - {timeAgo}
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
