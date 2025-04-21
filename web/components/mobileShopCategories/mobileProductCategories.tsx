import React from "react";
import { Category } from "interfaces";
import cls from "./mobileShopCategories.module.scss";
import FallbackImage from "components/fallbackImage/fallbackImage";
import scrollToView from "utils/scrollToView";
import Loader from "components/loader/loader";

type Props = {
  data: Category[];
  onClose: () => void;
  loading?: boolean;
};

export default function MobileProductCategories({
  data,
  onClose,
  loading = false,
}: Props) {
  function handleClick(event: any, uuid?: string) {
    event.preventDefault();
    onClose();
    setTimeout(() => {
      scrollToView(uuid);
    }, 100);
  }

  return (
    <div className={cls.wrapper}>
      {data.map((item) => (
        <a
          key={item.id}
          href={`#${item.uuid}`}
          className={cls.item}
          onClick={(event) => handleClick(event, item.uuid)}
        >
          {!!item.img && (
            <div className={cls.navImgWrapper}>
              <FallbackImage src={item.img} alt={item.translation?.title} />
            </div>
          )}
          <span className={cls.text}>{item.translation?.title}</span>
        </a>
      ))}
      {loading && <Loader size={22} />}
    </div>
  );
}
