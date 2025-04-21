import { Badge, Image } from 'antd';
import { useEffect, useState } from 'react';
import { delMany, keys } from 'idb-keyval';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import NotificationDrawer from 'components/notification-drawer';
import PushNotification from 'components/push-notification';
import 'assets/scss/components/header.scss';
import BellImagePath from 'assets/images/bell.png';

const NotificationsIndicator = () => {
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const handleFocus = () => {
      getNotifications();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const getNotifications = () => {
    keys().then((val) => setNotifications(val));
  };

  const clearNotifications = () => {
    delMany(notifications)
      .then(() => {
        setNotifications([]);
        setIsNotificationOpen(false);
      })
      .catch(() => toast.error(t('notification.error')));
  };

  return (
    <div>
      <button type='button' onClick={() => setIsNotificationOpen(true)}>
        <Badge count={notifications.length} size='small'>
          <Image
            src={BellImagePath}
            alt='bell'
            width={22}
            height={22}
            preview={false}
          />
        </Badge>
      </button>
      <NotificationDrawer
        visible={isNotificationOpen}
        handleClose={() => setIsNotificationOpen(false)}
        list={notifications}
        clear={clearNotifications}
        refetch={getNotifications}
      />
      <PushNotification refetch={getNotifications} />
    </div>
  );
};

export default NotificationsIndicator;
