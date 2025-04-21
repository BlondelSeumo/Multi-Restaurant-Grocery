import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DebounceSelect } from 'components/search';
import { deleteStockFromStocks } from 'redux/slices/product';

const ProductStockList = ({ fetchAddonOptions, form }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );

  const handleDeleteStock = ({ remove, field }) => {
    const deletedStockValue = form.getFieldsValue()?.stocks?.[field?.name];
    dispatch(deleteStockFromStocks(deletedStockValue));
    remove(field.name);
  };

  return (
    <Form.List name='stocks'>
      {(fields, { remove }) => {
        return (
          <div>
            {fields.map((field, index) => {
              return (
                <Row
                  key={field.key}
                  gutter={12}
                  align='middle'
                  style={{ flexWrap: 'nowrap', overflowX: 'auto' }}
                  hidden={!activeMenu.data?.extras?.length && field.key}
                >
                  {activeMenu.data?.extras?.map((item, idx) => (
                    <Col key={'extra' + item.value}>
                      <Form.Item
                        label={item?.label}
                        name={[index, `extras[${idx}]`]}
                        rules={[{ required: true, message: t('required') }]}
                      >
                        <Select
                          disabled
                          className='w-100'
                          style={{ minWidth: 200 }}
                        />
                      </Form.Item>
                    </Col>
                  ))}
                  <Col>
                    <Form.Item
                      label={t('addons')}
                      name={[index, 'addons']}
                      rules={[{ required: false, message: t('required') }]}
                    >
                      <DebounceSelect
                        mode='multiple'
                        style={{ minWidth: '300px', maxWidth: '300px' }}
                        fetchOptions={fetchAddonOptions}
                        allowClear={true}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item label={t('sku')} name={[index, 'sku']}>
                      <Input className='w-100' style={{ minWidth: 200 }} />
                    </Form.Item>
                  </Col>

                  <Col>
                    <Form.Item
                      label={t('quantity')}
                      name={[index, 'quantity']}
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InputNumber
                        min={0}
                        className='w-100'
                        style={{ minWidth: 200 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item
                      label={`${t('price')} (${defaultCurrency?.symbol})`}
                      name={[index, 'price']}
                      rules={[{ required: true, message: t('requried') }]}
                    >
                      <InputNumber
                        min={0}
                        className='w-100'
                        style={{ minWidth: 200 }}
                      />
                    </Form.Item>
                    <Form.Item
                      hidden
                      label={t('id')}
                      name={[index, 'stock_id']}
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item label={t('tax')} name={[index, 'tax']}>
                      <InputNumber
                        className='w-100'
                        disabled
                        style={{ minWidth: 200 }}
                        addonAfter='%'
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, nextValues) =>
                        prevValues?.stocks?.[field.name]?.price !==
                        nextValues?.stocks?.[field.name]?.price
                      }
                    >
                      {({ getFieldValue }) => {
                        const tax =
                          getFieldValue(['stocks', field.name, 'tax']) || 0;

                        const price = getFieldValue([
                          'stocks',
                          field.name,
                          'price',
                        ]);
                        const totalPrice =
                          tax === 0 ? price : (price * tax) / 100 + price;
                        return (
                          <Form.Item
                            label={`${t('total.price')} (${
                              defaultCurrency?.symbol
                            })`}
                          >
                            <InputNumber
                              min={1}
                              disabled
                              value={totalPrice}
                              className='w-100'
                              style={{ minWidth: 200 }}
                            />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                  </Col>
                  {!!activeMenu.data?.extras?.length && (
                    <Col>
                      <Button
                        type='primary'
                        className='mt-2'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteStock({ remove, field })}
                      />
                    </Col>
                  )}
                </Row>
              );
            })}
          </div>
        );
      }}
    </Form.List>
  );
};

export default ProductStockList;
