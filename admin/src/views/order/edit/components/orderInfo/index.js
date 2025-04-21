import { Card } from 'antd';
import DeliveryInfo from './components/deliveryInfo';
import PaymentInfo from './components/paymentInfo';

const OrderInfo = ({ orderLoading, form }) => {
  if (orderLoading) {
    return <Card loading={orderLoading} />;
  }
  return (
    <>
      <DeliveryInfo form={form} />
      <PaymentInfo form={form} />
    </>
  );
};

export default OrderInfo;
