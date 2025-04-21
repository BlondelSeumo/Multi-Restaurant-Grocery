import { store } from 'redux/store';

export const getHourFormat = () =>
  store.getState()?.globalSettings?.settings?.hour_format || 'HH:mm';
