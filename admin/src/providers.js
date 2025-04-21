import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import useBodyClass from './helpers/useBodyClass';
import AppLocale from './configs/app-locale';
import i18n from './configs/i18next';
import { updateFavicon } from './helpers/updateFavicon';
import { updateTitle } from './helpers/updateTitle';

export default function Providers({ children }) {
  const { theme } = useSelector((state) => state.theme, shallowEqual);
  const { settings } = useSelector((state) => state.globalSettings);
  useBodyClass(`dir-${theme.direction}`);

  useEffect(() => {
    updateFavicon(settings?.favicon);
    updateTitle(settings?.title);
  }, [settings?.favicon, settings?.title]);

  return (
    <ConfigProvider
      direction={theme.direction}
      locale={AppLocale[i18n.language]}
    >
      {children}
    </ConfigProvider>
  );
}
