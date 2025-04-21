import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Descriptions, Row, Spin, Switch } from 'antd';
import shopService from 'services/restaurant';
import { EditOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { fetchMyBranch } from 'redux/slices/myShop';
import numberToPrice from 'helpers/numberToPrice';
import useDemo from 'helpers/useDemo';
import ColumnImage from 'components/column-image';

export default function MyBranch() {
  const { t } = useTranslation();
  const [statusLoading, setStatusLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { myShop: data, loading } = useSelector(
    (state) => state.myShop,
    shallowEqual,
  );
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { isDemo, demoShop } = useDemo();

  const goToEdit = () => {
    dispatch(
      addMenu({
        id: 'edit-branch',
        url: `my-branch/${data.uuid}`,
        name: t('edit.branch'),
      }),
    );
    navigate(`/my-branch/${data.uuid}`);
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchMyBranch({}));
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  function workingStatusChange() {
    const params = {
      shop_id: data.uuid,
    };
    setStatusLoading(true);
    shopService
      .setWorkingStatus(params)
      .then(() => dispatch(setRefetch(activeMenu)))
      .finally(() => setStatusLoading(false));
  }

  return (
    <Card
      title={t('my.shop')}
      extra={
        <Button type='primary' icon={<EditOutlined />} onClick={goToEdit}>
          {t('shop.edit')}
        </Button>
      }
    >
      {!loading ? (
        <Row gutter={12}>
          <Col span={20}>
            <div className='position-relative'>
              <Descriptions bordered>
                <Descriptions.Item label={t('shop.name')} span={2}>
                  {data?.translation?.title || t('N/A')}
                </Descriptions.Item>
                <Descriptions.Item label={t('shop.address')} span={2}>
                  {data?.translation?.address || t('N/A')}
                </Descriptions.Item>
                <Descriptions.Item label={t('phone')} span={2}>
                  {data?.phone || t('N/A')}
                </Descriptions.Item>
                <Descriptions.Item label={t('tax')} span={2}>
                  {data?.tax ?? 0} %
                </Descriptions.Item>
                <Descriptions.Item label={t('background.image')} span={2}>
                  <ColumnImage image={data?.background_img} id={data?.id} />
                </Descriptions.Item>
                <Descriptions.Item label={t('logo.image')} span={2}>
                  <ColumnImage image={data?.logo_img} id={data?.id} />
                </Descriptions.Item>
                <Descriptions.Item label={t('open')} span={2}>
                  <Switch
                    name='open'
                    defaultChecked={data.open}
                    onChange={workingStatusChange}
                    disabled={isDemo && data?.id === demoShop}
                  />
                </Descriptions.Item>

                <Descriptions.Item label={t('wallet')} span={2}>
                  {numberToPrice(
                    data.seller?.wallet?.price,
                    defaultCurrency?.symbol,
                    defaultCurrency?.position,
                  )}
                </Descriptions.Item>
              </Descriptions>
              {data?.subscription && (
                <Descriptions
                  title={t('subscription')}
                  bordered
                  className='mt-5'
                >
                  <Descriptions.Item label={t('type')} span={3}>
                    {data?.subscription?.type}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('price')} span={3}>
                    {numberToPrice(
                      data?.subscription?.price,
                      defaultCurrency?.symbol,
                      defaultCurrency?.position,
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('expired.at')} span={3}>
                    {data?.subscription?.expired_at}
                  </Descriptions.Item>
                </Descriptions>
              )}
              {statusLoading && (
                <div className='loader'>
                  <Spin />
                </div>
              )}
            </div>
          </Col>
        </Row>
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
}
