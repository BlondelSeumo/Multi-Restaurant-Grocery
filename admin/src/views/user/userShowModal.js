import { useEffect, useState } from 'react';
import { Button, Col, Descriptions, Modal, Row } from 'antd';
import userService from 'services/user';
import { useTranslation } from 'react-i18next';
import Loading from 'components/loading';
import numberToPrice from 'helpers/numberToPrice';
import useDemo from 'helpers/useDemo';
import hideEmail from 'components/hideEmail';
import getFullDateTime from 'helpers/getFullDateTime';
import ColumnImage from 'components/column-image';
import hideNumber from 'components/hideNumber';

export default function UserShowModal({ uuid, handleCancel }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { isDemo } = useDemo();

  function fetchUser(uuid) {
    setLoading(true);
    userService
      .getById(uuid)
      .then((res) => setData(res?.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchUser(uuid);
  }, [uuid]);

  return (
    <Modal
      visible={!!uuid}
      title={t('user.info')}
      onCancel={handleCancel}
      footer={[
        <Button key='cancel' type='default' onClick={handleCancel}>
          {t('close')}
        </Button>,
      ]}
      className={data.shop ? 'large-modal' : ''}
    >
      {!loading ? (
        <Row gutter={24}>
          <Col span={data?.shop ? 12 : 24}>
            <Descriptions bordered>
              <Descriptions.Item span={3} label={t('avatar')}>
                <ColumnImage image={data?.img} id={data?.id} />
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('user.id')}>
                {data?.id}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('name')}>
                {data?.firstname || ''} {data?.lastname || ''}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('gender')}>
                {data?.gender}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('birthday')}>
                {data?.birthday
                  ? getFullDateTime(data?.birthday, false)
                  : t('N/A')}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('email')}>
                {isDemo ? hideEmail(data?.email) : data?.email}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('phone')}>
                {isDemo ? hideNumber(data?.phone) : data?.phone}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('role')}>
                {data?.role}
              </Descriptions.Item>
              <Descriptions.Item span={3} label={t('wallet')}>
                {numberToPrice(data?.wallet?.price)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          {!!data?.shop && (
            <Col span={12}>
              <Descriptions bordered>
                <Descriptions.Item span={3} label={t('shop.id')}>
                  {data?.shop?.id}
                </Descriptions.Item>
                <Descriptions.Item span={3} label={t('shop.name')}>
                  {data?.shop?.translation?.title}
                </Descriptions.Item>
                <Descriptions.Item span={3} label={t('shop.logo')}>
                  <ColumnImage
                    image={data?.shop?.logo_img}
                    id={data?.shop?.id}
                  />
                </Descriptions.Item>
                <Descriptions.Item span={3} label={t('shop.phone')}>
                  {data?.shop?.phone}
                </Descriptions.Item>
                <Descriptions.Item span={3} label={t('delivery.range')}>
                  {data?.shop?.delivery_range}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          )}
        </Row>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
