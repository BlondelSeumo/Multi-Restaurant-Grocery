import { Col, Row } from 'antd';
import StatisticNumberWidget from 'views/dashboard/statisticNumberWidget';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import SalesFilter from './filter';

const renderValue = (number, percent, percentType) => (
  <div>
    {numberToPrice(number)}
    <div style={{ fontSize: '18px', fontWeight: '400' }}>
      {`${percentType === 'plus' ? '+' : '-'}
      ${(percent || 0)?.toFixed(0)} %`}
    </div>
  </div>
);

const SalesMainCards = ({ data, title, params, loading = false }) => {
  const { t } = useTranslation();
  return (
    <>
      <h2 style={{ margin: '0 0 10px' }}>{title}</h2>
      <SalesFilter values={params} type='mainCards' disabled={loading} />
      <br />
      <Row gutter={12}>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('revenue')}
            value={renderValue(
              data?.revenue,
              data?.revenue_percent,
              data?.revenue_percent_type,
            )}
            color='purple'
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('orders')}
            value={renderValue(
              data?.orders,
              data?.orders_percent,
              data?.orders_percent_type,
            )}
            color='purple'
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('average')}
            value={renderValue(
              data?.average,
              data?.average_percent,
              data?.average_percent_type,
            )}
            color='purple'
          />
        </Col>
      </Row>
    </>
  );
};

export default SalesMainCards;
