import { useEffect, useState } from 'react';
import { TableCustom as Table, Button } from '@/component';
import { Modal, Input, Image, Space, Tooltip, Avatar } from 'antd';
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
        setReviewList((prev) =>
          prev.map((item) =>
            item._id === selectedReview._id
              ? { ...item, replyContent: { content: replyContent.trim() } }
              : item
          )
        );
        setEditingReply(true);
        handleCloseModal();
      } else {
        throw new Error(res.data?.message);
      }
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
        setReviewList((prev) =>
          prev.map((item) =>
            item._id === selectedReview._id
              ? {
                  ...item,
                  replyContent: {
                    ...item.replyContent,
                    content: replyContent.trim(),
                  },
                }
              : item
          )
        );
        handleCloseModal();
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
        setReviewList((prev) =>
          prev.map((item) =>
            item._id === selectedReview._id
              ? { ...item, replyContent: null }
              : item
          )
        );
        handleCloseModal();
      } else {
        throw new Error(res.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t('messages.deleteFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedReview(null);
    setReplyContent('');
    setEditingReply(false);
  };

  const handleTableChange = (paginationData) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: paginationData.current,
      limit: paginationData.pageSize,
    }));
  };

  const tablePaginationConfig = {
    current: pagination.currentPage,
    pageSize: pagination.limit,
    total: pagination.totalItems,
    showSizeChanger: true,
  };

  const columns = [
    {
      title: t('table.reviewer'),
      key: 'reviewer',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.accountId?.avatarImage?.url}
            alt="avatar"
            size={32}
          />
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
          <span
            style={{
              display: 'inline-block',
              maxWidth: 200,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {text}
          </span>
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
        pagination={tablePaginationConfig}
        onChange={handleTableChange}
      />

      <Modal
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        title={t('detail.title')}
        className={darkMode ? 'dark-modal' : ''}
        bodyStyle={{
          backgroundColor: darkMode ? '#111827' : undefined,
          color: darkMode ? '#f9fafb' : undefined,
        }}
      >
        {selectedReview && (
          <div>
            <Space align="center" style={{ marginBottom: 8 }}>
              <Avatar
                src={selectedReview.accountId?.avatarImage?.url}
                alt="avatar"
              />
              <span>{selectedReview.accountId?.fullname}</span>
            </Space>
            <p>
              <strong>{t('detail.content')}:</strong> {selectedReview.content}
            </p>
            <p>
              <strong>{t('detail.time')}:</strong>{' '}
              {convertTimetap(selectedReview.createdAt, true)}
            </p>
            <p>
              <strong>{t('detail.image')}:</strong>
            </p>

            {selectedReview.images?.length > 0 && (
              <Space style={{ flexWrap: 'wrap' }}>
                {selectedReview.images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img.imageUrl}
                    width={80}
                    height={80}
                    style={{
                      objectFit: 'cover',
                      borderRadius: 4,
                      backgroundColor: darkMode ? '#374151' : '#f0f0f0',
                    }}
                  />
                ))}
              </Space>
            )}

            <div>
              <p>
                <strong>{t('detail.reply')}:</strong>
              </p>
              <TextArea
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={
                  t('replyPlaceholder') || 'Enter your reply here...'
                }
                style={{
                  backgroundColor: darkMode ? '#374151' : '#fff',
                  color: darkMode ? '#fff' : undefined,
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
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ReviewManagement;
