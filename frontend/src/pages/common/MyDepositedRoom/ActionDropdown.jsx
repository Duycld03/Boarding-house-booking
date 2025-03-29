import { Dropdown, Button, Space } from "antd";
import {
  FileTextOutlined,
  DownOutlined,
  SyncOutlined,
  DollarOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

const ActionDropdown = ({
  record,
  onDetailClick,
  onRenewalClick,
  onDepositRefundClick,
  setDepositRoom,
  setIsPayDepositPopupVisible,
  setDepositRoomId,
  setIsPayRentModalVisible,
}) => {
  const menuItems = [
    {
      key: "detail",
      label: "Detail",
      icon: <FileTextOutlined />,
      disabled: record.status === "pending",
      onClick: () => onDetailClick(record._id),
    },
    {
      key: "renewal",
      label: "Create renewal request",
      icon: <SyncOutlined />,
      onClick: () => onRenewalClick(record),
    },
    record.status === "confirmed" && {
      key: "create-deposit-refund",
      label: "Create deposit refund request",
      icon: <RollbackOutlined />,
      onClick: () => onDepositRefundClick(record),
    },
    record.status === "confirmed" && {
      key: "viewDetail",
      label: "View Detail",
      icon: <FileTextOutlined />,
      onClick: () => {
        setDepositRoomId(record._id);
        setIsPayRentModalVisible(true);
      },
    },
    record.status === "accepted" && {
      key: "pay",
      label: "Pay",
      icon: <DollarOutlined />,
      onClick: () => {
        setDepositRoom(record);
        setIsPayDepositPopupVisible(true);
      },
    },
  ].filter(Boolean); // Loại bỏ các phần tử `false` hoặc `undefined`

  return (
    <Dropdown
      menu={{
        items:
          record.status === "refunded"
            ? []
            : menuItems.map(({ key, label, icon, onClick, disabled }) => ({
                key,
                label: (
                  <span
                    className={
                      disabled ? "text-gray-400 cursor-not-allowed" : ""
                    }
                    onClick={disabled ? undefined : onClick}
                  >
                    {icon} {label}
                  </span>
                ),
                disabled,
              })),
      }}
    >
      <Button>
        <Space>
          Actions
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default ActionDropdown;
