import React from "react";
import { Category } from "interfaces";
import cls from "./mobileShopNavbar.module.scss";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import Filter3LineIcon from "remixicon-react/Filter3LineIcon";
import ProductSorting from "components/shopSorting/productSorting";

const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const MobileProductCategories = dynamic(
  () => import("components/mobileShopCategories/mobileProductCategories")
);

type Props = {
  categories?: Category[];
  loading: boolean;
  isFetchingRest?: boolean;
  fetchRestCategories?: () => void;
};

export default function MobileShopNavbar({
  categories = [],
  loading,
  isFetchingRest,
  fetchRestCategories,
}: Props) {
  const { t } = useTranslation();
  const [visible, handleOpenCategories, handleCloseCategories] = useModal();
  const [openSorting, handleOpenSorting, handleCloseSorting] = useModal();

  const openCategoryDropdown = (event: any) => {
    handleOpenCategories(event);
    if (fetchRestCategories) fetchRestCategories();
  };

  return (
    <div className={cls.container}>
      <div className="container">
        <div className={cls.wrapper}>
          <button className={cls.showAllBtn} onClick={openCategoryDropdown}>
            <span className={cls.text}>{t("menu")}</span>
            <ArrowDownSLineIcon />
          </button>
          <div className={cls.actions}>
            <button className={cls.btn} onClick={handleOpenSorting}>
              <Filter3LineIcon />
              <span className={cls.text}>{t("sorted.by")}</span>
            </button>
          </div>
        </div>
      </div>

      {!loading && (
        <MobileDrawer open={visible} onClose={handleCloseCategories}>
          <MobileProductCategories
            data={categories}
            onClose={handleCloseCategories}
            loading={isFetchingRest}
          />
        </MobileDrawer>
      )}
      {!loading && (
        <MobileDrawer open={openSorting} onClose={handleCloseSorting}>
          <ProductSorting handleClose={handleCloseSorting} />
        </MobileDrawer>
      )}
    </div>
  );
}
