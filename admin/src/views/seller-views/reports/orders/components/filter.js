import { Col, DatePicker, Row, Select } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment/moment';
import { useDispatch } from 'react-redux';
import { setReportOrdersParams } from 'redux/slices/report/orders';

const { RangePicker } = DatePicker;

const otherTypes = ['day', 'week', 'month'];
const chartTypes = ['day', 'month'];
const transactionTypes = ['seller', 'deliveryman'];

const ReportOrderFilter = ({ type, values, disabled = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const actualType = useMemo(() => {
    switch (type) {
      case 'transactions':
        return transactionTypes;
      case 'chart':
        return chartTypes;
      default:
        return otherTypes;
    }
  }, [type]);

  const handleChange = (key, value) => {
    const body = {};
    switch (key) {
      case 'date':
        body.date_from = value[0].format('YYYY-MM-DD');
        body.date_to = value[1].format('YYYY-MM-DD');
        break;
      case 'type':
        body.type = value;
        break;
      default:
        break;
    }
    dispatch(setReportOrdersParams({ type, params: body }));
  };

  return (
    <Row gutter={12}>
      {type !== 'paginate' && (
        <Col flex='0 0 200px'>
          <Select
            className='w-100'
            value={values?.type}
            options={actualType.map((item) => ({
              label: t(item),
              value: item,
              key: item,
            }))}
            onChange={(value) => handleChange('type', value)}
            disabled={disabled}
          />
        </Col>
      )}
      <Col>
        <RangePicker
          value={[
            moment(values?.date_from, 'YYYY-MM-DD'),
            moment(values?.date_to, 'YYYY-MM-DD'),
          ]}
          onChange={(value) => handleChange('date', value)}
          allowClear={false}
          disabled={disabled}
        />
      </Col>
    </Row>
  );
};

export default ReportOrderFilter;
