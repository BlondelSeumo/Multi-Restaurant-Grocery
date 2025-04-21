import bannerService from 'services/banner';
import { useParams } from 'react-router-dom';
import BannerForm from './components/form';

const BannerEdit = () => {
  const { id } = useParams();
  const handleSubmit = (body) => bannerService.update(id, body);
  return <BannerForm handleSubmit={handleSubmit} />;
};

export default BannerEdit;
