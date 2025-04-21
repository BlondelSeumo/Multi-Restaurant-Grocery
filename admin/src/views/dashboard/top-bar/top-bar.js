import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import cls from './top-bar.module.scss';

const TopBar = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth, shallowEqual);

  return (
    <div className={cls.container}>
      <h1 className={cls.title}>
        {t('welcome')}, {user?.fullName}
      </h1>
      <p className={cls.description}>
        {t('monitor.your.business.performance.and.data')}
      </p>
    </div>
  );
};

export default TopBar;
