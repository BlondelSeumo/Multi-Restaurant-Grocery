import { defaultCenter } from 'configs/app-global';

export default function getDefaultLocation(settings) {
  if (!settings?.location || !settings?.length) {
    return defaultCenter;
  }
  const location = settings.location.split(', ');
  return {
    lat: parseFloat(location[0]),
    lng: parseFloat(location[1]),
  };
}
