import cls from './order-status-statistics.module.scss';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import ChartWidget from 'components/chart-widget';

const OrderStatusStatistics = () => {
  const { t } = useTranslation();
  const { counts } = useSelector(
    (state) => state.statisticsCount,
    shallowEqual,
  );
  const statusList = [
    {
      title: 'new',
      color: 'rgba(47, 128, 237, 1)',
      number: counts?.new || 0,
    },
    {
      title: 'confirmed',
      color: 'rgba(0, 195, 248, 1)',
      number: counts?.accepted || 0,
    },
    {
      title: 'ready',
      color: 'rgba(255, 137, 1, 1)',
      number: counts?.ready || 0,
    },
    {
      title: 'out',
      color: 'rgba(224, 241, 96, 1)',
      number: counts?.on_a_way || 0,
    },
    {
      title: 'delivered',
      color: 'rgba(70, 204, 107, 1)',
      number: counts?.delivered_orders_count || 0,
    },
    {
      title: 'canceled',
      color: 'rgba(255, 57, 43, 1)',
      number: counts?.cancel_orders_count || 0,
    },
  ];
  return (
    <div className={cls.container}>
      <h3 className={cls.title}>{t('order.status.statistics')}</h3>
      <ChartWidget
        type='donut'
        xAxis={statusList.map((item) => t(item.title))}
        series={statusList.map((item) => item.number)}
        customOptions={{ labels: statusList.map((item) => t(item.title)) }}
      />
      <div className={cls.footer}>
        <div className={cls.footerWrapper}>
          {statusList.slice(0, 3).map((item) => (
            <div className={cls.footerItem} key={item.title}>
              <div className={cls.footerItemName}>
                <div
                  className={cls.dot}
                  style={{ backgroundColor: item.color }}
                />
                <span className={cls.name}>{t(item.title)}</span>
              </div>
              <span className={cls.number}>{item.number}</span>
            </div>
          ))}
        </div>
        <div className={cls.verticalLine} />
        <div className={cls.footerWrapper}>
          {statusList.slice(3, 6).map((item) => (
            <div className={cls.footerItem} key={item.title}>
              <div className={cls.footerItemName}>
                <div
                  className={cls.dot}
                  style={{ backgroundColor: item.color }}
                />
                <span className={cls.name}>{t(item.title)}</span>
              </div>
              <span className={cls.number}>{item.number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusStatistics;
