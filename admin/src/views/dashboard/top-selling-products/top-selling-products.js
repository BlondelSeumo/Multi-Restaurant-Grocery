import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { filterTopProducts } from 'redux/slices/statistics/topProducts';
import { useTranslation } from 'react-i18next';
import cls from './top-selling-products.module.scss';
import DashboardFilter from '../filter';
import TopSellingProductsList from './list';

const TopSellingProducts = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { topProducts, loading, params, filterTimeList } = useSelector(
    (state) => state.topProducts,
    shallowEqual,
  );
  const handleChangeFilter = (item) => {
    dispatch(filterTopProducts({ time: item }));
  };
  const handleChangePerPage = (item) => {
    dispatch(filterTopProducts({ perPage: item }));
  };
  return (
    <div className={cls.container}>
      <h3 className={cls.title}>{t('top.selling.products')}</h3>
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
      <TopSellingProductsList data={topProducts} />
    </div>
  );
};

export default TopSellingProducts;
