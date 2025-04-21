import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "react-image-lightbox/style.css";
import "styles/globals.css";
import { useEffect, useState } from "react";
import App, { AppProps } from "next/app";
import Layout from "containers/layout/layout";
import { ToastContainer } from "react-toastify";
import { Router, useRouter } from "next/router";
import { getCookie } from "utils/session";
import ThemeProvider from "contexts/theme/theme.provider";
import createEmotionCache from "utils/createEmotionCache";
import { CacheProvider, EmotionCache } from "@emotion/react";
import MuiThemeProvider from "contexts/muiTheme/muiTheme.provider";
import { useDeviceType } from "utils/useDeviceType";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider } from "contexts/auth/auth.provider";
import { SettingsProvider } from "contexts/settings/settings.provider";
import NProgress from "nprogress";
import { Provider } from "react-redux";
import { store, persistor } from "redux/store";
import { PersistGate } from "redux-persist/integration/react";
import i18n from "../i18n";
import getLanguage from "utils/getLanguage";
import { config } from "constants/reactQuery.config";
import Script from "next/script";
import { G_TAG } from "constants/constants";
import { IShop } from "interfaces";
import { BranchProvider } from "contexts/branch/branch.provider";

import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "swiper/css/navigation";
import "nprogress/nprogress.css";
import ChatProvider from "../contexts/chat/chat.provider";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const clientSideEmotionCache = createEmotionCache();
const pagesWithoutLayout = [
  "register",
  "login",
  "reset-password",
  "verify-phone",
  "update-password",
  "update-details",
];

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  userAgent: string;
  appTheme: "light" | "dark";
  authState: any;
  settingsState: any;
  defaultAddress: string;
  locale: string;
  translations?: any;
  appDirection: "ltr" | "rtl";
  branchState?: IShop;
}

export default function ExtendedApp({
  Component,
  pageProps,
  userAgent,
  appTheme,
  emotionCache = clientSideEmotionCache,
  authState,
  settingsState,
  defaultAddress,
  locale,
  appDirection,
  branchState,
}: MyAppProps) {
  NProgress.configure({ showSpinner: false });
  const { pathname } = useRouter();
  const isAuthPage = pagesWithoutLayout.some((item) => pathname.includes(item));
  const deviceType = useDeviceType(userAgent);
  const [queryClient] = useState(() => new QueryClient(config));

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <CacheProvider value={emotionCache}>
          <MuiThemeProvider deviceType={deviceType}>
            <ThemeProvider appTheme={appTheme} appDirection={appDirection}>
              <ChatProvider>
                <Provider store={store}>
                  <SettingsProvider
                    settingsState={settingsState}
                    defaultAddress={defaultAddress}
                  >
                    <BranchProvider branchState={branchState}>
                      <AuthProvider authState={authState}>
                        {isAuthPage ? (
                          <Component {...pageProps} />
                        ) : (
                          <PersistGate loading={null} persistor={persistor}>
                            {() => (
                              <Layout>
                                <Component {...pageProps} />
                              </Layout>
                            )}
                          </PersistGate>
                        )}
                      </AuthProvider>
                    </BranchProvider>
                  </SettingsProvider>
                </Provider>
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={true}
                  newestOnTop={false}
                  closeOnClick
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  closeButton={false}
                  className="toast-alert"
                />
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${G_TAG}`}
                  strategy="afterInteractive"
                  async
                />
                <Script id="google-analytics" strategy="afterInteractive">
                  {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${G_TAG}');
              `}
                </Script>
              </ChatProvider>
            </ThemeProvider>
          </MuiThemeProvider>
        </CacheProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

ExtendedApp.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);
  const { req } = appContext.ctx;
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  const appTheme = getCookie("theme", appContext.ctx);
  const appDirection = getCookie("dir", appContext.ctx);
  const authState = getCookie("user", appContext.ctx);
  const settingsState = getCookie("settings", appContext.ctx);
  const defaultAddress = getCookie("address", appContext.ctx);
  const locale = getLanguage(getCookie("locale", appContext.ctx));
  const branchState = getCookie("branch", appContext.ctx);

  i18n.changeLanguage(locale);

  return {
    ...appProps,
    userAgent,
    appTheme,
    appDirection,
    authState,
    settingsState,
    defaultAddress,
    locale,
    branchState,
  };
};
