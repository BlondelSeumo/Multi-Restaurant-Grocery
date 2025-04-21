import axios from 'axios';
import getMapApiKey from './getMapApiKey';

export default async function getAddress(address, key = getMapApiKey()) {
  let params = {
    address,
    key,
  };
  return axios
    .get(`https://maps.googleapis.com/maps/api/geocode/json`, { params })
    .then(({ data }) => data.results[0])
    .catch((error) => {
      return 'not found';
    });
}
