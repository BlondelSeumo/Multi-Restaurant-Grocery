import React, { useContext, useEffect } from 'react';
import {
  Card,
  Col,
  DatePicker,
  Divider,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from 'antd';
import moment from 'moment';
import { Link } from 'react-router-dom';
import numberToPrice from 'helpers/numberToPrice';
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import ChartWidget from 'components/chart-widget';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { ReportContext } from 'context/report';
import { fetchSellerReportWaiter } from 'redux/slices/report/waiter';
import { disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

function Index() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading, orders } = useSelector((state) => state.reportWaiter);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );

  const {
    date_from,
    date_to,
    by_time,
    handleDateRange,
    options,
    handleByTime,
    chart_type,
    setChartType,
  } = useContext(ReportContext);

  const performance = [
    {
      title: t('avg.rating'),
      qty: 'avg_rating',
      price: false,
    },
    {
      title: t('last.order.income'),
      qty: 'last_order_income',
      price: true,
    },
    {
      title: t('last.order.total.price'),
      qty: 'last_order_total_price',
      price: true,
    },
    {
      title: t('total.canceled.count'),
      qty: 'total_canceled_count',
      price: false,
    },
    {
      title: t('total.count'),
      qty: 'total_count',
      price: false,
    },
    {
      title: t('total.new.count'),
      qty: 'total_new_count',
      price: false,
    },
    {
      title: t('total.paid.count'),
      qty: 'total_paid_count',
      price: false,
    },
    {
      title: t('total.price'),
      qty: 'total_price',
      price: true,
    },
    {
      title: t('total.today.count'),
      qty: 'total_today_count',
      price: false,
    },
    {
      title: t('waiter.tips'),
      qty: 'waiter_tips',
      price: true,
    },
    {
      title: t('wallet.currency'),
      qty: 'wallet_currency',
      price: false,
    },
    {
      title: t('wallet.price'),
      qty: 'wallet_price',
      price: true,
    },
  ];

  const columns = [
    {
      title: t('table.id'),
      dataIndex: 'table_id',
      key: 'title',
      render: (id) => `#${id}`,
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) =>
        numberToPrice(
          price,
          defaultCurrency?.symbol,
          defaultCurrency?.position,
        ),
    },
    {
      title: t('waiter.tips'),
      dataIndex: 'waiter_tips',
      key: 'waiter_tips',
      render: (price) =>
        numberToPrice(
          price,
          defaultCurrency?.symbol,
          defaultCurrency?.position,
        ),
    },
  ];

  const fetchData = () => {
    const params = {
      date_from,
      date_to,
      type: by_time,
    };
    dispatch(fetchSellerReportWaiter(params));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchData();
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchData();
  }, [date_from, date_to, by_time]);

  return (
    <Spin size='large' spinning={loading}>
      <Row gutter={24} className='mb-4'>
        <Col span={12}>
          <Space size='large'>
            <RangePicker
              defaultValue={[moment(date_from), moment(date_to)]}
              onChange={handleDateRange}
            />
          </Space>
        </Col>
      </Row>
      <Divider orientation='left'>Performance</Divider>
      <Row gutter={24}>
        {performance?.map((item) => {
          return (
            <Col span={6}>
              <Link key={item.title} to='/report/revenue'>
                <Card>
                  <Row className='mb-5'>
                    <Col>
                      <Text>{item.title}</Text>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Title level={2}>
                        {item.price
                          ? numberToPrice(
                              orders[item.qty],
                              defaultCurrency?.symbol,
                              defaultCurrency?.position,
                            )
                          : orders[item.qty] ?? t('no.data')}
                      </Title>
                    </Col>
                  </Row>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
      <Row gutter={24} className='mb-2'>
        <Col span={20}>
          <Divider orientation='left'>{t('charts')}</Divider>
        </Col>
        <Col span={4}>
          <div className='d-flex'>
            <Select
              style={{ width: 100 }}
              onChange={handleByTime}
              options={options.map((item) => ({
                ...item,
                label: t(item.label),
              }))}
              defaultValue={by_time}
            />

            <Divider type='vertical' style={{ height: '100%' }} />
            <Space>
              <LineChartOutlined
                style={{
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: chart_type === 'line' ? 'green' : '',
                }}
                onClick={() => setChartType('line')}
              />
              <BarChartOutlined
                style={{
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: chart_type === 'bar' ? 'green' : '',
                }}
                onClick={() => setChartType('bar')}
              />
            </Space>
          </div>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <Card title={t('net.sales')}>
            <ChartWidget
              type={chart_type}
              series={[
                {
                  name: t('total.price'),
                  data: orders?.chart?.map((item) =>
                    numberToPrice(
                      item.total_price,
                      defaultCurrency?.symbol,
                      defaultCurrency?.position,
                    ),
                  ),
                },
                {
                  name: t('waiter.tips'),
                  data: orders?.chart?.map((item) =>
                    numberToPrice(
                      item.waiter_tips,
                      defaultCurrency?.symbol,
                      defaultCurrency?.position,
                    ),
                  ),
                },
              ]}
              xAxis={orders?.chart?.map((item) => item.time)}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <Card title={t('sales.by.table')}>
            <Table columns={columns} dataSource={orders?.chart_by_table} />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
}

export default Index;
