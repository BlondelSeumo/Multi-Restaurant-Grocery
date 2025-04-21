import { Image } from 'antd';
import cls from './card.module.scss';

const OrderCard = ({ data, loading = false }) => {
  if (loading) {
    return <div className={`${cls.loadingContainer} skeleton`} />;
  }
  return (
    <div className={cls.container}>
      <div className={cls.left}>
        <span className={cls.title}>{data.title}</span>
        <span
          className={cls.number}
          style={{
            color: data.color,
          }}
        >
          {data.number || 0}
        </span>
      </div>
      <div className={cls.right}>
        <Image src={data.img} preview={false} width={36} height={36} />
      </div>
    </div>
  );
};

export default OrderCard;
