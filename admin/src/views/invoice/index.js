import Invoice from 'components/invoice';
import { useParams } from 'react-router-dom';

const AdminInvoice = () => {
  const { id } = useParams();
  return <Invoice role='admin' id={id} />;
};

export default AdminInvoice;
