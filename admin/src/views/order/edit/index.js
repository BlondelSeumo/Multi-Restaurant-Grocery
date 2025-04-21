import { Button, Card, Col, Form, Modal, Row } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import transactionService from 'services/transaction';
import orderService from 'services/order';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  setCalculateProductsBody,
  setOrderData,
  setOrderItems,
  setTotalPrices,
} from 'redux/slices/order';
import { useNavigate, useParams } from 'react-router-dom';
import { disableRefetch, removeFromMenu } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { ORDER_TYPES } from 'constants/index';
import { useTranslation } from 'react-i18next';
import { formatUsers } from 'helpers/formatUsers';
import moment from 'moment';
import QueryString from 'qs';
import useDebounce from 'helpers/useDebounce';
import Products from './components/products';
import OrderItems from './components/orderItems';
import OrderInfo from './components/orderInfo';
import TotalPrices from './components/totalPrices';
import Invoice from 'components/invoice';

const OrderEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const { id } = useParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { calculateProductsBody, data } = useSelector(
    (state) => state.order,
    shallowEqual,
  );

  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [productCalculateLoading, setProductCalculateLoading] = useState(false);

  const [previewModal, setPreviewModal] = useState(null);

  const orderTypes = useMemo(
    () =>
      ORDER_TYPES.map((type, index) => ({
        label: t(type),
        value: type,
        key: index,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const debouncedCalculateProductsBody = useDebounce(
    calculateProductsBody,
    300,
  );

  const deliveryType = Form.useWatch('deliveryType', form);
  const deliveryAddress = Form.useWatch('address', form);
  const address = Form.useWatch('address', form)?.value?.split('_');

  useEffect(() => {
    fetch();
    return () => {};
    // eslint-disable-next-line
  }, [id]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetch();
    }
    return () => {};
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    if (data?.id && !previewModal) {
      productCalculate();
    }
    return () => {};
    // eslint-disable-next-line
  }, [data?.id, debouncedCalculateProductsBody, deliveryAddress?.value]);

  const formatBodyForCalculate = () => {
    const body = {
      products: calculateProductsBody
        ?.filter((item) => !item?.bonus)
        ?.map((item) => ({
          ...item,
          addons: item?.addons?.length ? item?.addons : undefined,
        })),
      currency_id: data?.currency?.id,
      coupon: data?.coupon?.name || undefined,
      shop_id: data?.shop?.id,
      type: deliveryType?.value || data?.delivery_type,
      tips: data?.tips ?? undefined,
      address: address?.length
        ? {
            latitude: address?.[address?.length - 2],
            longitude: address?.[address?.length - 1],
          }
        : data?.location
          ? data?.location
          : undefined,
    };
    return QueryString.stringify(body, { addQueryPrefix: true });
  };

  const productCalculate = async (resetDetails = false) => {
    const body = formatBodyForCalculate(resetDetails);
    setProductCalculateLoading(true);
    await orderService
      .calculate(body)
      .then((res) => {
        dispatch(
          setTotalPrices({
            ...res?.data?.data,
            stocks: undefined,
            shop: undefined,
          }),
        );
        dispatch(setOrderItems(res?.data?.data?.stocks));
      })
      .finally(() => {
        setProductCalculateLoading(false);
      });
  };

  const fetchOrderById = async (id) => {
    setLoading(true);
    await orderService
      .getById(id)
      .then((res) => {
        const formBody = {
          deliveryType: orderTypes.find(
            (item) => item.value === res?.data?.delivery_type,
          ),
          currency: {
            label: `${res?.data?.currency?.title} ${res?.data?.currency?.symbol}`,
            value: res?.data?.currency?.id,
            key: res?.data?.currency?.id,
          },
          paymentType: res?.data?.transaction?.payment_system
            ? {
                label:
                  t(res?.data?.transaction?.payment_system?.tag) || t('N/A'),
                value: res?.data?.transaction?.payment_system?.tag,
                key: res?.data?.transaction?.payment_system?.id,
              }
            : undefined,
          user: formatUsers(res?.data?.user),
          address: res?.data?.address
            ? {
                label: res?.data?.address?.address,
                value: `${res?.data?.address?.address}_${res?.data?.location?.latitude}_${res?.data?.location?.longitude}`,
                key: `${res?.data?.address?.address}_${res?.data?.location?.latitude}_${res?.data?.location?.longitude}`,
              }
            : null,
          deliveryDate: res?.data?.delivery_date
            ? moment(res?.data?.delivery_date, 'YYYY-MM-DD')
            : null,
          deliveryTime: res?.data?.delivery_time
            ? moment(res?.data?.delivery_time, 'HH:mm')
            : null,
          table: {
            label: res?.data?.table?.name || t('N/A'),
            value: res?.data?.table?.id,
            key: res?.data?.table?.id,
          },
          deliveryZone: {
            label:
              res?.data?.table?.shop_section?.translation?.title || t('N/A'),
            value: res?.data?.table?.shop_section?.id,
            key: res?.data?.table?.shop_section?.id,
          },
        };
        form.setFieldsValue(formBody);
        batch(() => {
          dispatch(setOrderData(res?.data));
          dispatch(
            setCalculateProductsBody(
              res?.data?.details?.map((item) => ({
                stock_id: item?.stock?.id,
                quantity: item?.quantity ?? 0,
                bonus: item?.bonus || undefined,
                addons: item?.addons?.length
                  ? item?.addons?.map((addon) => ({
                      stock_id: addon?.stock_id || addon?.id,
                      quantity: addon?.quantity ?? 0,
                    }))
                  : [],
              })),
            ),
          );
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetch = () => {
    fetchOrderById(id);
    dispatch(disableRefetch(activeMenu));
  };

  const handleCloseInvoice = () => {
    setPreviewModal(null);
    const nextUrl = 'orders';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
  };

  const onFinish = (values) => {
    const addressValue = values?.address?.value?.split('_');
    const defaultBody = {
      shop_id: data?.shop?.id,
      coupon: data?.coupon?.name || undefined,
      currency_id: values?.currency?.value,
      payment_type: values?.paymentType?.value,
      delivery_type: values?.deliveryType?.value,
      products: calculateProductsBody?.map((item) => ({
        ...item,
        addons: item?.addons?.length ? item?.addons : undefined,
      })),
    };
    const deliveryBody = {
      user_id: values?.user?.value,
      address: {
        address: values?.address?.label,
        office: null,
        house: null,
        floor: null,
      },
      location: {
        latitude: addressValue?.[addressValue?.length - 2],
        longitude: addressValue?.[addressValue?.length - 1],
      },
      delivery_date: values?.deliveryDate?.format('YYYY-MM-DD'),
      delivery_time: values?.deliveryTime?.format('HH:mm'),
      ...defaultBody,
    };
    const pickUpOrDineInBody = {
      table_id: values?.table?.value || undefined,
      ...defaultBody,
    };
    const body =
      deliveryType?.value === 'delivery' ? deliveryBody : pickUpOrDineInBody;

    setLoadingBtn(true);
    orderService
      .update(id, body)
      .then((res) => {
        transactionService
          .create(res.data.id, {
            payment_sys_id: values?.paymentType?.key,
          })
          .then(() => {
            dispatch(setOrderData({}));
            dispatch(setOrderItems([]));
            dispatch(setCalculateProductsBody([]));
            dispatch(setTotalPrices({}));
            setPreviewModal(res?.data?.id);
          })
          .finally(() => {
            setLoadingBtn(false);
          });
      })
      .catch(() => {
        setLoadingBtn(false);
      });
  };

  return (
    <>
      <Form
        form={form}
        name='order-edit-form'
        layout='vertical'
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col span={16}>
            <Products orderLoading={loading} />
            <OrderItems orderLoading={loading || productCalculateLoading} />
          </Col>
          <Col span={8}>
            <div style={{ position: 'sticky', top: '16px', right: 0 }}>
              <OrderInfo form={form} />
              <TotalPrices loading={loading || productCalculateLoading} />
              <Card>
                <Row gutter={12}>
                  <Col span={24}>
                    <Button
                      type='primary'
                      htmlType='submit'
                      style={{ minWidth: '100%' }}
                      loading={loadingBtn}
                      disabled={productCalculateLoading}
                    >
                      {t('save')}
                    </Button>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
      {!!previewModal && (
        <Modal
          visible={!!previewModal}
          footer={null}
          onCancel={handleCloseInvoice}
          width={1000}
        >
          <Invoice id={previewModal} role='admin' />
        </Modal>
      )}
    </>
  );
};

export default OrderEdit;
