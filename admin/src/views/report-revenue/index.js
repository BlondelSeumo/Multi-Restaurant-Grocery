import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  Table,
  Button,
  DatePicker,
  Spin,
} from 'antd';
import React, { useContext, useEffect } from 'react';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { ReportContext } from '../../context/report';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  fetchReportRevenue,
  fetchReportRevenueChart,
} from '../../redux/slices/report/revenue';
import useDidUpdate from '../../helpers/useDidUpdate';
import QueryString from 'qs';
import { useLocation } from 'react-router-dom';
import { disableRefetch } from '../../redux/slices/menu';
import moment from 'moment';
import { useState } from 'react';
import ReportService from '../../services/reports';
import FilterColumns from '../../components/filter-column';
import numberToPrice from '../../helpers/numberToPrice';
import ReportChart from '../../components/report/chart';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReportRevenue = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const category_id = QueryString.parse(location.search, [])['?category_id'];
  const product_id = QueryString.parse(location.search, [])['?product_id'];
  const { date_from, date_to, by_time, chart, handleDateRange, handleChart } =
    useContext(ReportContext);
  const dispatch = useDispatch();
  const [downloadLoading, setDownloadLoading] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { loading, revenueList, chartData } = useSelector(
    (state) => state.revenueReport,
    shallowEqual,
  );
  const initialColumns = [
    {
      title: t('date'),
      dataIndex: 'time',
      key: 'time',
      is_show: true,
    },
    {
      title: t('item.sold'),
      dataIndex: 'count',
      key: 'count',
      is_show: true,
    },
    {
      title: t('orders'),
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      is_show: true,
    },
    {
      title: t('shipping'),
      key: 'delivery_fee',
      dataIndex: 'delivery_fee',
      render: (_, row) =>
        numberToPrice(
          row.delivery_fee,
          defaultCurrency?.symbol,
          defaultCurrency?.position,
        ),
      is_show: true,
    },
    {
      title: t('returns'),
      key: 'canceled_sum',
      dataIndex: 'canceled_sum',
      render: (_, row) =>
        numberToPrice(
          row.canceled_sum,
          defaultCurrency?.symbol,
          defaultCurrency?.position,
        ),
      is_show: true,
    },
    {
      title: t('net.sales'),
      key: 'total_price',
      dataIndex: 'total_price',
      render: (_, row) =>
        numberToPrice(
          row.total_price,
          defaultCurrency?.symbol,
          defaultCurrency?.position,
        ),
      is_show: true,
    },
    {
      title: t('tax'),
      key: 'tax',
      dataIndex: 'tax',
      render: (_, row) =>
        numberToPrice(
          row.tax,
          defaultCurrency?.symbol,
          defaultCurrency?.position,
        ),
      is_show: true,
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const fetchReport = () => {
    const params = {
      date_from,
      date_to,
      type: by_time,
      chart,
    };
    if (category_id) params.categories = [category_id];
    if (product_id) params.products = [product_id];
    if (performance.find((item) => item.value === chart)) {
      dispatch(fetchReportRevenueChart(params));
    }
  };
  const fetchRevenue = () => {
    const params = {
      date_from,
      date_to,
      type: by_time,
    };
    if (category_id) params.categories = [category_id];
    if (product_id) params.products = [product_id];
    dispatch(fetchReportRevenue(params));
  };

  const excelExport = () => {
    setDownloadLoading(true);
    ReportService.getRevenueReport({
      date_from,
      date_to,
      type: by_time,
      export: 'excel',
    })
      .then((res) => {
        const body = res.data.link;
        if (body) {
          window.location.href = body;
        }
      })
      .finally(() => setDownloadLoading(false));
  };

  const performance = useMemo(
    () => [
      {
        label: t('total.sales'),
        value: 'avg_quantity',
        qty: 'quantity',
        price: false,
      },
      {
        label: t('net.sales'),
        value: 'price',
        qty: 'price',
        price: true,
      },
      {
        label: t('average.order.price'),
        value: 'avg_price',
        qty: 'avg_price',
        price: true,
      },
      {
        label: t('orders'),
        value: 'count',
        qty: 'count',
        price: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (performance.every((item) => item.value !== chart)) {
      handleChart(performance[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchRevenue();
      fetchReport();
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchRevenue();
  }, [date_to, by_time, chart, category_id, product_id, date_from]);

  useDidUpdate(() => {
    fetchReport();
  }, [date_to, by_time, chart, date_from]);

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
      <Row gutter={24} className='report-products'>
        {performance?.map((item) => (
          <Col
            span={6}
            key={item.label}
            onClick={() => handleChart(item.value)}
          >
            <Card className={chart === item.value && 'active'}>
              <Row className='mb-5'>
                <Col>
                  <Text>{t(item.label)}</Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={18}>
                  <Title level={2}>
                    {!item.price
                      ? chartData[item.qty]
                      : numberToPrice(
                          chartData[item.qty],
                          defaultCurrency?.symbol,
                          defaultCurrency?.position,
                        )}
                  </Title>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
      <ReportChart reportData={chartData} chart_data='quantities_sum' />
      <Row gutter={24}>
        <Col span={24}>
          <Card>
            <Row gutter={24} className='align-items-center mb-2'>
              <Space className='w-100 mr-16 ml-16 justify-content-between'>
                <Title level={2} className='mb-0'>
                  {t('revenue')}
                </Title>
                <Space align='end'>
                  <Button
                    onClick={excelExport}
                    loading={downloadLoading}
                    icon={<CloudDownloadOutlined />}
                  >
                    {t('download')}
                  </Button>
                  <FilterColumns columns={columns} setColumns={setColumns} />
                </Space>
              </Space>
            </Row>
            <Table
              columns={columns?.filter((item) => item.is_show)}
              loading={loading}
              dataSource={revenueList?.paginate}
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default ReportRevenue;
