import React, { useMemo } from "react";
import { Category } from "interfaces";
import cls from "./shopNavbar.module.scss";
import dynamic from "next/dynamic";
import usePopover from "hooks/usePopover";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";
import Filter3LineIcon from "remixicon-react/Filter3LineIcon";
import useLocale from "hooks/useLocale";
import ProductSorting from "components/shopSorting/productSorting";
import FallbackImage from "components/fallbackImage/fallbackImage";
import { useMediaQuery } from "@mui/material";
import scrollToView from "utils/scrollToView";

const PopoverContainer = dynamic(() => import("containers/popover/popover"));
const CategoryDropdown = dynamic(
  () => import("components/categoryDropdown/categoryDropdown")
);

type Props = {
  categories?: Category[];
  loading?: boolean;
  isFetchingRest?: boolean;
  fetchRestCategories?: () => void;
};

export default function ShopNavbar({
  categories = [],
  loading,
  isFetchingRest,
  fetchRestCategories,
}: Props) {
  const { t } = useLocale();
  const isLargeDesktop = useMediaQuery("(min-width:1536px)");
  const [openDropdown, anchorDropdown, handleOpenPopover, handleClosePopover] =
    usePopover();
  const [openSorting, anchorSorting, handleOpenSorting, handleCloseSorting] =
    usePopover();

  const openCategoryDropdown = (event: any) => {
    handleOpenPopover(event);
    if (fetchRestCategories) fetchRestCategories();
  };

  const { list, rest } = useMemo(() => {
    const MAX_ITEM = isLargeDesktop ? 8 : 6;
    const arr = [...categories];
    if (arr.length > MAX_ITEM) {
      return {
        list: arr.slice(0, MAX_ITEM),
        rest: arr.slice(MAX_ITEM),
      };
    }
    return {
      list: arr,
      rest: [],
    };
  }, [categories, isLargeDesktop]);

  function handleClick(event: any, uuid?: string) {
    event.preventDefault();
    scrollToView(uuid);
  }

  return (
    <div className={cls.container}>
      <div className="container">
        <div className={cls.wrapper}>
          {!loading ? (
            <ul className={cls.navbar}>
              <li className={cls.navItem}>
                <a
                  href={`#recommended`}
                  className={`${cls.navLink}`}
                  onClick={(event) => handleClick(event, "recommended")}
                >
                  {t("all")}
                </a>
              </li>
              {list.map((item) => (
                <li key={item.id} className={cls.navItem}>
                  <a
                    href={`#${item.uuid}`}
                    className={`${cls.navLink}`}
                    onClick={(event) => handleClick(event, item.uuid)}
                  >
                    {!!item.img && (
                      <div className={cls.navImgWrapper}>
                        <FallbackImage
                          src={item.img}
                          alt={item.translation?.title}
                        />
                      </div>
                    )}
                    <span className={cls.text}>{item.translation?.title}</span>
                  </a>
                </li>
              ))}
              {rest.length > 0 && (
                <li className={cls.navItem}>
                  <button className={cls.btn} onClick={openCategoryDropdown}>
                    <span className={cls.text}>{t("more")}</span>
                    <ArrowDownSLineIcon />
                  </button>
                </li>
              )}
            </ul>
          ) : (
            <div></div>
          )}
          <div className={cls.actions}>
            <button className={cls.btn} onClick={handleOpenSorting}>
              <Filter3LineIcon />
              <span className={cls.text}>{t("sorted.by")}</span>
            </button>
          </div>
        </div>
      </div>
      <CategoryDropdown
        data={rest}
        open={openDropdown}
        anchorEl={anchorDropdown}
        onClose={handleClosePopover}
        handleClickMain={handleClick}
        loading={isFetchingRest}
      />
      <PopoverContainer
        open={openSorting}
        anchorEl={anchorSorting}
        onClose={handleCloseSorting}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <ProductSorting handleClose={handleCloseSorting} />
      </PopoverContainer>
    </div>
  );
}
