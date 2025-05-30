import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Image, Button, Spin } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  StarFilled,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addFavorite, getFavorite } from '../../api/favoriteManagement';
import { useCurrentUser } from '@/context/userContext';
import userRoles from '@/constants/userRole';
import { formatTimeAgo } from '@/utils/timeUtils';
import { useTranslation } from 'react-i18next';
import truncateDetail from '@/utils/truncateDetail';
import { useTheme } from '@/context/ThemeContext';
import formatAmount from '@/utils/formatAmount';

const ITEMS_PER_PAGE = 9;

const BoardingHouseCard = ({
  id,
  name,
  price,
  detail,
  rating,
  img,
  updatedAt,
  isFavorite: initialFavorite = false,
}) => {
  const { hasRole } = useCurrentUser();
  const isOwner = hasRole(userRoles.owner);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const validRating = Number.isFinite(rating) ? Math.round(rating) : 0;
  const { t } = useTranslation('home');
  const timeAgoText = formatTimeAgo(updatedAt, t);
  const translatedDetail = truncateDetail(
    detail
      ? t(`location.${detail}`, { defaultValue: detail })
      : t('location.No address provided')
  );

  const handleCardClick = () => {
    navigate(`/boarding-house/${id}`);
  };

  const handleFavoriteClick = async (event) => {
    event.stopPropagation();
    try {
      const response = await addFavorite(id);
      if (response && typeof response.isFavorite !== 'undefined') {
        setIsFavorite(response.isFavorite);
      } else {
        toast.error('Dữ liệu phản hồi không hợp lệ!');
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
            width: '100%',
            height: '200px',
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
        border: '2px solid #ddd',
        height: '370px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        marginRight: '10px',
        backgroundColor: darkMode ? '#1f2937' : '#fff',
        color: darkMode ? '#fff' : '#000',
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Typography.Title
          level={5}
          style={{ fontSize: '20px', color: darkMode ? '#fff' : undefined }}
        >
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
            fontWeight: '700',
            fontSize: '18px',
            marginTop: '12px',
            marginBottom: '12px',
            display: 'block',
          }}
        >
          {formatAmount(price)} {t('currencyPerMonth')}{' '}
        </Typography.Text>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
            color: darkMode ? '#e5e7eb' : undefined,
          }}
        >
          <Typography.Text
            strong
            style={{ color: darkMode ? '#e5e7eb' : undefined }}
          >
            {translatedDetail} - {timeAgoText}
          </Typography.Text>

          <Button
            type="text"
            onClick={handleFavoriteClick}
            disabled={isOwner}
            icon={
              isFavorite ? (
                <HeartFilled style={{ color: 'red', fontSize: '22px' }} />
              ) : (
                <HeartOutlined
                  style={{
                    fontSize: '22px',
                    color: darkMode ? '#fff' : undefined,
                  }}
                />
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
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await getFavorite();
        if (response && Array.isArray(response.favorites)) {
          setFavoriteIds(response.favorites.map((fav) => fav.id));
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
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
      isFavorite: favoriteIds.includes(item.id),
    }));

  return (
    <div
      style={{
        backgroundColor: darkMode ? '#1f2937' : '#fff',
        padding: 20,
      }}
    >
      {loading ? (
        <Spin
          size="large"
          style={{ display: 'block', textAlign: 'center', margin: '20px' }}
        />
      ) : (
        <>
          <List
            grid={{ gutter: 10, xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
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
            }}
          >
            <Button
              shape="circle"
              size="middle"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              icon={<LeftOutlined />}
              style={{
                backgroundColor: darkMode ? '#374151' : '#fff',
                border: `1px solid ${darkMode ? '#4B5563' : '#d9d9d9'}`,
                color: darkMode ? '#fff' : '#000',
              }}
            />

            <Typography.Text style={{ color: darkMode ? '#fff' : '#000' }}>
              {currentPage + 1} / {totalPages}
            </Typography.Text>

            <Button
              shape="circle"
              size="middle"
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              icon={<RightOutlined />}
              style={{
                backgroundColor: darkMode ? '#374151' : '#fff',
                border: `1px solid ${darkMode ? '#4B5563' : '#d9d9d9'}`,
                color: darkMode ? '#fff' : '#000',
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BoardingHouseGrid;
