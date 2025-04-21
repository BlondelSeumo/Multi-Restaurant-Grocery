import bannerService from 'services/banner';
import BannerForm from './components/form';

const BannerAdd = () => {
  const handleSubmit = (body) => bannerService.create(body);
  return <BannerForm handleSubmit={handleSubmit} />;
};

export default BannerAdd;
