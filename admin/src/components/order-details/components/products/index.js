import { Card, Modal, Space, Table, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import ColumnImage from 'components/column-image';
import { EditOutlined } from '@ant-design/icons';
import numberToPrice from 'helpers/numberToPrice';
import { lazy, Suspense, useState } from 'react';
import Loading from 'components/loading';
import numberToQuantity from 'helpers/numberToQuantity';

const ProductStatusModal = lazy(() => import('../product-status-modal'));

const Products = ({ data, role, loading = false }) => {
  const { t } = useTranslation();
  const [productStatus, setProductStatus] = useState(null);

  const renderProductWithAddons = (item) => {
    return (
      <Space wrap>
        {item?.stock?.product?.translation?.title || t('N/A')}
        {!!item?.addons?.length &&
          item?.addons?.map((addon) => (
            <Tag key={addon?.id}>
              {addon?.stock?.product?.translation?.title} x{' '}
              {numberToQuantity(
                (addon?.quantity || 0) * (addon?.stock?.product?.interval || 1),
                addon?.stock?.product?.unit,
              )}
            </Tag>
          ))}
      </Space>
    );
  };

  const columns = [
    { title: t('id'), dataIndex: 'id', key: 'id' },
    {
      title: t('name'),
      dataIndex: 'stock',
      key: 'stock',
      render: (_, row) => renderProductWithAddons(row),
    },
    {
      title: t('image'),
      dataIndex: 'stock',
      key: 'img',
      render: (stock) => (
        <ColumnImage image={stock?.product?.img} id={stock?.id} />
      ),
    },
    {
      title: t('kitchen'),
      dataIndex: 'kitchen',
      key: 'kitchen',
      render: (kitchen) => kitchen?.translation?.title || t('N/A'),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <Space>
          <Tag>{t(status)}</Tag>
          {role !== 'deliveryman' && (
            <EditOutlined onClick={() => handleOpenProductStatusModal(row)} />
          )}
        </Space>
      ),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, row) => (
        <span style={{ width: 'max-content', display: 'block' }}>
          {(quantity || 1) * (row?.stock?.product?.interval || 1)}{' '}
          {row?.stock?.product?.unit?.translation?.title || ''}
        </span>
      ),
    },
    {
      title: t('price'),
      dataIndex: 'origin_price',
      key: 'origin_price',
      render: (origin_price) => (
        <span style={{ width: 'max-content', display: 'block' }}>
          {numberToPrice(origin_price)}
        </span>
      ),
    },
    {
      title: t('discount'),
      dataIndex: 'discount',
      key: 'discount',
      render: (discount = 0, row) => (
        <span style={{ width: 'max-content', display: 'block' }}>
          {numberToPrice((discount || 0) / (row?.quantity || 1))}
        </span>
      ),
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (tax = 0, row) => (
        <span style={{ width: 'max-content', display: 'block' }}>
          {numberToPrice((tax || 0) / (row?.quantity || 1))}
        </span>
      ),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total_price, row) => {
        const totalPriceWithAddons =
          (total_price ?? 0) +
          (row?.addons?.reduce(
            (total, item) => (total += item?.total_price ?? 0),
            0,
          ) || 0);

        return (
          <span style={{ width: 'max-content', display: 'block' }}>
            {numberToPrice(totalPriceWithAddons)}
          </span>
        );
      },
    },
    {
      title: t('note'),
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || t('N/A'),
    },
  ];

  const prices = [
    {
      id: 'service_fee',
      label: t('service.fee'),
      value: data?.service_fee || 0,
      show: true,
    },
    {
      id: 'delivery_fee',
      label: t('delivery.fee'),
      value: data?.delivery_fee || 0,
      show: data?.delivery_type === 'delivery',
    },
    {
      id: 'tax',
      label: t('tax'),
      value: data?.tax || 0,
      show: true,
    },
    {
      id: 'product',
      label: t('product'),
      value: data?.origin_price || 0,
      show: true,
    },
    {
      id: 'discount',
      label: t('discount'),
      value: data?.total_discount || 0,
      show: true,
    },
    {
      id: 'coupon',
      label: t('coupon'),
      value: data?.coupon_price || 0,
      show: !!data?.coupon_price,
    },
    {
      id: 'tips',
      label: t('tips'),
      value: data?.tips || 0,
      show: true,
    },
    {
      id: 'total_price',
      label: t('total.price'),
      value: data?.total_price || 0,
      show: true,
    },
  ];

  const handleOpenProductStatusModal = (item) => {
    setProductStatus({ id: item?.id, status: item?.status });
  };

  const handleCloseProductStatusModal = () => {
    setProductStatus(null);
  };

  return (
    <>
      <Card>
        <Table
          scroll={{ x: true }}
          loading={loading}
          columns={columns}
          dataSource={data?.details || []}
          pagination={false}
          rowKey={(item) => item?.id}
        />
        <Space direction='vertical' align='end' className='w-100 mt-4'>
          {prices
            .filter((item) => item.show)
            .map((item) => (
              <Space
                key={item.id}
                style={{ width: '200px', justifyContent: 'space-between' }}
              >
                <Typography.Text>{item.label}:</Typography.Text>
                <Typography.Text>{numberToPrice(item.value)}</Typography.Text>
              </Space>
            ))}
        </Space>
      </Card>
      {!!productStatus && (
        <Modal
          visible={!!productStatus}
          footer={false}
          onCancel={handleCloseProductStatusModal}
        >
          <Suspense fallback={<Loading />}>
            <ProductStatusModal
              id={productStatus?.id}
              status={productStatus?.status}
              handleCancel={handleCloseProductStatusModal}
              role={role}
            />
          </Suspense>
        </Modal>
      )}
    </>
  );
};

export default Products;
