import React, { useState, useEffect } from 'react';
import {
  Button,
  Checkbox,
  Col,
  Descriptions,
  Image,
  Modal,
  Row,
  Space,
  Spin,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import getImage from 'helpers/getImage';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { addOrderItem, setOrderData } from 'redux/slices/order';
import numberToPrice from 'helpers/numberToPrice';
import { toast } from 'react-toastify';
import numberToQuantity from 'helpers/numberToQuantity';
import { useTranslation } from 'react-i18next';
import { getExtras, sortExtras } from 'helpers/getExtras';
import getImageFromStock from 'helpers/getImageFromStock';
import useDidUpdate from 'helpers/useDidUpdate';
import productService from 'services/product';

export default function ExtrasModal({ extrasModal, setExtrasModal }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const { t } = useTranslation();
  const [currentStock, setCurrentStock] = useState({});
  const { currencyObject: currency } = useSelector(
    (state) => state.order.data,
    shallowEqual,
  );
  const dispatch = useDispatch();
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
  const [counter, setCounter] = useState(
    extrasModal.quantity || data.quantity || data.min_qty,
  );

  const handleSubmit = () => {
    const calculate = false;
    dispatch(setOrderData({ calculate }));
    const products = addons.map((item) => ({
      ...item,
      stock_id: item.product.stock.id,
      quantity: item.product.quantity || item.product.min_qty,
    }));
    const orderItem = {
      ...data,
      stock: currentStock,
      quantity: counter,
      id: currentStock.id,
      img: getImageFromStock(currentStock) || data.img,
      stockID: currentStock,
      addons: products,
      price: currentStock.price,
    };
    if (orderItem.quantity > currentStock.quantity) {
      toast.warning(
        `${t('you.cannot.order.more.than')} ${currentStock.quantity}`,
      );
      return;
    }
    dispatch(addOrderItem(orderItem));
    setExtrasModal(null);
  };

  const handleExtrasClick = (e) => {
    const index = extrasIds.findIndex(
      (item) => item.extra_group_id === e.extra_group_id,
    );
    let array = extrasIds;
    if (index > -1) array = array.slice(0, index);
    array.push(e);
    const nextIds = array.map((item) => item.id).join(',');
    var extrasData = getExtras(nextIds, extras, stock);
    setShowExtras(extrasData);
    extrasData.extras?.forEach((element) => {
      const index = extrasIds.findIndex((item) =>
        element[0].extra_group_id != e.extra_group_id
          ? item.extra_group_id === element[0].extra_group_id
          : item.extra_group_id === e.extra_group_id,
      );
      if (element[0].level >= e.level) {
        var itemData =
          element[0].extra_group_id != e.extra_group_id ? element[0] : e;
        if (index == -1) array.push(itemData);
        else {
          array[index] = itemData;
        }
      }
    });
    setExtrasIds(array);
  };

  function addCounter() {
    if (counter === data.max_qty) {
      return;
    }
    setCounter((prev) => prev + 1);
  }

  function reduceCounter() {
    if (counter === 1) {
      return;
    }
    if (counter <= data.min_qty) {
      return;
    }
    setCounter((prev) => prev - 1);
  }

  const handleChange = (item) => {
    const value = String(item.addon_id);
    if (selectedValues.includes(value)) {
      setSelectedValues((prev) => prev.filter((el) => el !== value));
    } else {
      setSelectedValues((prev) => [...prev, value]);
    }
  };
  const handleCancel = () => setExtrasModal(false);
  const handleAddonClick = (list) => setAddons(list);

  function calculateTotalPrice(priceKey) {
    const addonPrice = addons?.reduce(
      (total, item) =>
        (total +=
          (item?.product?.stock?.price || 0) *
          (item?.product?.quantity || item?.product?.min_qty || 1)),
      0,
    );
    return (
      addonPrice +
      (showExtras?.stock[priceKey || 'price'] || 0) * (counter || 1)
    );
  }

  function addonCalculate(id, quantity) {
    setShowExtras((prev) => ({
      ...prev,
      stock: {
        ...prev.stock,
        addons: prev.stock.addons.map((addon) => {
          if (addon.addon_id === id) {
            return { ...addon, product: { ...addon.product, quantity } };
          }
          return addon;
        }),
      },
    }));
    setAddons((prev) =>
      prev.map((addon) => {
        if (addon.addon_id === id) {
          return {
            ...addon,
            product: { ...addon.product, quantity },
          };
        }
        return addon;
      }),
    );
  }

  useDidUpdate(() => {
    const addons = showExtras.stock.addons.filter((item) =>
      selectedValues.includes(String(item.addon_id)),
    );

    handleAddonClick(addons);
  }, [selectedValues]);

  useEffect(() => {
    if (showExtras?.stock) {
      setCurrentStock({ ...showExtras.stock, extras: extrasIds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExtras]);

  useEffect(() => {
    setLoading(true);
    productService
      .getById(extrasModal.uuid)
      .then(({ data }) => {
        setData(data);
        const myData = sortExtras(data, extrasModal?.addons);
        setExtras(myData.extras);
        setCounter(extrasModal.quantity || data.quantity || data.min_qty);
        setStock(myData.stock);
        setShowExtras(getExtras('', myData.extras, myData.stock));
        getExtras('', myData.extras, myData.stock).extras?.forEach(
          (element) => {
            setExtrasIds((prev) => [...prev, element[0]]);
          },
        );
        if (extrasModal?.addons) {
          setSelectedValues(
            extrasModal?.addons?.map((addon) =>
              String(addon?.stock?.product?.id || addon.addon_id),
            ) || [],
          );
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extrasModal.uuid]);

  return (
    <Modal
      visible={!!data}
      title={data?.translation?.title}
      onCancel={handleCancel}
      footer={[
        <Button key={'add-product'} type='primary' onClick={handleSubmit}>
          {t('add')}
        </Button>,
        <Button key={'cancel-modal'} type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Row gutter={24}>
          <Col span={8}>
            <Image
              src={getImage(getImageFromStock(currentStock) || data.img)}
              alt={data.name}
              height={200}
              style={{ objectFit: 'contain' }}
            />
          </Col>
          <Col span={16}>
            <Descriptions title={data.translation?.title}>
              <Descriptions.Item label={t('price')} span={3}>
                <div className={currentStock?.discount ? 'strike' : ''}>
                  {numberToPrice(
                    calculateTotalPrice(),
                    currency?.symbol,
                    currency?.position,
                  )}
                </div>
                {currentStock?.discount ? (
                  <div className='ml-2 font-weight-bold'>
                    {numberToPrice(
                      calculateTotalPrice('total_price'),
                      currency?.symbol,
                      currency?.position,
                    )}
                  </div>
                ) : (
                  ''
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('in.stock')} span={3}>
                {numberToQuantity(currentStock?.quantity, data.unit)}
              </Descriptions.Item>
              <Descriptions.Item label={t('tax')} span={3}>
                {numberToPrice(
                  currentStock?.tax,
                  currency?.symbol,
                  currency?.position,
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {showExtras?.extras?.map((item, idx) => (
          <div className='extra-group'>
            <Space key={'extra-group' + idx} className='extras-select'>
              {item.map((el) => {
                return (
                  <span
                    className={`extras-text rounded ${
                      !!extrasIds.find((extra) => extra.id === el.id)
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleExtrasClick(el)}
                  >
                    {el.value}
                  </span>
                );
              })}
            </Space>
          </div>
        ))}

        <Space direction='vertical' size='middle'>
          {showExtras.stock?.addons
            ?.filter((item) => !!item.product)
            .map((item) => {
              const selected = selectedValues.includes(String(item.addon_id));
              return (
                <div key={item.id}>
                  <Checkbox
                    id={String(item.id)}
                    name={String(item.id)}
                    checked={selected}
                    onChange={() => handleChange(item)}
                  />
                  <label htmlFor={String(item.id)}>
                    {selected && (
                      <Space size={0}>
                        <Button
                          type='text'
                          className='minus-button'
                          style={{ padding: 0, height: 'max-content' }}
                          size='small'
                          icon={<MinusOutlined />}
                          disabled={item.product.quantity === 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            addonCalculate(
                              item.addon_id,
                              item.product.quantity - 1,
                            );
                          }}
                        />
                        <span className='ml-2'>
                          {item.product.quantity || item.product.min_qty}
                        </span>
                        <Button
                          type='text'
                          className='plus-button'
                          style={{ padding: 0, height: 'max-content' }}
                          size='small'
                          icon={<PlusOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            addonCalculate(
                              item.addon_id,
                              item.product.quantity
                                ? item.product.quantity + 1
                                : item.product.min_qty + 1,
                            );
                          }}
                        />
                      </Space>
                    )}
                    <span className='ml-2'>
                      {item.product.translation?.title}
                    </span>
                  </label>
                </div>
              );
            })}
        </Space>

        <Row gutter={12} className='mt-3'>
          <Col span={24}>
            <Space>
              <Button
                key={'plus'}
                type='primary'
                icon={<MinusOutlined />}
                onClick={reduceCounter}
              />
              {counter}
              <Button
                key={'minus'}
                type='primary'
                icon={<PlusOutlined />}
                onClick={addCounter}
              />
            </Space>
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
}
