import { Button, Col, Form, Input, InputNumber, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { DebounceSelect } from 'components/search';
import React from 'react';
import generateRandomNumbers from 'helpers/generateRandomNumbers';

const randomNumbersLength = 6;

const assignObject = (obj, key, value) =>
  obj.map((item = {}) => ({ ...item, [key]: value }));

const StockSetAll = ({ form, fetchAddonOptions }) => {
  const { t } = useTranslation();
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );

  const handleSetAllSku = (generateRandom, value) => {
    const skuValue = generateRandom
      ? generateRandomNumbers(randomNumbersLength)
      : value;
    const { stocks } = form.getFieldsValue();
    form.setFieldsValue({
      all_sku: skuValue,
      stocks: assignObject(stocks, 'sku', skuValue),
    });
  };

  const handleSetAllQuantity = (value) => {
    const { stocks } = form.getFieldsValue();
    form.setFieldsValue({ stocks: assignObject(stocks, 'quantity', value) });
  };

  const handleSetAllPrice = (value) => {
    const { stocks } = form.getFieldsValue();
    form.setFieldsValue({ stocks: assignObject(stocks, 'price', value) });
  };

  const handleSetAllAddons = (value) => {
    const { stocks } = form.getFieldsValue();
    form.setFieldsValue({
      stocks: assignObject(stocks, 'addons', value),
    });
  };

  return (
    <Row gutter={12}>
      <Col style={{ width: 200 }}>
        <Form.Item label={t('set.all.skus')} name='all_sku'>
          <Input onChange={(e) => handleSetAllSku(false, e.target.value)} />
        </Form.Item>
      </Col>
      <Col>
        <Form.Item label=' '>
          <Button onClick={handleSetAllSku}>{t('generate.sku')}</Button>
        </Form.Item>
      </Col>
      <Col style={{ width: 200 }}>
        <Form.Item label={t('set.all.quantities')} name='all_quantity'>
          <InputNumber onChange={handleSetAllQuantity} className='w-100' />
        </Form.Item>
      </Col>
      <Col style={{ width: 200 }}>
        <Form.Item
          label={`${t('set.all.prices')} (${defaultCurrency?.symbol})`}
          name='all_price'
        >
          <InputNumber onChange={handleSetAllPrice} className='w-100' />
        </Form.Item>
      </Col>
      <Col style={{ width: 200 }}>
        <Form.Item label={t('set.all.addons')} name='all_addon'>
          <DebounceSelect
            mode='multiple'
            style={{ minWidth: '300px' }}
            fetchOptions={fetchAddonOptions}
            allowClear={true}
            onChange={handleSetAllAddons}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default StockSetAll;
