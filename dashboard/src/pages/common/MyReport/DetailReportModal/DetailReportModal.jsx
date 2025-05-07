import React from "react";
import { useEffect, useState } from "react";
import { Modal, Image, Avatar, Button, Tag, Rate } from "antd";
import convertTimetap from "../../../../utils/convertTimetap";
import DefaultAccount from "@/assets/images/none_avatar.png";

const DetailReportModal = ({ isOpen, onClose, reportData }) => {
  const [currentReport, setCurrentReport] = useState(null);
  useEffect(() => {
    if (isOpen && reportData) {
      setCurrentReport(reportData); // Chỉ cập nhật khi modal mở
    }
  }, [isOpen, reportData]);

  if (!currentReport) return null;

  if (!reportData) return null;

  const { reporter, target, reason, details, images, createdAt, status } =
    reportData;

  return (
    <Modal
      key={reportData?._id}
      title={
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
          {reportData?.reportType === "review"
            ? "Review Report Detail"
            : "Boarding House Report Detail"}
        </h2>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Phần 1: bị tố cáo */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-semibold">
            {reportData?.reportType === "review"
              ? "Review information"
              : "Boarding house information"}
          </h2>
          <div className="flex items-center gap-3">
            {reportData?.reportType === "review" ? (
              <>
                <Avatar
                  src={target?.accountId?.avatarImage?.url ?? DefaultAccount}
                  size={50}
                />
                <div>
                  <p>{target?.accountId?.fullname || "Unknown"}</p>
                </div>
              </>
            ) : (
              <p>
                <strong>Name:</strong> {target?.name || "Unknown"}
              </p>
            )}
          </div>
          <p>
            <strong>Rating:</strong>{" "}
            <Rate disabled defaultValue={Number(target?.rating)} />
          </p>
          {reportData?.reportType === "review" ? (
            <p>
              <strong>Content:</strong> {target?.content || "No content"}
            </p>
          ) : (
            <p>
              <strong>Type:</strong>{" "}
              {target?.boardingHouseType?.name || "Unknown"}
            </p>
          )}
          <p>
            <strong>Review Images:</strong>
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {target?.images?.length > 0 ? (
              target.images.map((img, index) => (
                <Image
                  key={index}
                  width={150}
                  height={150}
                  className="rounded-md transition-transform transform hover:scale-105"
                  style={{ objectFit: "cover" }}
                  src={img.imageUrl}
                  alt={`Review Image ${index}`}
                />
              ))
            ) : (
              <p>No images available</p>
            )}
          </div>
        </div>

        {/* Phần 2: Đơn tố cáo */}
        <div>
          <h2 className="text-2xl font-semibold">Report Information</h2>
          <div className="flex items-center gap-3">
            <Avatar
              src={reporter.avatarImage?.url ?? DefaultAccount}
              size={50}
            />
            <div>
              <p className="">{reporter.fullname || "Unknown"}</p>
            </div>
          </div>
          <p>
            <strong>Reported At:</strong> {convertTimetap(createdAt)}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <Tag
              color={
                status === "pending"
                  ? "orange"
                  : status === "resolved"
                  ? "green"
                  : "red"
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
          <p>
            <strong>Report Images:</strong>
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {images?.length > 0 ? (
              images.map((img, index) => (
                <Image
                  key={index}
                  width={150}
                  height={150}
                  className="rounded-md transition-transform transform hover:scale-105"
                  style={{ objectFit: "cover" }}
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
