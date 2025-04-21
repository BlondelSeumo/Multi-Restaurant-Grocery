import cls from "./homeChatButton.module.scss";
import Message3FillIcon from "remixicon-react/Message3FillIcon";
import dynamic from "next/dynamic";
import { useContext } from "react";
import { ChatContext } from "contexts/chat/chat.context";

const DrawerContainer = dynamic(() => import("containers/drawer/drawer"));
const Chat = dynamic(() => import("containers/chat/chat"));

type Props = {
  userId?: number;
  title?: string;
};

export default function HomeChatButton({ userId, title }: Props) {
  const { isChatOpen, toggleChat } = useContext(ChatContext);
  return (
    <>
      <button type="button" className={cls.container} onClick={toggleChat}>
        <Message3FillIcon size={24} />
      </button>
      <DrawerContainer
        open={isChatOpen}
        onClose={toggleChat}
        PaperProps={{ style: { padding: 0, width: "500px" } }}
      >
        <Chat
          receiverId={userId}
          title={title || "shop"}
          translateTitle={!title}
        />
      </DrawerContainer>
    </>
  );
}
