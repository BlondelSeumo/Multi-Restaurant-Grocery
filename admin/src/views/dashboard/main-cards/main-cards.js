import { useTranslation } from 'react-i18next';
import cls from './main-cards.module.scss';
import { Button, Image } from 'antd';
import TotalOrdersIcon from 'assets/images/total-orders.svg';
import NewOrdersIcon from 'assets/images/new-orders.svg';
import ConfirmedOrdersIcon from 'assets/images/confirmed-orders.svg';
import ReadyOrdersIcon from 'assets/images/ready-orders.svg';
import OutForDeliveryOrdersIcon from 'assets/images/out-for-delivery-orders.svg';
import DeliveredOrdersIcon from 'assets/images/delivered-orders.svg';
import CanceledOrdersIcon from 'assets/images/canceled-orders.svg';
import { useNavigate } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import { setFilters, setParams } from 'redux/slices/statistics/count';
import OrderCard from '../card';
import DashboardFilter from '../filter';
import { setMenu } from 'redux/slices/menu';

const MainCards = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { counts, filterTimeList, filters, loading } = useSelector(
    (state) => state.statisticsCount,
    shallowEqual,
  );
  const ordersPath = useMemo(() => {
    switch (user?.role) {
      case 'admin':
        return 'orders';
      case 'manager':
        return 'orders';
      case 'seller':
        return 'seller/orders';
      case 'moderator':
        return 'seller/orders';
      case 'deliveryman':
        return 'deliveryman/orders';
      default:
        return 'orders';
    }
  }, [user?.role]);
  const cardList = [
    {
      title: t('new.orders'),
      number: counts?.new,
      img: NewOrdersIcon,
      color: 'var(--dark-blue)',
      id: 'new_orders',
    },
    {
      title: t('confirmed.orders'),
      number: counts?.accepted,
      img: ConfirmedOrdersIcon,
      color: 'var(--dark-blue)',
      id: 'confirmed_orders',
    },
    {
      title: t('ready.orders'),
      number: counts?.ready,
      img: ReadyOrdersIcon,
      color: 'var(--dark-blue)',
      id: 'ready_orders',
    },
    {
      title: t('out.for.delivery.orders'),
      number: counts?.on_a_way,
      img: OutForDeliveryOrdersIcon,
      color: 'var(--green)',
      id: 'out_for_delivery_orders',
    },
    {
      title: t('delivered.orders'),
      number: counts?.delivered_orders_count,
      img: DeliveredOrdersIcon,
      color: 'var(--primary)',
      id: 'delivered_orders',
    },
    {
      title: t('cancelled.orders'),
      number: counts?.cancel_orders_count,
      img: CanceledOrdersIcon,
      color: 'var(--red)',
      id: 'cancelled_orders',
    },
  ];
  const handleChangeFilter = (item) => {
    dispatch(setFilters({ time: item }));
    dispatch(setParams({ time: item }));
  };
  return (
    <div className={cls.container}>
      <div className={cls.filter}>
        <DashboardFilter
          filterList={filterTimeList}
          activeKey={filters?.time}
          onChange={handleChangeFilter}
          disabled={loading}
        />
      </div>
      <div className={cls.wrapper}>
        {loading ? (
          <div className={`${cls.mainCard} skeleton`} />
        ) : (
          <div className={cls.mainCard}>
            <div className={cls.header}>
              <span className={cls.title}>{t('total.orders')}</span>
              <div className={cls.circle} />
            </div>
            <div className={cls.body}>
              <span className={cls.number}>{counts?.orders_count || 0}</span>
              <div className={cls.iconContainer}>
                <div className={cls.icon}>
                  <Image src={TotalOrdersIcon} preview={false} />
                </div>
              </div>
            </div>
            <Button
              type='primary'
              className='w-100'
              onClick={() => {
                dispatch(
                  setMenu({
                    id: 'all_orders',
                    url: ordersPath,
                    name: t('all'),
                    refetch: true,
                  }),
                );
                navigate(`/${ordersPath}`);
              }}
            >
              {t('all.orders')}
            </Button>
          </div>
        )}
        <div className={cls.cards}>
          {cardList.map((item) => (
            <OrderCard key={item.id} data={item} loading={loading} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainCards;
