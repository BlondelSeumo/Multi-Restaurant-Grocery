import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  fetchSellerSalesCards,
  fetchSellerSalesChart,
  fetchSellerSalesHistory,
  fetchSellerSalesMainCards,
  fetchSellerSalesStatistic,
} from 'redux/slices/report/sales';
import { useEffect } from 'react';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import { disableRefetch } from 'redux/slices/menu';
import SalesHistory from './components/sales-history';
import SalesCards from './components/sales-cards';
import SalesMainCards from './components/sales-main-cards';
import SalesChart from './components/sales-chart';
import SalesStatistics from './components/sales-statistics';

const SalesReport = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    salesHistory,
    salesCards,
    salesMainCards,
    salesChart,
    salesStatistics,
  } = useSelector((state) => state.sales, shallowEqual);

  const handlePageChange = (page) => {
    dispatch(fetchSellerSalesHistory({ page }));
    dispatch(disableRefetch(activeMenu));
  };

  const fetchSalesReport = () => {
    dispatch(fetchSellerSalesHistory({}));
    dispatch(fetchSellerSalesCards());
    dispatch(fetchSellerSalesMainCards(0));
    dispatch(fetchSellerSalesChart());
    dispatch(fetchSellerSalesStatistic());
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchSalesReport();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchSalesReport();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    dispatch(fetchSellerSalesHistory(salesHistory.params));
  }, [salesHistory.params]);

  useDidUpdate(() => {
    dispatch(fetchSellerSalesMainCards(salesMainCards.params));
  }, [salesMainCards.params]);

  useDidUpdate(() => {
    dispatch(fetchSellerSalesChart(salesChart.params));
  }, [salesChart.params]);

  useDidUpdate(() => {
    dispatch(fetchSellerSalesStatistic(salesStatistics.params));
  }, [salesStatistics.params]);

  return (
    <>
      <SalesMainCards
        data={salesMainCards.data}
        title={t('sales.main.cards')}
        params={salesMainCards.params}
        loading={salesMainCards.loading}
      />
      <SalesCards
        data={salesCards.data}
        title={t('sales.cards')}
        loading={salesCards.loading}
      />
      <SalesChart
        data={salesChart.data}
        title={t('sales.chart')}
        params={salesChart.params}
        loading={salesChart.loading}
      />
      <SalesStatistics
        data={salesStatistics.data}
        title={t('sales.statistics')}
        params={salesStatistics.params}
        loading={salesStatistics.loading}
      />
      <SalesHistory
        data={salesHistory.data}
        meta={salesHistory.meta}
        params={salesHistory.params}
        title={t('sales.history')}
        loading={salesHistory.loading}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default SalesReport;
