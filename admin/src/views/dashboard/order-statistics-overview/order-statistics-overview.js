import cls from './order-statistics-overview.module.scss';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { COLORS } from 'constants/ChartConstant';
import ChartWidget from 'components/chart-widget';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import DashboardFilter from '../filter';
import { filterOrderCounts } from 'redux/slices/statistics/orderCounts';
import { IoStatsChart } from 'react-icons/io5';

const OrderStatisticsOverview = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { counts, filterTimeList, loading, params } = useSelector(
    (state) => state.orderCounts,
    shallowEqual,
  );
  const { direction } = useSelector((state) => state.theme.theme, shallowEqual);

  const timeFormat = useMemo(() => {
    switch (params?.time) {
      case 'subWeek':
        return 'ddd';
      case 'subMonth':
        return 'MMM';
      case 'subYear':
        return 'YYYY';
      default:
        return 'ddd';
    }
  }, [params?.time]);

  const totalOrders = counts?.reduce(
    (total, item) => (total += item?.count || 0),
    0,
  );
  const xAxis = useMemo(
    () => counts?.map((item) => moment(item?.time).format(timeFormat)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [counts],
  );
  const series = useMemo(() => {
    return [
      {
        name: t('orders'),
        data: counts?.map((item) => item?.count || 0),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts]);

  // demo data
  // const addType = useMemo(() => {
  //   switch (params?.time) {
  //     case 'subWeek':
  //       return 'day';
  //     case 'subMonth':
  //       return 'month';
  //     case 'subYear':
  //       return 'year';
  //     default:
  //       return 'day';
  //   }
  // }, [params?.time]);
  // const xAxis = Array.from({ length: 7 }, (_, index) =>
  //   moment()
  //     .add(6 - index, addType)
  //     .format(timeFormat),
  // );
  //
  // // demo data
  // const series = [
  //   {
  //     name: t('orders'),
  //     data: Array.from({ length: 7 }).map(() =>
  //       Math.floor(Math.random() * 100),
  //     ),
  //   },
  // ];

  const handleChangeFilter = (item) => {
    dispatch(filterOrderCounts({ time: item }));
  };

  return (
    <div className={cls.container}>
      <h3 className={cls.title}>{t('order.statistics.overview')}</h3>
      <div className={cls.filter}>
        <DashboardFilter
          filterList={filterTimeList}
          activeKey={params?.time}
          onChange={handleChangeFilter}
          disabled={loading}
        />
      </div>
      <div className={cls.totalOrdersContainer}>
        <div className={cls.numberContainer}>
          <IoStatsChart />
          <span className={cls.number}>{totalOrders}</span>
        </div>
        <span className={cls.text}>{t('total.orders')}</span>
      </div>
      <ChartWidget
        card={false}
        series={series}
        xAxis={xAxis}
        type='area'
        customOptions={{
          colors: [COLORS[6], COLORS[0]],
          legend: {
            show: false,
          },
          stroke: {
            width: 4,
            curve: 'smooth',
          },
        }}
        direction={direction}
      />
    </div>
  );
};

export default OrderStatisticsOverview;
