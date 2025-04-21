import { Card, Descriptions } from 'antd';
import { useQueryParams } from 'helpers/useQueryParams';
import { useEffect, useMemo, useState } from 'react';
import userService from 'services/seller/user';
import { useTranslation } from 'react-i18next';
import ColumnImage from 'components/column-image';
import getFullDateTime from 'helpers/getFullDateTime';

const ShopUserDetails = () => {
  const { t } = useTranslation();
  const queryParams = useQueryParams();
  const uuid = queryParams.get('uuid');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const fetchUserByUuid = () => {
    setLoading(true);
    userService
      .getById(uuid)
      .then((res) => {
        setData(res?.data);
      })
      .catch(() => {
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (uuid) {
      fetchUserByUuid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const userShops = useMemo(
    () => data?.invitations?.map((item) => item?.shop),
    [data],
  );

  return (
    <Card bordered={false} loading={loading}>
      <Descriptions bordered>
        <Descriptions.Item label={t('avatar')} span={3}>
          <ColumnImage image={data?.img} id={uuid} />
        </Descriptions.Item>
        <Descriptions.Item label={t('firstname')} span={3}>
          {data?.firstname || t('N/A')}
        </Descriptions.Item>
        <Descriptions.Item label={t('lastname')} span={3}>
          {data?.lastname || t('N/A')}
        </Descriptions.Item>
        <Descriptions.Item label={t('birthday')} span={3}>
          {data?.birthday ? getFullDateTime(data?.birthday, false) : t('N/A')}
        </Descriptions.Item>
        <Descriptions.Item label={t('phone')} span={3}>
          {data?.phone || t('N/A')}
        </Descriptions.Item>
        <Descriptions.Item label={t('email')} span={3}>
          {data?.email || t('N/A')}
        </Descriptions.Item>
        {!!userShops?.length && (
          <Descriptions.Item
            label={t(userShops?.length > 1 ? 'shop' : 'shops')}
            span={3}
          >
            {userShops?.map((item) => item?.translation?.title).join(', ')}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default ShopUserDetails;
