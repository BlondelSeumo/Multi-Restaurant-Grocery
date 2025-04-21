import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { BsList } from 'react-icons/bs';
import { RiDashboardLine } from 'react-icons/ri';
import { setMenu } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import cls from './order-type-switcher.module.scss';

const orderViewTypes = [
  {
    value: 'orders',
    title: 'list',
    icon: <BsList size={12} />,
    routes: {
      admin: 'orders',
      seller: 'seller/orders',
    },
  },
  {
    value: 'orders-board',
    title: 'board',
    icon: <RiDashboardLine size={12} />,
    routes: {
      admin: 'orders-board',
      seller: 'seller/orders-board',
    },
  },
];

const OrderTypeSwitcher = ({ listType, role = 'admin' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { type } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const handleChange = (item) => {
    dispatch(
      setMenu({
        ...activeMenu,
        url: item.routes[role],
        id: 'orders',
        refetch: true,
      }),
    );
    navigate(`/${item.routes[role]}${type ? `/${type}` : ''}`);
  };

  return (
    <div className={cls.container}>
      {orderViewTypes.map((item) => (
        <button
          type='button'
          onClick={() => handleChange(item)}
          key={item.value}
          className={`${cls.item} ${listType === item.value && cls.active}`}
        >
          {item.icon}
          <span className={cls.title}>{t(item.title)}</span>
        </button>
      ))}
    </div>
  );
};

export default OrderTypeSwitcher;
