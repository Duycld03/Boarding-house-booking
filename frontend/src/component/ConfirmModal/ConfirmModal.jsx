import { Modal } from "antd";
import ButtonCustom from "../Button";

const ConfirmModal = ({ title, content, onOk, onCancel, isOpen }) => {
  return (
    <Modal title={title} open={isOpen} onCancel={onCancel} footer={null}>
      {content}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "flex-end",
          gap: 20,
        }}
      >
        <ButtonCustom
          size="large"
          title="Confirm"
          onClick={onOk}
          className={"bg-teal-600 text-white"}
        />
        <ButtonCustom
          title="Cancel"
          onClick={onCancel}
          size="large"
          className={"bg-red-500 text-white"}
        />
      </div>
    </Modal>
  );
};

export default ConfirmModal;
