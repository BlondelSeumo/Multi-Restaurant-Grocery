import { useTranslation } from 'react-i18next';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import numberToPrice from 'helpers/numberToPrice';
import cls from './list.module.scss';
import RiveResult from 'components/rive-result';

const TopCustomersList = ({ data }) => {
  const { t } = useTranslation();
  if (!data?.length) {
    return <RiveResult />;
  }
  return (
    <div className={cls.container}>
      {data?.map((item) => (
        <div key={item?.id} className={cls.item}>
          <div className={cls.main}>
            <Avatar src={item?.img} shape='circle' icon={<UserOutlined />} />
            <div className={cls.info}>
              <span>
                {item?.firstname || ''} {item?.lastname || ''}
              </span>
              <span>{item?.phone || t('N/A')}</span>
            </div>
          </div>
          <div className={cls.right}>
            <span className={cls.order}>
              {t('orders')}: {item?.count || 0}
            </span>
            <span className={cls.price}>
              {numberToPrice(item?.total_price)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopCustomersList;
