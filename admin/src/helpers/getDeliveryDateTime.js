import moment from 'moment';
import getFullDateTime from './getFullDateTime';
import { getHourFormat } from './getHourFormat';

export const getDeliveryDateTime = (date, time) => {
  if (typeof time === 'string' && time?.includes('-')) {
    const formatedDate = getFullDateTime(date, false);
    const [startTime, endTime] = time?.split('-');
    return `${formatedDate} ${moment(`${date} ${startTime}`).format(getHourFormat())} - ${moment(`${date} ${endTime}`).format(getHourFormat())}`;
  }
  return getFullDateTime(`${date} ${time}`);
};
