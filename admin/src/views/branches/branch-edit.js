import React, { useState, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import LanguageList from 'components/language-list';
import { useTranslation } from 'react-i18next';
import { Card, Steps } from 'antd';
import { useQueryParams } from 'helpers/useQueryParams';
import { disableRefetch, setMenuData } from 'redux/slices/menu';
import restaurantService from 'services/restaurant';
import { useParams } from 'react-router-dom';
import Loading from 'components/loading';
import Map from 'components/shop/map';
import getLanguageFields from 'helpers/getLanguageFields';
import createImage from 'helpers/createImage';
import { steps } from './steps';
import UserEdit from './user';
import BranchMain from './main';
import BranchDelivery from './branchDelivery';

const { Step } = Steps;

const RestaurantEdit = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const queryParams = useQueryParams();
  const current = Number(queryParams.values?.step || 0);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);

  const [loading, setLoading] = useState(activeMenu.refetch);

  const next = () => {
    const step = current + 1;
    queryParams.set('step', step);
  };
  const prev = () => {
    const step = current - 1;
    queryParams.set('step', step);
  };

  const onChange = (step) => {
    dispatch(setMenuData({ activeMenu, data: { ...activeMenu.data, step } }));
    queryParams.set('step', step);
  };

  const fetchRestaurant = (uuid) => {
    setLoading(true);
    restaurantService
      .getById(uuid)
      .then((res) => {
        const data = {
          ...res.data,
          ...getLanguageFields(languages, res?.data, [
            'title',
            'description',
            'address',
          ]),
          logo_img: createImage(res?.data?.logo_img),
          background_img: createImage(res?.data?.background_img),
          user: {
            label: `${res?.data?.seller?.firstname || ''} ${res?.data?.seller?.lastname || ''}`,
            value: res?.data?.seller?.id,
            key: res?.data?.seller?.id,
          },
          delivery_time_from: res?.data?.delivery_time?.from,
          delivery_time_to: res?.data?.delivery_time?.to,
          delivery_time_type: res?.data?.delivery_time?.type,
          recommended: res?.data?.mark === 'recommended',
          order_payment: {
            label: res?.data?.order_payment,
            value: res?.data?.order_payment,
            key: res?.data?.order_payment,
          },
          categories: res.data?.categories?.map((item) => ({
            label: item?.translation?.title,
            value: item?.id,
            key: item?.id,
          })),
          tags: res?.data?.tags.map((item) => ({
            label: item?.translation?.title,
            value: item?.id,
            key: item?.id,
          })),
          emailStatuses: res?.data?.email_statuses?.map((item) => ({
            label: t(item),
            value: item,
            key: item,
          })),
          price: res?.data?.price || 0,
          price_per_km: res?.data?.price_per_km || 0,
          min_amount: res?.data?.min_amount || 0,
          tax: res?.data?.tax || 0,
          percentage: res?.data?.percentage || 0,
        };
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  useEffect(() => {
    if (activeMenu.refetch && uuid) {
      fetchRestaurant(uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <Card title={t('branches.edit')} extra={<LanguageList />}>
      <Steps current={current} onChange={onChange}>
        {steps.map((item) => (
          <Step title={t(item.title)} key={item.title} />
        ))}
      </Steps>
      {!loading ? (
        <div className='steps-content'>
          {steps[current].content === 'First-content' && (
            <BranchMain
              next={next}
              loading={loading}
              action_type={'edit'}
              user={true}
            />
          )}

          {steps[current].content === 'Second-content' && (
            <Map next={next} prev={prev} />
          )}

          {steps[current].content === 'Third-content' && (
            <BranchDelivery next={next} prev={prev} />
          )}

          {steps[current].content === 'Four-content' && (
            <UserEdit next={next} prev={prev} />
          )}
        </div>
      ) : (
        <Loading />
      )}
    </Card>
  );
};
export default RestaurantEdit;
