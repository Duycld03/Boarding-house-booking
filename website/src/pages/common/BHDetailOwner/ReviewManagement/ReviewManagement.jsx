import { useState } from 'react';
import { Table, Modal, Button, Input, Image, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { TextArea } = Input;

function ReviewManagement({ reviews }) {
  const { t } = useTranslation('review');

  // Dữ liệu cứng nếu không truyền từ props
  const defaultReviews = [
    {
      id: 1,
      reviewerName: 'John Doe',
      content: 'The room was clean and well-maintained.',
      createdAt: '2025-07-06T14:00:00Z',
      images: ['https://via.placeholder.com/100'],
      reply: '',
    },
    {
      id: 2,
      reviewerName: 'Jane Smith',
      content: 'Great location and helpful staff!',
      createdAt: '2025-07-05T10:30:00Z',
      images: [],
      reply: 'Thank you for your kind words!',
    },
    {
      id: 3,
      reviewerName: 'Nguyen Van A',
      content: 'Ổn nhưng cần cải thiện wifi.',
      createdAt: '2025-07-04T08:20:00Z',
      images: ['https://via.placeholder.com/120'],
      reply: '',
    },
  ];

  const [reviewList, setReviewList] = useState(reviews || defaultReviews);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editingReply, setEditingReply] = useState(false);

  const handleRowClick = (record) => {
    setSelectedReview(record);
    setReplyContent(record.reply || '');
    setEditingReply(!!record.reply);
    setIsModalVisible(true);
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;
    setReviewList((prev) =>
      prev.map((item) =>
        item.id === selectedReview.id ? { ...item, reply: replyContent } : item
      )
    );
    setEditingReply(true);
  };

  const handleUpdateReply = () => {
    if (!replyContent.trim()) return;
    setReviewList((prev) =>
      prev.map((item) =>
        item.id === selectedReview.id ? { ...item, reply: replyContent } : item
      )
    );
  };

  const handleDeleteReply = () => {
    setReviewList((prev) =>
      prev.map((item) =>
        item.id === selectedReview.id ? { ...item, reply: '' } : item
      )
    );
    setReplyContent('');
    setEditingReply(false);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedReview(null);
    setReplyContent('');
    setEditingReply(false);
  };

  const columns = [
    {
      title: t('table.reviewer'),
      dataIndex: 'reviewerName',
      key: 'reviewerName',
    },
    {
      title: t('table.content'),
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: t('table.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
    },
  ];

  return (
    <div>
      <Table
        rowKey="id"
        dataSource={reviewList}
        columns={columns}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        scroll={{ x: 600 }}
        style={{ cursor: 'pointer' }}
      />

      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        title={t('detail.title')}
      >
        {selectedReview && (
          <div>
            <p>
              <strong>{t('detail.reviewer')}:</strong>{' '}
              {selectedReview.reviewerName}
            </p>
            <p>
              <strong>{t('detail.content')}:</strong> {selectedReview.content}
            </p>
            <p>
              <strong>{t('detail.time')}:</strong>{' '}
              {dayjs(selectedReview.createdAt).format('DD/MM/YYYY HH:mm')}
            </p>

            {selectedReview.images?.length > 0 && (
              <Space style={{ marginBottom: 16 }}>
                {selectedReview.images.map((img, idx) => (
                  <Image key={idx} src={img} width={80} height={80} />
                ))}
              </Space>
            )}

            <div style={{ marginTop: 20 }}>
              <p>
                <strong>{t('detail.reply')}:</strong>
              </p>
              <TextArea
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />

              <Space style={{ marginTop: 16 }}>
                {!editingReply && (
                  <Button type="primary" onClick={handleReply}>
                    {t('actions.reply')}
                  </Button>
                )}
                {editingReply && (
                  <>
                    <Button type="primary" onClick={handleUpdateReply}>
                      {t('actions.update')}
                    </Button>
                    <Button danger onClick={handleDeleteReply}>
                      {t('actions.delete')}
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ReviewManagement;
