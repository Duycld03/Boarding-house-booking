import { useEffect, useState } from "react";
import { Tag } from "antd";
import convertTimetap from "../../../utils/convertTimetap";
import { useTranslation } from "react-i18next";

function ReportDetailModal({ isOpen, onClose, report }) {
  const [currentReport, setCurrentReport] = useState(null);
  const { t } = useTranslation("reportBoardingHouse");

  useEffect(() => {
    if (isOpen && report) {
      setCurrentReport(report);
    }
  }, [isOpen, report]);

  const coverReasonToMultipleLanguage = (reasonValue) => {
    const reasonLowerCase = reasonValue?.toLowerCase();

    switch (reasonLowerCase) {
      case "scam on rent or deposit".toLowerCase(): {
        return t("reason.scamOnRentOrDeposit");
      }
      case "false advertisement".toLowerCase(): {
        return t("reason.falseAdvertisement");
      }
      case "violation of privacy".toLowerCase(): {
        return t("reason.violationOfPrivacy");
      }
      case "unfriendly landlord".toLowerCase(): {
        return t("reason.unfriendlyLandlord");
      }
      case "poor security".toLowerCase(): {
        return t("reason.poorSecurity");
      }
      default: {
        return reasonValue;
      }
    }
  };

  if (!isOpen || !report) return null;

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "orange",
      resolved: "green",
      rejected: "red",
    };
    return statusColors[status?.toLowerCase()] || "default";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl mx-auto rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {t("detailModal.title")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2 dark:text-white">
              {t("detailModal.reporterInfo")}
            </h3>
            <div className="space-y-2">
              <p className="dark:text-gray-300">
                <span className="font-medium">{t("columns.reporter")}:</span>{" "}
                {report.reporter?.fullname || "N/A"}
              </p>
              <p className="dark:text-gray-300">
                <span className="font-medium">{t("detailModal.email")}:</span>{" "}
                {report.reporter?.email || "N/A"}
              </p>
              <p className="dark:text-gray-300">
                <span className="font-medium">{t("detailModal.phone")}:</span>{" "}
                {report.reporter?.phone || "N/A"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 dark:text-white">
              {t("detailModal.reportInfo")}
            </h3>
            <div className="space-y-2">
              <p className="dark:text-gray-300">
                <span className="font-medium">
                  {t("columns.boardingHouseName")}:
                </span>{" "}
                {report.targetId?.name || "N/A"}
              </p>
              <p className="dark:text-gray-300">
                <span className="font-medium">{t("columns.reason")}:</span>{" "}
                {coverReasonToMultipleLanguage(report.reason)}
              </p>
              <p className="dark:text-gray-300">
                <span className="font-medium">{t("columns.status")}:</span>{" "}
                <Tag color={getStatusColor(report.status)}>
                  {t(`status.${report.status?.toLowerCase()}`)}
                </Tag>
              </p>
            </div>
          </div>
        </div>

        {/* Report Details */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 dark:text-white">
            {t("detailModal.details")}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <p className="whitespace-pre-wrap dark:text-gray-300">
              {report.description || t("detailModal.noDetails")}
            </p>
          </div>
        </div>

        {/* Images Section */}
        {report.images && report.images.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2 dark:text-white">
              {t("detailModal.images")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {report.images.map((img, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-md bg-gray-200 aspect-square"
                >
                  <img
                    src={img.url}
                    alt={`Report Evidence ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response/Reply Section */}
        {report.adminResponse && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2 dark:text-white">
              {t("detailModal.adminResponse")}
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-md">
              <p className="dark:text-gray-300 whitespace-pre-wrap">
                {report.adminResponse}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t("detailModal.respondedOn")}:{" "}
                {convertTimetap(report.updatedAt)}
              </p>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            {t("columns.createdAt")}: {convertTimetap(report.createdAt)}
          </p>
          <p>
            {t("columns.processedDate")}:{" "}
            {report.updatedAt !== report.createdAt
              ? convertTimetap(report.updatedAt)
              : t("detailModal.notProcessedYet")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReportDetailModal;
