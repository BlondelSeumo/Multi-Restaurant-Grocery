import Invoice from 'components/invoice';
import { useParams } from 'react-router-dom';

const SellerInvoice = () => {
  const { id } = useParams();
  return <Invoice role='seller' id={id} />;
};

export default SellerInvoice;
