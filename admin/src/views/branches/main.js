import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { replaceMenu, setMenuData } from 'redux/slices/menu';
import restaurantService from 'services/restaurant';
import { useTranslation } from 'react-i18next';
import getDefaultLocation from 'helpers/getDefaultLocation';
import { SHOP_EMAIL_STATUSES } from 'constants/index';
import getTranslationFields from 'helpers/getTranslationFields';
import RestaurantAddData from './branch-add-data';

const RestaurantMain = ({ next, action_type = '', user }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [logoImage, setLogoImage] = useState(
    activeMenu.data?.logo_img ? [activeMenu.data?.logo_img] : [],
  );
  const [backImage, setBackImage] = useState(
    activeMenu.data?.background_img ? [activeMenu.data?.background_img] : [],
  );
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual,
  );
  const [location, setLocation] = useState(
    activeMenu?.data?.location
      ? {
          lat: parseFloat(activeMenu?.data?.location?.latitude),
          lng: parseFloat(activeMenu?.data?.location?.longitude),
        }
      : getDefaultLocation(settings),
  );

  const emailStatusOptions = useMemo(
    () =>
      SHOP_EMAIL_STATUSES.map((item) => ({
        label: t(item),
        value: item,
        key: item,
      })),
    // eslint-disable-next-line
    [uuid],
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.open_time = JSON.stringify(data?.open_time);
      data.close_time = JSON.stringify(data?.close_time);
      dispatch(
        setMenuData({ activeMenu, data: { ...activeMenu.data, ...data } }),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = (values) => {
    console.log('values', values);
    setLoadingBtn(true);
    const body = {
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
      address: getTranslationFields(languages, values, 'address'),
      phone: `${values?.phone}`,
      user_id: values?.user?.value,
      order_payment: values?.order_payment?.value || values?.order_payment,
      email_statuses: values?.emailStatuses?.map((item) => item?.value || item),
      price: values?.price || 0,
      price_per_km: values?.price_per_km || 0,
      delivery_time_type: values?.delivery_time_type,
      delivery_time_from: values?.delivery_time_from,
      delivery_time_to: values?.delivery_time_to,
      min_amount: `${values?.min_amount || 0}`,
      tax: values?.tax || 0,
      percentage: values?.percentage || 0,
      wifi_name: values?.wifi_name || '',
      wifi_password: values?.wifi_password || '',
      delivery_time: 0,
      type: 'shop',
      images: [logoImage[0]?.name, backImage[0]?.name],
      location: {
        latitude: location?.lat,
        longitude: location?.lng,
      },
      status_note: values?.status_note || undefined,
      status: values?.status,
      open: undefined,
    };
    if (action_type === 'edit') {
      restaurantUpdate(values, body);
    } else {
      restaurantCreate(values, body);
    }
  };

  function restaurantCreate(values, params) {
    restaurantService
      .create(params)
      .then(({ data }) => {
        dispatch(
          replaceMenu({
            id: `branch-${data.uuid}`,
            url: `branch/${data.uuid}`,
            name: t('add.branch'),
            data: {
              ...data,
              background_img: { name: data?.background_img },
              logo_img: { name: data?.logo_img },
              ...values,
            },
            refetch: false,
          }),
        );
        navigate(`/branch/${data.uuid}?step=1`);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingBtn(false));
  }

  function restaurantUpdate(values, params) {
    restaurantService
      .update(uuid, params)
      .then(() => {
        dispatch(
          setMenuData({
            activeMenu,
            data: values,
          }),
        );
        next();
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingBtn(false));
  }

  return (
    <>
      <Form
        form={form}
        name='basic'
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          open: false,
          status: 'new',
          ...activeMenu.data,
        }}
      >
        <RestaurantAddData
          logoImage={logoImage}
          setLogoImage={setLogoImage}
          backImage={backImage}
          setBackImage={setBackImage}
          form={form}
          location={location}
          setLocation={setLocation}
          user={user}
          emailStatusOptions={emailStatusOptions}
        />
        <Space>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('next')}
          </Button>
        </Space>
      </Form>
    </>
  );
};
export default RestaurantMain;
