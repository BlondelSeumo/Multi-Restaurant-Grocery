import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getSidebarIcons } from 'helpers/getSidebarIcons';
import { setMenu } from 'redux/slices/menu';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const SidebarMenuList = ({ data, active }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addNewItem = (item) => {
    if (typeof item.url === 'undefined') return;
    const data = {
      ...item,
      icon: undefined,
      children: undefined,
      refetch: true,
    };
    dispatch(setMenu(data));
    navigate(`/${item.url}`);
  };

  const renderMenuItem = (item) => {
    switch (item?.type) {
      case 'group': {
        return (
          <Menu.ItemGroup key={item?.id} title={t(item?.name)}>
            {item?.menus?.map((child) => renderMenuItem(child))}
          </Menu.ItemGroup>
        );
      }
      case 'parent': {
        return (
          <Menu.SubMenu
            key={item?.id}
            title={t(item?.name)}
            icon={getSidebarIcons(item?.icon, 14)}
          >
            {item?.children?.map((child) => renderMenuItem(child))}
          </Menu.SubMenu>
        );
      }
      case 'single': {
        return (
          <Menu.Item
            key={item?.id}
            icon={getSidebarIcons(item?.icon, 14)}
            onClick={() => {
              navigate(`/${item?.url}`);
              addNewItem(item);
            }}
            // className={!!item?.parentId && 'height-20'}
          >
            <span
              className={
                item?.parentId ? 'text-13 font-400' : 'text-14 font-400'
              }
              // className='text-14 font-400'
            >
              {t(item?.name)}
            </span>
          </Menu.Item>
        );
      }

      default:
        return;
    }
  };

  return (
    <Menu
      theme='light'
      mode='inline'
      defaultSelectedKeys={[String(active?.id)]}
      // defaultOpenKeys={[String(active?.parentId)]}
      style={{ paddingBottom: '20px' }}
    >
      {data?.map((item) => renderMenuItem(item))}
    </Menu>
  );
};

export default SidebarMenuList;
