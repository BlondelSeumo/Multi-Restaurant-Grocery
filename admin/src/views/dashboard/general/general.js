import Card from 'components/card';
import cls from './general.module.scss';
import TopBar from '../top-bar';
import MainCards from '../main-cards';
import OrderStatisticsOverview from '../order-statistics-overview';
import OrderStatusStatistics from '../order-status-statistics';
import TotalSalesOverview from '../total-sales-overview';
import ToDo from '../to-do';
import TopSellingProducts from '../top-selling-products';
import TopCustomers from '../top-customers';

const General = ({ role }) => (
  <div className={cls.container}>
    <TopBar />
    <Card>
      <MainCards />
    </Card>
    {role !== 'deliveryman' && (
      <Card>
        <div className={cls.orderStatisticsOverviewContainer}>
          <div className={cls.item}>
            <OrderStatisticsOverview />
          </div>
          <div className={cls.item}>
            <OrderStatusStatistics />
          </div>
        </div>
      </Card>
    )}
    {role !== 'deliveryman' && (
      <Card>
        <div className={cls.orderStatisticsOverviewContainer}>
          <div className={cls.item}>
            <TotalSalesOverview />
          </div>
          <div className={cls.item}>
            <ToDo />
          </div>
        </div>
      </Card>
    )}
    {role !== 'deliveryman' && (
      <Card>
        <div className={cls.topSellingProductsContainer}>
          <div className={cls.item}>
            <TopSellingProducts />
          </div>
          <div className={cls.item}>
            <TopCustomers />
          </div>
        </div>
      </Card>
    )}
  </div>
);

export default General;
