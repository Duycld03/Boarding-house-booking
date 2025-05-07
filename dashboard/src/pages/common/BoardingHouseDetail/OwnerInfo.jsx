import { Card, Avatar, Modal, Tag, Tooltip } from "antd";
import { useState } from "react";

function OwnerInfo({ ownerData }) {
  const [visible, setVisible] = useState(false);

  if (!ownerData) return null;

  return (
    <>
      <Tooltip placement="bottom" title="Click to view owner info">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setVisible(true)}
        >
          <Avatar size={48} src={ownerData.avatarImage?.url} alt="Avatar" />
          <span className="text-3xl font-semibold">{ownerData.fullname}</span>
        </div>
      </Tooltip>

      <Modal
        title={
          <span className="text-lg sm:text-4xl font-bold">
            Owner Information
          </span>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={400}
      >
        <div className="flex flex-col">
          <Avatar
            className="mx-auto"
            size={96}
            src={ownerData.avatarImage?.url}
            alt="Avatar"
          />
          <div className="mt-3 space-y-2 text-gray-700">
            <p>
              <strong>Full name:</strong>{" "}
              <Tag color="blue">{ownerData.fullname}</Tag>
            </p>
            <p>
              <strong>Email:</strong> <Tag color="green">{ownerData.email}</Tag>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <Tag color="purple">{ownerData.phoneNumber}</Tag>
            </p>
            <p>
              <strong>Gender:</strong> <Tag color="red">{ownerData.gender}</Tag>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default OwnerInfo;
