import { Radio } from 'antd';
import { useQueryParams } from 'helpers/useQueryParams';
import { useTranslation } from 'react-i18next';

const StockTypeSwitcher = ({ options, onChange }) => {
  const queryParams = useQueryParams();
  const { t } = useTranslation();
  const value = queryParams.get('type') || options[0]?.value;
  return (
    <Radio.Group buttonStyle='solid' value={value}>
      {options.map((item) => (
        <Radio.Button
          key={item?.value}
          value={item?.value}
          onChange={() => onChange(item?.value)}
        >
          {t(item?.title)}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
};

export default StockTypeSwitcher;
