import { useEffect, useState } from 'react';
import { TableCustom as Table, Button } from '@/component';
import { Modal, Input, Image, Space, Avatar, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import convertTimetap from '@/utils/convertTimetap';
import {
  replyReview,
  updateReplyReview,
  softDeleteReplyReview,
} from '@/api/reviewAPI';
import { getReviewByBhId } from '@/api/ownerUser/boardingHouseAPI';
import { toast } from 'react-toastify';
import { useTheme } from '@/context/themeContext';
import './ReviewManagement.css';
import {
  CloseOutlined,
  StarOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  MessageOutlined,
  CameraOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

function ReviewManagement({ boardingHouseId }) {
  const { t } = useTranslation('review');
  const { darkMode } = useTheme();

  const [reviewList, setReviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editingReply, setEditingReply] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    limit: 10,
  });

  useEffect(() => {
    const fetchReviews = async () => {
      if (!boardingHouseId) return;
      try {
        setLoading(true);
        const response = await getReviewByBhId(boardingHouseId, {
          page: pagination.currentPage,
          limit: pagination.limit,
        });
        if (response?.success && Array.isArray(response.data)) {
          setReviewList(response.data);
          setPagination((prev) => ({
            ...prev,
            totalItems: response.pagination?.totalItems || response.data.length,
          }));
        } else {
          toast.error(t('messages.fetchFailed'));
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || t('messages.fetchFailed')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [boardingHouseId, pagination.currentPage, pagination.limit, t]);

  const handleRowClick = (record) => {
    setSelectedReview(record);
    setReplyContent(record.replyContent?.content || '');
    setEditingReply(!!record.replyContent?.content);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedReview(null);
    setReplyContent('');
    setEditingReply(false);
  };
  const handleReply = async () => {
    if (!replyContent.trim()) return toast.error(t('messages.emptyReply'));
    if (!selectedReview?._id) return;

    try {
      setActionLoading(true);
      const res = await replyReview({
        parentId: selectedReview._id,
        content: replyContent.trim(),
      });

      if (res.success) {
        toast.success(t('messages.replySuccess'));

        // ✅ Fetch lại từ backend để lấy replyContent._id mới
        const refreshed = await getReviewByBhId(boardingHouseId, {
          page: pagination.currentPage,
          limit: pagination.limit,
        });

        if (refreshed.success) {
          const updatedReview = refreshed.data.find(
            (r) => r._id === selectedReview._id
          );

          setReviewList(refreshed.data);
          setSelectedReview(updatedReview);
          setReplyContent(updatedReview.replyContent?.content || '');
          setEditingReply(true);
          setIsModalVisible(true); // vẫn giữ modal mở
        }
      } else throw new Error(res.data?.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || t('messages.replyFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateReply = async () => {
    if (!replyContent.trim()) return toast.error(t('messages.emptyReply'));
    if (!selectedReview?.replyContent?._id) return;

    try {
      setActionLoading(true);
      const res = await updateReplyReview({
        replyId: selectedReview.replyContent._id,
        content: replyContent.trim(),
      });

      if (res.success) {
        toast.success(t('messages.updateSuccess'));

        const updatedList = reviewList.map((item) =>
          item._id === selectedReview._id
            ? {
                ...item,
                replyContent: {
                  ...item.replyContent,
                  content: replyContent.trim(),
                },
              }
            : item
        );

        setReviewList(updatedList);

        // ✅ Cập nhật selectedReview để phản ánh nội dung mới trên UI
        setSelectedReview((prev) => ({
          ...prev,
          replyContent: {
            ...prev.replyContent,
            content: replyContent.trim(),
          },
        }));
        setEditingReply(true);

        // ✅ Chỉ đóng modal sau khi cập nhật state xong
        setTimeout(() => {
          handleCloseModal();
        }, 100);
      } else {
        throw new Error(res.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t('messages.updateFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!selectedReview?.replyContent?._id) return;

    try {
      setActionLoading(true);
      const res = await softDeleteReplyReview(selectedReview.replyContent._id);

      if (res.success) {
        toast.success(t('messages.deleteSuccess'));

        const updatedReview = {
          ...selectedReview,
          replyContent: null,
        };

        setReviewList((prev) =>
          prev.map((item) =>
            item._id === selectedReview._id ? updatedReview : item
          )
        );

        // ✅ Cập nhật lại selectedReview để đồng bộ state
        setSelectedReview(updatedReview);
        setReplyContent('');
        setEditingReply(false);
      } else throw new Error(res.data?.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || t('messages.deleteFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleTableChange = (paginationData) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: paginationData.current,
      limit: paginationData.pageSize,
    }));
  };

  const columns = [
    {
      title: t('table.reviewer'),
      key: 'reviewer',
      render: (_, record) => (
        <Space>
          <Avatar src={record.accountId?.avatarImage?.url} size={32} />
          <span>{record.accountId?.fullname || '-'}</span>
        </Space>
      ),
    },
    {
      title: t('table.content'),
      dataIndex: 'content',
      key: 'content',
      render: (text) => (
        <Tooltip title={text}>
          <span className="truncate-text">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: t('table.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => convertTimetap(text, true),
    },
  ];

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : ''}>
      <Table
        tableName={t('tableName')}
        data={reviewList}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
        scroll={{ x: 600 }}
        style={{ cursor: 'pointer' }}
        pagination={{
          current: pagination.currentPage,
          pageSize: pagination.limit,
          total: pagination.totalItems,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />

      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        className={darkMode ? 'dark-modal' : ''}
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
              {t('detail.title')}
            </span>
          </div>
        }
      >
        {selectedReview && (
          <>
            <div
              style={{
                background: darkMode ? '#374151' : '#fafafa',
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${darkMode ? '#4b5563' : '#e8e8e8'}`,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Avatar
                src={selectedReview.accountId?.avatarImage?.url}
                size={60}
                style={{ border: '2px solid #1890ff' }}
              />
              <div>
                <strong>{selectedReview.accountId?.fullname || '-'}</strong>
                <p style={{ margin: 0 }}>{selectedReview.content}</p>
              </div>
            </div>

            <p style={{ marginBottom: 8 }}>
              <strong>{t('detail.content')}:</strong> {selectedReview.content}
            </p>

            <p style={{ marginBottom: 8 }}>
              <strong>{t('detail.time')}:</strong>{' '}
              {convertTimetap(selectedReview.createdAt)}
            </p>

            {selectedReview.images?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p>
                  <strong>{t('detail.image')}</strong>
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: 12,
                  }}
                >
                  {selectedReview.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img.imageUrl}
                      width={80}
                      height={80}
                      style={{
                        objectFit: 'cover',
                        borderRadius: 8,
                        backgroundColor: darkMode ? '#374151' : '#f0f0f0',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <p>
              <strong>{t('detail.reply')}</strong>
            </p>
            <TextArea
              rows={3}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t('replyPlaceholder')}
              style={{
                backgroundColor: darkMode ? '#374151' : '#fff',
                color: darkMode ? '#fff' : '#000',
                border: `1px solid ${darkMode ? '#4b5563' : '#d9d9d9'}`,
                borderRadius: 8,
              }}
            />
            <Space style={{ marginTop: 16 }}>
              {!editingReply && (
                <Button
                  onClick={handleReply}
                  loading={actionLoading}
                  title={t('actions.reply')}
                  btnReplay
                />
              )}
              {editingReply && (
                <>
                  <Button
                    onClick={handleUpdateReply}
                    loading={actionLoading}
                    title={t('actions.update')}
                    btnUpdate
                  />
                  <Button
                    onClick={handleDeleteReply}
                    loading={actionLoading}
                    title={t('actions.delete')}
                    btnDelete
                  />
                </>
              )}
            </Space>
          </>
        )}
      </Modal>
    </div>
  );
}

export default ReviewManagement;
