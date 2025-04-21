import { store } from 'redux/store';
import { MAP_API_KEY } from 'configs/app-global';

export const getMapKey = () => {
  const googleMapKey = store.getState().globalSettings?.google_map_key;

  return googleMapKey || MAP_API_KEY;
};
