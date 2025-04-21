import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'helpers/useQueryParams';
import { shopUserRoles } from '../../roles';

const { TabPane } = Tabs;

const ShopUsersRolesFilter = () => {
  const { t } = useTranslation();
  const queryParams = useQueryParams();
  const onTabChange = (role) => {
    queryParams.set('role', role);
  };
  return (
    <Tabs
      type='card'
      activeKey={queryParams.get('role') || 'user'}
      onChange={onTabChange}
    >
      {shopUserRoles.map((item) => (
        <TabPane tab={t(item)} key={item} />
      ))}
    </Tabs>
  );
};

export default ShopUsersRolesFilter;
