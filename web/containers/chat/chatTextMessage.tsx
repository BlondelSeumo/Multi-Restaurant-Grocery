import cls from "./chatTextMessage.module.scss";
import { IMessage } from "interfaces/chat.interface";
import dayjs from "dayjs";
import CheckLineIcon from "remixicon-react/CheckLineIcon";
import CheckDoubleLineIcon from "remixicon-react/CheckDoubleLineIcon";
import ChatRepliedMessage from "./chatRepliedMessage";
import { useDateHourFormat } from "utils/useDateHourFormat";

type Props = {
  data: IMessage;
  userId?: number;
  repliedMessage: IMessage | null;
};

export default function ChatTextMessage({
  data,
  userId,
  repliedMessage,
}: Props) {
  const { hourFormat } = useDateHourFormat();
  return (
    <div className={cls.container}>
      <div
        className={`${cls.wrapper} ${userId === data.senderId ? cls.left : cls.right}`}
      >
        {repliedMessage && (
          <ChatRepliedMessage
            data={repliedMessage}
            inProgress={false}
            isMine={data.senderId === userId}
          />
        )}
        {data.message}
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
