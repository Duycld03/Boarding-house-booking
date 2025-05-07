import { Modal } from 'antd';
import ButtonCustom from '../Button';

const ConfirmModal = ({
  title,
  content,
  onOk,
  onCancel,
  isOpen,
  confirmLoading, // Use confirmLoading for the modal button
}) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      confirmLoading={confirmLoading} // Add confirmLoading here to show spinner
    >
      {content}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 20,
        }}
      >
        <ButtonCustom
          size="large"
          title="Confirm"
          onClick={onOk}
          className={'bg-teal-600 text-white'}
          loading={confirmLoading} // Set loading on the confirm button
        />
        <ButtonCustom
          title="Cancel"
          onClick={onCancel}
          size="large"
          btnCancel
        />
      </div>
    </Modal>
  );
};

export default ConfirmModal;
