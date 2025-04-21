import React, { useEffect, useState } from 'react';
import { Card, Form, Tabs } from 'antd';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import userService from 'services/user';
import Loading from 'components/loading';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import createImage from 'helpers/createImage';
import useDemo from 'helpers/useDemo';
import hideEmail from 'components/hideEmail';
import UserOrders from './userOrders';
import UserPassword from './userPassword';
import UserEditForm from './userEditForm';
import WalletHistory from './walletHistory';
import DeliverymanZone from './deliveryman-zone';
import DelivertSettingCreate from './add-deliveryman-settings';

const { TabPane } = Tabs;

const UserEdit = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('edit');
  const [image, setImage] = useState([]);
  const [id, setId] = useState(null);
  const role = activeMenu?.data?.role;
  const { isDemo } = useDemo();

  const showUserData = (uuid) => {
    setLoading(true);
    userService
      .getById(uuid)
      .then((res) => {
        const data = res.data;
        const payload = {
          ...data,
          image: createImage(data.img),
        };
        dispatch(setMenuData({ activeMenu, data: payload }));
        form.setFieldsValue({
          firstname: data.firstname,
          lastname: data.lastname,
          email: isDemo ? hideEmail(data.email) : data.email,
          phone: data.phone,
          birthday: moment(data.birthday),
          gender: data.gender,
          password_confirmation: data.password_confirmation,
          password: data.password,
          image: createImage(data.img) ? [createImage(data.img)] : [],
          shop_id: data?.invitations?.map((i) => ({
            label: i?.shop?.translation?.title,
            value: i?.shop?.id,
          })),
          kitchen: {
            label: data?.kitchen?.translation?.title,
            value: data?.kitchen?.id,
            key: data?.kitchen?.id,
          },
          tables: data?.tables?.length
            ? data?.tables?.map((item) => ({
                label: item?.name || t('N/A'),
                value: item?.id,
                key: item?.id,
              }))
            : undefined,
          isWork: !!data?.isWork,
        });
        setImage(createImage(data?.img) ? [createImage(data?.img)] : []);
        setId(res.data?.delivery_man_setting?.id);
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  useEffect(() => {
    if (activeMenu?.refetch) showUserData(uuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu?.refetch]);

  const onChange = (key) => setTab(key);

  return (
    <Card title={t('user.settings')}>
      {!loading ? (
        <Tabs
          activeKey={tab}
          onChange={onChange}
          tabPosition='left'
          size='small'
        >
          <TabPane key='edit' tab={t('edit.user')}>
            <UserEditForm
              data={activeMenu?.data}
              form={form}
              image={image}
              setImage={setImage}
              action_type={'edit'}
            />
          </TabPane>
          <TabPane key='order' tab={t('orders')}>
            <UserOrders data={activeMenu?.data} />
          </TabPane>
          {role === 'deliveryman' && (
            <>
              <TabPane key='delivery' tab={t('delivery.transport')}>
                <DelivertSettingCreate id={id} data={activeMenu.data} />
              </TabPane>
              <TabPane key='deliverymanzone' tab={t('delivery.zone')}>
                <DeliverymanZone user_id={activeMenu.data?.id} />
              </TabPane>
            </>
          )}
          <TabPane key='wallet' tab={t('wallet')}>
            <WalletHistory data={activeMenu?.data} />
          </TabPane>
          <TabPane key='password' tab={t('password')}>
            <UserPassword data={activeMenu?.data} />
          </TabPane>
        </Tabs>
      ) : (
        <Loading />
      )}
    </Card>
  );
};

export default UserEdit;
