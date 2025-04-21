import request from '../request';

const SellerReportService = {
  getStatisticsSalesHistory: (params) =>
    request.get('dashboard/seller/sales-history', { params }),
  getStatisticsSalesCards: (params) =>
    request.get('dashboard/seller/sales-cards', { params }),
  getStatisticsSalesMainCards: (params) =>
    request.get('dashboard/seller/sales-main-cards', { params }),
  getStatisticsSalesChart: (params) =>
    request.get('dashboard/seller/sales-chart', { params }),
  getStatisticsSalesStatistic: (params) =>
    request.get('dashboard/seller/sales-statistic', { params }),
  getStatisticsOrderReport: (params) =>
    request.get('dashboard/seller/order/report', { params }),
  getStatisticsOrdersReportChart: (params) =>
    request.get('dashboard/seller/orders/report/chart', { params }),
  getStatisticsOrdersReportTransactions: (params) =>
    request.get('dashboard/seller/orders/report/transactions', { params }),
  getStatisticsOrdersReportPaginate: (params) =>
    request.get('dashboard/seller/orders/report/paginate', { params }),
  getReportWaiter: (params) =>
    request.get('dashboard/seller/waiter/orders/report', { params }),
};

export default SellerReportService;
