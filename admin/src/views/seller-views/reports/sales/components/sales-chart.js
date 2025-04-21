import ChartWidget from 'components/chart-widget';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SalesFilter from './filter';
import { Card } from 'antd';

const SalesChart = ({ data, title, params, loading = false }) => {
  const { t } = useTranslation();

  const chartSeries = useMemo(
    () => [
      {
        name: t('total.price'),
        data: data?.map((item) => item?.total_price?.toFixed(2)) || [],
      },
    ],
    // eslint-disable-next-line
    [data],
  );

  const chartXAxis = useMemo(() => {
    return data?.map((item) => item?.time);
  }, [data]);

  return (
    <>
      <h2 style={{ margin: '0 0 10px' }}>{title}</h2>
      <SalesFilter values={params} type='chart' disabled={loading} />
      <br />
      <Card loading={loading}>
        <ChartWidget height={280} series={chartSeries} xAxis={chartXAxis} />
      </Card>
    </>
  );
};

export default SalesChart;
