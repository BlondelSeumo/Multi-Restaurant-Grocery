import React from "react";
import cls from "./galleryGrid.module.scss";
import { Grid } from "@mui/material";
import { Gallery } from "interfaces";
import useLocale from "hooks/useLocale";
import FallbackImage from "components/fallbackImage/fallbackImage";
import getImage from "utils/getImage";
import { useRouter } from "next/router";

type Props = {
  data: Gallery[];
};

export default function GalleryGrid({ data }: Props) {
  const { t } = useLocale();
  const { replace } = useRouter();

  const handleClick = (event: any, index: number) => {
    event.preventDefault();
    replace(
      {
        pathname: "",
        query: { ph_idx: index },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className={cls.wrapper}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("all.photos")}</h1>
      </div>
      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Grid key={index} item xs={12} sm={4} md={3} lg={2}>
            <a
              href="#"
              className={cls.imgWrapper}
              onClick={(event) => handleClick(event, index)}
            >
              <FallbackImage
                fill
                src={getImage(item.path)}
                alt={item.title}
                sizes="400px"
              />
            </a>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
