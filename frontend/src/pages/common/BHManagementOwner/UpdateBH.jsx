import { Modal } from 'antd';

const UpdateBHModal = ({ open, onCancel }) => {
  return (
    <Modal
      title="Update Boarding House"
      open={open} // ⚠️ Đảm bảo sử dụng đúng prop của Ant Design
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <p>Hello</p>
    </Modal>
  );
};

export default UpdateBHModal;
