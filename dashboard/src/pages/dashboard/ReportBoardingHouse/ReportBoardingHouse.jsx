import { useEffect, useState } from "react";
import {
  TableCustom as Table,
  Button,
  ConfirmModal,
  FormReplayPopup,
} from "../../../component";
import { toast } from "react-toastify";
import { Tag } from "antd";
import {
  deleteReport,
  sendReplyByEmail,
  filterBHReports,
} from "../../../api/reportManagement";
import convertTimetap from "../../../utils/convertTimetap";
import FilterBHReportPopup from "./FilterBHReportPopup ";
import { useTranslation } from "react-i18next";
import ReportDetailModal from "./ReportDetailModal";

function ReportBoardingHouse() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isReplayPopupOpen, setIsReplayPopupOpen] = useState(false);
  const [replayReportData, setReplayReportData] = useState(null);
  const [filterValue, setFilterValue] = useState({});
  const { t } = useTranslation("reportBoardingHouse");

  // Thêm state quản lý phân trang
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Thêm state quản lý các tùy chọn phân trang gửi đến API
  const [paginationOptions, setPaginationOptions] = useState({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  const coverReasonToMultipleLanguage = (reasonValue) => {
    const reasonLowerCase = reasonValue.toLowerCase();

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

  // Thay thế hàm fetchData bằng filterReportData với phân trang
  const filterReportData = async () => {
    setLoading(true);
    try {
      const res = await filterBHReports(filterValue, paginationOptions);

      if (res?.data && res?.pagination) {
        setData(res.data);
        setPagination({
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          limit: res.pagination.limit,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch filtered reports:", error);
      toast.error(t("toast.filterFailed"));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý sự kiện thay đổi trang
  const handleTableChange = (pagination) => {
    setPaginationOptions((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  // Cấu hình phân trang cho bảng
  const tablePaginationConfig = {
    current: pagination.currentPage,
    pageSize: pagination.limit,
    total: pagination.totalItems,
    showSizeChanger: true,
  };

  const handleViewDetail = (record) => {
    setSelectedReport(record);
    setIsDetailModalOpen(true);
  };

  // Loại bỏ useEffect với getBHReports
  // Chỉ giữ lại useEffect với filterReportData
  useEffect(() => {
    filterReportData();
  }, [filterValue, paginationOptions]);

  // Define columns for the Table component
  const columns = [
    {
      title: t("columns.reporter"),
      dataIndex: "reporter",
      key: "reporter",
      render: (reporter) => reporter?.fullname || "N/A",
    },
    {
      title: t("columns.boardingHouseName"),
      dataIndex: "targetId",
      key: "email",
      render: (target) => target?.name || "N/A",
    },
    {
      title: t("columns.reason"),
      dataIndex: "reason",
      key: "reason",
      render: (reason) => {
        const reasonText = coverReasonToMultipleLanguage(reason);
        return <span>{reasonText}</span>;
      },
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusColors = {
          pending: "orange",
          resolved: "green",
          rejected: "red",
        };
        return (
          <Tag color={statusColors[status.toLowerCase()]}>
            {t(`status.${status.toLowerCase()}`)}
          </Tag>
        );
      },
    },
    {
      title: t("columns.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => convertTimetap(createdAt),
    },
    {
      title: t("columns.processedDate"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) => convertTimetap(updatedAt),
    },
    {
      title: t("columns.action"),
      render: (record) => (
        <div className="flex gap-2">
          <Button
            title={t("buttons.delete")}
            btnDelete
            className="btn-delete"
            onClick={() => handleDeleteModal(record)}
          />
          {record.status !== "rejected" && record.status !== "resolved" && (
            <Button
              title={t("buttons.replay")}
              btnReplay
              className="btn-replay"
              onClick={() => handleReplay(record)}
            />
          )}
        </div>
      ),
    },
  ];

  // Handle opening the delete modal
  const handleDeleteModal = (record) => {
    setSelectedRequest(record);
    setIsOpenDeleteModal(true);
  };

  // Handle opening the replay popup
  const handleReplay = (record) => {
    setReplayReportData(record);
    setIsReplayPopupOpen(true);
  };

  // Handle deleting a report
  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      await deleteReport(selectedRequest._id);
      // Sau khi xóa, gọi lại API để lấy dữ liệu mới nhất
      filterReportData();
      toast.success(t("toast.deleteSuccess"));
    } catch (error) {
      console.error("Failed to delete report:", error);
      toast.error(t("toast.deleteFailed"));
    } finally {
      setIsOpenDeleteModal(false);
      setSelectedRequest(null);
    }
  };

  const handleReplaySubmit = async (formData) => {
    if (!replayReportData || !replayReportData._id) {
      toast.error(t("toast.missingData"));
      return;
    }

    try {
      await sendReplyByEmail(replayReportData._id, {
        status: formData.status,
        detailReport: formData.detailReport,
      });

      setIsReplayPopupOpen(false);
      // Gọi lại API để lấy dữ liệu mới nhất
      filterReportData();
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast.error(t("toast.replyFailed"));
    }
  };

  return (
    <div className="txt">
      <>
        <div className="flex justify-end mb-4">
          <FilterBHReportPopup setFilterValue={setFilterValue} />
        </div>
        {/* Show filtered data with pagination */}
        <Table
          tableName={t("title")}
          columns={columns}
          onRowClick={(record) => {
            console.log("Row clicked:", record);
          }}
          data={data}
          loading={loading}
          pagination={tablePaginationConfig}
          onChange={handleTableChange}
        />
        <ConfirmModal
          title={t("modals.deleteTitle")}
          content={t("modals.deleteContent")}
          onOk={handleDelete}
          onCancel={() => setIsOpenDeleteModal(false)}
          isOpen={isOpenDeleteModal}
          cancelText={t("modals.cancelButton")}
          okText={t("modals.confirmButton")}
        />
        {isReplayPopupOpen && (
          <FormReplayPopup
            visible={isReplayPopupOpen}
            onClose={() => setIsReplayPopupOpen(false)}
            onSubmit={handleReplaySubmit}
            reportData={replayReportData}
            title={t("replyForm.title")}
            statusLabel={t("replyForm.status")}
            detailsLabel={t("replyForm.details")}
            submitText={t("replyForm.submit")}
            cancelText={t("replyForm.cancel")}
          />
        )}
        {/* <ReportDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          report={selectedReport}
        /> */}
      </>
    </div>
  );
}

export default ReportBoardingHouse;
