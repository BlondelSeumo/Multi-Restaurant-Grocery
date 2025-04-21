import { useState } from 'react';
import { Dropdown, Menu, Space, Switch, Tooltip, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import OptionsIcon from 'assets/icons/options';
import OutlinedButton from 'components/outlined-button';

const { Text } = Typography;

const FilterColumns = ({ columns = [], setColumns }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleVisibleChange = (flag) => {
    setOpen(flag);
  };
  const onChange = (checked) => {
    const newArray = columns?.map((item) => {
      if (item.dataIndex === checked.dataIndex) {
        item.is_show = !item?.is_show;
      }
      return item;
    });
    setColumns(newArray);
  };

  const menu = (
    <Menu>
      {columns?.map((item, key) => (
        <Menu.Item key={item + key}>
          <Space className='d-flex justify-content-between'>
            <Text>{item.title}</Text>
            <Switch
              defaultChecked
              onClick={() => onChange(item)}
              disabled={key === 1}
            />
          </Space>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      onVisibleChange={handleVisibleChange}
      visible={open}
    >
      <Tooltip title={t('change.columns')}>
        <OutlinedButton>
          <OptionsIcon />
        </OutlinedButton>
      </Tooltip>
    </Dropdown>
  );
};

export default FilterColumns;
