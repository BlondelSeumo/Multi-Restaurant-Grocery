import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { filterTopCustomers } from 'redux/slices/statistics/topCustomers';
import cls from './top-customers.module.scss';
import DashboardFilter from '../filter';
import TopCustomersList from './list';

const TopCustomers = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { topCustomers, loading, params, filterTimeList } = useSelector(
    (state) => state.topCustomers,
    shallowEqual,
  );

  const handleChangeFilter = (item) => {
    dispatch(filterTopCustomers({ time: item }));
  };
  const handleChangePerPage = (item) => {
    dispatch(filterTopCustomers({ perPage: item }));
  };

  return (
    <div className={cls.container}>
      <h3 className={cls.title}>{t('top.customers')}</h3>
      <div className={cls.filter}>
        <DashboardFilter
          filterList={filterTimeList}
          activeKey={params?.time}
          onChange={handleChangeFilter}
          disabled={loading}
          withPerPage
          activeKeyPerPage={params?.perPage}
          onChangePerPage={handleChangePerPage}
        />
      </div>
      <TopCustomersList data={topCustomers} />
    </div>
  );
};

export default TopCustomers;
