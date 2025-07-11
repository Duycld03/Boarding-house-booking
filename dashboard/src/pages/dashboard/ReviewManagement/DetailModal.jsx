import React, { useState } from 'react';
import { Modal } from 'antd';
import {
  CloseOutlined,
  StarOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  MessageOutlined,
  CameraOutlined,
} from '@ant-design/icons';

import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import DefaultAccount from '../../../assets/images/none_avatar.png';
import convertTimetap from '../../../utils/convertTimetap';
import './Filter.css';

const DetailModal = ({ isOpen, onClose, review }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { darkMode } = useTheme();
  const { t } = useTranslation('reviewManagement');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarOutlined
        key={index}
        style={{
          color: index < rating ? '#facc15' : '#d1d5db',
          fontSize: 16,
        }}
      />
    ));
  };

  if (!review) return null;

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        key={review?._id}
        width={700}
        className={darkMode ? 'ant-modal-dark' : ''}
        bodyStyle={{
          backgroundColor: darkMode ? '#1f2937' : '#fff',
          color: darkMode ? '#fff' : '#000',
          maxHeight: '80vh',
          overflowY: 'auto',
          borderRadius: 16,
          padding: 24,
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span
              style={{
                color: darkMode ? '#fff' : '#000',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {t('buttons.detail')}
            </span>
          </div>
        }
      >
        {/* Reviewer Info */}
        <div
          style={{
            background: darkMode ? '#374151' : '#fafafa',
            padding: 20,
            borderRadius: 12,
            marginBottom: 16,
            border: `1px solid ${darkMode ? '#4b5563' : '#e8e8e8'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={review.accountId?.avatarImage?.url ?? DefaultAccount}
              alt="Avatar"
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #1890ff',
              }}
            />
            <div>
              <strong style={{ color: darkMode ? '#fff' : '#000' }}>
                {review.accountId?.username || 'N/A'}
              </strong>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {renderStars(review.rating)}
                </div>
                <span
                  style={{
                    backgroundColor: getRatingColor(review.rating),
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                >
                  {review.rating}/5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Boarding House */}
        <div
          style={{
            background: darkMode ? '#374151' : '#fafafa',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            border: `1px solid ${darkMode ? '#4b5563' : '#e8e8e8'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HomeOutlined style={{ color: '#1890ff', fontSize: 16 }} />
            <strong style={{ color: darkMode ? '#fff' : '#000' }}>
              {t('columns.boardingHouseName')}:
            </strong>
            <span style={{ color: darkMode ? '#e5e7eb' : '#595959' }}>
              {review.boardingHouseId?.name || 'N/A'}
            </span>
          </div>
        </div>

        {/* Content */}
        {/* Content */}
        <div
          style={{
            background: darkMode ? '#374151' : '#fafafa',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: `1px solid ${darkMode ? '#4b5563' : '#e8e8e8'}`,
          }}
        >
          <MessageOutlined style={{ color: '#1890ff', fontSize: 16 }} />
          <strong style={{ color: darkMode ? '#fff' : '#000' }}>
            {t('columns.content')}:
          </strong>
          <span
            style={{
              color: darkMode ? '#e5e7eb' : '#595959',
              wordBreak: 'break-word',
            }}
          >
            {review.content}
          </span>
        </div>

        {/* Created At */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <CalendarOutlined style={{ color: '#1890ff', fontSize: 16 }} />
          <strong style={{ color: darkMode ? '#fff' : '#000' }}>
            {t('columns.createdAt')}:
          </strong>
          <span style={{ color: darkMode ? '#e5e7eb' : '#595959' }}>
            {convertTimetap(review.createdAt)}
          </span>
        </div>

        {/* Images */}
        {review.images?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <CameraOutlined style={{ color: '#1890ff', fontSize: 16 }} />
              <strong style={{ color: darkMode ? '#fff' : '#000' }}>
                {t('filters.images')} ({review.images.length})
              </strong>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 12,
              }}
            >
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.imageUrl}
                  alt={`Review Image ${idx + 1}`}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  style={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = 'scale(1.05)')
                  }
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Owner Reply */}
        {review.replies?.length > 0 && (
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(24,144,255,0.1), rgba(24,144,255,0.05))',
              padding: 20,
              borderRadius: 12,
              border: `2px solid ${
                darkMode
                  ? 'rgba(24, 144, 255, 0.25)'
                  : 'rgba(24, 144, 255, 0.2)'
              }`,
              borderLeft: '6px solid #1890ff',
              marginTop: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <MessageOutlined style={{ color: '#1890ff', fontSize: 16 }} />
              <span style={{ color: '#1890ff', fontSize: 16, fontWeight: 600 }}>
                {t('columns.reply')}
              </span>
            </div>
            <div
              style={{
                color: darkMode ? '#e5e7eb' : '#595959',
                fontSize: 15,
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}
            >
              "{review.replies[0]?.content}"
            </div>
          </div>
        )}
      </Modal>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}
          >
            <img
              src={selectedImage}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(0, 0, 0, 0.7)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              <CloseOutlined style={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailModal;
