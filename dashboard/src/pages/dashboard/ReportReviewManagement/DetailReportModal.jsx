import React, { useEffect, useState } from 'react';
import { Modal, Image, Avatar, Button, Tag, Rate } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/themeContext';
import convertTimetap from '../../../utils/convertTimetap';
import DefaultAccount from '../../../assets/images/none_avatar.png';

const DetailReportModal = ({ isOpen, onClose, reportData, onReplay }) => {
  const [currentReport, setCurrentReport] = useState(null);
  const { t } = useTranslation('reviewReportManagement');
  const { darkMode } = useTheme();

  useEffect(() => {
    if (isOpen && reportData) {
      setCurrentReport(reportData);
    }
  }, [isOpen, reportData]);

  if (!currentReport) return null;

  const { reporter, target, reason, details, images, createdAt, status } =
    currentReport;

  const bgClass = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black';

  return (
    <Modal
      key={currentReport?._id}
      open={isOpen}
      onCancel={onClose}
      title={
        <h2 className="text-2xl font-bold">
          {t('detail.title', 'Review Report Details')}
        </h2>
      }
      footer={[
        <Button
          key="close"
          onClick={onClose}
          className="bg-orange-600 text-white"
        >
          {t('buttons.close', 'Close')}
        </Button>,
        status !== 'rejected' && status !== 'resolved' && (
          <Button
            key="replay"
            className="bg-primary text-white ml-2 btn-replay"
            onClick={() => {
              onClose();
              setTimeout(() => onReplay(currentReport), 200);
            }}
          >
            {t('buttons.replay', 'Replay')}
          </Button>
        ),
      ]}
      className={darkMode ? 'dark-modal' : ''}
      bodyStyle={{ padding: 0 }}
    >
      <div className={`space-y-6 ${bgClass}`}>
        {/* Section 1: Review Info */}
        <div className={`rounded-md ${bgClass}`}>
          <h3 className="text-xl font-semibold mb-3">
            {t('detail.reviewInfo', 'Review Information')}
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <Avatar
              src={target?.accountId?.avatarImage?.url ?? DefaultAccount}
              size={50}
            />
            <p>
              {target?.accountId?.fullname || t('detail.unknown', 'Unknown')}
            </p>
          </div>
          <p>
            <strong>{t('detail.rating')}:</strong>{' '}
            <Rate disabled defaultValue={Number(target?.rating)} />
          </p>
          <p>
            <strong>{t('detail.content')}:</strong>{' '}
            {target?.content || t('detail.noContent')}
          </p>
          <p className="mt-2 font-semibold">{t('detail.reviewImages')}:</p>
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {target?.images?.length > 0 ? (
              target.images.map((img, idx) => (
                <Image
                  key={idx}
                  width={150}
                  height={150}
                  className="rounded-md transition-transform hover:scale-105"
                  style={{ objectFit: 'cover' }}
                  src={img.imageUrl}
                  alt={`Review Image ${idx}`}
                />
              ))
            ) : (
              <p>{t('detail.noImages')}</p>
            )}
          </div>
        </div>

        {/* Section 2: Report Info */}
        <div className={`rounded-md ${bgClass}`}>
          <h3 className="text-xl font-semibold mb-3">
            {t('detail.reportInfo', 'Report Information')}
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <Avatar
              src={reporter?.avatarImage?.url ?? DefaultAccount}
              size={50}
            />
            <p>{reporter?.fullname || t('detail.unknown')}</p>
          </div>
          <p>
            <strong>{t('detail.reportedAt')}:</strong>{' '}
            {convertTimetap(createdAt)}
          </p>
          <p>
            <strong>{t('columns.status')}:</strong>{' '}
            <Tag
              color={
                status === 'pending'
                  ? 'orange'
                  : status === 'resolved'
                  ? 'green'
                  : 'red'
              }
            >
              {t(`status.${status}`, status)}
            </Tag>
          </p>
          <p>
            <strong>{t('columns.reason')}:</strong>{' '}
            {t(`reasons.${reason}`, reason)}
          </p>
          <p>
            <strong>{t('detail.details')}:</strong>{' '}
            {details || t('detail.noContent')}
          </p>
          <p className="mt-2 font-semibold">{t('detail.reportImages')}:</p>
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {images?.length > 0 ? (
              images.map((img, idx) => (
                <Image
                  key={idx}
                  width={150}
                  height={150}
                  className="rounded-md transition-transform hover:scale-105"
                  style={{ objectFit: 'cover' }}
                  src={img.imageUrl}
                  alt={`Report Image ${idx}`}
                />
              ))
            ) : (
              <p>{t('detail.noImages')}</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailReportModal;
