import React, { useEffect, useState } from 'react';
import { Modal, Image, Avatar, Tag, Rate, Card } from 'antd';
import convertTimetap from '@/utils/convertTimetap';
import { useTheme } from '@/context/themeContext';
import { useTranslation } from 'react-i18next';
import DefaultAccount from '@/assets/images/none_avatar.png';

const DetailReportModal = ({ isOpen, onClose, reportData }) => {
  const [currentReport, setCurrentReport] = useState(null);
  const { darkMode } = useTheme();
  const { t } = useTranslation('myreport');

  useEffect(() => {
    if (isOpen && reportData) {
      setCurrentReport(reportData);
    }
  }, [isOpen, reportData]);

  if (!currentReport) return null;

  const { reporter, target, reason, details, images, createdAt, status } =
    currentReport;

  const cardClass = darkMode
    ? 'bg-[#1f2937] text-white'
    : 'bg-white text-black';

  return (
    <Modal
      key={reportData?._id}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      title={<h2 className="text-2xl font-bold">{t('detail.title')}</h2>}
      className={darkMode ? 'dark-modal' : ''}
      bodyStyle={{ padding: 0 }}
    >
      <div className="space-y-6 p-6">
        {/* Section 1: Review / Boarding House Info */}
        <Card bordered={false} className={`shadow-sm ${cardClass}`}>
          <h2 className="text-xl font-semibold mb-2">
            {reportData?.reportType === 'review'
              ? t('detail.reviewInfo')
              : t('detail.boardingInfo')}
          </h2>

          <div className="flex items-center gap-3">
            {reportData?.reportType === 'review' ? (
              <>
                <Avatar
                  src={target?.accountId?.avatarImage?.url ?? DefaultAccount}
                  size={50}
                />
                <p>{target?.accountId?.fullname || t('detail.unknown')}</p>
              </>
            ) : (
              <p>
                <strong>{t('detail.name')}:</strong>{' '}
                {target?.name || t('detail.unknown')}
              </p>
            )}
          </div>

          <p>
            <strong>{t('detail.rating')}:</strong>{' '}
            <Rate disabled defaultValue={Number(target?.rating)} />
          </p>

          {reportData?.reportType === 'review' ? (
            <p>
              <strong>{t('detail.content')}:</strong>{' '}
              {target?.content || t('detail.noContent')}
            </p>
          ) : (
            <p>
              <strong>{t('detail.type')}:</strong>{' '}
              {t(`boardingHouseTypes.${target?.boardingHouseType?.name}`, {
                defaultValue:
                  target?.boardingHouseType?.name || t('detail.unknown'),
              })}
            </p>
          )}

          <p className="font-bold">{t('detail.images')}:</p>
          <div className="grid grid-cols-3">
            {reportData?.reportType === 'review' &&
            target?.images?.length > 0 ? (
              target.images.map((img, index) => (
                <Image
                  key={index}
                  width={150}
                  height={150}
                  className="rounded-md transition-transform transform hover:scale-105"
                  style={{ objectFit: 'cover' }}
                  src={img.imageUrl}
                  alt={`Review Image ${index}`}
                />
              ))
            ) : reportData?.reportType === 'boardingHouse' &&
              target?.images?.[0]?.imageUrl ? (
              <Image
                width={130}
                height={130}
                className="rounded-md transition-transform transform hover:scale-105 p-1"
                style={{ objectFit: 'cover' }}
                src={images?.[0]?.imageUrl}
                alt="Boarding House Image"
              />
            ) : (
              <p>{t('detail.noImages')}</p>
            )}
          </div>
        </Card>

        {/* Section 2: Report Info */}
        <Card bordered={false} className={`shadow-sm ${cardClass}`}>
          <h2 className="text-xl font-semibold mb-2">
            {t('detail.reportInfo')}
          </h2>

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
            <strong>{t('myReport.status')}:</strong>{' '}
            <Tag
              color={
                status === 'pending'
                  ? 'orange'
                  : status === 'resolved'
                  ? 'green'
                  : 'red'
              }
            >
              {t(`status.${status}`)}
            </Tag>
          </p>

          <p>
            <strong>{t('myReport.reason')}:</strong>{' '}
            {t(`reasons.${reason}`, { defaultValue: reason })}
          </p>

          <p>
            <strong>{t('myReport.details')}:</strong> {details}
          </p>

          <p className="font-bold">{t('detail.reportImages')}:</p>
          <div className="grid grid-cols-3">
            {images?.length > 0 ? (
              images.map((img, index) => (
                <div key={index} className="p-1">
                  <Image
                    width={130}
                    height={130}
                    className="rounded-md transition-transform transform hover:scale-105"
                    style={{ objectFit: 'cover' }}
                    src={img.imageUrl}
                    alt={`Review Image ${index}`}
                  />
                </div>
              ))
            ) : (
              <p>{t('detail.noImages')}</p>
            )}
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default DetailReportModal;
