import React from "react";
import cls from "./chatMessageActionButton.module.scss";

type Props = {
  icon: React.ReactElement;
  text: string;
  danger?: boolean;
  onClick: () => void;
  onClose: () => void;
};

export default function ChatMessageActionButton({
  icon,
  text,
  danger,
  onClick,
  onClose,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        onClose();
      }}
      className={`${cls.container} ${danger && cls.danger}`}
    >
      {icon}
      {text}
    </button>
  );
}
