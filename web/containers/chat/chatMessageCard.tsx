import { IMessage } from "interfaces/chat.interface";
import { useTranslation } from "react-i18next";
import ChatTextMessage from "./chatTextMessage";
import { useEffect, useState } from "react";
import cls from "./chatMessageCard.module.scss";
import ChatImageMessage from "./chatImageMessage";
import usePopover from "hooks/usePopover";
import PopoverContainer from "containers/popover/popover";
import ChatMessageActionButton from "./chatMessageActionButton";
import PencilLineIcon from "remixicon-react/PencilLineIcon";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "utils/firebase";
import ReplyAllLineIcon from "remixicon-react/ReplyAllLineIcon";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";

type Props = {
  data: IMessage;
  userId?: number;
  onEdit: (message: IMessage | null) => void;
  onReply: (message: IMessage | null) => void;
  onDelete: (message: IMessage) => void;
  chatId?: string;
};

export default function ChatMessageCard({
  data,
  userId,
  onReply,
  onEdit,
  onDelete,
  chatId,
}: Props) {
  const { t } = useTranslation();
  const [open, anchor, handleOpen, handleClose] = usePopover();
  const [repliedMessage, setRepliedMessage] = useState<IMessage | null>(null);

  const isTextMessage =
    data.type === "text" || typeof data.type === "undefined";

  const handleReply = () => {
    onReply(data);
    onEdit(null);
  };

  const handleEdit = () => {
    onEdit(data);
    onReply(null);
  };

  const fetchRepliedMessage = async (messageId: string) => {
    if (chatId) {
      const db = getFirestore(firebaseApp);
      const q = doc(db, "chat", chatId, "message", messageId);
      await getDoc(q).then((snapShot) => {
        const message = snapShot.data();
        setRepliedMessage({
          id: snapShot.id,
          message: message?.message,
          time: message?.time,
          replyDocId: message?.replyDocId,
          senderId: message?.senderId,
          type: message?.type,
          read: message?.read,
          isLast: false,
        });
      });
    }
  };

  useEffect(() => {
    if (data?.replyDocId) {
      fetchRepliedMessage(data.replyDocId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.replyDocId]);

  return (
    <div
      className={`${cls.container} ${userId === data.senderId && cls.sender}`}
    >
      <div
        onClick={(e) => {
          handleOpen(e);
        }}
      >
        {data.type === "image" && (
          <ChatImageMessage
            repliedMessage={repliedMessage}
            data={data}
            userId={userId}
          />
        )}
        {isTextMessage && (
          <ChatTextMessage
            data={data}
            userId={userId}
            repliedMessage={repliedMessage}
          />
        )}
      </div>
      <PopoverContainer
        open={open}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={
          data.senderId === userId
            ? { vertical: "bottom", horizontal: "right" }
            : { vertical: "bottom", horizontal: "left" }
        }
        transformOrigin={
          data.senderId === userId
            ? { vertical: "top", horizontal: "right" }
            : { vertical: "top", horizontal: "left" }
        }
        PaperProps={{ style: { borderRadius: "10px" } }}
      >
        <div className={cls.popover}>
          {data.senderId === userId && isTextMessage && (
            <ChatMessageActionButton
              onClick={() => {
                handleEdit();
              }}
              onClose={handleClose}
              icon={<PencilLineIcon size={20} />}
              text={t("edit")}
            />
          )}
          <ChatMessageActionButton
            onClick={() => {
              handleReply();
            }}
            onClose={handleClose}
            text={t("reply")}
            icon={<ReplyAllLineIcon size={20} />}
          />
          {data.senderId === userId && (
            <ChatMessageActionButton
              danger
              onClick={() => onDelete(data)}
              onClose={handleClose}
              icon={<DeleteBinLineIcon size={20} />}
              text={t("delete")}
            />
          )}
        </div>
      </PopoverContainer>
    </div>
  );
}
