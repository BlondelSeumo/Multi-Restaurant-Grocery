import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Card, Col, Form, Input, Row, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import productService from 'services/product';
import { InfiniteSelect } from 'components/infinite-select';
import React, { useState } from 'react';

const BannerFormBasic = ({ loading = false }) => {
  const { t } = useTranslation();
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const [hasMore, setHasMore] = useState(false);
  const fetchProducts = ({ search = '', page = 1 }) => {
    const params = {
      search: search?.length ? search : undefined,
      status: 'published',
      page,
      perPage: 10,
    };
    return productService.getAll(params).then((res) => {
      setHasMore(!!res?.links?.next);
      return res?.data?.map((item) => ({
        label: item?.translation?.title || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };
  return (
    <Card title={t('basic.info')} loading={loading}>
      <Row gutter={12}>
        <Col span={24}>
          {languages.map((item) => (
            <Form.Item
              label={t('name')}
              name={`title[${item?.locale || 'en'}]`}
              key={item?.locale}
              hidden={item?.locale !== defaultLang}
              rules={[
                {
                  required: item?.locale === defaultLang,
                  message: t('required'),
                },
                {
                  type: 'string',
                  min: 2,
                  max: 200,
                  message: t('min.2.max.200.chars'),
                },
              ]}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={24}>
          {languages.map((item) => (
            <Form.Item
              label={t('description')}
              name={`description[${item?.locale || 'en'}]`}
              key={item?.locale}
              hidden={item?.locale !== defaultLang}
              rules={[
                {
                  required: item?.locale === defaultLang,
                  message: t('required'),
                },
                {
                  type: 'string',
                  min: 2,
                  max: 5000,
                  message: t('min.2.max.200.chars'),
                },
              ]}
            >
              <TextArea rows={2} />
            </Form.Item>
          ))}
        </Col>
        <Col span={24}>
          {languages.map((item) => (
            <Form.Item
              label={t('button.text')}
              name={`button_text[${item?.locale || 'en'}]`}
              key={item?.locale}
              hidden={item?.locale !== defaultLang}
              rules={[
                {
                  required: item?.locale === defaultLang,
                  message: t('required'),
                },
                {
                  type: 'string',
                  min: 2,
                  max: 200,
                  message: t('min.2.max.200.chars'),
                },
              ]}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={24}>
          <Form.Item
            label={t('url')}
            name='url'
            rules={[
              { required: true, message: t('required') },
              {
                type: 'url',
                message: t('invalid.url'),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name='products'
            label={t('products')}
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <InfiniteSelect
              fetchOptions={fetchProducts}
              hasMore={hasMore}
              mode='multiple'
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item
            label={t('clickable')}
            name='clickable'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default BannerFormBasic;
