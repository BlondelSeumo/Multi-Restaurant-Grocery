import { isArray } from 'lodash';

export const formatUsers = (data) => {
  if (!data) return;
  if (isArray(data)) {
    return data.map((item) => ({
      label: `${item?.firstname || ''} ${item?.lastname || ''}`,
      value: item?.id,
      id: item?.id,
    }));
  } else {
    return {
      label: `${data?.firstname || ''} ${data?.lastname || ''}`,
      value: data?.id,
      key: data?.id,
    };
  }
};
