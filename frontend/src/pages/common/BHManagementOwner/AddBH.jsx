import { useState } from 'react';
import { Modal } from 'antd';
import { Button } from '../../../component';

const AddBHModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button btnAdd title="Add new" size="large" onClick={showModal} />
      <Modal
        title="Add Boarding House"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        className="custom-modal"
      >
        <div className="bg-primary p-4 text-white">
          <p>Hello</p>
        </div>
      </Modal>
    </>
  );
};

export default AddBHModal;
