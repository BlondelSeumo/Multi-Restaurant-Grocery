import React, { useContext } from "react";
import { useRouter } from "next/router";
import Header from "./header/header";
import MobileHeader from "./mobileHeader/mobileHeader";
import ProfileHeader from "./profileHeader/profileHeader";
import { useMediaQuery } from "@mui/material";
import { useQuery } from "react-query";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { useAuth } from "contexts/auth/auth.context";
import {
  selectCurrency,
  setCurrency,
  setDefaultCurrency,
} from "redux/slices/currency";
import currencyService from "services/currency";
import { CartStockWithProducts, Currency, Langauge } from "interfaces";
import languageService from "services/language";
import dynamic from "next/dynamic";
import informationService from "services/information";
import { useSettings } from "contexts/settings/settings.context";
import ErrorBoundary from "containers/errorBoundary/errorBoundary";
import { ThemeContext } from "contexts/theme/theme.context";
import Footer from "./footer/footer";
import translationService from "services/translations";
import ProductSingleContainer from "containers/productSingle/productSingleContainer";
import useLocale from "hooks/useLocale";
import cartService from "services/cart";
import { setToCart } from "redux/slices/cart";
import { updateUserCart } from "redux/slices/userCart";
import { getCookie, setCookie } from "utils/session";
import i18n from "i18n";

const PushNotification = dynamic(
  () => import("containers/pushNotification/pushNotification"),
);
const TopHeader = dynamic(() => import("./topHeader/topHeader"), {
  ssr: false,
});

type LayoutProps = {
  children: any;
};

const profileRoutes = [
  "checkout",
  "profile",
  "settings",
  "help",
  "orders/",
  "be-seller",
  "branches",
  "about",
  "products",
  "reservations",
];

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useRouter();
  const { locale, addResourceBundle } = useLocale();
  const isProfileRoute = profileRoutes.find((item) => pathname.includes(item));
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const currency = useAppSelector(selectCurrency);
  const { updateSettings } = useSettings();
  const { isDarkMode, setDirection } = useContext(ThemeContext);
  const isGroupOrderPage = pathname.includes("group/order");

  useQuery(
    ["translation", locale],
    () => translationService.getAll({ lang: locale }),
    {
      onSuccess: (data) => {
        addResourceBundle(locale, "translation", data.data);
      },
    },
  );

  useQuery("currencies", () => currencyService.getAll(), {
    onSuccess: (data) => {
      const defaultCurrency = data.data.find((item: Currency) => item.default);

      const savedCurrency = data.data.find(
        (item: Currency) => item.id === currency?.id,
      );

      dispatch(setDefaultCurrency(defaultCurrency));

      if (savedCurrency) {
        dispatch(setCurrency(savedCurrency));
      } else {
        dispatch(setCurrency(defaultCurrency));
      }
    },
  });

  useQuery("languages", () => languageService.getAllActive(), {
    onSuccess: (data) => {
      const defaultLang = data?.data?.find((item: Langauge) => item?.default);
      const currentLang = (() => {
        const localeLang = getCookie("locale");
        const detectedLang = data?.data?.find(
          (item: Langauge) => item?.locale === localeLang,
        );
        return detectedLang || defaultLang;
      })();
      const isRTL = currentLang?.backward;
      setDirection(isRTL ? "rtl" : "ltr");
      setCookie("locale", currentLang?.locale || "en");
      i18n.changeLanguage(currentLang?.locale || "en");
    },
  });

  useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
      onSuccess: (data) => {
        dispatchCartData(data.data.user_carts[0]?.cartDetails);
        dispatch(updateUserCart(data.data));
      },
      retry: false,
      staleTime: 0,
      enabled: isAuthenticated,
    },
  );

  useQuery("settings", () => informationService.getSettings(), {
    onSuccess: (data) => {
      const obj = createSettings(data.data);
      updateSettings({
        payment_type: obj.payment_type,
        instagram_url: obj.instagram,
        facebook_url: obj.facebook,
        twitter_url: obj.twitter,
        youtube_url: obj.youtube,
        telegram_url: obj.telegram,
        referral_active: obj.referral_active,
        otp_expire_time: obj.otp_expire_time,
        customer_app_android: obj.customer_app_android,
        customer_app_ios: obj.customer_app_ios,
        delivery_app_android: obj.delivery_app_android,
        delivery_app_ios: obj.delivery_app_ios,
        vendor_app_android: obj.vendor_app_android,
        vendor_app_ios: obj.vendor_app_ios,
        footer_text: obj.footer_text,
        address_text: obj.address,
        phone: obj.phone,
        email: obj.email,
        reservation_time_durations: obj.reservation_time_durations,
        reservation_before_time: obj.reservation_before_time,
        min_reservation_time: obj.min_reservation_time,
        favicon: obj?.favicon,
        logo: obj?.logo,
        dark_logo: obj?.dark_logo,
        hour_format: obj?.hour_format,
        google_map_key: obj?.google_map_key,
        reservation_enable_for_user: obj?.reservation_enable_for_user,
        blog_active: obj?.blog_active,
        system_refund: obj?.system_refund,
      });
    },
  });

  function createSettings(list: any[]) {
    const result = list.map((item) => ({
      [item.key]: item.value,
    }));
    return Object.assign({}, ...result);
  }

  function dispatchCartData(data?: CartStockWithProducts[]) {
    if (data?.length) {
      data.forEach((item) => {
        let product = {
          ...item.stock.product,
          quantity: item.quantity,
          stock: item.stock,
          extras: item.stock.extras?.map((el) => el.value) || [],
          addons: item.addons,
        };
        dispatch(setToCart(product));
      });
    }
  }

  return (
    <ErrorBoundary isDarkMode={isDarkMode}>
      <div className="layout-container">
        {/* if you need fluid container, just remove this div */}
        {isProfileRoute ? (
          <ProfileHeader />
        ) : isDesktop ? (
          <>
            <TopHeader />
            <Header />
          </>
        ) : (
          <>
            <TopHeader />
            <MobileHeader />
          </>
        )}
        {children}
        {!isGroupOrderPage && <ProductSingleContainer />}
        {isAuthenticated && <PushNotification />}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
