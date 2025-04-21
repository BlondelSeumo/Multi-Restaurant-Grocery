import React, { useContext } from 'react';
import { Button, Modal } from 'antd';
import { Context } from '../context/context';
import { useTranslation } from 'react-i18next';

const CustomModal = ({
  text,
  click,
  loading,
  setText,
  setActive,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { isModalVisible, setIsModalVisible } = useContext(Context);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      closable={false}
      visible={isModalVisible}
      footer={[
        <Button
          onClick={() => {
            setIsModalVisible(false);
            setText([]);
            setActive(null);
            handleCancel();
          }}
        >
          {t('no')}
        </Button>,
        <Button
          type='primary'
          className='mr-2'
          onClick={click}
          loading={loading}
        >
          {t('yes')}
        </Button>,
      ]}
      centered
      onCancel={handleCancel}
    >
      <p>{text}</p>
    </Modal>
  );
};

export default CustomModal;
