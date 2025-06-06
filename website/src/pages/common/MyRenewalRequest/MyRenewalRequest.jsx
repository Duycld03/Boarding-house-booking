import { useEffect, useState } from "react";
import { TableCustom as Table } from "@/component";
import { getExtensionRequests } from "@/api/extensionRequestAPI";
import { Tag, Tooltip } from "antd";

function MyRenewalRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatusTag = (status) => {
    if (!status) return <Tag color="default">Unknown</Tag>;

    const statusMap = {
      pending: { color: "orange", label: "Pending" },
      approved: { color: "green", label: "Approved" },
      rejected: { color: "red", label: "Rejected" },
    };

    const normalizedStatus = status.toLowerCase();
    return (
      <Tag color={statusMap[normalizedStatus]?.color || "default"}>
        {statusMap[normalizedStatus]?.label || "Unknown"}
      </Tag>
    );
  };

  const renderLimitedText = (text, maxLength = 30) => {
    return text.length > maxLength ? (
      <Tooltip title={text}>{text.slice(0, maxLength)}...</Tooltip>
    ) : (
      text
    );
  };

  const columns = [
    {
      key: "roomNumber",
      dataIndex: ["roomId", "roomNumber"],
      title: "Room Number",
    },
    {
      key: "boardingHouseName",
      dataIndex: ["roomId", "boardingHouseId", "name"],
      title: "Boarding House",
    },
    {
      key: "oldEndDate",
      dataIndex: "currentEndDate",
      title: "Previous End Date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: "newEndDate",
      dataIndex: "requestedEndDate",
      title: "Requested Extension Date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: "status",
      dataIndex: "status",
      title: "Status",
      render: (status) => getStatusTag(status),
    },
    {
      key: "tenantNote",
      dataIndex: "tenantNote",
      title: "Tenant's Note",
      render: (note) => renderLimitedText(note),
    },
    {
      key: "ownerNote",
      dataIndex: "ownerNote",
      title: "Owner's Note",
      render: (note) => renderLimitedText(note),
    },
  ];

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getExtensionRequests();
      setRequests(response);
    } catch (error) {
      console.error("Failed to fetch extension requests:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <Table columns={columns} data={requests} loading={loading} />
    </div>
  );
}

export default MyRenewalRequest;
