import cls from './outlined-button.module.scss';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const OutlinedButton = ({
  color = 'primary',
  htmlType = 'button',
  loading = false,
  children,
  ...props
}) => {
  return (
    <button
      type={htmlType}
      {...props}
      className={`${cls.container} ${cls[color]}`}
    >
      {loading && (
        <Spin
          indicator={<LoadingOutlined spin />}
          size='small'
          className={cls.loading}
        />
      )}
      {children}
    </button>
  );
};

export default OutlinedButton;
