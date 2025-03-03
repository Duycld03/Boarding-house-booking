import { getMyReport } from "@/api/ownerUser/myReport";
import { useEffect, useState } from "react";
import { TableCustom as Table } from "@/component";
import convertTimetap from "@/utils/convertTimetap";
import { Tag, Tooltip } from "antd";

function MyReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

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
  ];

  return (
    <div>
      <Table data={report} columns={columns} loading={loading} />
    </div>
  );
}

export default MyReport;
