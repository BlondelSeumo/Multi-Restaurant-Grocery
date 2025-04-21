import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { navCollapseTrigger } from 'redux/slices/theme';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useContext, useMemo } from 'react';
import { Context } from 'context/context';

const SidebarHeader = ({ navCollapsed = false }) => {
  const dispatch = useDispatch();
  const { darkTheme } = useContext(Context);
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual,
  );

  const logo = useMemo(() => {
    if (darkTheme && settings?.dark_logo) {
      return settings?.dark_logo;
    }
    return settings?.logo;
  }, [darkTheme, settings?.logo, settings?.dark_logo]);

  const menuTrigger = (event) => {
    event.stopPropagation();
    dispatch(navCollapseTrigger());
  };
  return (
    <div
      className='d-flex justify-content-center align-items-center'
      style={{ margin: '22px 0 42px 0' }}
    >
      <div
        style={{ width: '90%' }}
        className='d-flex justify-content-between align-items-center'
      >
        {!navCollapsed && (
          <>
            <div
              style={{ maxWidth: '129px', height: '30px', overflow: 'hidden' }}
            >
              <img
                alt={settings?.title}
                src={logo}
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  maxWidth: '129px',
                  height: '30px',
                }}
              />
            </div>
            <MenuFoldOutlined
              onClick={menuTrigger}
              style={{ fontSize: '20px' }}
            />
          </>
        )}
        {navCollapsed && (
          <div className='w-100 d-flex justify-content-center'>
            <MenuUnfoldOutlined
              onClick={menuTrigger}
              style={{ fontSize: '20px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarHeader;
