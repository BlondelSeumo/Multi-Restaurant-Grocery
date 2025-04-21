import {
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Modal,
  Row,
  Space,
  Spin,
} from 'antd';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import productService from 'services/product';
import { getExtras, sortExtras } from 'helpers/getExtras';
import { batch, useDispatch } from 'react-redux';
import numberToPrice from 'helpers/numberToPrice';
import numberToQuantity from 'helpers/numberToQuantity';
import AddonsItem from 'views/pos-system/components/addons';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { addCalculateProductsBody } from 'redux/slices/order';

const ProductModal = ({ uuid, type = 'add', onCancel }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [currentStock, setCurrentStock] = useState({});
  const [extras, setExtras] = useState([]);
  const [stock, setStock] = useState([]);
  const [extrasIds, setExtrasIds] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [showExtras, setShowExtras] = useState({
    extras: [],
    stock: {
      id: 0,
      quantity: 1,
      price: 0,
    },
  });
  const [counter, setCounter] = useState(data?.min_qty ?? 1);

  const handleExtrasClick = (e) => {
    const index = extrasIds.findIndex(
      (item) => item?.extra_group_id === e?.extra_group_id,
    );
    let array = extrasIds;
    if (index > -1) array = array?.slice(0, index);
    array?.push(e);
    const nextIds = array?.map((item) => item?.id)?.join(',');
    let extrasData = getExtras(nextIds, extras, stock);
    setShowExtras(extrasData);
    extrasData?.extras?.forEach((element) => {
      const index = extrasIds.findIndex((item) =>
        element[0]?.extra_group_id !== e?.extra_group_id
          ? item?.extra_group_id === element[0]?.extra_group_id
          : item?.extra_group_id === e?.extra_group_id,
      );
      if (element[0]?.level >= e?.level) {
        let itemData =
          element[0]?.extra_group_id !== e?.extra_group_id ? element[0] : e;
        if (index === -1) array.push(itemData);
        else {
          array[index] = itemData;
        }
      }
    });
    setExtrasIds(array);
  };

  const addCounter = () => {
    if (counter >= data?.quantity) {
      return;
    }
    if (counter >= data?.max_qty) {
      return;
    }
    setCounter((prev) => prev + 1);
  };

  const reduceCounter = () => {
    if (counter === 1) {
      return;
    }
    if (counter <= data?.min_qty) {
      return;
    }
    setCounter((prev) => prev - 1);
  };

  const handleChange = (item) => {
    const value = String(item?.addon_id);
    if (selectedValues?.includes(value)) {
      setSelectedValues((prev) => prev.filter((el) => el !== value));
    } else {
      setSelectedValues((prev) => [...prev, value]);
    }
  };

  const handleAddonClick = (list) => {
    setAddons(list);
  };

  const calculateTotalPrice = (priceKey) => {
    const addonPrice = addons?.reduce(
      (total, item) =>
        (total +=
          (item?.product?.stock?.price ?? 0) *
          (item?.product?.quantity ?? item?.product?.min_qty ?? 1)),
      0,
    );
    return (addonPrice ?? 0) + (showExtras?.stock ?? 0)
      ? showExtras?.stock[priceKey || 'price']
      : 0;
  };

  const addonCalculate = (id, quantity) => {
    setShowExtras((prev) => ({
      ...prev,
      stock: {
        ...prev?.stock,
        addons: prev?.stock?.addons.map((addon) => {
          if (addon?.addon_id === id) {
            return { ...addon, product: { ...addon?.product, quantity } };
          }
          return addon;
        }),
      },
    }));
    setAddons((prev) =>
      prev.map((addon) => {
        if (addon?.addon_id === id) {
          return {
            ...addon,
            product: { ...addon?.product, quantity },
          };
        }
        return addon;
      }),
    );
  };

  const fetchProductById = (uuid) => {
    setLoading(true);
    productService
      .getById(uuid)
      .then((res) => {
        setData(res?.data);
        const sortedExtras = sortExtras(res?.data);
        setExtras(sortedExtras?.extras);
        setCounter(res?.data?.min_qty ?? res?.data?.quantity ?? 1);
        setStock(sortedExtras?.stock);
        setShowExtras(
          getExtras(extrasIds, sortedExtras?.extras, sortedExtras?.stock),
        );
        getExtras(
          '',
          sortedExtras?.extras,
          sortedExtras?.stock,
        )?.extras?.forEach((element) => {
          setExtrasIds((prev) => [...prev, element[0]]);
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onFinish = () => {
    const orderItem = {
      stock_id: currentStock?.id,
      quantity: counter,
      addons: addons?.length
        ? addons?.map((addon) => ({
            stock_id: addon?.stock_id,
            quantity: addon?.product?.quantity ?? addon?.product?.min_qty ?? 1,
          }))
        : [],
    };
    batch(() => {
      dispatch(addCalculateProductsBody(orderItem));
    });
    onCancel();
  };

  useEffect(() => {
    if (uuid) {
      fetchProductById(uuid);
    }
    return () => {};
    // eslint-disable-next-line
  }, [uuid]);

  useEffect(() => {
    if (showExtras?.stock?.addons) {
      const addons = showExtras?.stock?.addons?.filter((item) =>
        selectedValues?.includes(String(item?.addon_id)),
      );

      return handleAddonClick(addons);
    }
  }, [selectedValues, data?.uuid, showExtras?.stock?.addons]);

  useEffect(() => {
    if (showExtras?.stock) {
      setCurrentStock({ ...showExtras.stock, extras: extrasIds });
    }
  }, [showExtras?.stock, extrasIds]);

  return (
    <Modal
      visible={!!uuid}
      title={data?.translation?.title || t('product')}
      onCancel={onCancel}
      footer={[
        <Button
          key='addUpdateOrderProductModal'
          type='primary'
          disabled={loading}
          onClick={onFinish}
        >
          {t(type)}
        </Button>,
        <Button onClick={onCancel} key='closeOrderProductModal'>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Card>
        {loading && (
          <div className='loader'>
            <Spin />
          </div>
        )}
        <Row gutter={12}>
          <Col span={8}>
            <Image
              src={data?.img || 'https://via.placeholder.com/150'}
              alt={data?.translation?.title || t('N/A')}
              height={200}
              style={{ objectFit: 'contain' }}
            />
          </Col>
          <Col span={16}>
            <Descriptions title={data?.translation?.title || t('product')}>
              <Descriptions.Item label={t('price')} span={3}>
                <div className={currentStock?.discount ? 'strike' : ''}>
                  {numberToPrice(calculateTotalPrice())}
                </div>
                {!!currentStock?.discount && (
                  <div className='ml-2 font-weight-bold'>
                    {numberToPrice(calculateTotalPrice('total_price'))}
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('in.stock')} span={3}>
                {numberToQuantity(currentStock?.quantity ?? 1, data?.unit)}
              </Descriptions.Item>
              <Descriptions.Item label={t('tax')} span={3}>
                {numberToPrice(currentStock?.tax)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {!!showExtras?.extras?.length &&
          showExtras?.extras?.map((item, idx) => (
            <div className='extra-group' key={`extra-group_${idx}`}>
              <Space className='extras-select' wrap>
                {item?.map((el) => {
                  return (
                    <span
                      className={`extras-text rounded ${
                        !!extrasIds?.find((extra) => extra?.id === el?.id)
                          ? 'selected'
                          : ''
                      }`}
                      key={el?.id}
                      onClick={() => handleExtrasClick(el)}
                      style={{ padding: '0 10px' }}
                    >
                      {el?.value || t('N/A')}
                    </span>
                  );
                })}
              </Space>
            </div>
          ))}

        <AddonsItem
          showExtras={showExtras}
          selectedValues={selectedValues}
          handleChange={handleChange}
          addonCalculate={addonCalculate}
        />

        <Row gutter={12} className='mt-5'>
          <Col span={24}>
            <Space>
              <Button
                type='primary'
                icon={<MinusOutlined />}
                onClick={reduceCounter}
                disabled={counter === data?.min_qty}
              />
              {(counter ?? 1) * (data?.interval ?? 1)}
              {data?.unit?.translation?.title}
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={addCounter}
                disabled={
                  counter === data?.quantity || counter === data?.max_qty
                }
              />
            </Space>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
};

export default ProductModal;
