import 'assets/scss/components/header.scss';
import ThemeChanger from './theme-changer';
import NotificationsIndicator from './notifications-indicator';
import LanguageChanger from './language-changer';
import Profile from './profile';

const Header = () => {
  return (
    <div className='header'>
      <div className='wrapper'>
        <ThemeChanger />
        <NotificationsIndicator />
        <LanguageChanger />
        <Profile />
      </div>
    </div>
  );
};

export default Header;
