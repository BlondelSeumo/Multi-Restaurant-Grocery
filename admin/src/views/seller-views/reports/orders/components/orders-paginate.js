import { Card, Space, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import moment from 'moment';
import ReportOrderFilter from './filter';

const Products = ({ data }) => {
  return (
    <Space>
      {data?.map((item, index) => (
        <Tag key={index}>{item}</Tag>
      ))}
    </Space>
  );
};

const ReportOrdersPaginate = ({
  data,
  meta,
  title,
  params,
  onPageChange,
  loading = false,
}) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('client'),
      dataIndex: 'firstname',
      key: 'firstname',
      render: (_, item) => `${item?.firstname || ''} ${item?.lastname || ''}`,
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => t(status),
    },
    {
      title: t('product.count'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => quantity || 0,
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (createdAt) => moment(createdAt).format('YYYY-MM-DD HH:mm'),
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
      <ReportOrderFilter type='paginate' values={params} disabled={loading} />
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
            rowExpandable: (item) => !!item?.products?.length,
            expandedRowRender: (item) => (
              <>
                <div>{t('products')}</div>
                <br />
                <Products data={item?.products} />
              </>
            ),
          }}
        />
      </Card>
    </>
  );
};

export default ReportOrdersPaginate;
