import { Button, Card, Col, Row, Space } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import Details from './components/details';
import { useTranslation } from 'react-i18next';
import orderService from 'services/order';
import sellerOrderService from 'services/seller/order';
import { disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import Shop from './components/shop';
import Products from './components/products';
import Customer from './components/customer';
import { useQueryParams } from 'helpers/useQueryParams';
import { useReactToPrint } from 'react-to-print';
import { PrinterOutlined } from '@ant-design/icons';
import 'assets/scss/components/print.scss';

const Invoice = ({ id, role = 'admin' }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const queryParams = useQueryParams();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const containerRef = useRef();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchOrderDetails = () => {
    setLoading(true);
    (role === 'admin' ? orderService : sellerOrderService)
      .getById(id)
      .then((res) => {
        setData(res?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePrint = useReactToPrint({
    content: () => containerRef.current,
    onAfterPrint: () => {
      if (queryParams.get('print') === 'true') {
        queryParams.set('print', false);
      }
    },
  });

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line
  }, [id]);

  useDidUpdate(() => {
    if (activeMenu.refetch && id) {
      fetchOrderDetails();
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch, id]);

  useDidUpdate(() => {
    if (!loading && queryParams.get('print') === 'true') {
      setTimeout(() => {
        handlePrint();
      }, 1000);
    }
  }, [id, queryParams, loading]);

  return (
    <div ref={containerRef}>
      <Card
        title={t('invoice')}
        extra={
          <Space className='buttons'>
            <Button
              disabled={loading}
              onClick={handlePrint}
              type='primary'
              icon={<PrinterOutlined />}
            >
              {t('print')}
            </Button>
          </Space>
        }
      >
        <Row gutter={12}>
          <Col span={12}>
            <Details data={data} />
          </Col>
          <Col span={12}>
            <Shop data={data} />
            <Customer data={data} />
          </Col>
          <Col span={24}>
            <Products data={data} loading={loading} />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Invoice;
