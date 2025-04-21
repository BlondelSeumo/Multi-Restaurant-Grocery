import { Card, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addMenu } from 'redux/slices/menu';
import getFullDateTime from 'helpers/getFullDateTime';

const Invoice = ({ data, role, loading = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: t('document'),
      dataIndex: 'document',
      key: 'document',
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
    },
  ];

  const goToInvoice = () => {
    const url =
      role === 'admin'
        ? `orders/generate-invoice/${data?.id}`
        : `seller/generate-invoice/${data?.id}`;
    const id = role === 'admin' ? 'invoice' : 'seller_invoice';
    dispatch(
      addMenu({
        url,
        id,
        name: t('invoice'),
      }),
    );
    navigate(`/${url}`);
  };

  const dataSource = [
    {
      date: getFullDateTime(data?.created_at),
      document: t('invoice'),
      id: (
        <button
          type='button'
          onClick={goToInvoice}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#1890ff',
          }}
        >
          #{data?.id}
        </button>
      ),
      total_price: numberToPrice(data?.total_price),
    },
  ];

  return (
    <Card title={t('invoice')}>
      <Table
        loading={loading}
        scroll={{ x: true }}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </Card>
  );
};
export default Invoice;
