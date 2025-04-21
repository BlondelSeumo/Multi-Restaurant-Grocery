import bannerService from 'services/banner';
import BannerForm from './components/form';

const BannerClone = () => {
  const handleSubmit = (body) => bannerService.create(body);
  return <BannerForm handleSubmit={handleSubmit} />;
};

export default BannerClone;
