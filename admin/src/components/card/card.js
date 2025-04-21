import cls from './card.module.scss';

const Card = ({ title, children }) => {
  return (
    <div className={cls.container}>
      {title && <h3 className={cls.title}>{title}</h3>}
      <div className={cls.children}>{children}</div>
    </div>
  );
};

export default Card;
