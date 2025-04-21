import { useState, useEffect } from 'react';
import { Divider, Space, Tabs, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import settingService from 'services/settings';
import { shallowEqual, useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { disableRefetch, setMenuData } from 'redux/slices/menu';
import createImage from 'helpers/createImage';
import Loading from 'components/loading';
import { isArray } from 'lodash';
import Setting from './setting';
import Locations from './locations';
import Footer from './footer';
import Reservation from './reservation';
import Permission from './permission';
import Auth from './auth';
import QrCode from './qrcode';
import DefaultDeliveryZone from './default-delivery-zone';
import TemplateDeliveryZones from './template-delivery-zones';
import { checkIsTruish } from 'helpers/checkIsTruish';
import { defaultCenter } from 'configs/app-global';
import Card from 'components/card';

const { TabPane } = Tabs;

export default function GeneralSettings() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  const onChange = (key) => setTab(key);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [logo, setLogo] = useState(activeMenu.data?.logo || null);
  const [darkLogo, setDarkLogo] = useState(activeMenu.data?.dark_logo || null);
  const [favicon, setFavicon] = useState(activeMenu.data?.favicon || null);
  const [location, setLocation] = useState(
    activeMenu.data?.location || defaultCenter,
  );
  const [triangleCoords, setTriangleCoords] = useState([]);
  const [templateTriangleCoords, setTemplateTriangleCoords] = useState([]);

  const createSettings = (list) => {
    const result = list.map((item) => ({
      [item.key]: item.value,
    }));
    return Object.assign({}, ...result);
  };

  function fetchSettings() {
    setLoading(true);
    settingService
      .get()
      .then((res) => {
        const data = createSettings(res?.data);
        const locationArray = data?.location?.split(',');
        data.order_auto_delivery_man = checkIsTruish(
          data.order_auto_delivery_man,
        );
        data.order_auto_approved = checkIsTruish(data.order_auto_approved);
        data.system_refund = checkIsTruish(data.system_refund);
        data.refund_delete = checkIsTruish(data.refund_delete);
        data.prompt_email_modal = checkIsTruish(data.prompt_email_modal);
        data.blog_active = checkIsTruish(data.blog_active);
        data.referral_active = checkIsTruish(data.referral_active);
        data.aws = checkIsTruish(data.aws);
        data.group_order = checkIsTruish(data.group_order);
        data.by_subscription = checkIsTruish(data.by_subscription);
        data.is_demo = checkIsTruish(data.is_demo);
        data.location = {
          lat: Number(locationArray?.[0]),
          lng: Number(locationArray?.[1]),
        };
        setLocation(data.location);
        data.logo = createImage(data.logo);
        data.dark_logo = createImage(data?.dark_logo);
        data.favicon = createImage(data.favicon);
        setLogo(data.logo);
        setDarkLogo(data.dark_logo);
        setFavicon(data.favicon);
        setTemplateTriangleCoords(
          data?.template_delivery_zones?.length
            ? data?.template_delivery_zones
            : [],
        );
        if (
          isArray(data?.default_delivery_zone) &&
          data?.default_delivery_zone?.length
        ) {
          setTriangleCoords(
            data?.default_delivery_zone?.map((item) => ({
              lng: item?.[0],
              lat: item?.[1],
            })),
          );
        }
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchSettings();
    }
    // eslint-disable-next-line
  }, [activeMenu.refetch]);

  return (
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
          {t('general.settings')}
        </Typography.Title>
      </Space>
      <Divider color='var(--divider)' />
      {loading ? (
        <Loading />
      ) : (
        <Tabs
          activeKey={tab}
          onChange={onChange}
          tabPosition='left'
          size='small'
        >
          <TabPane key='settings' tab={t('settings')}>
            <Setting
              logo={logo}
              setLogo={setLogo}
              darkLogo={darkLogo}
              setDarkLogo={setDarkLogo}
              favicon={favicon}
              setFavicon={setFavicon}
            />
          </TabPane>
          <TabPane key='location' tab={t('location')}>
            <Locations location={location} setLocation={setLocation} />
          </TabPane>
          <TabPane key='defaultDeliveryZone' tab={t('default.delivery.zone')}>
            <DefaultDeliveryZone
              triangleCoords={triangleCoords}
              setTriangleCoords={setTriangleCoords}
            />
          </TabPane>
          <TabPane
            key='templateDeliveryZones'
            tab={t('template.delivery.zones')}
          >
            <TemplateDeliveryZones
              templateTriangleCoords={templateTriangleCoords}
              isLoading={loading}
            />
          </TabPane>
          <TabPane key='permission' tab={t('permission')}>
            <Permission />
          </TabPane>
          <TabPane key='auth' tab={t('auth.settings')}>
            <Auth />
          </TabPane>
          <TabPane key='reservation' tab={t('reservation')}>
            <Reservation />
          </TabPane>
          <TabPane key='qr_code' tab={t('qrcode')}>
            <QrCode />
          </TabPane>
          <TabPane key='footer' tab={t('footer')}>
            <Footer />
          </TabPane>
        </Tabs>
      )}
    </Card>
  );
}
