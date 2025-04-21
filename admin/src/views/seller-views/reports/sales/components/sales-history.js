import { Card, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import SalesFilter from './filter';

const Transactions = ({ data }) => {
  const { t } = useTranslation();
  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => t(status || 'N/A'),
    },
    {
      title: t('payment.type'),
      dataIndex: 'payment_system',
      key: 'payment_system',
      render: (paymentSystem) => t(paymentSystem?.tag || 'N/A'),
    },
  ];
  return <Table dataSource={data} columns={columns} pagination={false} />;
};

const SalesHistory = ({
  data,
  meta,
  params,
  title,
  loading = false,
  onPageChange,
}) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('user'),
      dataIndex: 'user',
      key: 'user',
      render: (user) => `${user?.firstname || ''} ${user?.lastname || ''}`,
    },
    {
      title: t('note'),
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || t('N/A'),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (totalPrice) => numberToPrice(totalPrice),
    },
  ];

  return (
    <>
      <h2 style={{ margin: '0 0 10px' }}>{title}</h2>
      <SalesFilter values={params} type='history' disabled={loading} />
      <br />
      <Card>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          scroll={{ x: true }}
          rowKey={(item) => item?.id}
          pagination={{
            total: meta?.total,
            current: meta?.current_page,
            pageSize: meta?.per_page,
          }}
          onChange={(pagination) => {
            onPageChange(pagination.current);
          }}
          expandable={{
            rowExpandable: (item) => !!item?.transactions?.length,
            expandedRowRender: (item) => (
              <>
                <span>{t('transactions')}</span>
                <Transactions data={item?.transactions} />
              </>
            ),
          }}
        />
      </Card>
    </>
  );
};

export default SalesHistory;
