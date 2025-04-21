import { useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import Sidebar from 'components/sidebar';
// import TabMenu from 'components/tab-menu';
import ChatIcons from 'views/chat/chat-icons';
import Footer from 'components/footer';
import languagesService from 'services/languages';
import { setLangugages } from 'redux/slices/formLang';
import { fetchAllShops } from 'redux/slices/allShops';
import { fetchCurrencies, fetchRestCurrencies } from 'redux/slices/currency';
import { data } from 'configs/menu-config';
import { setUserData } from 'redux/slices/auth';
import Loading from 'components/loading';
import { fetchMyBranch, fetchMyShop } from 'redux/slices/myShop';
import SubscriptionsDate from 'components/subscriptions-date';
import Header from 'components/header';
const { Content } = Layout;

const AppLayout = () => {
  const dispatch = useDispatch();
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { direction, navCollapsed } = useSelector(
    (state) => state.theme.theme,
    shallowEqual,
  );

  const fetchLanguages = () => {
    languagesService.getAllActive().then(({ data }) => {
      dispatch(setLangugages(data));
    });
  };

  useEffect(() => {
    const body = {
      page: 1,
      perPage: 1,
      status: 'approved',
    };
    if (!languages.length) {
      fetchLanguages();
    }
    if (user?.role === 'seller' || user?.role === 'moderator') {
      dispatch(fetchMyShop({}));
    }
    if (user?.role === 'admin') {
      dispatch(fetchMyBranch({}));
    }
    if (user?.role === 'admin' || user?.role === 'manager') {
      dispatch(fetchAllShops(body));
      dispatch(fetchCurrencies({}));
    } else {
      dispatch(fetchRestCurrencies({}));
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // for development purpose only
    const userObj = {
      ...user,
      urls: data[user.role],
    };
    dispatch(setUserData(userObj));
    // eslint-disable-next-line
  }, []);

  const getLayoutGutter = () => {
    return navCollapsed ? 80 : 250;
  };

  const getLayoutDirectionGutter = () => {
    if (direction === 'ltr') {
      return { paddingLeft: getLayoutGutter(), minHeight: '100vh' };
    }
    if (direction === 'rtl') {
      return { paddingRight: getLayoutGutter(), minHeight: '100vh' };
    }
    return { paddingLeft: getLayoutGutter() };
  };

  return (
    <Layout className='app-container'>
      <Sidebar />
      <Layout className='app-layout' style={getLayoutDirectionGutter()}>
        <Header />
        {/*<TabMenu />*/}
        <Content style={{ flex: '1 0 70%', padding: '1rem 30px' }}>
          <Suspense fallback={<Loading />}>
            <SubscriptionsDate />
            <Outlet />
          </Suspense>
        </Content>
        <Footer />
      </Layout>
      {(user?.role === 'admin' ||
        user?.role === 'seller' ||
        user?.role === 'deliveryman') && <ChatIcons />}
    </Layout>
  );
};

export default AppLayout;
