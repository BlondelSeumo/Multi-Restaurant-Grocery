/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useRef } from "react";
import cls from "./shopReview.module.scss";
import useLocale from "hooks/useLocale";
import Comment from "components/comment/comment";
import Filter3FillIcon from "remixicon-react/Filter3FillIcon";
import usePopover from "hooks/usePopover";
import ReviewSorting from "components/shopSorting/reviewSorting";
import useModal from "hooks/useModal";
import { Skeleton, useMediaQuery } from "@mui/material";
import ReviewCreate from "components/reviewCreate/reviewCreate";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useInfiniteQuery } from "react-query";
import shopService from "services/shop";
import ShopRating from "components/shopRating/shopRating";

const Loader = dynamic(() => import("components/loader/loader"));
const PopoverContainer = dynamic(() => import("containers/popover/popover"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const ModalContainer = dynamic(() => import("containers/modal/modal"));

type Props = {};

export default function ShopReview({}: Props) {
  const { t, locale } = useLocale();
  const { query } = useRouter();
  const loader = useRef(null);
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [openSorting, anchorSorting, handleOpenSorting, handleCloseSorting] =
    usePopover();
  const [openModal, handleOpenModal, handleCloseModal] = useModal();
  const column = query.column;
  const sort = query.sort;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      ["shopReviews", locale, column, sort],
      ({ pageParam = 1 }) =>
        shopService.getShopReviews({
          page: pageParam,
          perPage: 10,
          column,
          sort,
        }),
      {
        getNextPageParam: (lastPage: any) => {
          if (lastPage.meta.current_page < lastPage.meta.last_page) {
            return lastPage.meta.current_page + 1;
          }
          return undefined;
        },
        staleTime: 0,
        refetchOnWindowFocus: true,
      }
    );

  const reviews = data?.pages?.flatMap((item) => item.data);

  const handleObserver = useCallback(
    (entries: any) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
  }, [handleObserver]);

  useEffect(() => {
    if (!!data && !!query.review) {
      const element = document.getElementById(`comment-${query.review}`);
      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [data, query.review]);

  return (
    <div className={cls.wrapper}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("reviews")}</h1>
        <div className={cls.actions}>
          <button className={cls.btn} onClick={handleOpenSorting}>
            <Filter3FillIcon />
            <span className={cls.text}>{t("sorted.by")}</span>
          </button>
        </div>
      </div>
      <ShopRating />
      {/* <div className={cls.block}>
        {isAuthenticated ? (
          <div className={cls.user}>
            <div className={cls.imgWrapper}>
              <Avatar data={user} />
            </div>
            <div className={cls.info}>
              <h3 className={cls.username}>
                {user?.firstname} {user?.lastname}
              </h3>
            </div>
          </div>
        ) : (
          <div className={cls.user}>
            <h3 className={cls.username}>{t("leave.review")}</h3>
          </div>
        )}
        <div className={cls.actions}>
          <DarkButton
            icon={<EditBoxLineIcon />}
            onClick={() =>
              isAuthenticated ? handleOpenModal() : push("/login")
            }
          >
            {t("add.review")}
          </DarkButton>
        </div>
      </div> */}
      {!isLoading ? (
        reviews?.map((item) => <Comment key={item.id} data={item} />)
      ) : (
        <div className={cls.shimmerContainer}>
          {Array.from(new Array(3)).map((item, idx) => (
            <Skeleton
              key={"reviews" + idx}
              variant="rectangular"
              className={cls.shimmer}
            />
          ))}
        </div>
      )}

      {isFetchingNextPage && <Loader />}
      <div ref={loader} />

      <PopoverContainer
        open={openSorting}
        anchorEl={anchorSorting}
        onClose={handleCloseSorting}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <ReviewSorting handleClose={handleCloseSorting} />
      </PopoverContainer>
      {isDesktop ? (
        <ModalContainer open={openModal} onClose={handleCloseModal}>
          <ReviewCreate />
        </ModalContainer>
      ) : (
        <MobileDrawer open={openModal} onClose={handleCloseModal}>
          <ReviewCreate />
        </MobileDrawer>
      )}
    </div>
  );
}
