import React from 'react';
import useGoogle from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
import getAddress from 'helpers/getAddress';
import { shallowEqual, useSelector } from 'react-redux';
import { Form, Select } from 'antd';
import getMapApiKey from 'helpers/getMapApiKey';
import { useTranslation } from 'react-i18next';

const AddressForm = ({ value, setValue, setLocation }) => {
  const { t } = useTranslation();
  const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } =
    useGoogle({
      apiKey: getMapApiKey(),
      libraries: ['places', 'geocode'],
    });
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual,
  );

  return (
    <div>
      {languages.map((item, idx) => (
        <Form.Item
          key={'address' + idx}
          label={t('address')}
          name={`address[${item.locale}]`}
          rules={[
            {
              required: item.locale === defaultLang,
              message: t('required'),
            },
          ]}
          hidden={item.locale !== defaultLang}
        >
          <Select
            allowClear
            searchValue={value}
            showSearch
            autoClearSearchValue
            loading={isPlacePredictionsLoading}
            options={placePredictions?.map((prediction) => ({
              label: prediction?.description,
              value: prediction?.description,
              key: prediction?.description,
            }))}
            onSearch={(searchValue) => {
              setValue(searchValue);
              if (searchValue?.length > 0) {
                getPlacePredictions({ input: searchValue });
              }
            }}
            onSelect={async (value) => {
              const address = await getAddress(value);
              setLocation({
                lat: address?.geometry?.location?.lat,
                lng: address?.geometry?.location?.lng,
              });
            }}
            getPopupContainer={(trigger) => trigger?.parentNode}
          />
        </Form.Item>
      ))}
    </div>
  );
};

export default AddressForm;
