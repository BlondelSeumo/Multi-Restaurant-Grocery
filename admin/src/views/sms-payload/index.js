import { useEffect } from 'react';
import { Button, Divider, Space, Table, Typography } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { disableRefetch } from 'redux/slices/menu';
import { shallowEqual, useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { fetchSms } from 'redux/slices/sms-geteways';
import { useNavigate } from 'react-router-dom';
import { addMenu } from 'redux/slices/menu';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import useDidUpdate from 'helpers/useDidUpdate';

export default function SmsGateways() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { smsGatewaysList, loading } = useSelector(
    (state) => state.sms,
    shallowEqual,
  );

  const columns = [
    {
      title: t('type'),
      dataIndex: 'type',
      width: '30%',
    },
    {
      title: t('twilio.number'),
      dataIndex: 'twilio_number',
      render: (_, row) => row.payload?.twilio_number,
    },
    {
      title: t('actions'),
      key: 'actions',
      dataIndex: 'type',
      is_show: true,
      render: (type) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            onClick={(e) => {
              e.stopPropagation();
              goToEdit(type);
            }}
          >
            <EditOutlined />
          </button>
        </div>
      ),
    },
  ];

  const goToEdit = (type) => {
    dispatch(
      addMenu({
        id: 'sms-payload-edit',
        url: `settings/sms-payload/${type}`,
        name: t('edit.sms.payload'),
      }),
    );
    navigate(`/settings/sms-payload/${type}`);
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'sms-payload-add',
        url: 'settings/sms-payload/add',
        name: t('add.sms.payload'),
      }),
    );
    navigate('/settings/sms-payload/add');
  };

  const fetchSmsLocal = () => {
    dispatch(fetchSms());
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchSmsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchSmsLocal();
    }
  }, [activeMenu.refetch]);

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
          {t('sms.providers')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.sms.provider')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Table
        scroll={{ x: true }}
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={smsGatewaysList}
        pagination={false}
        loading={loading}
      />
    </Card>
  );
}
