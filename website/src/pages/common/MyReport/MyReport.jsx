import { getMyReport } from "@/api/ownerUser/myReport";
import { useEffect, useState } from "react";
import { TableCustom as Table } from "@/component";
import convertTimetap from "@/utils/convertTimetap";
import { Tag, Tooltip } from "antd";
import { Button } from "@/component";
import { FileTextOutlined } from "@ant-design/icons";
import DetailReportModal from "./DetailReportModal";
import { getOwnReportReviewDetail } from "@/api/reportAPI";
import { toast } from "react-toastify";

function MyReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchReport = async () => {
    try {
      const response = await getMyReport();
      setReport(response);
    } catch (error) {
      console.log("Fetch report error: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const columns = [
    {
      title: "Report Type",
      dataIndex: "reportType",
      key: "reportType",
    },
    {
      title: "Target",
      dataIndex: "target",
      key: "target",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
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
      ),
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (text) => {
        const maxLength = 50;
        const truncated =
          text && text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text;
        return (
          <Tooltip title={text}>
            <span>{truncated}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => convertTimetap(text, false),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            size="large"
            title={"Detail"}
            icon={<FileTextOutlined />}
            onClick={() => handleDetailModal(record)}
            className="text-white"
            bgColor="rgb(5 150 105)"
          />
        </div>
      ),
    },
  ];

  const fetchReportDetail = async (reportId) => {
    try {
      const res = await getOwnReportReviewDetail(reportId);
      console.log("Report deatil", res);

      if (res) {
        setSelectedData(res);
      } else {
        setSelectedData(null);
      }
    } catch (error) {
      console.error("Failed to fetch report details:", error);
      toast.error("Failed to fetch report details. Please try again later.");
    }
  };

  const handleDetailModal = (record) => {
    fetchReportDetail(record._id);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  return (
    <div>
      <Table data={report} columns={columns} loading={loading} />
      <DetailReportModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        reportData={selectedData}
      />
      ;
    </div>
  );
}

export default MyReport;
