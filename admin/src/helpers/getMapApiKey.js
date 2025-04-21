import { store } from 'redux/store';
import { MAP_API_KEY } from 'configs/app-global';

const getMapApiKey = () => {
  const settings = store.getState()?.globalSettings?.settings;

  return settings?.google_map_key || MAP_API_KEY;
};

export default getMapApiKey;
