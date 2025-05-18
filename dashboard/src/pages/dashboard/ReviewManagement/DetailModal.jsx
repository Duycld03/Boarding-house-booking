import React, { useEffect, useState } from 'react';
import { Modal, Rate } from 'antd';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import DefaultAccount from '../../../assets/images/none_avatar.png';

const DetailModal = ({ isOpen, onClose, review }) => {
  const [currentReport, setCurrentReport] = useState(null);
  const { darkMode } = useTheme();
  const { t } = useTranslation('reviewManagement');

  useEffect(() => {
    if (isOpen && review) {
      setCurrentReport(review);
    }
  }, [isOpen, review]);

  if (!review) return null;

  return (
    <Modal
      title={
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: darkMode ? '#fff' : '#000',
          }}
        >
          {t('buttons.detail')}
        </h2>
      }
      key={review?._id}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className={darkMode ? 'ant-modal-dark' : ''}
      bodyStyle={{
        backgroundColor: darkMode ? '#1f2937' : '#fff',
        color: darkMode ? '#fff' : '#000',
      }}
    >
      {/* Reviewer */}
      <div>
        <p>
          <strong>{t('columns.reviewer')}:</strong>
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '15px',
          }}
        >
          <img
            src={review.accountId?.avatarImage?.url ?? DefaultAccount}
            alt="Avatar"
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              marginRight: '10px',
              objectFit: 'cover',
            }}
          />
          <p style={{ fontWeight: 'bold' }}>
            {review.accountId?.username || 'N/A'}
          </p>
        </div>
      </div>

      {/* Content */}
      <p>
        <strong>{t('columns.boardingHouseName')}:</strong>{' '}
        {review.boardingHouseId?.name || 'N/A'}
      </p>
      <p>
        <strong>{t('columns.content')}:</strong> {review.content}
      </p>
      <p>
        <strong>{t('columns.rating')}:</strong>{' '}
        <Rate disabled defaultValue={review.rating} />
      </p>
      <p>
        <strong>{t('columns.createdAt')}:</strong>{' '}
        {new Date(review.createdAt).toLocaleDateString('en-GB')}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div>
          <p>
            <strong>{t('filters.images')}</strong>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {review.images.map((img, index) => (
              <img
                key={index}
                width={150}
                height={150}
                className="rounded-md transition-transform transform hover:scale-105"
                style={{ objectFit: 'cover', width: '150px', height: '150px' }}
                src={img.imageUrl}
                alt={`Review Image ${index}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reply */}
      {review.replies?.length > 0 && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            background: darkMode ? '#374151' : '#f6f6f6',
            borderRadius: '5px',
            borderLeft: '4px solid #1890ff',
            color: darkMode ? '#fff' : '#000',
          }}
        >
          <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {t('buttons.owner')}:
          </p>
          <p>{review.replies[0].content}</p>
        </div>
      )}
    </Modal>
  );
};

export default DetailModal;
