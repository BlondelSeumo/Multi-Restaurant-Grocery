import { useState } from 'react';
import { Button, Divider, Space, Typography } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Dragger from 'antd/lib/upload/Dragger';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import updateService from 'services/update';
import { setMenuData } from 'redux/slices/menu';
import { toast } from 'react-toastify';
import Card from 'components/card';

export default function Update() {
  const [loadingBtn, setLoadingBtn] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const updateBackend = () => {
    setLoadingBtn(true);
    updateService
      .update()
      .then(() => toast.success(t('successfully.updated')))
      .finally(() => setLoadingBtn(false));
  };

  const createFile = (file) => {
    return {
      uid: file.title,
      name: file.title,
      status: 'done',
      url: file.title,
      created: true,
    };
  };

  const handleUpload = ({ file, onSuccess }) => {
    const formData = new FormData();
    formData.append('file', file);
    updateService.upload(formData).then(({ data }) => {
      dispatch(setMenuData({ activeMenu, data: createFile(data) }));
      onSuccess('ok');
    });
  };

  const beforeUpload = (file) => {
    const isPNG = file.type === 'image/png';
    const isJPG = file.type === 'image/jpg';
    const isJPEG = file.type === 'image/jpeg';
    if (isPNG || isJPEG || isJPG) {
      toast.error(`${file.name} is not valid file`);
      return false;
    }
  };

  return (
    <Card>
      <Space className='align-items-center justify-content-between w-100'>
        <Typography.Title
          level={1}
          style={{
            color: 'var(--text)',
            fontSize: '20px',
            fontWeight: 500,
            padding: 0,
            margin: 0,
          }}
        >
          {t('update.database')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={updateBackend}
          style={{ width: '100%' }}
          loading={loadingBtn}
        >
          {t('update.database')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Dragger
        name='file'
        multiple={false}
        maxCount={1}
        customRequest={handleUpload}
        defaultFileList={activeMenu?.data ? [activeMenu?.data] : null}
        beforeUpload={beforeUpload}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          {t('Click or drag file to this area to upload')}
        </p>
        <p className='ant-upload-hint'>
          {t(
            'In order to update database using this file you need to click button above',
          )}
        </p>
      </Dragger>
    </Card>
  );
}
