import React from 'react';
import { useEffect, useState } from 'react';
import { Modal, Rate } from 'antd';
import DefaultAccount from '../../../assets/images/none_avatar.png';

const DetailModal = ({ isOpen, onClose, review }) => {
  const [currentReport, setCurrentReport] = useState(null);
  useEffect(() => {
    if (isOpen && review) {
      setCurrentReport(review); // Chỉ cập nhật khi modal mở
    }
  }, [isOpen, review]);

  if (!review) return null;

  return (
    <Modal
      title={
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Review Detail</h2>
      }
      key={review?._id}
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      {/* Avatar & Reviewer Info */}
      <div>
        <p>
          <strong>Reviewer:</strong>
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

      {/* Review Content */}
      <p>
        <strong>Boarding House:</strong> {review.boardingHouseId?.name || 'N/A'}
      </p>
      <p>
        <strong>Content:</strong> {review.content}
      </p>
      <p>
        <strong>Rating:</strong> <Rate disabled defaultValue={review.rating} />
      </p>
      <p>
        <strong>Created At:</strong>{' '}
        {new Date(review.createdAt).toLocaleDateString('en-GB')}
      </p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div>
          <p>
            <strong>Review Images:</strong>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {review.images.map((img, index) => (
              <img
                key={index}
                width={150}
                height={150} // Set chiều cao cố định
                className="rounded-md transition-transform transform hover:scale-105"
                style={{ objectFit: 'cover', width: '150px', height: '150px' }} // Cố định cả width & height
                src={img.imageUrl}
                alt={`Review Image ${index}`}
              />
            ))}
          </div>
        </div>
      )}

      {review.replies?.length > 0 && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            background: '#f6f6f6',
            borderRadius: '5px',
            borderLeft: '4px solid #1890ff',
          }}
        >
          <p style={{ fontWeight: 'bold', color: '#1890ff' }}>Owner Reply:</p>
          <p>{review.replies[0].content}</p>
        </div>
      )}
    </Modal>
  );
};

export default DetailModal;
