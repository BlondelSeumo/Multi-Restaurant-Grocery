import { IMessage } from "interfaces/chat.interface";
import cls from "./chatImageMessage.module.scss";
import FallbackImage from "components/fallbackImage/fallbackImage";
import dayjs from "dayjs";
import CheckDoubleLineIcon from "remixicon-react/CheckDoubleLineIcon";
import CheckLineIcon from "remixicon-react/CheckLineIcon";
import ChatRepliedMessage from "./chatRepliedMessage";
import { useDateHourFormat } from "utils/useDateHourFormat";

type Props = {
  data: IMessage;
  userId?: number;
  repliedMessage: IMessage | null;
};

export default function ChatImageMessage({
  data,
  userId,
  repliedMessage,
}: Props) {
  const { hourFormat } = useDateHourFormat();
  return (
    <div className={cls.container}>
      {repliedMessage && (
        <ChatRepliedMessage
          data={repliedMessage}
          inProgress={false}
          isMine={data.senderId === userId}
        />
      )}
      <div
        className={`${cls.wrapper} ${userId === data.senderId ? cls.left : cls.right}`}
      >
        <div className={cls.image}>
          <FallbackImage
            src={data.message}
            alt={data.message}
            sizes="200px"
            fill
          />
        </div>
        <div className={cls.addition}>
          <span
            className={`${cls.date} ${userId === data.senderId && cls.left}`}
          >
            {dayjs(data.time).format(hourFormat)}
          </span>
          {userId === data.senderId && (
            <div className={cls.icon}>
              {data.read ? (
                <CheckDoubleLineIcon size={12} />
              ) : (
                <CheckLineIcon size={12} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
