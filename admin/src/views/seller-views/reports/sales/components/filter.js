import { Col, DatePicker, Row, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { setSalesParams } from 'redux/slices/report/sales';

const { RangePicker } = DatePicker;

const otherTypes = ['day', 'week', 'month'];
const historyTypes = ['history', 'today', 'deliveryman'];

const SalesFilter = ({ type, values, disabled = false }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const actualTypes = type === 'history' ? historyTypes : otherTypes;

  const handleChange = (key, value) => {
    const body = {};
    switch (key) {
      case 'date':
        body.date_from = value[0].format('YYYY-MM-DD');
        body.date_to = value[1].format('YYYY-MM-DD');
        break;
      case 'type':
        body.type = value;
        if (type === 'history') {
          body.page = 1;
          break;
        }
        switch (value) {
          case 'day':
            body.date_from = moment().subtract(1, 'day').format('YYYY-MM-DD');
            body.date_to = moment().format('YYYY-MM-DD');
            break;
          case 'week':
            body.date_from = moment().subtract(1, 'week').format('YYYY-MM-DD');
            body.date_to = moment().format('YYYY-MM-DD');
            break;
          case 'month':
            body.date_from = moment().subtract(1, 'month').format('YYYY-MM-DD');
            body.date_to = moment().format('YYYY-MM-DD');
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    dispatch(setSalesParams({ type, params: body }));
  };

  return (
    <Row gutter={12}>
      <Col flex='0 0 200px'>
        <Select
          className='w-100'
          placeholder={t('select.type')}
          value={values?.type}
          options={actualTypes.map((item) => ({
            label: t(item),
            value: item,
            key: item,
          }))}
          onChange={(value) => handleChange('type', value)}
          disabled={disabled}
        />
      </Col>
      {type !== 'history' && (
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
      )}
    </Row>
  );
};

export default SalesFilter;
