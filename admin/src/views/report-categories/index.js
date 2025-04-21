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
import React, { useContext, useEffect, useState } from 'react';
import SearchInput from 'components/search-input';
import { CloudDownloadOutlined } from '@ant-design/icons';
import ReportService from 'services/reports';
import { disableRefetch } from 'redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ReportChart from 'components/report/chart';
import moment from 'moment';
import { ReportContext } from 'context/report';
import FilterColumns from 'components/filter-column';
import { fetchReportProductChart } from 'redux/slices/report/categories';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import { useMemo } from 'react';
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const ReportProducts = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { date_from, date_to, by_time, chart, handleChart, handleDateRange } =
    useContext(ReportContext);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    loading,
    chartData: reportData,
    productList,
  } = useSelector((state) => state.categoryReport, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [search, setSearch] = useState();
  const [downloading, setDownloading] = useState(false);

  const initialColumns = [
    {
      title: t('category'),
      key: 'category',
      dataIndex: 'category',
      render: (_, data) => {
        const categoryList = data?.title?.split('-');
        return categoryList?.map((item, i) =>
          i === categoryList?.length - 1 ? <span>{item}</span> : item,
        );
      },
      is_show: true,
    },
    {
      title: t('item.sold'),
      dataIndex: 'quantity',
      key: 'quantity',
      is_show: true,
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      is_show: true,
      render: (_, data) => {
        return numberToPrice(
          data?.price,
          defaultCurrency?.symbol,
          defaultCurrency?.position,
        );
      },
    },
    {
      title: t('products'),
      key: 'products_count',
      dataIndex: 'products_count',
      render: (_, data) => {
        return <span>{data?.products_count}</span>;
      },
      is_show: true,
    },
    {
      title: t('orders'),
      key: 'count',
      dataIndex: 'count',
      is_show: true,
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const chart_type = useMemo(
    () => [
      { value: 'quantity', label: t('item.sold'), qty: 'total_quantity' },
      { value: 'price', label: t('net.sales'), qty: 'total_price' },
      { value: 'count', label: t('orders'), qty: 'total_count' },
      {
        value: 'total_products_count',
        label: t('order.products'),
        qty: 'total_products_count',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const fetchReport = () => {
    if (chart_type.find((item) => item.value === chart)) {
      const params = {
        date_from,
        date_to,
        type: by_time,
        chart,
        search: search?.trim() === '' ? undefined : search?.trim(),
      };
      dispatch(fetchReportProductChart(params));
    }
  };

  useEffect(() => {
    if (chart_type.every((item) => item.value !== chart)) {
      handleChart(chart_type[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchReport();
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchReport();
  }, [date_to, by_time, chart, search, date_from]);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const excelExport = () => {
    setDownloading(true);
    ReportService.getCategoriesChart({
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
      .finally(() => setDownloading(false));
  };

  return (
    <Spin size='large' spinning={loading}>
      <Row gutter={24} className='mb-3'>
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
        {chart_type?.map((item) => (
          <Col
            span={6}
            key={item.label}
            onClick={() => handleChart(item.value)}
          >
            <Card className={chart === item.value && 'active'}>
              <Row className='mb-5'>
                <Col>
                  <Text>{item.label}</Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Title level={2}>
                    {item.qty === 'total_price'
                      ? numberToPrice(
                          reportData[item.qty],
                          defaultCurrency?.symbol,
                          defaultCurrency?.position,
                        )
                      : reportData[item.qty]}
                  </Title>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
      <ReportChart reportData={reportData} chart_data='quantities_sum' />
      <Card>
        <Space className='align-items-center justify-content-between mb-4 w-100'>
          <Title level={2} className='mb-0'>
            {t('categories')}
          </Title>

          <Space>
            <SearchInput
              style={{ width: '100%' }}
              handleChange={(e) => setSearch(e)}
              defaultValue={activeMenu.data?.search}
              resetSearch={!activeMenu.data?.search}
            />
            <Button
              icon={<CloudDownloadOutlined />}
              loading={downloading}
              disabled={productList?.data?.length === 0}
              onClick={excelExport}
            >
              {t('download')}
            </Button>
            <FilterColumns columns={columns} setColumns={setColumns} />
          </Space>
        </Space>
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={Object.values(productList) || []}
          rowKey={(row) => row.id}
          loading={loading}
          pagination={{
            pageSize: productList?.per_page,
            page: productList?.current_page || 1,
            total: productList?.total,
            defaultCurrent: 1,
          }}
        />
      </Card>
    </Spin>
  );
};

export default ReportProducts;
