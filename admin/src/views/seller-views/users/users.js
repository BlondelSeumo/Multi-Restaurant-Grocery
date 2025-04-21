import { Button, Card, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'helpers/useQueryParams';
import { addMenu } from 'redux/slices/menu';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { lazy } from 'react';
import ShopUsersRolesFilter from './components/roles-filter';
import ShopUsersList from './components/list';

const ShopUserDetails = lazy(() => import('./components/details'));

const ShopUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryParams = useQueryParams();
  const goToAddShopUser = () => {
    const link = `seller/shop-users/add/${queryParams.get('role')}`;
    dispatch(
      addMenu({
        id: 'shop-user-add',
        url: link,
        name: t(`add.${queryParams.get('role')}`),
      }),
    );
    navigate(`/${link}`);
  };
  return (
    <Card
      title={t('branch.users')}
      extra={[
        <Button
          type='primary'
          hidden={
            queryParams.get('role') === 'user' ||
            queryParams.get('role') === 'deliveryman' ||
            !queryParams.get('role')
          }
          onClick={goToAddShopUser}
        >
          {t(`add.${queryParams.get('role')}`)}
        </Button>,
      ]}
    >
      <ShopUsersRolesFilter />
      <ShopUsersList />
      <Modal
        title={t('user.details')}
        visible={!!queryParams.get('uuid')}
        onCancel={() => queryParams.reset('uuid')}
        footer={[
          <Button onClick={() => queryParams.reset('uuid')}>
            {t('close')}
          </Button>,
        ]}
      >
        <ShopUserDetails />
      </Modal>
    </Card>
  );
};

export default ShopUsers;
