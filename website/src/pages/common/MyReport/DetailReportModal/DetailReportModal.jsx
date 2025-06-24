import React, { useEffect, useState } from 'react';
import { Modal, Image, Avatar, Button, Tag, Rate } from 'antd';
import convertTimetap from '../../../../utils/convertTimetap';
import { useTheme } from '@/context/themeContext'; // nhớ kiểm tra lại đường dẫn
import DefaultAccount from '@/assets/images/none_avatar.png';

const DetailReportModal = ({ isOpen, onClose, reportData }) => {
  const [currentReport, setCurrentReport] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    if (isOpen && reportData) {
      setCurrentReport(reportData);
    }
  }, [isOpen, reportData]);

  if (!currentReport) return null;

  const { reporter, target, reason, details, images, createdAt, status } =
    currentReport;

  const bgClass = darkMode ? 'bg-[#111827] text-white' : 'bg-white text-black';

  return (
    <Modal
      key={reportData?._id}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      title={
        <h2 className="text-2xl font-bold">
          {reportData?.reportType === 'review'
            ? 'Review Report Detail'
            : 'Boarding House Report Detail'}
        </h2>
      }
      className={darkMode ? 'dark-modal' : ''}
      bodyStyle={{ padding: 0 }}
    >
      <div className={`space-y-6 p-6 ${bgClass}`}>
        {/* Section 1 */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-2">
            {reportData?.reportType === 'review'
              ? 'Review information'
              : 'Boarding house information'}
          </h2>

          <div className="flex items-center gap-3">
            {reportData?.reportType === 'review' ? (
              <>
                <Avatar
                  src={target?.accountId?.avatarImage?.url ?? DefaultAccount}
                  size={50}
                />
                <p>{target?.accountId?.fullname || 'Unknown'}</p>
              </>
            ) : (
              <p>
                <strong>Name:</strong> {target?.name || 'Unknown'}
              </p>
            )}
          </div>

          <p>
            <strong>Rating:</strong>{' '}
            <Rate disabled defaultValue={Number(target?.rating)} />
          </p>

          {reportData?.reportType === 'review' ? (
            <p>
              <strong>Content:</strong> {target?.content || 'No content'}
            </p>
          ) : (
            <p>
              <strong>Type:</strong>{' '}
              {target?.boardingHouseType?.name || 'Unknown'}
            </p>
          )}

          <p className="font-bold">Images:</p>
          <div className="grid grid-cols-3 gap-4">
            {target?.images?.length > 0 &&
            reportData?.reportType === 'review' ? (
              target.images.map((img, index) => (
                <Image
                  key={index}
                  width={150}
                  height={150}
                  className="rounded-md transition-transform transform hover:scale-105 p-1"
                  style={{ objectFit: 'cover' }}
                  src={img.imageUrl}
                  alt={`Review Image ${index}`}
                />
              ))
            ) : reportData?.reportType === 'boardingHouse' &&
              target.images[0]?.imageUrl ? (
              <Image
                width={150}
                height={150}
                className="rounded-md transition-transform transform hover:scale-105 p-1"
                style={{ objectFit: 'cover' }}
                src={images[0]?.imageUrl}
                alt="Boarding House Image"
              />
            ) : (
              <p>No images available</p>
            )}
          </div>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Report Information</h2>
          <div className="flex items-center gap-3 mb-2">
            <Avatar
              src={reporter?.avatarImage?.url ?? DefaultAccount}
              size={50}
            />
            <p>{reporter?.fullname || 'Unknown'}</p>
          </div>
          <p>
            <strong>Reported At:</strong> {convertTimetap(createdAt)}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <Tag
              color={
                status === 'pending'
                  ? 'orange'
                  : status === 'resolved'
                  ? 'green'
                  : 'red'
              }
            >
              {status}
            </Tag>
          </p>
          <p>
            <strong>Reason:</strong> {reason}
          </p>
          <p>
            <strong>Details:</strong> {details}
          </p>
          <p className="font-bold">Report Images:</p>
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            {images?.length > 0 ? (
              images.map((img, index) => (
                <Image
                  key={index}
                  width={150}
                  height={150}
                  className="rounded-md transition-transform transform hover:scale-105 p-1"
                  style={{ objectFit: 'cover' }}
                  src={img.imageUrl}
                  alt={`Report Image ${index}`}
                />
              ))
            ) : (
              <p>No images available</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailReportModal;
