import React, { useMemo } from "react";
import cls from "./shopGallery.module.scss";
import { Gallery } from "interfaces";
import useLocale from "hooks/useLocale";
import Apps2FillIcon from "remixicon-react/Apps2FillIcon";
import FallbackImage from "components/fallbackImage/fallbackImage";
import getImage from "utils/getImage";
import useModal from "hooks/useModal";
import ModalContainer from "containers/modal/modal";
import { Skeleton, useMediaQuery } from "@mui/material";
import GalleryGrid from "components/galleryGrid/galleryGrid";
import { useRouter } from "next/router";
import Lightbox from "react-image-lightbox";

type Props = {
  data: Gallery[];
  loading: boolean;
};

export default function ShopGallery({ data, loading }: Props) {
  const { t } = useLocale();
  const isMobile = useMediaQuery("(max-width:576px)");
  const { replace, query } = useRouter();
  const [openGalleryGrid, handleOpenGallery, handleCloseGallery] = useModal();
  const photoIndex = Number(query.ph_idx);
  const isPhotoGalleryOpen = isFinite(photoIndex);

  const { images, featuredImages } = useMemo(
    () => ({
      images: data.map((item) => item.path),
      featuredImages: data.slice(0, 3),
    }),
    [data]
  );

  const handleSelectPhoto = (idx: number) => {
    replace(
      {
        pathname: "",
        query: { ph_idx: idx },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleClosePhoto = () => {
    replace(
      { query: JSON.parse(JSON.stringify({ ...query, ph_idx: undefined })) },
      undefined,
      {
        shallow: true,
      }
    );
  };

  return (
    <div className={cls.container}>
      <div className="container">
        <div className={cls.wrapper}>
          {!loading
            ? featuredImages.map((item, idx) => (
                <div
                  key={item.id}
                  className={cls.imageWrapper}
                  onClick={() => handleSelectPhoto(idx)}
                >
                  <FallbackImage
                    fill
                    src={getImage(item.path)}
                    alt={item.title}
                    sizes="600px"
                  />
                </div>
              ))
            : Array.from(new Array(3)).map((item, idx) => (
                <div key={"gallery" + idx} className={cls.imageWrapper}>
                  <Skeleton variant="rectangular" className={cls.shimmer} />
                </div>
              ))}

          {data?.length > 3 ? (
            <div className={cls.floatBtn}>
              <button className={cls.showAll} onClick={handleOpenGallery}>
                <Apps2FillIcon />
                <span>{t("see.all.photos", { count: data.length })}</span>
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <ModalContainer
        open={openGalleryGrid}
        onClose={handleCloseGallery}
        fullScreen={isMobile}
      >
        <GalleryGrid data={data} />
      </ModalContainer>
      {isPhotoGalleryOpen && (
        <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => handleClosePhoto()}
          onMovePrevRequest={() =>
            handleSelectPhoto((photoIndex + images.length - 1) % images.length)
          }
          onMoveNextRequest={() =>
            handleSelectPhoto((photoIndex + 1) % images.length)
          }
        />
      )}
    </div>
  );
}
