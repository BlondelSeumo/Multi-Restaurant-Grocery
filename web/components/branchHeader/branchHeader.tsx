import React, { useState } from "react";
import cls from "./branchHeader.module.scss";
import Filter3FillIcon from "remixicon-react/Filter3FillIcon";
import EqualizerFillIcon from "remixicon-react/EqualizerFillIcon";
import dynamic from "next/dynamic";
import useLocale from "hooks/useLocale";
import usePopover from "hooks/usePopover";
import ShopFilter from "components/shopFilter/shopFilter";
import ShopSorting from "components/shopSorting/shopSorting";
import { useMediaQuery } from "@mui/material";
import Search2LineIcon from "remixicon-react/Search2LineIcon";
import useDebounce from "hooks/useDebounce";
import useDidUpdate from "hooks/useDidUpdate";
import { useAppDispatch } from "hooks/useRedux";
import { setSearchFilter } from "redux/slices/shopFilter";

const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const PopoverContainer = dynamic(() => import("containers/popover/popover"));

type Props = {};

export default function BranchHeader({}: Props) {
  const { t } = useLocale();
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useAppDispatch();
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 400);
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [openFilter, anchorFilter, handleOpenFilter, handleCloseFilter] =
    usePopover();
  const [openSorting, anchorSorting, handleOpenSorting, handleCloseSorting] =
    usePopover();

  useDidUpdate(() => {
    if (debouncedSearchTerm) {
      dispatch(setSearchFilter(debouncedSearchTerm));
    } else {
      dispatch(setSearchFilter(undefined));
    }
  }, [debouncedSearchTerm]);

  return (
    <div className={cls.header}>
      <div className="container">
        <h1 className={cls.title}>{t("branches")}</h1>
        <div className={cls.flex}>
          <div className={cls.searchContainer}>
            <label htmlFor="search">
              <Search2LineIcon />
            </label>
            <input
              type="text"
              id="search"
              placeholder={t("search.branches")}
              autoComplete="off"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className={cls.actions}>
            <button className={cls.btn} onClick={handleOpenSorting}>
              <Filter3FillIcon />
              <span className={cls.text}>{t("sorted.by")}</span>
            </button>
            <button className={cls.btn} onClick={handleOpenFilter}>
              <EqualizerFillIcon />
              <span className={cls.text}>{t("filter")}</span>
            </button>
          </div>
        </div>

        {isDesktop ? (
          <PopoverContainer
            open={openFilter}
            anchorEl={anchorFilter}
            onClose={handleCloseFilter}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <ShopFilter handleClose={handleCloseFilter} />
          </PopoverContainer>
        ) : (
          <MobileDrawer open={openFilter} onClose={handleCloseFilter}>
            <ShopFilter handleClose={handleCloseFilter} />
          </MobileDrawer>
        )}
        {isDesktop ? (
          <PopoverContainer
            open={openSorting}
            anchorEl={anchorSorting}
            onClose={handleCloseSorting}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <ShopSorting handleClose={handleCloseSorting} />
          </PopoverContainer>
        ) : (
          <MobileDrawer open={openSorting} onClose={handleCloseSorting}>
            <ShopSorting handleClose={handleCloseSorting} />
          </MobileDrawer>
        )}
      </div>
    </div>
  );
}
