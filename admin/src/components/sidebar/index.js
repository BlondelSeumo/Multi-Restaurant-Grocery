import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { Layout, Input } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Scrollbars from 'react-custom-scrollbars';
import SidebarHeader from './header';
import MenuList from './menu-list';

const { Sider } = Layout;

const Sidebar = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { navCollapsed } = useSelector(
    (state) => state.theme.theme,
    shallowEqual,
  );

  const routes = useMemo(
    () => user.urls,
    // eslint-disable-next-line
    [user?.id],
  );
  const findActive = (item) => {
    if (item?.type === 'single' && pathname.includes(item?.url)) {
      return item;
    }
    if (item?.type === 'group') {
      for (const menu of item?.menus || []) {
        const tempActiveMenu = findActive(menu);
        if (tempActiveMenu) return tempActiveMenu;
      }
    }
    if (item?.type === 'parent') {
      for (const child of item?.children || []) {
        const activeChild = findActive(child);
        if (activeChild) return activeChild;
      }
    }
    return null;
  };
  const active =
    routes?.reduce((acc, item) => acc || findActive(item), null) || routes?.[0];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredList = (searchTerm) => {
    if (!searchTerm.length) {
      return routes;
    }

    const searchTermLower = searchTerm.toLowerCase();

    const filterItems = (items) => {
      return items.reduce((acc, item) => {
        const itemName = t(item?.name)?.toLowerCase();
        if (itemName?.includes(searchTermLower?.toLowerCase())) {
          acc.push(item);
        } else if (item?.menus) {
          const filteredMenus = filterItems(item.menus);
          if (filteredMenus.length) {
            acc.push({ ...item, menus: filteredMenus });
          }
        } else if (item?.children) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length) {
            acc.push({ ...item, children: filteredChildren });
          }
        }
        return acc;
      }, []);
    };

    return filterItems(routes);
  };

  const menuList = filteredList(searchTerm);

  return (
    <>
      <Sider
        className='navbar-nav side-nav'
        width={250}
        collapsed={navCollapsed}
        style={{ height: '100vh', top: 0 }}
      >
        <SidebarHeader navCollapsed={navCollapsed} />
        {!navCollapsed && (
          <span
            className='d-flex justify-content-center'
            style={{ margin: '0 0 20px' }}
          >
            <Input
              placeholder={t('search.in.menu')}
              style={{ width: '90%' }}
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
              }}
              prefix={<SearchOutlined />}
            />
          </span>
        )}
        <Scrollbars
          autoHeight
          autoHeightMax={`calc(100vh - ${navCollapsed ? 84 : 154}px)`}
          autoHeightMin={`calc(100vh - ${navCollapsed ? 84 : 154}px)`}
          autoHide
        >
          <MenuList data={menuList} active={active} />
        </Scrollbars>
      </Sider>
    </>
  );
};
export default Sidebar;
