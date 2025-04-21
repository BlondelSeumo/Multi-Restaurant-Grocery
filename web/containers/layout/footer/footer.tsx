/* eslint-disable @next/next/no-img-element */
import React, { useContext } from "react";
import cls from "./footer.module.scss";
import { Grid, useMediaQuery } from "@mui/material";
import {
  BrandLogo,
  BrandLogoDark,
  MailIcon,
  PhoneIcon,
} from "components/icons";
import { ThemeContext } from "contexts/theme/theme.context";
import Link from "next/link";
import FacebookCircleFillIcon from "remixicon-react/FacebookCircleFillIcon";
import TwitterFillIcon from "remixicon-react/TwitterFillIcon";
import InstagramFillIcon from "remixicon-react/InstagramFillIcon";
import YoutubeFillIcon from "remixicon-react/YoutubeFillIcon";
import TelegramFillIcon from "remixicon-react/TelegramFillIcon";
import { useSettings } from "contexts/settings/settings.context";
import useLocale from "hooks/useLocale";
import { checkIsTrue } from "../../../utils/checkIsTrue";

type Props = {};

export default function Footer({}: Props) {
  const { t } = useLocale();
  const { isDarkMode } = useContext(ThemeContext);
  const isMobile = useMediaQuery("(max-width:576px)");
  const { settings } = useSettings();
  const isReferralActive = settings.referral_active == 1;

  return (
    <footer className={cls.footer}>
      <div className="container">
        <Grid container spacing={4}>
          <Grid item xs={12} md={3} order={isMobile ? 3 : 0}>
            <div className={cls.main}>
              <div className={cls.logoWrapper}>
                {isDarkMode ? <BrandLogoDark /> : <BrandLogo />}
              </div>
              <p className={cls.address}>{settings?.address_text}</p>
              <div className={cls.flex}>
                <a
                  href={settings?.customer_app_ios}
                  className={cls.item}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/images/app-store.webp" alt="App store" />
                </a>
                <a
                  href={settings?.customer_app_android}
                  className={cls.item}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/images/google-play.webp" alt="Google play" />
                </a>
              </div>
            </div>
          </Grid>
          {!isMobile && <Grid item xs={12} md={1}></Grid>}
          <Grid item xs={12} md={2}>
            <ul className={cls.column}>
              <li className={cls.columnItem}>
                <Link href="/about" className={cls.listItem}>
                  {t("about")}
                </Link>
              </li>
              {checkIsTrue(settings?.blog_active) && (
                <li className={cls.columnItem}>
                  <Link href="/blog" className={cls.listItem}>
                    {t("blog")}
                  </Link>
                </li>
              )}
              <li className={cls.columnItem}>
                <Link href="/careers" className={cls.listItem}>
                  {t("careers")}
                </Link>
              </li>
              {isReferralActive && (
                <li className={cls.columnItem}>
                  <Link href="/referrals" className={cls.listItem}>
                    {t("become.affiliate")}
                  </Link>
                </li>
              )}
            </ul>
          </Grid>
          {!isMobile && <Grid item xs={12} md={0.5}></Grid>}
          <Grid item xs={12} md={2}>
            <ul className={cls.column}>
              <li className={cls.columnItem}>
                <Link href="/branches" className={cls.listItem}>
                  {t("branches")}
                </Link>
              </li>
              <li className={cls.columnItem}>
                <Link href="/recipes" className={cls.listItem}>
                  {t("recipes")}
                </Link>
              </li>
              <li className={cls.columnItem}>
                <Link href="/help" className={cls.listItem}>
                  {t("get.helps")}
                </Link>
              </li>
              <li className={cls.columnItem}>
                <Link href="/deliver" className={cls.listItem}>
                  {t("sign.up.to.deliver")}
                </Link>
              </li>
            </ul>
          </Grid>
          {!isMobile && <Grid item xs={12} md={0.5}></Grid>}
          <Grid item xs={12} md={3}>
            <ul className={cls.column}>
              <li className={cls.columnTitle}>{t("contacts")}</li>
              <li className={cls.columnItem}>
                <PhoneIcon />
                <a href={`tel:${settings?.phone}`} className={cls.listItem}>
                  {settings?.phone}
                </a>
              </li>
              <li className={cls.columnItem}>
                <MailIcon />
                <a href={`mailto:${settings?.email}`} className={cls.listItem}>
                  {settings?.email}
                </a>
              </li>
              <div className={cls.social}>
                <a
                  href={settings?.facebook_url}
                  className={cls.socialItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookCircleFillIcon />
                </a>
                <a
                  href={settings?.telegram_url}
                  className={cls.socialItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TelegramFillIcon />
                </a>
                <a
                  href={settings?.twitter_url}
                  className={cls.socialItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TwitterFillIcon />
                </a>
                <a
                  href={settings?.instagram_url}
                  className={cls.socialItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramFillIcon />
                </a>
                <a
                  href={settings?.youtube_url}
                  className={cls.socialItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <YoutubeFillIcon />
                </a>
              </div>
            </ul>
          </Grid>
        </Grid>

        <div className={cls.bottom}>
          <Grid
            container
            spacing={4}
            flexDirection={isMobile ? "column" : "row"}
          >
            <Grid item xs={12} md={3}>
              <div className={cls.flex}>
                <Link href="/privacy" className={cls.mutedLink}>
                  {t("privacy.policy")}
                </Link>
                <Link href="/terms" className={cls.mutedLink}>
                  {t("terms")}
                </Link>
              </div>
            </Grid>
            <Grid item xs={12} md={6}></Grid>
            <Grid item xs={12} md={3}>
              <p className={cls.text}>
                &copy; {new Date().getFullYear()} {settings?.footer_text}
              </p>
            </Grid>
          </Grid>
        </div>
      </div>
    </footer>
  );
}
