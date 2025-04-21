import 'assets/scss/components/header.scss';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Dropdown, Menu, Modal } from 'antd';
import { EditOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import getAvatar from 'helpers/getAvatar';
import React, { useState } from 'react';
import UserModal from 'components/user-modal';
import { clearUser } from 'redux/slices/auth';
import { clearMenu } from 'redux/slices/menu';
import { setCurrentChat } from 'redux/slices/chat';
import { clearBags } from 'redux/slices/cart';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = () => {
    batch(() => {
      dispatch(clearUser());
      dispatch(clearMenu());
      dispatch(setCurrentChat(null));
      dispatch(clearBags());
    });
    setIsLogoutOpen(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menu = (
    <Menu>
      <Menu.Item
        key='edit'
        icon={<EditOutlined />}
        onClick={() => setIsProfileOpen(true)}
      >
        {t('edit.profile')}
      </Menu.Item>
      <Menu.Item
        key='logout'
        icon={<LogoutOutlined />}
        onClick={() => setIsLogoutOpen(true)}
      >
        {t('logout')}
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Dropdown placement='bottom' trigger={['click']} overlay={menu}>
        <div className='profile'>
          <div className='info'>
            <span className='fullName'>{user?.fullName || ''}</span>
            <span className='role'>{t(user?.role)}</span>
          </div>
          <Avatar
            src={getAvatar(user?.img)}
            icon={<UserOutlined />}
            size={40}
          />
        </div>
      </Dropdown>
      <Modal
        centered
        visible={isLogoutOpen}
        onCancel={() => setIsLogoutOpen(false)}
        footer={[
          <Button onClick={() => setIsLogoutOpen(false)}>{t('cancel')}</Button>,
          <Button type='primary' onClick={handleLogout}>
            {t('confirm')}
          </Button>,
        ]}
      >
        <LogoutOutlined size={24} theme='primary' />
        <span className='ml-2'>{t('leave.site')}</span>
      </Modal>
      {isProfileOpen && (
        <UserModal
          visible={isProfileOpen}
          handleCancel={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;
