import React, { useEffect, useState } from 'react';
import { Modal, Image, Avatar, Button, Tag, Rate } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/themeContext';
import convertTimetap from '@/utils/convertTimetap';
import DefaultAccount from '@/assets/images/none_avatar.png';

const ReportDetailModal = ({ isOpen, onClose, reportData, onReplay }) => {
  const [currentReport, setCurrentReport] = useState(null);
  const { darkMode } = useTheme();
  const { t } = useTranslation('reportBoardingHouse');

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

  // ✅ Hàm dịch lý do tố cáo
  const coverReasonToMultipleLanguage = (reasonValue) => {
    const reasonLowerCase = reasonValue?.toLowerCase();
    switch (reasonLowerCase) {
      case 'scam on rent or deposit':
        return t('reason.scamOnRentOrDeposit');
      case 'false advertisement':
        return t('reason.falseAdvertisement');
      case 'violation of privacy':
        return t('reason.violationOfPrivacy');
      case 'unfriendly landlord':
        return t('reason.unfriendlyLandlord');
      case 'poor security':
        return t('reason.poorSecurity');
      default:
        return reasonValue || t('detail.unknown');
    }
  };

  return (
    <Modal
      key={reportData?._id}
      open={isOpen}
      onCancel={onClose}
      destroyOnClose
      title={<h2 className="text-2xl font-bold">{t('detail.title')}</h2>}
      className={darkMode ? 'dark-modal' : ''}
      bodyStyle={{ padding: 0 }}
      footer={[
        <Button
          key="close"
          onClick={onClose}
          className="bg-orange-600 text-white"
        >
          {t('buttons.close')}
        </Button>,
        status !== 'rejected' && status !== 'resolved' && (
          <Button
            key="replay"
            className="bg-primary text-white ml-2 btn-replay"
            onClick={() => {
              onClose();
              setTimeout(() => onReplay?.(currentReport), 200);
            }}
          >
            {t('buttons.replay')}
          </Button>
        ),
      ]}
    >
      <div>
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
        <div className="grid grid-cols-3 gap-1.5">
          {reportData?.reportType === 'review' && target?.images?.length > 0 ? (
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
              width={150}
              height={150}
              className="rounded-md transition-transform transform hover:scale-105"
              style={{ objectFit: 'cover' }}
              src={images?.[0]?.imageUrl}
              alt="Boarding House Image"
            />
          ) : (
            <p>{t('detail.noImages')}</p>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-2 mt-6">
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
          <strong>{t('detail.reportedAt')}:</strong> {convertTimetap(createdAt)}
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
          {coverReasonToMultipleLanguage(reason)}
        </p>

        <p>
          <strong>{t('myReport.details')}:</strong> {details}
        </p>

        <p className="font-bold">{t('detail.reportImages')}:</p>
        <div className="grid grid-cols-3 gap-[4px]">
          {images?.length > 0 ? (
            images.map((img, index) => (
              <div key={index} className="p-[2px]">
                <Image
                  width={150}
                  height={150}
                  className="rounded-md transition-transform transform hover:scale-105"
                  style={{ objectFit: 'cover' }}
                  src={img.imageUrl}
                  alt={`Report Image ${index}`}
                />
              </div>
            ))
          ) : (
            <p>{t('detail.noImages')}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReportDetailModal;
