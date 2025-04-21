import React from 'react';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useDemo from '../helpers/useDemo';

export default function DeleteButton({
  size = '',
  onClick,
  type = 'default',
  withIcon = true,
  ...props
}) {
  const { t } = useTranslation();
  const { isDemo } = useDemo();

  const handleClick = (e) => {
    if (isDemo) {
      toast.warning(t('cannot.work.demo'));
      return;
    }
    onClick(e);
  };

  return (
    <Button
      size={size}
      icon={withIcon ? <DeleteOutlined /> : null}
      onClick={handleClick}
      type={type}
      {...props}
    />
  );
}
