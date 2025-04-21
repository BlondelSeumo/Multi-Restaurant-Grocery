import { Card, Steps } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const StatusTrack = ({ status }) => {
  const { t } = useTranslation();
  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );
  const statusIndex = activeStatusList?.findIndex(
    (item) => item?.name === status,
  );
  return (
    <Card>
      <Steps current={statusIndex}>
        {activeStatusList?.slice(0, -1).map((item) => (
          <Steps.Step key={item.id} title={t(item.name)} />
        ))}
      </Steps>
    </Card>
  );
};

export default StatusTrack;
