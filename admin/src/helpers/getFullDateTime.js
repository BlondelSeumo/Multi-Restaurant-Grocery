import moment from 'moment';
import { getHourFormat } from './getHourFormat';

export default function getFullDateTime(date, withTime = true, utc = false) {
  // const is12TimeFormat =
  //   !!store.getState()?.globalSettings?.using_12_hour_format;

  const timeFormat = getHourFormat();
  let format = 'DD-MM-YYYY';
  if (withTime) {
    format += ` ${timeFormat}`;
  }
  if (date) {
    if (utc) {
      return moment.utc(date).format(format);
    }
    return moment(date).format(format);
  }
  return 'N/A';
}
