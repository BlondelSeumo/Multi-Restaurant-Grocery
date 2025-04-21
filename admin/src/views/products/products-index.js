import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Switch,
} from 'antd';
import { DebounceSelect } from 'components/search';
import brandService from 'services/brand';
import categoryService from 'services/category';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import productService from 'services/product';
import { replaceMenu, setMenuData } from 'redux/slices/menu';
import unitService from 'services/unit';
import { useNavigate, useParams } from 'react-router-dom';
import { AsyncTreeSelect } from 'components/async-tree-select';
import { useTranslation } from 'react-i18next';
import MediaUpload from 'components/upload';
import TextArea from 'antd/lib/input/TextArea';
import createSelectObject from 'helpers/createSelectObject';
import { InfiniteSelect } from 'components/infinite-select';
import kitchenService from 'services/kitchen';

const ProductsIndex = ({ next, action_type = '' }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uuid } = useParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);

  const [fileList, setFileList] = useState(
    activeMenu.data?.images?.length ? activeMenu.data?.images : [],
  );
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [hasMore, setHasMore] = useState({ unit: false, kitchen: false });

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(
        setMenuData({ activeMenu, data: { ...activeMenu.data, ...data } }),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserBrandList = (search) => {
    return brandService.search(search).then((res) => {
      return res.data.map((item) => createSelectObject(item));
    });
  };

  const fetchUserCategoryList = () => {
    const params = { perPage: 100, type: 'main' };
    return categoryService
      .getAll(params)
      .then((res) => res.data.map((item) => createSelectObject(item)));
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const params = {
      ...values,
      active: Number(values?.active),
      brand_id: values?.brand?.value || undefined,
      category_id: values?.category?.value,
      unit_id: values?.unit?.value,
      kitchen_id: values?.kitchen?.value || undefined,
      images: undefined,
      brand: undefined,
      category: undefined,
      shop: undefined,
      unit: undefined,
      kitchen: undefined,
      ...Object.assign(
        {},
        ...fileList.map((item, index) => ({
          [`images[${index}]`]: item.name,
        })),
      ),
    };

    if (action_type === 'edit') {
      productUpdate(values, params);
    } else {
      productCreate(values, params);
    }
  };

  const productCreate = (values, params) => {
    productService
      .create(params)
      .then(({ data }) => {
        dispatch(
          replaceMenu({
            id: `product-${data.uuid}`,
            url: `product/${data.uuid}`,
            name: t('add.product'),
            data: values,
            refetch: false,
          }),
        );
        navigate(`/product/${data.uuid}/?step=1`);
      })
      .finally(() => setLoadingBtn(false));
  };

  const productUpdate = (values, params) => {
    productService
      .update(uuid, params)
      .then(() => {
        dispatch(
          setMenuData({
            activeMenu,
            data: { ...values, ...activeMenu?.data },
          }),
        );
        next();
      })
      .finally(() => setLoadingBtn(false));
  };

  const fetchUnits = ({ page = 1, search = '' }) => {
    const params = {
      search: search?.length ? search : undefined,
      page,
      perPage: 20,
      active: 1,
    };
    return unitService.getAll(params).then((res) => {
      setHasMore((prev) => ({ ...prev, unit: !!res?.links?.next }));
      return res?.data?.map((item) => createSelectObject(item));
    });
  };

  const fetchKitchens = ({ search, page = 1 }) => {
    const params = {
      search: search?.length ? search : undefined,
      page,
      perPage: 20,
      active: 1,
      shop_id: myShop?.id,
    };
    return kitchenService.getAll(params).then((res) => {
      setHasMore({
        ...hasMore,
        kitchen: res?.meta?.current_page < res?.meta?.last_page,
      });
      return res?.data?.map((item) => ({
        label: item?.translation?.title || item?.id || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  return (
    <Form
      layout='vertical'
      form={form}
      initialValues={{ active: true, ...activeMenu.data }}
      onFinish={onFinish}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'name' + item?.id}
              label={t('name')}
              name={`title[${item?.locale}]`}
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
              hidden={item?.locale !== defaultLang}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={12} className='mb-4'>
          {languages.map((item) => (
            <Form.Item
              key={'description' + item.id}
              label={t('description')}
              name={`description[${item.locale}]`}
              rules={[
                {
                  required: item?.locale === defaultLang,
                  message: t('required'),
                },
                {
                  type: 'string',
                  min: 2,
                  max: 1000,
                  message: t('min.2.max.10000.chars'),
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <TextArea rows={3} />
            </Form.Item>
          ))}
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('brand')}
            name='brand'
            rules={[
              {
                required: false,
                message: t('required'),
              },
            ]}
          >
            <DebounceSelect
              fetchOptions={fetchUserBrandList}
              allowClear={false}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('category')}
            name='category'
            rules={[{ required: true, message: t('required') }]}
          >
            <AsyncTreeSelect fetchOptions={fetchUserCategoryList} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('kitchen')} name='kitchen'>
            <InfiniteSelect
              allowClear={false}
              fetchOptions={fetchKitchens}
              hasMore={hasMore.kitchen}
              disabled={!myShop?.id}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('unit')}
            name='unit'
            rules={[{ required: true, message: t('required') }]}
          >
            <InfiniteSelect
              fetchOptions={fetchUnits}
              hasMore={hasMore?.unit}
              allowClear={false}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('tax')}
            name='tax'
            rules={[
              { required: true, message: t('required') },
              {
                validator(_, value) {
                  if (value < 0 || value > 100) {
                    return Promise.reject(
                      new Error(t('must.be.between.0.and.100')),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber className='w-100' addonAfter='%' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('interval')}
            name='interval'
            rules={[
              { required: true, message: t('required') },
              {
                type: 'number',
                min: 1,
                message: t('should.be.more.than.1'),
              },
            ]}
          >
            <InputNumber className='w-100' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('min.qty')}
            name='min_qty'
            rules={[
              { required: true, message: t('required') },
              {
                validator(_, value) {
                  if (value <= 0) {
                    return Promise.reject(
                      new Error(t('must.be.greater.than.0')),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber className='w-100' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('max.qty')}
            name='max_qty'
            rules={[
              { required: true, message: t('required') },
              {
                validator(_, value) {
                  if (value <= 0) {
                    return Promise.reject(
                      new Error(t('must.be.greater.than.0')),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber className='w-100' />
          </Form.Item>
        </Col>
        <Col span={2}>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item
            label={t('images')}
            name='images'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <MediaUpload
              type='products'
              imageList={fileList}
              setImageList={setFileList}
              form={form}
              multiple={true}
            />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('next')}
      </Button>
    </Form>
  );
};

export default ProductsIndex;
