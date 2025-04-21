import React from "react";
import { PopoverProps } from "@mui/material";
import PopoverContainer from "containers/popover/popover";
import cls from "./categoryDropdown.module.scss";
import { Category } from "interfaces";
import FallbackImage from "components/fallbackImage/fallbackImage";
import Loader from "components/loader/loader";

interface Props extends PopoverProps {
  data: Category[];
  handleClickItem?: (event?: any, id?: number) => void;
  handleClickMain?: (event?: any, uuid?: string) => void;
  type?: "recipe" | "main";
  loading?: boolean;
}

export default function CategoryPopover({
  data,
  handleClickItem = () => {},
  handleClickMain,
  type = "main",
  loading = false,
  ...props
}: Props) {
  const handleClick = (event: any, id: number, uuid?: string) => {
    if (props.onClose) props.onClose({}, "backdropClick");
    handleClickItem(event, id);
    if (handleClickMain) {
      setTimeout(() => {
        handleClickMain(event, uuid);
      }, 100);
    }
  };

  return (
    <PopoverContainer
      {...props}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <div className={cls.wrapper}>
        {data.map((item) => (
          <a
            href={`#${item.uuid}`}
            key={item.uuid}
            className={cls.link}
            onClick={(event) => handleClick(event, item.id, item.uuid)}
          >
            {!!item.img && type === "main" && (
              <div className={cls.navImgWrapper}>
                <FallbackImage src={item.img} alt={item.translation?.title} />
              </div>
            )}
            <span className={cls.text}>{item.translation.title}</span>
          </a>
        ))}
        {loading && <Loader size={20} />}
      </div>
    </PopoverContainer>
  );
}
