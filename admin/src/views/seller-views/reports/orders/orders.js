import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  fetchReportOrder,
  fetchReportOrdersChart,
  fetchReportOrdersPaginate,
  fetchReportOrderTransactions,
} from 'redux/slices/report/orders';
import { disableRefetch } from 'redux/slices/menu';
import { useEffect } from 'react';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import ReportOrdersPaginate from './components/orders-paginate';
import ReportOrder from './components/order';
import ReportOrdersChart from './components/orders-chart';
import ReportOrdersTransactions from './components/orders-transactions';

const ReportOrders = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    reportOrdersPaginate,
    reportOrder,
    reportOrdersChart,
    reportOrderTransactions,
  } = useSelector((state) => state.reportOrders, shallowEqual);

  const handlePageChange = (type, page) => {
    switch (type) {
      case 'paginate':
        dispatch(fetchReportOrdersPaginate({ page }));
        break;
      case 'transactions':
        dispatch(fetchReportOrderTransactions({ page }));
        break;
      default:
        break;
    }
    dispatch(disableRefetch(activeMenu));
  };

  const fetchReportOrders = () => {
    dispatch(fetchReportOrdersPaginate({}));
    dispatch(fetchReportOrder({}));
    dispatch(fetchReportOrdersChart({}));
    dispatch(fetchReportOrderTransactions({}));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchReportOrders();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchReportOrders();
    }
    return () => {};
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    dispatch(fetchReportOrder(reportOrder.params));
    return () => {};
  }, [reportOrder.params]);

  useDidUpdate(() => {
    dispatch(fetchReportOrdersChart(reportOrdersChart.params));
    return () => {};
  }, [reportOrdersChart.params]);

  useDidUpdate(() => {
    dispatch(fetchReportOrdersPaginate(reportOrdersPaginate.params));
    return () => {};
  }, [reportOrdersPaginate.params]);

  useDidUpdate(() => {
    dispatch(fetchReportOrderTransactions(reportOrderTransactions.params));
    return () => {};
  }, [reportOrderTransactions.params]);

  return (
    <>
      <ReportOrder
        title={t('report.order')}
        data={reportOrder.data}
        loading={reportOrder.loading}
        params={reportOrder.params}
      />
      <ReportOrdersChart
        data={reportOrdersChart.data}
        title={t('report.orders.chart.title')}
        loading={reportOrdersChart.loading}
        params={reportOrdersChart.params}
      />
      <ReportOrdersPaginate
        title={t('report.orders.paginate.title')}
        data={reportOrdersPaginate.data}
        meta={reportOrdersPaginate.meta}
        loading={reportOrdersPaginate.loading}
        params={reportOrdersPaginate.params}
        onPageChange={(page) => handlePageChange('paginate', page)}
      />
      <ReportOrdersTransactions
        data={reportOrderTransactions.data}
        meta={reportOrderTransactions.meta}
        title={t('order.transactions.title')}
        loading={reportOrderTransactions.loading}
        params={reportOrderTransactions.params}
        onPageChange={(page) => handlePageChange('transactions', page)}
      />
    </>
  );
};

export default ReportOrders;
