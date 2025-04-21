import React, { useState } from "react";
import { Order } from "interfaces";
import { useTranslation } from "react-i18next";
import ImageViewer from "react-simple-image-viewer";
import ModalContainer from "containers/modal/modal";
import cls from "./orderImage.module.scss";

type Props = {
  data?: Order;
};

export default function OrderImage({ data }: Props) {
  const { t } = useTranslation();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  return (
    <>
      <div className={cls.wrapper}>
        <div className={cls.header}>
          <h3 className={cls.title}>{t("order.image")}</h3>
        </div>
        <div className={cls.body}>
          <img
            src={data?.image_after_delivered}
            alt={t("order.image")}
            onClick={() => setIsViewerOpen(true)}
          />
        </div>
        <ModalContainer
          open={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        >
          <ImageViewer
            src={[data?.image_after_delivered || ""]}
            currentIndex={0}
            closeOnClickOutside={true}
            onClose={() => setIsViewerOpen(false)}
          />
        </ModalContainer>
      </div>
    </>
  );
}
