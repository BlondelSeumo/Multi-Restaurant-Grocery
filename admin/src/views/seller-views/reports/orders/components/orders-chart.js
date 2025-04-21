import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import ChartWidget from 'components/chart-widget';
import ReportOrderFilter from './filter';

const ReportOrdersChart = ({ data, title, params, loading = false }) => {
  const { t } = useTranslation();
  const chartSeries = useMemo(
    () => [
      {
        name: t('orders.count'),
        data: data?.chart?.map((item) => item?.count) || [],
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
      <ReportOrderFilter type='chart' values={params} disabled={loading} />
      <br />
      <Card loading={loading}>
        <ChartWidget height={280} series={chartSeries} xAxis={chartXAxis} />
      </Card>
    </>
  );
};

export default ReportOrdersChart;
