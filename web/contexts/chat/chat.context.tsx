import { createContext } from "react";

type ChatContextType = {
  isChatOpen: boolean;
  toggleChat: () => void;
};

export const ChatContext = createContext<ChatContextType>(
  {} as ChatContextType,
);
