import { Dropdown, Button, Space } from "antd";
import {
  FileTextOutlined,
  DownOutlined,
  SyncOutlined,
} from "@ant-design/icons";

const ActionDropdown = ({ record, onDetailClick, onRenewalClick }) => {
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
  ];

  console.log("record", record);

  return (
    <Dropdown
      menu={{
        items: menuItems.map(({ key, label, icon, onClick, disabled }) => ({
          key,
          label: (
            <span
              className={disabled ? "text-gray-400 cursor-not-allowed" : ""}
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
