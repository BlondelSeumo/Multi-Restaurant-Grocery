import React from 'react';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { clearMenu } from '../../redux/slices/menu';

const NotFound = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleOk = () => {
    dispatch(clearMenu());
    window.history.back();
  };

  return (
    <div>
      <div className='container'>
        <Typography.Title
          level={1}
          style={{ fontSize: '200px', fontWeight: 700, padding: 0, margin: 0 }}
        >
          404
        </Typography.Title>
        <div>
          <h1 className='font-weight-bold mb-4 display-4'>
            {t('page.not.found')}
          </h1>
          <Button
            type='primary'
            icon={<ArrowLeftOutlined />}
            onClick={() => handleOk()}
          >
            {t('go.back')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
