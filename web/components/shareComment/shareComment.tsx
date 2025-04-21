import React from "react";
import { Grid } from "@mui/material";
import cls from "./shareComment.module.scss";
import { useRouter } from "next/router";
import {
  FacebookShareButton,
  EmailShareButton,
  TwitterShareButton,
} from "react-share";
import useLocale from "hooks/useLocale";
import CloseFillIcon from "remixicon-react/CloseFillIcon";
import { success, warning } from "components/alert/toast";
import { WEBSITE_URL } from "constants/constants";
import qs from "qs";
import { ShopReview } from "interfaces";
import FileCopyLineIcon from "remixicon-react/FileCopyLineIcon";
import MailSendLineIcon from "remixicon-react/MailSendLineIcon";
import TwitterLineIcon from "remixicon-react/TwitterLineIcon";
import FacebookCircleLineIcon from "remixicon-react/FacebookCircleLineIcon";

type Props = {
  data: ShopReview;
  handleClose: () => void;
};

export default function ShareComment({ data, handleClose }: Props) {
  const { t } = useLocale();
  const { query } = useRouter();

  const queries = qs.stringify(
    { ...query, review: data.id },
    { addQueryPrefix: true }
  );
  const copyMe = WEBSITE_URL + "/about" + queries;

  const copyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(copyMe);
      success(t("copied"));
      handleClose();
    } catch (err) {
      warning("Failed to copy!");
    }
  };

  return (
    <div className={cls.root}>
      <h6 className={cls.title}>{t("share.review")}</h6>
      <button className={cls.closeBtn} onClick={handleClose}>
        <CloseFillIcon />
      </button>
      <div className={cls.wrapper}>
        <Grid container spacing={2} pt={2}>
          <Grid item xs={6}>
            <button className={cls.shareItem} onClick={copyToClipBoard}>
              <FileCopyLineIcon />
              <span className={cls.text}>{t("copy.link")}</span>
            </button>
          </Grid>
          <Grid item xs={6}>
            <EmailShareButton className={cls.shareItem} url={copyMe}>
              <MailSendLineIcon />
              <span className={cls.text}>{t("email")}</span>
            </EmailShareButton>
          </Grid>
          <Grid item xs={6}>
            <TwitterShareButton className={cls.shareItem} url={copyMe}>
              <TwitterLineIcon />
              <span className={cls.text}>Twitter</span>
            </TwitterShareButton>
          </Grid>
          <Grid item xs={6}>
            <FacebookShareButton className={cls.shareItem} url={copyMe}>
              <FacebookCircleLineIcon />
              <span className={cls.text}>Facebook</span>
            </FacebookShareButton>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
