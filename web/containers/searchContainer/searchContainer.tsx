import React, { useState } from "react";
import cls from "./searchContainer.module.scss";
import useDebounce from "hooks/useDebounce";
import useDidUpdate from "hooks/useDidUpdate";
import Search2LineIcon from "remixicon-react/Search2LineIcon";
import SearchResult from "components/searchResult/searchResult";
import { useInfiniteQuery } from "react-query";
import productService from "services/product";
import dynamic from "next/dynamic";
import SearchSuggestion from "components/searchSuggestion/searchSuggestion";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { addToSearch, selectSearchHistory } from "redux/slices/search";
import useLocale from "hooks/useLocale";
import { useBranch } from "contexts/branch/branch.context";

const PopoverContainer = dynamic(() => import("containers/popover/popover"));

type Props = {
  searchContainerRef: any;
};

export default function SearchContainer({ searchContainerRef }: Props) {
  const { t, locale } = useLocale();
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 400);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [anchorSuggestion, setAnchorSuggestion] = useState(null);
  const openSuggetion = Boolean(anchorSuggestion);
  const dispatch = useAppDispatch();
  const history = useAppSelector(selectSearchHistory);
  const { branch } = useBranch();

  const {
    data: products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(
    ["productResult", debouncedSearchTerm, locale],
    ({ pageParam = 1 }) =>
      productService.search({
        search: debouncedSearchTerm,
        page: pageParam,
        shop_id: branch?.id,
      }),
    {
      getNextPageParam: (lastPage: any) => {
        if (lastPage.meta.current_page < lastPage.meta.last_page) {
          return lastPage.meta.current_page + 1;
        }
        return undefined;
      },
      retry: false,
      enabled: !!debouncedSearchTerm,
      onSuccess: () => {
        dispatch(addToSearch(debouncedSearchTerm));
      },
    },
  );

  const resetSearch = () => setSearchTerm("");
  const handleOpen = () => setAnchorEl(searchContainerRef.current);
  const handleClose = () => setAnchorEl(null);

  const handleOpenSuggestion = () =>
    setAnchorSuggestion(searchContainerRef.current);
  const handleCloseSuggestion = () => setAnchorSuggestion(null);

  const handleClick = () => {
    handleOpenSuggestion();
    if (debouncedSearchTerm) {
      handleOpen();
      handleCloseSuggestion();
    }
  };

  useDidUpdate(() => {
    if (debouncedSearchTerm) {
      handleOpen();
      handleCloseSuggestion();
    } else {
      handleClose();
      handleOpenSuggestion();
    }
  }, [debouncedSearchTerm]);

  return (
    <div
      className={`${cls.search} ${collapsed ? cls.collapsed : ""}`}
      ref={searchContainerRef}
      onClick={() => setCollapsed(false)}
    >
      <label htmlFor="search">
        <Search2LineIcon />
      </label>
      <input
        type="text"
        id="search"
        placeholder={t("search.products")}
        autoComplete="off"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onClick={handleClick}
      />

      <PopoverContainer
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        anchorPosition={{ left: 30, top: 30 }}
        disableAutoFocus
      >
        <SearchResult
          products={products?.pages?.flatMap((item) => item.data) || []}
          isLoading={isLoading}
          handleClickItem={handleClose}
          productTotal={products?.pages ? products.pages[0].meta.total : 0}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={!!hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </PopoverContainer>

      <PopoverContainer
        open={openSuggetion && !!history.length}
        anchorEl={anchorSuggestion}
        onClose={handleCloseSuggestion}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        anchorPosition={{ left: 30, top: 30 }}
        disableAutoFocus
      >
        <SearchSuggestion setSearchTerm={setSearchTerm} />
      </PopoverContainer>
    </div>
  );
}
