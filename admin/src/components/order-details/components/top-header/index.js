import { Button, Col, Row, Space, Typography } from 'antd';
import { FiShoppingCart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { clearOrder } from 'redux/slices/order';
import { addMenu } from 'redux/slices/menu';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const TopHeader = ({ data, handleOpenStatusModal, role }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToEdit = () => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        url: `order/${data?.id}`,
        id: 'order_edit',
        name: t('edit.order'),
      }),
    );
    navigate(`/order/${data?.id}`);
  };

  return (
    <Row justify='space-between'>
      <Col>
        <Space>
          <FiShoppingCart size={32} />
          <Typography.Text
            strong
            style={{ fontSize: '24px' }}
          >{`${t('order')} #${data?.id} ${t('from')} ${data?.user?.firstname || ''} ${data?.user?.lastname || ''}`}</Typography.Text>
        </Space>
      </Col>
      {data?.status !== 'delivered' &&
        data?.status !== 'canceled' &&
        role !== 'deliveryman' && (
          <Col>
            <Space>
              <Button type='primary' onClick={handleOpenStatusModal}>
                {t('change.status')}
              </Button>
              {role === 'admin' && (
                <Button type='primary' onClick={goToEdit}>
                  {t('edit')}
                </Button>
              )}
            </Space>
          </Col>
        )}
    </Row>
  );
};

export default TopHeader;
