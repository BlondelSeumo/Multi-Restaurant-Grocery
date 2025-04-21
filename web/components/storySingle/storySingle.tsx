import React from "react";
import { Story } from "interfaces";
import Link from "next/link";
import cls from "./storySingle.module.scss";
import useModal from "hooks/useModal";
import getImage from "utils/getImage";
import dynamic from "next/dynamic";
import FallbackImage from "components/fallbackImage/fallbackImage";

const StoryContainer = dynamic(() => import("containers/story/story"), {
  ssr: false,
});

type Props = {
  data: Story[];
  list: Story[][];
};

export default function StorySingle({ data, list }: Props) {
  const [open, handleOpen, handleClose] = useModal();
  const filteredList = list.filter(
    (item) => item[0].shop_id !== data[0].shop_id,
  );

  const goToStory = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    handleOpen();
  };

  return (
    <>
      <Link href="/" className={cls.story} onClick={goToStory}>
        <div className={cls.logo}>
          <span className={cls.logoWrapper}>
            <FallbackImage
              fill
              src={getImage(data[0].logo_img)}
              alt={data[0].title}
              sizes="38px"
              quality={90}
              priority
            />
          </span>
        </div>
        <h3 className={cls.shopTitle}>{data[0].title}</h3>
      </Link>
      {open && (
        <StoryContainer
          open={open}
          onClose={handleClose}
          stories={[data, ...filteredList]}
          handleClose={handleClose}
        />
      )}
    </>
  );
}
