import React, { useState, useEffect } from 'react';
import {
  Button,
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
import {
  MinusOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import numberToPrice from 'helpers/numberToPrice';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { addToCart } from 'redux/slices/cart';
import numberToQuantity from 'helpers/numberToQuantity';
import getImageFromStock from 'helpers/getImageFromStock';
import { getExtras, sortExtras } from 'helpers/getExtras';
import useDidUpdate from 'helpers/useDidUpdate';
import productService from 'services/product';
import AddonsItem from './addons';

export default function ProductModal({ extrasModal, setExtrasModal }) {
  const { t } = useTranslation();

  const { currentBag, currency } = useSelector(
    (state) => state.cart,
    shallowEqual,
  );

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [currentStock, setCurrentStock] = useState({});
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
    extrasModal?.quantity || data?.quantity || data?.min_qty || 1,
  );

  const handleSubmit = () => {
    const products = addons.map((item) => ({
      ...item,
      stockID: item.product.stock.id,
      quantity: item?.product?.quantity || item?.product?.min_qty || 1,
    }));
    const orderItem = {
      ...data,
      stock: currentStock,
      quantity: counter,
      id: currentStock.id,
      img: getImageFromStock(currentStock) || data.img,
      bag_id: currentBag,
      stockID: currentStock,
      addons: products,
    };
    if (orderItem?.quantity > currentStock?.quantity) {
      toast.warning(
        `${t('you.cannot.order.more.than')} ${currentStock?.quantity || 1}`,
      );
      return;
    }
    dispatch(addToCart(orderItem));
    setExtrasModal(null);
  };

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
    if (counter === data?.quantity) {
      return;
    }
    if (counter === data?.max_qty) {
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

  const handleCancel = () => {
    setExtrasModal(false);
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

  const fetchProductByUuid = (uuid) => {
    setLoading(true);
    productService
      .getById(uuid)
      .then(({ data }) => {
        setData(data);
        const myData = sortExtras(data, extrasModal?.addons);
        setExtras(myData?.extras);
        setCounter(
          extrasModal?.quantity ?? data?.quantity ?? data.min_qty ?? 1,
        );
        setStock(myData?.stock);
        setShowExtras(getExtras(extrasIds, myData?.extras, myData?.stock));
        getExtras('', myData?.extras, myData?.stock)?.extras?.forEach(
          (element) => {
            setExtrasIds((prev) => [...prev, element[0]]);
          },
        );
        if (extrasModal?.addons) {
          setSelectedValues(
            extrasModal?.addons?.map((addon) =>
              String(addon?.countable?.id ?? addon.countable_id),
            ) || [],
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useDidUpdate(() => {
    const addons = showExtras?.stock?.addons.filter((item) =>
      selectedValues.includes(String(item?.addon_id)),
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
    if (extrasModal?.uuid) {
      fetchProductByUuid(extrasModal?.uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extrasModal?.uuid]);

  return (
    <Modal
      visible={!!data}
      title={data?.translation?.title || t('N/A')}
      onCancel={handleCancel}
      footer={[
        <Button
          icon={<PlusCircleOutlined />}
          key='add-product'
          type='primary'
          onClick={handleSubmit}
          disabled={loading}
        >
          {t('add')}
        </Button>,
        <Button key='cancel-product' type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Row gutter={24}>
          <Col span={8}>
            <Image
              src={getImage(getImageFromStock(currentStock) || data?.img)}
              alt={data?.translation?.title || t('N/A')}
              height={200}
              style={{ objectFit: 'contain' }}
            />
          </Col>
          <Col span={16}>
            <Descriptions title={data?.translation?.title || t('N/A')}>
              <Descriptions.Item label={t('price')} span={3}>
                <div className={currentStock?.discount ? 'strike' : ''}>
                  {numberToPrice(
                    calculateTotalPrice(),
                    currency?.symbol,
                    currency?.position,
                  )}
                </div>
                {!!currentStock?.discount && (
                  <div className='ml-2 font-weight-bold'>
                    {numberToPrice(
                      calculateTotalPrice('total_price'),
                      currency?.symbol,
                      currency?.position,
                    )}
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('in.stock')} span={3}>
                {numberToQuantity(currentStock?.quantity ?? 1, data?.unit)}
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

        <Row gutter={12} className='mt-3'>
          <Col span={24}>
            <Space>
              <Button
                type='primary'
                icon={<MinusOutlined />}
                onClick={reduceCounter}
              />
              {(counter ?? 1) * (data?.interval || 1)}
              {data?.unit?.translation?.title}
              <Button
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
