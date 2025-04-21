import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import settingService from 'services/settings';
import { toast } from 'react-toastify';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from 'redux/slices/menu';
import { fetchSettings as getSettings } from 'redux/slices/globalSettings';
import Loading from 'components/loading';
import useDemo from 'helpers/useDemo';
import Card from 'components/card';
import useDidUpdate from 'helpers/useDidUpdate';

export default function FirebaseConfig() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { isDemo } = useDemo();

  const createSettings = (list) => {
    const result = list.map((item) => ({
      [item.key]: item.value,
    }));
    return Object.assign({}, ...result);
  };

  const fetchSettings = () => {
    setLoading(true);
    settingService
      .get()
      .then((res) => {
        const data = createSettings(res.data);
        form.setFieldsValue(data);
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    settingService
      .update(values)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleClick = () => {
    if (isDemo) {
      toast.warning(t('cannot.work.demo'));
      return;
    }
    form.submit();
  };

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchSettings();
    }
  }, [activeMenu.refetch]);

  return (
    <Form
      layout='vertical'
      form={form}
      name='global-settings'
      onFinish={onFinish}
      initialValues={{ ...activeMenu.data }}
    >
      {!loading ? (
        <Card>
          <Space className='align-items-center justify-content-between w-100'>
            <Typography.Title
              level={1}
              style={{
                color: 'var(--text)',
                fontSize: '20px',
                fontWeight: 500,
                padding: 0,
                margin: 0,
              }}
            >
              {t('firebase.configuration')}
            </Typography.Title>
            <Button
              type='primary'
              onClick={() => handleClick()}
              style={{ width: '100%' }}
              loading={loadingBtn}
            >
              {t('save')}
            </Button>
          </Space>
          <Divider color='var(--divider)' />
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label={t('api.key')}
                name='api_key'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('auth.domain')}
                name='auth_domain'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('project.id')}
                name='project_id'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('storage.bucket')}
                name='storage_bucket'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('messaging.sender.id')}
                name='messaging_sender_id'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('app.id')}
                name='app_id'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('measurement.id')}
                name='measurement_id'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('vapid.key')}
                name='vapid_key'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={'IOS ' + t('api.key')}
                name='ios_api_key'
                rules={[
                  {
                    required: false,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={'Android ' + t('api.key')}
                name='android_api_key'
                rules={[
                  {
                    required: false,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ) : (
        <Loading />
      )}
    </Form>
  );
}
