import cls from './total-sales-overview.module.scss';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { COLORS } from 'constants/ChartConstant';
import ChartWidget from 'components/chart-widget';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import DashboardFilter from '../filter';
import { IoStatsChart } from 'react-icons/io5';
import { filterOrderSales } from 'redux/slices/statistics/orderSales';
import numberToPrice from 'helpers/numberToPrice';

const TotalSalesOverview = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { sales, params, loading, filterTimeList } = useSelector(
    (state) => state.orderSales,
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

  const totalSales =
    sales?.reduce((total, item) => (total += item?.total_price || 0), 0) || 0;
  const xAxis = useMemo(
    () => sales?.map((item) => moment(item?.time).format(timeFormat)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sales],
  );
  const series = useMemo(() => {
    return [
      {
        name: t('earnings'),
        data: sales?.map((item) => +(item?.total_price || 0)?.toFixed(0)),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales]);

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
  //     name: t('earnings'),
  //     data: Array.from({ length: 7 }).map(() =>
  //       Math.floor(Math.random() * 100),
  //     ),
  //   },
  // ];

  const handleChangeFilter = (item) => {
    dispatch(filterOrderSales({ time: item }));
  };

  return (
    <div className={cls.container}>
      <h3 className={cls.title}>{t('total.sales.overview')}</h3>
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
          <span className={cls.number}>{numberToPrice(totalSales)}</span>
        </div>
        <span className={cls.text}>{t('total.sales')}</span>
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

export default TotalSalesOverview;
