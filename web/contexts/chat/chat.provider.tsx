import React, { useReducer } from "react";
import { ChatContext } from "./chat.context";

enum ChatActionKind {
  TOGGLE_CHAT = "TOGGLE_CHAT",
}

interface ThemeAction {
  type: ChatActionKind;
  payload?: any;
}
interface StateType {
  isChatOpen: boolean;
}

function reducer(state: StateType, action: ThemeAction) {
  const { type } = action;
  switch (type) {
    case ChatActionKind.TOGGLE_CHAT:
      return {
        ...state,
        isChatOpen: !state.isChatOpen,
      };
    default:
      return state;
  }
}

type Props = {
  children: any;
};

export default function ChatProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    isChatOpen: false,
  });

  const toggleChat = () => {
    dispatch({ type: ChatActionKind.TOGGLE_CHAT });
  };

  return (
    <ChatContext.Provider
      value={{
        isChatOpen: state.isChatOpen,
        toggleChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
