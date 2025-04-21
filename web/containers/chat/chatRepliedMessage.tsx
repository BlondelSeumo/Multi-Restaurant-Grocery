import cls from "./chatRepliedMessage.module.scss";
import { IMessage } from "interfaces/chat.interface";
import { useTranslation } from "react-i18next";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import FallbackImage from "components/fallbackImage/fallbackImage";

type Props = {
  data: IMessage;
  inProgress: boolean;
  onClear?: () => void;
  isMine?: boolean;
};

export default function ChatRepliedMessage({
  data,
  inProgress,
  onClear,
  isMine,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className={cls.container}>
      <div className={cls.body}>
        {inProgress && <span className={cls.label}>{t("replying.to")}</span>}
        {data.type === "image" ? (
          <div className={cls.image}>
            <FallbackImage
              src={data.message}
              alt={data.message}
              sizes="100px"
              fill
            />
          </div>
        ) : (
          <span className={`${cls.message} ${isMine && cls.mine}`}>
            {data?.message}
          </span>
        )}
      </div>
      {!!onClear && (
        <button
          className={cls.closeBtn}
          type="button"
          onClick={() => onClear()}
        >
          <CloseLineIcon size={20} />
        </button>
      )}
    </div>
  );
}
