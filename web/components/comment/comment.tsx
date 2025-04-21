/* eslint-disable @next/next/no-img-element */
import React from "react";
import cls from "./comment.module.scss";
import ShareLineIcon from "remixicon-react/ShareLineIcon";
import { Rating } from "@mui/material";
import { ShopReview } from "interfaces";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import usePopover from "hooks/usePopover";
import ShareComment from "components/shareComment/shareComment";
import dynamic from "next/dynamic";
import Avatar from "components/avatar";

const PopoverContainer = dynamic(() => import("containers/popover/popover"));

type Props = {
  data: ShopReview;
};

export default function Comment({ data }: Props) {
  const { query } = useRouter();
  const isActive = Number(query.review) === data.id;
  const [openShare, anchorShare, handleOpenShare, handleCloseShare] =
    usePopover();

  return (
    <div
      id={`comment-${data.id}`}
      className={`${cls.wrapper} ${isActive ? cls.active : ""}`}
    >
      <div className={cls.header}>
        <div className={cls.user}>
          <div className={cls.imgWrapper}>
            {!!data.user && <Avatar data={data.user} />}
          </div>
          <div className={cls.info}>
            <h3 className={cls.username}>
              {data.user?.firstname} {data.user?.lastname}
            </h3>
            <p className={cls.text}>{data.order?.address?.address}</p>
          </div>
        </div>
        <button className={cls.shareBtn} onClick={handleOpenShare}>
          <ShareLineIcon />
        </button>
      </div>
      <div className={cls.body}>
        <div className={cls.rating}>
          <Rating
            value={data.rating}
            readOnly
            sx={{ color: "#ffa100", "& *": { color: "inherit" } }}
          />
          <div className={cls.muted}>
            {dayjs(data.created_at).format("DD.MM.YYYY")}
          </div>
        </div>
        <div className={cls.content}>
          <p>{data.comment}</p>
        </div>
      </div>

      {openShare && (
        <PopoverContainer
          open={openShare}
          anchorEl={anchorShare}
          onClose={handleCloseShare}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <ShareComment data={data} handleClose={handleCloseShare} />
        </PopoverContainer>
      )}
    </div>
  );
}
