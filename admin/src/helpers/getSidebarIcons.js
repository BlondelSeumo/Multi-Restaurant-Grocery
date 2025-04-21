import { LuLayoutDashboard } from 'react-icons/lu';
import { FaCashRegister } from 'react-icons/fa';
import {
  CheckCircleOutlined,
  CommentOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { TbBasketStar, TbMessagePlus } from 'react-icons/tb';
import { TbRulerMeasure } from 'react-icons/tb';
import { BsBoxSeam, BsFillDiagram3Fill } from 'react-icons/bs';
import { FaPuzzlePiece } from 'react-icons/fa6';
import { PiHandCoins } from 'react-icons/pi';
import { CiDiscount1 } from 'react-icons/ci';
import { BsHouse } from 'react-icons/bs';
import { BsHouses } from 'react-icons/bs';
import { IoImagesOutline } from 'react-icons/io5';
import { FaKitchenSet } from 'react-icons/fa6';
import { LuCalendarCog, LuCalendarDays } from 'react-icons/lu';
import { MdManageHistory, MdWorkOutline } from 'react-icons/md';
import { LiaAdSolid } from 'react-icons/lia';
import { MdOutlineNotificationsActive } from 'react-icons/md';
import { RiCoupon2Line } from 'react-icons/ri';
import { TbGiftFilled } from 'react-icons/tb';
import { TbUsersGroup } from 'react-icons/tb';
import { FaUsersGear } from 'react-icons/fa6';
import { RiEBike2Line } from 'react-icons/ri';
import { CiWallet } from 'react-icons/ci';
import { FaMoneyBillTransfer } from 'react-icons/fa6';
import { LiaMoneyCheckSolid } from 'react-icons/lia';
import { GiPayMoney } from 'react-icons/gi';
import { FaMoneyBillTrendUp } from 'react-icons/fa6';
import { BiMoneyWithdraw } from 'react-icons/bi';
import { IoMdSettings } from 'react-icons/io';
import { MdCurrencyExchange } from 'react-icons/md';
import { MdOutlinePayments } from 'react-icons/md';
import { MdEditNotifications } from 'react-icons/md';
import { GrServicePlay } from 'react-icons/gr';
import { TbDeviceMobileCog } from 'react-icons/tb';
import { RiPagesLine } from 'react-icons/ri';
import { LiaLanguageSolid } from 'react-icons/lia';
import { FaGears } from 'react-icons/fa6';
import { PiWarningCircleLight } from 'react-icons/pi';
import { TbDatabaseCog } from 'react-icons/tb';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { TbReportAnalytics } from 'react-icons/tb';
import { TbAlignBoxBottomCenter } from 'react-icons/tb';
import { LuFileBox } from 'react-icons/lu';
import { AiOutlineStock } from 'react-icons/ai';
import { RiListSettingsLine } from 'react-icons/ri';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { RxDotFilled } from 'react-icons/rx';
import { BsListColumnsReverse } from 'react-icons/bs';

export const getSidebarIcons = (icon, size = 14) => {
  switch (icon) {
    case 'dashboard':
      return <LuLayoutDashboard size={size} />;
    case 'pos':
      return <FaCashRegister size={size} />;
    case 'orders':
      return <ShoppingCartOutlined size={size} />;
    case 'order_statuses':
      return <CheckCircleOutlined size={size} />;
    case 'order_reviews':
      return <CommentOutlined size={size} />;
    case 'brands':
      return <TbBasketStar size={size} />;
    case 'units':
      return <TbRulerMeasure size={size} />;
    case 'products':
      return <BsBoxSeam size={size} />;
    case 'addons':
      return <FaPuzzlePiece size={size} />;
    case 'options':
      return <PiHandCoins size={size} />;
    case 'discounts':
      return <CiDiscount1 size={size} />;
    case 'main_branch':
      return <BsHouse size={size} />;
    case 'branch_list':
      return <BsHouses size={size} />;
    case 'gallery':
      return <IoImagesOutline size={size} />;
    case 'kitchen_list':
      return <FaKitchenSet size={size} />;
    case 'reservation_set_up':
      return <LuCalendarCog size={size} />;
    case 'reservations':
      return <LuCalendarDays size={size} />;
    case 'stories':
      return <MdManageHistory size={size} />;
    case 'blogs':
      return <TbMessagePlus size={size} />;
    case 'careers':
      return <MdWorkOutline size={size} />;
    case 'banners':
      return <LiaAdSolid size={size} />;
    case 'notifications':
      return <MdOutlineNotificationsActive size={size} />;
    case 'coupons':
      return <RiCoupon2Line size={size} />;
    case 'referral':
      return <BsFillDiagram3Fill size={size} />;
    case 'bonuses':
      return <TbGiftFilled size={size} />;
    case 'customers':
      return <TbUsersGroup size={size} />;
    case 'staff_and_admin_users':
      return <FaUsersGear size={size} />;
    case 'deliverymen':
      return <RiEBike2Line size={size} />;
    case 'wallets':
      return <CiWallet size={size} />;
    case 'transactions':
      return <FaMoneyBillTransfer size={size} />;
    case 'seller_payments':
      return <LiaMoneyCheckSolid size={size} />;
    case 'deliveryman_payments':
      return <GiPayMoney size={size} />;
    case 'payout_requests':
      return <FaMoneyBillTrendUp size={size} />;
    case 'payouts':
      return <BiMoneyWithdraw size={size} />;
    case 'general_settings':
      return <IoMdSettings size={size} />;
    case 'currencies':
      return <MdCurrencyExchange size={size} />;
    case 'payments':
      return <MdOutlinePayments size={size} />;
    case 'notification_settings':
      return <MdEditNotifications size={size} />;
    case 'social_settings':
      return <GrServicePlay size={size} />;
    case 'app_settings':
      return <TbDeviceMobileCog size={size} />;
    case 'page_setup':
      return <RiPagesLine size={size} />;
    case 'languages_and_translations':
      return <LiaLanguageSolid size={size} />;
    case 'backup_and_maintenance':
      return <FaGears size={size} />;
    case 'system_information':
      return <PiWarningCircleLight size={size} />;
    case 'update_database':
      return <TbDatabaseCog size={size} />;
    case 'overview':
      return <HiOutlineDocumentReport size={size} />;
    case 'revenue_reports':
      return <TbReportAnalytics size={size} />;
    case 'order_reports':
      return <TbAlignBoxBottomCenter size={size} />;
    case 'product_reports':
      return <LuFileBox size={size} />;
    case 'stock_reports':
      return <AiOutlineStock size={size} />;
    case 'category_reports':
      return <RiListSettingsLine size={size} />;
    case 'options_extras_reports':
      return <HiOutlineClipboardDocumentList size={size} />;
    case 'recipes':
      return <BsListColumnsReverse size={size} />;

    default:
      return (
        <RxDotFilled size={size} />
        // <div className='flex align-items-center'>
        //   <div
        //     style={{
        //       width: '4px',
        //       height: '4px',
        //       maxWidth: '4px',
        //       background: '#A1A1A1',
        //       borderRadius: '50%',
        //     }}
        //   />
        // </div>
      );
  }
};
