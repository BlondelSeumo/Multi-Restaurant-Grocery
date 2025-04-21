import React, { useEffect, useState } from 'react';
import { data } from 'configs/menu-config';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  notification,
  Row,
  Typography,
} from 'antd';
import authService from 'services/auth';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from 'redux/slices/auth';
import { fetchRestSettings, fetchSettings } from 'redux/slices/globalSettings';
import { useTranslation } from 'react-i18next';
import { PROJECT_NAME } from 'configs/app-global';
import Recaptcha from 'components/recaptcha';
import { setMenu } from 'redux/slices/menu';
import cls from './login.module.scss';

const { Title } = Typography;

const credentials = [
  {
    login: 'owner@githubit.com',
    password: 'githubit',
  },
  {
    login: 'branch1@githubit.com',
    password: 'branch1',
  },
  {
    login: 'delivery@githubit.com',
    password: 'delivery',
  },
  {
    login: 'waiter@githubit.com',
    password: 'waiter',
  },
];

const Login = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { settings } = useSelector((state) => state.globalSettings);
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [recaptcha, setRecaptcha] = useState(null);

  const isDemo = Boolean(Number(settings?.is_demo));

  const handleRecaptchaChange = (value) => {
    setRecaptcha(value);
  };

  const fetchUserSettings = (role) => {
    switch (role) {
      case 'admin':
        dispatch(fetchSettings({}));
        break;
      case 'seller':
        dispatch(fetchRestSettings({ seller: true }));
        break;
      default:
        dispatch(fetchRestSettings({}));
    }
  };

  const handleLogin = (values) => {
    const body = {
      password: values.password,
    };
    if (values.email.includes('@')) {
      body.email = values.email;
    } else {
      body.phone = values.email.replace(/[^0-9]/g, '');
    }
    setLoading(true);
    authService
      .login(body)
      .then((res) => {
        const user = {
          fullName: `${res?.data?.user?.firstname || ''} ${res?.data?.user?.lastname || ''}`,
          role: res.data.user.role,
          urls: data[res.data.user.role],
          img: res.data.user.img,
          token: res.data.access_token,
          email: res.data.user.email,
          id: res.data.user.id,
          shop_id: res.data.user?.shop?.id,
        };
        if (user.role === 'waiter') {
          dispatch(
            setMenu({
              name: t('my.orders'),
              url: 'waiter/orders',
              id: 'my_orders',
              refetch: true,
            }),
          );
        }
        if (user?.role === 'user') {
          notification.error({
            message: t('ERROR_101'),
          });
          return;
        }
        localStorage.setItem('token', res?.data?.access_token);
        dispatch(setUserData(user));
        fetchUserSettings(user?.role);
      })
      .finally(() => setLoading(false));
  };

  const copyCredentials = (event, item) => {
    event.preventDefault();
    form.setFieldsValue({ email: item?.login, password: item?.password });
  };

  useEffect(() => {
    fetchUserSettings(user?.role || '');
    return () => {};
    // eslint-disable-next-line
  }, []);

  return (
    <div className={cls.loginContainer}>
      <div className='container d-flex flex-column justify-content-center h-100 align-items-end'>
        <Row justify='center'>
          <Col>
            <Card className='card'>
              <div className='my-4 pl-4 pr-4 w-100'>
                <div className={`${cls.appBrand} text-center`}>
                  <Title className={cls.brandLogo}>
                    {settings.title || PROJECT_NAME}
                  </Title>
                </div>
                <Row justify='center'>
                  <Col>
                    <Form
                      name='login-form'
                      layout='vertical'
                      form={form}
                      onFinish={handleLogin}
                      style={{ width: '420px' }}
                    >
                      <Form.Item
                        name='email'
                        label={t('email')}
                        rules={[
                          {
                            required: true,
                            message: t('please.enter.your.email'),
                          },
                        ]}
                      >
                        <Input
                          prefix={
                            <MailOutlined className='site-form-item-icon' />
                          }
                          placeholder={t('example@info.com')}
                        />
                      </Form.Item>
                      <Form.Item
                        name='password'
                        label={t('password')}
                        rules={[
                          {
                            required: true,
                            message: t('please.enter.your.password'),
                          },
                        ]}
                      >
                        <Input.Password
                          prefix={
                            <LockOutlined className='site-form-item-icon' />
                          }
                          placeholder={t('password')}
                        />
                      </Form.Item>
                      <Recaptcha onChange={handleRecaptchaChange} />
                      <Form.Item className='login-input mt-4'>
                        <Button
                          type='primary'
                          htmlType='submit'
                          className={cls.loginFormButton}
                          loading={loading}
                          disabled={!Boolean(recaptcha)}
                        >
                          {t('login')}
                        </Button>
                      </Form.Item>
                      {isDemo && (
                        <Descriptions bordered size='small'>
                          {credentials.map((item, idx) => (
                            <React.Fragment key={idx}>
                              <Descriptions.Item span={2} label={item.login}>
                                {item.password}
                              </Descriptions.Item>
                              <Descriptions.Item span={1}>
                                <a
                                  href='/'
                                  className={cls.copyLink}
                                  onClick={(event) =>
                                    copyCredentials(event, item)
                                  }
                                >
                                  {t('copy')}
                                </a>
                              </Descriptions.Item>
                            </React.Fragment>
                          ))}
                        </Descriptions>
                      )}{' '}
                      {!isDemo && process.env.REACT_APP_IS_DEMO === 'true' && (
                        <Descriptions bordered size='small'>
                          <Descriptions.Item
                            span={2}
                            label={credentials[0].login}
                          >
                            {credentials[0].password}
                          </Descriptions.Item>
                          <Descriptions.Item span={1}>
                            <a
                              href='/'
                              className={cls.copyLink}
                              onClick={(event) =>
                                copyCredentials(event, credentials[0])
                              }
                            >
                              {t('copy')}
                            </a>
                          </Descriptions.Item>
                        </Descriptions>
                      )}
                    </Form>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default Login;
