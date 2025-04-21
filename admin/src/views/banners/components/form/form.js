import { Button, Col, Form, Row } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector, shallowEqual, batch } from 'react-redux';
import { useEffect, useState } from 'react';
import bannerService from 'services/banner';
import getLanguageFields from 'helpers/getLanguageFields';
import { disableRefetch, removeFromMenu } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchBanners } from 'redux/slices/banner';
import getTranslationFields from 'helpers/getTranslationFields';
import createImage from 'helpers/createImage';
import BannerFormBasic from './basic';
import BannerFormMedia from './media';

const BannerForm = ({ handleSubmit }) => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [imageList, setImageList] = useState([]);

  const fetchBanner = (id) => {
    setLoading(true);
    bannerService
      .getById(id)
      .then((res) => {
        const body = {
          ...getLanguageFields(languages, res?.data, [
            'title',
            'description',
            'button_text',
          ]),
          url: res?.data?.url,
          products: res?.data?.products?.map((product) => ({
            label: product?.translation?.title,
            value: product?.id,
            key: product?.id,
          })),
          clickable: !!res?.data?.clickable,
          active: !!res?.data?.active,
        };
        if (res?.data?.img) {
          setImageList([createImage(res?.data?.img)]);
        }
        form.setFieldsValue(body);
      })
      .finally(() => setLoading(false));
  };

  const fetch = () => {
    fetchBanner(id);
    dispatch(disableRefetch(activeMenu));
  };

  const onFinish = (values) => {
    const body = {
      // basic info
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
      button_text: getTranslationFields(languages, values, 'button_text'),
      url: values?.url,
      products: values?.products?.map((item) => item?.value),
      clickable: !!values?.clickable,
      active: !!values?.active,
      // media
      images: imageList.map((item) => item?.name),
    };
    setLoadingBtn(true);
    handleSubmit(body)
      .then(() => {
        const nextUrl = 'banners';
        batch(() => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchBanners({}));
        });
        navigate(`/${nextUrl}`);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (id) {
      fetch();
    }
    return () => {};
    // eslint-disable-next-line
  }, [id]);

  useDidUpdate(() => {
    if (activeMenu.refetch && id) {
      fetch();
    }
  }, [activeMenu.refetch, id]);

  return (
    <Form form={form} layout='vertical' onFinish={onFinish}>
      <Row gutter={12}>
        <Col span={16}>
          <BannerFormBasic loading={loading} />
        </Col>
        <Col flex='1'>
          <BannerFormMedia
            form={form}
            imageList={imageList}
            setImageList={setImageList}
            loading={loading}
          />
        </Col>
      </Row>
      <Button htmlType='submit' loading={loadingBtn} type='primary'>
        {t('save')}
      </Button>
    </Form>
  );
};

export default BannerForm;
