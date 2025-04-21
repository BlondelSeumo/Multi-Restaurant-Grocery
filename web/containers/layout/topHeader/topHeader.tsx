import React from "react";
import cls from "./topHeader.module.scss";
import AddressContainer from "containers/addressContainer/addressContainer";
import { ArrowDownIcon, CashIcon, GlobeIcon } from "components/icons";
import LanguagePopover from "components/languagePopover/languagePopover";
import CurrencyList from "components/currencyList/currencyList";
import useLocale from "hooks/useLocale";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import languageService from "services/language";
import { useQuery } from "react-query";
import { useMediaQuery } from "@mui/material";
import usePopover from "hooks/usePopover";
import dynamic from "next/dynamic";

const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const PopoverContainer = dynamic(() => import("containers/popover/popover"));

type Props = {};

export default function TopHeader({}: Props) {
  const { locale } = useLocale();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const currency = useAppSelector(selectCurrency);
  const [langDrawer, anchorLang, handleOpenLangDrawer, handleCloseLangDrawer] =
    usePopover();
  const [
    currencyDrawer,
    anchorCurrency,
    handleOpenCurrencyDrawer,
    handleCloseCurrencyDrawer,
  ] = usePopover();

  const { data } = useQuery("languages", () => languageService.getAllActive(), {
    keepPreviousData: true,
  });

  return (
    <div className={cls.wrapper}>
      <div className="container">
        <div className={cls.navigation}>
          <div className={cls.navItem}>
            <AddressContainer />
          </div>
          <div className={cls.navItem}>
            <button className={cls.button} onClick={handleOpenLangDrawer}>
              <GlobeIcon className={cls.icon} />
              <span className={cls.text}>
                {data?.data.find((item) => item.locale === locale)?.title}
              </span>
              <ArrowDownIcon />
            </button>
            <button className={cls.button} onClick={handleOpenCurrencyDrawer}>
              <CashIcon className={cls.icon} />
              <span className={cls.text}>{currency?.title}</span>
              <ArrowDownIcon />
            </button>
          </div>
        </div>
      </div>
      {isDesktop ? (
        <PopoverContainer
          open={langDrawer}
          anchorEl={anchorLang}
          onClose={handleCloseLangDrawer}
        >
          <LanguagePopover onClose={handleCloseLangDrawer} />
        </PopoverContainer>
      ) : (
        <MobileDrawer open={langDrawer} onClose={handleCloseLangDrawer}>
          <LanguagePopover onClose={handleCloseLangDrawer} />
        </MobileDrawer>
      )}
      {isDesktop ? (
        <PopoverContainer
          open={currencyDrawer}
          anchorEl={anchorCurrency}
          onClose={handleCloseCurrencyDrawer}
        >
          <CurrencyList onClose={handleCloseCurrencyDrawer} />
        </PopoverContainer>
      ) : (
        <MobileDrawer open={currencyDrawer} onClose={handleCloseCurrencyDrawer}>
          <CurrencyList onClose={handleCloseCurrencyDrawer} />
        </MobileDrawer>
      )}
    </div>
  );
}
