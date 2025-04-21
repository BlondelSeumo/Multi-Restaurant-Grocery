import { Button, Col, Space, Tag } from 'antd';
import ColumnImage from 'components/column-image';
import numberToPrice from 'helpers/numberToPrice';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import useDebounce from 'helpers/useDebounce';
import useDidUpdate from 'helpers/useDidUpdate';
import { useState } from 'react';

const OrderItem = ({
  item,
  data,
  handleChangeProductQuantity,
  handleDeleteProduct,
}) => {
  const { t } = useTranslation();

  const [quantity, setQuantity] = useState(item?.quantity ?? 0);
  const debouncedQuantity = useDebounce(quantity, 300);

  const handleChangeQuantity = (type, number) => {
    if (type === 'increment') {
      if (item?.stock?.product?.max_qty < number) return;
      setQuantity((prev) => prev + 1);
    } else if (type === 'decrement') {
      if (item?.stock?.product?.min_qty > number || number === 0) return;
      setQuantity((prev) => prev - 1);
    }
  };

  useDidUpdate(() => {
    handleChangeProductQuantity({ ...item, quantity: debouncedQuantity });
    return () => {};
  }, [debouncedQuantity]);

  useDidUpdate(() => {
    if (item?.quantity && item?.quantity !== quantity) {
      setQuantity(item?.quantity ?? 0);
    }
  }, [item?.quantity]);

  return (
    <Col
      span={24}
      style={{
        border: '1px solid var(--input-border)',
        borderRadius: '12px',
        padding: '10px 15px',
        columnGap: '20px',
      }}
    >
      <Space size={20}>
        <ColumnImage image={item?.stock?.product?.img} id={item?.stock_id} />
        <Space direction='vertical' size={15}>
          <h3 style={{ margin: 0 }}>
            {item?.stock?.product?.translation?.title || t('N/A')}
          </h3>
          {!!item?.bonus && <Tag color='red'>{t('bonus')}</Tag>}
          {!!item?.stock?.stock_extras?.length && (
            <div>
              {item?.stock?.stock_extras?.map((extra) => (
                <Tag key={extra?.id}>{extra?.value || t('N/A')}</Tag>
              ))}
            </div>
          )}
          {!!item?.addons?.length && (
            <div>
              {item?.addons?.map((addon) => (
                <Tag key={addon?.id}>
                  {`${addon?.product?.translation?.title || t('N/A')} x ${addon?.quantity ?? 0}`}
                </Tag>
              ))}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              columnGap: '10px',
              fontSize: '16px',
            }}
          >
            {!!item?.discount && (
              <span
                style={{ textDecoration: 'line-through', color: 'orangered' }}
              >
                {numberToPrice(
                  item?.price,
                  data?.currency?.symbol,
                  data?.currency?.position,
                )}
              </span>
            )}
            <span>
              {numberToPrice(
                item?.total_price,
                data?.currency?.symbol,
                data?.currency?.position,
              )}
            </span>
          </div>
          <Space>
            <Button
              icon={<MinusOutlined />}
              onClick={() => {
                handleChangeQuantity('decrement', quantity - 1);
              }}
              disabled={
                item?.stock?.product?.min_qty === quantity || !!item?.bonus
              }
            />
            <Space>
              {item?.stock?.product?.unit?.position === 'before' && (
                <span>
                  {item?.stock?.product?.unit?.translation?.title || t('N/A')}
                </span>
              )}
              {(quantity ?? 0) * (item?.stock?.product?.interval ?? 1)}
              {item?.stock?.product?.unit?.position === 'after' && (
                <span>
                  {item?.stock?.product?.unit?.translation?.title || t('N/A')}
                </span>
              )}
            </Space>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                handleChangeQuantity('increment', quantity + 1);
              }}
              disabled={
                item?.stock?.product?.max_qty === quantity ||
                item?.stock?.quantity <= quantity ||
                !!item?.bonus
              }
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProduct(item)}
              disabled={!!item?.bonus}
            />
          </Space>
        </Space>
      </Space>
    </Col>
  );
};

export default OrderItem;
