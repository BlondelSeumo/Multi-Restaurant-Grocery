import { Col, Row } from 'antd';
import StatisticNumberWidget from 'views/dashboard/statisticNumberWidget';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';

const SalesCards = ({ data, title, loading = false }) => {
  const { t } = useTranslation();
  return (
    <>
      <h2 style={{ margin: '0 0 10px' }}>{title}</h2>
      <Row gutter={16}>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('all.cash.payment.orders.sum')}
            value={numberToPrice(data?.cash)}
            color='purple'
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('all.delivery.fee.sum')}
            value={numberToPrice(data?.delivery_fee)}
            color='red'
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            title={t('all.other.payment.orders.sum')}
            value={numberToPrice(data?.other)}
            color='grey'
          />
        </Col>
      </Row>
    </>
  );
};

export default SalesCards;
