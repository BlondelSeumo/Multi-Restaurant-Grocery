import React, { useContext } from "react";
import { BrandLogo, BrandLogoDark } from "components/icons";
import Image from "next/image";
import cls from "./auth.module.scss";
import { ThemeContext } from "contexts/theme/theme.context";
import Link from "next/link";
import { useQuery } from "react-query";
import informationService from "services/information";
import { useSettings } from "contexts/settings/settings.context";

type Props = {
  children: any;
};

export default function AuthContainer({ children }: Props) {
  const { isDarkMode } = useContext(ThemeContext);
  const { updateSettings } = useSettings();

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

  return (
    <div className={cls.container}>
      <div className={cls.authForm}>
        <div className={cls.formWrapper}>
          <div className={cls.header}>
            <Link href="/" style={{ display: "block" }}>
              {isDarkMode ? <BrandLogoDark /> : <BrandLogo />}
            </Link>
          </div>
          <div className={cls.body}>{children}</div>
        </div>
      </div>
      <div className={cls.hero}>
        <div className={cls.imgWrapper}>
          <Image fill src="/images/welcome.jpg" alt="Welcome to foodyman" />
        </div>
      </div>
    </div>
  );
}
