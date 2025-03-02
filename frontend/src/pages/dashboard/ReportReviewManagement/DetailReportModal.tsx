import React from 'react';
import { Modal, Image, Avatar, Button } from 'antd';
import convertTimetap from '../../../utils/convertTimetap';

const DetailReportModal = ({ isOpen, onClose, reportData, onReplay }) => {
  if (!reportData) return null;

  return (
    <Modal
      title="Review Details"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          onClick={onClose}
          className="bg-orange-600 text-white"
        >
          Close
        </Button>,
        reportData.status !== 'rejected' &&
          reportData.status !== 'resolved' && (
            <Button
              title={'Replay'}
              className="bg-primary text-white ml-2 btn-replay"
              onClick={() => {
                onClose(); // Đóng popup detail trước
                setTimeout(() => {
                  onReplay(reportData); // Mở popup replay sau một chút để tránh lag
                }, 200);
              }}
            >
              Replay
            </Button>
          ),
      ]}
    >
      <div className="space-y-4">
        {/* Phần 1: Review bị tố cáo */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold">🔍 Review Information</h2>
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium">Hihi</p>
            </div>
          </div>
          <p>
            <strong>Rating:</strong> ⭐ /5
          </p>
          <p>
            <strong>Content:</strong> No content'
          </p>
          <p>
            <strong>Images:</strong>
          </p>
        </div>

        {/* Phần 2: Đơn tố cáo */}
        <div>
          <h2 className="text-lg font-semibold">🚨 Report Information</h2>
          <div className="flex items-center gap-3">
            <Avatar src={reportData.reporter.reporterAvatar} size={50} />
            <div>
              <p className="font-medium">
                {reportData.reporter.fullname || 'Unknown'}
              </p>
            </div>
          </div>
          <p>
            <strong>Reported At:</strong> {convertTimetap(reportData.createdAt)}
          </p>
          <p>
            <strong>Status:</strong> {reportData.status}
          </p>
          <p>
            <strong>Reason:</strong> {reportData.reason}
          </p>
          <p>
            <strong>Details:</strong> {reportData.details}
          </p>
          <p>
            <strong>Images:</strong>
          </p>
          <div className="flex gap-2">
            {reportData.images?.length > 0 ? (
              reportData.images.map((img, index) => (
                <Image
                  key={index}
                  width={100}
                  src={img}
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
