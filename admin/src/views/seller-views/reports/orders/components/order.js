import { Card, Col, Row } from 'antd';
import StatisticNumberWidget from 'views/dashboard/statisticNumberWidget';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import { useMemo } from 'react';
import ChartWidget from 'components/chart-widget';
import ReportOrderFilter from './filter';

const ReportOrder = ({ data, title, params, loading = false }) => {
  const { t } = useTranslation();
  const chartSeries = useMemo(
    () => [
      {
        name: t('total.price'),
        data: data?.chart?.map((item) => item?.total_price?.toFixed(2)) || [],
      },
    ],
    // eslint-disable-next-line
    [data],
  );

  const chartXAxis = useMemo(() => {
    return data?.chart?.map((item) => item?.time);
  }, [data]);

  return (
    <>
      <h2 style={{ margin: '0 0 10px' }}>{title}</h2>
      <ReportOrderFilter type='order' values={params} disabled={loading} />
      <br />
      <Row gutter={12}>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('total.price')}
            loading={loading}
            value={numberToPrice(data?.total_price)}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('total.orders.count')}
            loading={loading}
            value={data?.total_count}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('orders.count.today')}
            loading={loading}
            value={data?.total_today_count}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('new.orders.count')}
            loading={loading}
            value={data?.total_price}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('accepted.orders.count')}
            loading={loading}
            value={data?.total_accepted_count}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('ready.orders.count')}
            loading={loading}
            value={data?.total_ready_count}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('on.a.way.orders.count')}
            loading={loading}
            value={data?.total_on_a_way_count}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('canceled.orders.count')}
            loading={loading}
            value={data?.total_canceled_count}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('delivered.orders.count')}
            loading={loading}
            value={data?.total_delivered_count}
          />
        </Col>
      </Row>
      <Card loading={loading}>
        <ChartWidget height={280} series={chartSeries} xAxis={chartXAxis} />
      </Card>
    </>
  );
};

export default ReportOrder;
