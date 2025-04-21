import { Button, Card, Col, Form, Row, Select } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  setFilters,
  setFilteredStocks,
  resetFilters,
  resetFilteredStocks,
  deleteFilter,
  updateFormStocks,
} from 'redux/slices/product';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';

const ProductStockFilter = ({ form, extras }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { filters, stocks, filteredStocks } = useSelector(
    (state) => state.product.form,
    shallowEqual,
  );
  // handles reset set all form fields
  const handleClearSetAll = () => {
    form.setFieldsValue({
      all_sku: null,
      all_quantity: null,
      all_price: null,
      all_addon: [],
    });
  };
  // handle filter changes
  const handleChange = (extra, value) => {
    // updating form changes to stocks state
    const fieldValues = form.getFieldsValue()?.stocks;
    if (fieldValues?.length) {
      dispatch(updateFormStocks(fieldValues));
    }
    // filtering
    if (!value) {
      if (Object.values(filters)?.length === 1) {
        handleClearFilter(false);
        return;
      }
      dispatch(deleteFilter(extra?.value));
      return;
    }
    const selectedExtraValue = extra?.values?.find(
      (item) => item?.value === value?.value,
    );
    batch(() => {
      dispatch(setFilters({ [extra?.value]: selectedExtraValue }));
    });
    handleClearSetAll();
  };
  // reset filters to initial state
  const handleClearFilter = (withUpdateStocks = true) => {
    const fieldValues = form.getFieldsValue()?.stocks;
    batch(() => {
      if (fieldValues?.length && withUpdateStocks) {
        dispatch(updateFormStocks(fieldValues));
      }
      dispatch(resetFilters());
      dispatch(resetFilteredStocks());
    });
    // reset set all form fields
    handleClearSetAll();
  };
  // updating filtered stocks
  useDidUpdate(() => {
    if (!Object.values(filters)?.length) {
      return;
    }
    const localeFilteredStocks = stocks?.filter((stock) =>
      Object.values(filters)?.every((filter) =>
        stock?.extras?.find((extra) => extra?.value === filter?.value),
      ),
    );
    dispatch(setFilteredStocks(localeFilteredStocks));
  }, [filters, stocks]);

  // setting filtered stocks data to form to show user
  useDidUpdate(() => {
    form.setFieldsValue({
      stocks: Object.values(filters)?.length ? filteredStocks : stocks,
    });
  }, [filteredStocks]);

  return (
    <Card>
      <Row gutter={12}>
        {extras?.map((extra) => (
          <Col style={{ width: 250 }} key={extra?.value}>
            <Form.Item label={extra?.label}>
              <Select
                allowClear
                labelInValue
                options={extra?.values}
                onChange={(value) => handleChange(extra, value)}
                value={filters?.[extra?.value]?.value}
              />
            </Form.Item>
          </Col>
        ))}
        <Col>
          <Form.Item label=' '>
            <Button onClick={handleClearFilter}>{t('clear.filter')}</Button>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default ProductStockFilter;
