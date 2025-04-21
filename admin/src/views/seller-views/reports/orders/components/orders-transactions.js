import { useTranslation } from 'react-i18next';
import { Card, Table } from 'antd';
import moment from 'moment';
import numberToPrice from 'helpers/numberToPrice';
import ReportOrderFilter from './filter';

const OrderDetails = ({ data }) => {
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
      render: (status) => t(status),
    },
    {
      title: t('delivery.type'),
      dataIndex: 'delivery_type',
      key: 'delivery_type',
      render: (deliveryType) => t(deliveryType),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (totalPrice) => numberToPrice(totalPrice),
    },
  ];
  return (
    <Table
      dataSource={[data]}
      columns={columns}
      pagination={false}
      rowKey={(item) => item?.id}
    />
  );
};

const ReportOrdersTransactions = ({
  data,
  meta,
  title,
  params,
  loading = false,
  onPageChange,
}) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('id'),
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => transaction?.id,
    },
    {
      title: t('payment.type'),
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => t(transaction?.payment_system?.tag || 'N/A'),
    },
    {
      title: t('status'),
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => t(transaction?.status || 'N/A'),
    },
    {
      title: t('created.at'),
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) =>
        moment(transaction?.created_at).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('price'),
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => numberToPrice(transaction?.price),
    },
  ];

  return (
    <>
      <h2 style={{ margin: '0 0 10px' }}>{title}</h2>
      <ReportOrderFilter
        type='transactions'
        values={params}
        disabled={loading}
      />
      <br />
      <Card>
        <Table
          loading={loading}
          dataSource={data?.data}
          columns={columns}
          rowKey={(item) => item?.transaction?.id}
          pagination={{
            total: meta?.total,
            current: meta?.current_page,
            pageSize: meta?.per_page,
          }}
          onChange={(pagination) => {
            onPageChange(pagination.current);
          }}
          expandable={{
            expandedRowRender: (item) => (
              <>
                <span>{t('order')}</span>
                <OrderDetails data={item} />
              </>
            ),
          }}
        />
      </Card>
    </>
  );
};

export default ReportOrdersTransactions;
