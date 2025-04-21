import { Button, Card, Col, Form, Input, Row, Space, Table } from 'antd';
import DrawingManager from 'components/drawing-map';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useDemo from 'helpers/useDemo';
import settingService from 'services/settings';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import generateRandomNumbers from 'helpers/generateRandomNumbers';
import DeleteButton from 'components/delete-button';
import { DeleteOutlined } from '@ant-design/icons';
import { setRefetch } from 'redux/slices/menu';

const TemplateDeliveryZones = ({
  templateTriangleCoords,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { isDemo } = useDemo();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [dataSource, setDataSource] = useState(() =>
    templateTriangleCoords?.map((item, index) => ({
      key: index + 1,
      id: generateRandomNumbers(8),
      ...item,
    })),
  );

  const [triangleCoords, setTriangleCoords] = useState([]);

  const [merge, setMerge] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      render: (text) => text || t('N/A'),
    },
    {
      title: t('actions'),
      dataIndex: 'id',
      key: 'actions',
      render: (id) => (
        <DeleteButton
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(id)}
        />
      ),
    },
  ];

  const handleDelete = (id) => {
    setDataSource((prev) => prev.filter((item) => item.id !== id));
  };

  const updateSettings = (data) => {
    setLoadingBtn(true);
    settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        form.resetFields();
        setTriangleCoords([]);
        setMerge(null);
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoadingBtn(false));
  };

  const onFinish = (values) => {
    if (triangleCoords?.length > 0) {
      if (triangleCoords?.length < 3) {
        toast.warning(t('place.selected.map'));
        return;
      }

      if (!merge) {
        toast.warning(t('place.selected.map'));
        return;
      }
    }

    const body = {
      template_delivery_zones: [
        ...dataSource,
        {
          location: triangleCoords?.map((item) => [item?.lat, item?.lng]),
          title: values?.title,
          id: generateRandomNumbers(8),
        },
      ]?.filter((item) => item?.location?.length),
    };
    updateSettings(body);
  };

  return (
    <Form form={form} layout='vertical' onFinish={onFinish}>
      <Card loading={isLoading}>
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name='title'
              label={t('title')}
              rules={[
                {
                  required: !!triangleCoords?.length,
                  message: t('please.input.title'),
                },
                {
                  type: 'string',
                  min: 2,
                  max: 200,
                  message: t('min.2.max.200.chars'),
                },
              ]}
            >
              <Input className='w-100' />
            </Form.Item>
          </Col>
          <Col span={24}>
            <DrawingManager
              triangleCoords={triangleCoords}
              settriangleCoords={setTriangleCoords}
              setMerge={setMerge}
            />
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          className='mt-5'
          bordered
        />
        <Space className='mt-5'>
          <Button
            type='primary'
            htmlType='submit'
            loading={loadingBtn}
            disabled={isDemo}
          >
            {t('save')}
          </Button>
        </Space>
      </Card>
    </Form>
  );
};

export default TemplateDeliveryZones;
