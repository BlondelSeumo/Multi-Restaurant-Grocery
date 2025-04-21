import 'assets/scss/components/header.scss';
import React, { useContext, useEffect } from 'react';
import { Context } from 'context/context';
import { BsMoonFill, BsSunFill } from 'react-icons/bs';

const ThemeChanger = () => {
  const { darkTheme, setDarkTheme } = useContext(Context);
  const handleToggle = () => setDarkTheme(!darkTheme);
  useEffect(() => {
    if (darkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkTheme]);
  return (
    <button type='button' onClick={handleToggle} className='themeChanger'>
      {darkTheme ? <BsSunFill size={22} /> : <BsMoonFill size={22} />}
    </button>
  );
};

export default ThemeChanger;
