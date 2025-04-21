import React, { useState } from "react";
import cls from "./mobileSearchContainer.module.scss";
import useDebounce from "hooks/useDebounce";
import ModalContainer from "containers/modal/modal";
import { DialogProps } from "@mui/material";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import MobileSearch from "components/mobileSearch/mobileSearch";
import { useInfiniteQuery } from "react-query";
import productService from "services/product";
import SearchResult from "components/searchResult/searchResult";
import SearchSuggestion from "components/searchSuggestion/searchSuggestion";
import { useDispatch } from "react-redux";
import { addToSearch } from "redux/slices/search";
import useLocale from "hooks/useLocale";
import { useBranch } from "contexts/branch/branch.context";

export default function MobileSearchContainer(props: DialogProps) {
  const { locale } = useLocale();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 400);
  const dispatch = useDispatch();
  const { branch } = useBranch();

  const resetSearch = () => setSearchTerm("");

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
    }
  );

  return (
    <ModalContainer {...props} closable={false}>
      <div className={cls.root}>
        <MobileSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className={cls.wrapper}>
          {!!debouncedSearchTerm && (
            <SearchResult
              products={products?.pages?.flatMap((item) => item.data) || []}
              isLoading={isLoading}
              handleClickItem={() => {
                resetSearch();
                if (props.onClose) props.onClose({}, "backdropClick");
              }}
              productTotal={products?.pages ? products.pages[0].meta.total : 0}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={!!hasNextPage}
              fetchNextPage={fetchNextPage}
            />
          )}
          {!debouncedSearchTerm && (
            <SearchSuggestion setSearchTerm={setSearchTerm} />
          )}
        </div>
        <div className={cls.footer}>
          <button
            className={cls.circleBtn}
            onClick={(event) => {
              if (props.onClose) props.onClose(event, "backdropClick");
            }}
          >
            <ArrowLeftLineIcon />
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}
