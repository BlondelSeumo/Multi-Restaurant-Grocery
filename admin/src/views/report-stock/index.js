import { Card, Col, Row, Space, Table, Button, Select, Divider } from 'antd';
import React from 'react';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { useEffect } from 'react';
import ReportService from 'services/reports';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import FilterColumns from 'components/filter-column';
import { fetchStockProduct } from 'redux/slices/report/stock';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';

const ReportStock = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const options = [
    { value: null, label: t('all.products') },
    { value: 'in_stock', label: t('in stock') },
    { value: 'low_stock', label: t('low.stock') },
    { value: 'out_of_stock', label: t('out.of.stock') },
  ];
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const { loading, productList: reportProducts } = useSelector(
    (state) => state.stockReport,
    shallowEqual,
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState(activeMenu?.data?.value || null);
  const goToProductReport = (row) => {
    dispatch(
      addMenu({
        url: `report/products`,
        id: 'report.products',
        name: t('report.products'),
      }),
    );
    navigate(`/report/products?product_id=${row.id}`);
  };
  const initialColumns = [
    {
      title: t('product.title'),
      dataIndex: 'product_translation_title',
      key: 'product_translation_title',
      render: (_, data) => {
        return (
          <span onClick={() => goToProductReport(data)}>
            {data?.translation?.title}
          </span>
        );
      },
      is_show: true,
      sorter: (a, b) =>
        a?.translation?.title.localeCompare(b?.translation?.title),
    },
    {
      title: t('bar.code'),
      dataIndex: 'product_bar_code',
      key: 'product_bar_code',
      is_show: true,
      render: (_, data) => {
        return <>{data?.bar_code || '-'}</>;
      },
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div className={tableRowClasses.status}>
          <span className={tableRowClasses[status || 'pending']}>
            {t(status)}
          </span>
        </div>
      ),
    },
    {
      title: t('stock'),
      key: 'stock',
      dataIndex: 'quantity',
      render: (_, data) => data?.stocks_sum_quantity,
      is_show: true,
      sorter: (a, b) => a?.stocks_sum_quantity - b?.stocks_sum_quantity,
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  const params = {
    page: activeMenu.page,
    perPage: activeMenu.perPage,
    actual: status,
  };

  const fetchProduct = (params) => {
    dispatch(fetchStockProduct(params));
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  useDidUpdate(() => {
    fetchProduct(params);
  }, [status]);

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchProduct(params);
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  const onSelectChange = (newSelectedRowKeys) =>
    setSelectedRowKeys(newSelectedRowKeys);

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    fetchProduct({ page, perPage, actual: status });
  };

  const excelExport = () => {
    setDownloading(true);
    ReportService.getStocks({ export: 'excel', actual: status })
      .then((res) => {
        const body = res.data.link;
        if (body) {
          window.location.href = body;
        }
      })
      .finally(() => setDownloading(false));
  };

  const handleSelector = (e) => setStatus(e);

  return (
    <>
      <Row gutter={24}>
        <Col span={24}>
          <Card title={t('stock')}>
            <Space className='d-flex justify-content-end'>
              <Select
                style={{ width: '200px' }}
                onChange={handleSelector}
                options={options}
                defaultValue={activeMenu?.data || null}
              />
              <Button
                icon={<CloudDownloadOutlined />}
                loading={downloading}
                onClick={excelExport}
              >
                {t('download')}
              </Button>
              <FilterColumns columns={columns} setColumns={setColumns} />
            </Space>
            <Divider color='var(--divider)' />
            <Table
              scroll={{ x: true }}
              rowSelection={rowSelection}
              columns={columns?.filter((item) => item.is_show)}
              dataSource={reportProducts.data || []}
              rowKey={(row) => row.id}
              loading={loading}
              pagination={{
                pageSize: reportProducts?.per_page,
                page: reportProducts?.current_page || 1,
                total: reportProducts?.total,
                defaultCurrent: 1,
              }}
              onChange={onChangePagination}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ReportStock;
