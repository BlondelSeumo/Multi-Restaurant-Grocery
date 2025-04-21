import { forwardRef } from "react";
import { GroupedMessage, IMessage } from "interfaces/chat.interface";
import { useTranslation } from "react-i18next";
import { useAuth } from "contexts/auth/auth.context";
import cls from "./chatMessages.module.scss";
import dayjs from "dayjs";
import ChatMessageCard from "./chatMessageCard";

interface ChatMessageProps {
  messages: GroupedMessage[];
  onEdit: (message: IMessage | null) => void;
  onReply: (message: IMessage | null) => void;
  onDelete: (message: IMessage) => void;
  chatId?: string;
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ messages, onReply, onEdit, onDelete, chatId }, ref) => {
    const { t } = useTranslation();
    const { user } = useAuth();

    if (messages.length === 0) {
      return (
        <div className={cls.empty}>
          <span>{t("there.are.no.messages")}</span>
        </div>
      );
    }

    return (
      <div id="messages" className={cls.container}>
        {messages.map((group) => (
          <div key={group.date}>
            <div className={cls.date}>
              {dayjs(group.date).format("DD MMM, YY")}
            </div>
            <div className={cls.body}>
              {group.messages.map((message) => (
                <ChatMessageCard
                  onEdit={onEdit}
                  onReply={onReply}
                  data={message}
                  userId={user?.id}
                  key={message.id}
                  onDelete={onDelete}
                  chatId={chatId}
                />
              ))}
            </div>
          </div>
        ))}
        <div ref={ref} />
      </div>
    );
  },
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
