import { Tabs } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setFilters, setParams } from 'redux/slices/banner';

const BannerFiltersTabs = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { statuses, filters } = useSelector(
    (state) => state.banner,
    shallowEqual,
  );

  const handleChangeTab = (status) => {
    batch(() => {
      dispatch(setFilters({ status }));
      dispatch(setParams({ page: 1 }));
    });
  };

  return (
    <Tabs activeKey={filters?.status} onChange={handleChangeTab} type='card'>
      {statuses.map((status) => (
        <Tabs.TabPane key={status} tab={t(status)} />
      ))}
    </Tabs>
  );
};

export default BannerFiltersTabs;
