import { Col, Row } from 'antd';
import StatisticNumberWidget from 'views/dashboard/statisticNumberWidget';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import SalesFilter from './filter';

const renderValue = (number, percent) => (
  <div>
    {numberToPrice(number)}
    <div style={{ fontSize: '18px', fontWeight: '400' }}>
      {`${(percent || 0)?.toFixed(0)} %`}
    </div>
  </div>
);

const SalesStatistics = ({ data, title, params, loading = false }) => {
  const { t } = useTranslation();
  return (
    <>
      <h2 style={{ margin: '0 0 10px' }}>{title}</h2>
      <SalesFilter values={params} type='statistics' disabled={loading} />
      <br />
      <Row gutter={12}>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('new')}
            value={renderValue(data?.new?.sum, data?.new?.percent)}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('accepted')}
            value={renderValue(data?.accepted?.sum, data?.accepted?.percent)}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('ready')}
            value={renderValue(data?.ready?.sum, data?.ready?.percent)}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('on_a_way')}
            value={renderValue(data?.on_a_way?.sum, data?.on_a_way?.percent)}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('delivered')}
            value={renderValue(data?.delivered?.sum, data?.delivered?.percent)}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('canceled')}
            value={renderValue(data?.canceled?.sum, data?.canceled?.percent)}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('group.active')}
            value={renderValue(
              data?.group?.active?.sum,
              data?.group?.active?.percent,
            )}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('group.completed')}
            value={renderValue(
              data?.group?.completed?.sum,
              data?.group?.completed?.percent,
            )}
          />
        </Col>
        <Col flex='1'>
          <StatisticNumberWidget
            loading={loading}
            title={t('group.ended')}
            value={renderValue(
              data?.group?.ended?.sum,
              data?.group?.ended?.percent,
            )}
          />
        </Col>
      </Row>
    </>
  );
};

export default SalesStatistics;
