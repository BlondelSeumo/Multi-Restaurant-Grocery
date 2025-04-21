import { useAuth } from "contexts/auth/auth.context";
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  getFirestore,
  getDocs,
  where,
  serverTimestamp,
  writeBatch,
  doc as firebaseDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import firebaseApp from "utils/firebase";
import { GroupedMessage, IChat, IMessage } from "interfaces/chat.interface";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { groupMessagesByDate } from "utils/groupMessageByDate";
import cls from "./chat.module.scss";
import { useTranslation } from "react-i18next";
import ChatForm from "./chatForm";
import Loading from "components/loader/loading";
import ChatMessages from "./chatMessages";

type Props = {
  title?: string;
  receiverId?: number;
  translateTitle?: boolean;
};

export default function ChatContainer({
  receiverId,
  title = "help.center",
  translateTitle = true,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const db = getFirestore(firebaseApp);
  const scroll = useRef<HTMLDivElement>(null);
  const isCreated = useRef(false);
  const [messages, setMessages] = useState<GroupedMessage[]>([]);
  const [chatId, setChatId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [repliedMessage, setRepliedMessage] = useState<IMessage | null>(null);
  const [editedMessage, setEditedMessage] = useState<IMessage | null>(null);

  const fetchChat = async () => {
    const chatsRef = collection(db, "chat");
    const q = query(
      chatsRef,
      where("ids", "array-contains-any", [user?.id, receiverId]),
      orderBy("time", "desc"),
    );
    await getDocs(q)
      .then(async (querySnapshot) => {
        const chats = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const isMine = data.ids.includes(user?.id);
          const isSameReceiver = data.ids.includes(receiverId);
          const actualData: IChat = {
            id: doc.id,
            ids: data.ids,
            time: data.time,
            lastMessage: data.lastMessage,
          };
          if (isMine && isSameReceiver) {
            return actualData;
          }
          return undefined;
        });
        const actualChat = chats.find(
          (chatItem) => typeof chatItem !== "undefined",
        );
        if (actualChat) {
          setChatId(actualChat.id);
        } else if (!isCreated.current) {
          isCreated.current = true;
          await addDoc(collection(db, "chat"), {
            ids: [user?.id, receiverId],
            time: serverTimestamp(),
          })
            .then((res) => {
              setChatId(res.id);
            })
            .catch(() => {
              isCreated.current = false;
            });
        }
      })
      .catch(async () => {
        isCreated.current = true;
        await addDoc(collection(db, "chat"), {
          ids: [user?.id, receiverId],
          time: serverTimestamp(),
        }).then((res) => {
          setChatId(res.id);
        });
      });

    scroll.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      fetchChat().catch(() => {
        setIsLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverId, user?.id]);

  const fetchMessages = async () => {
    if (chatId) {
      const q = query(collection(db, "chat", chatId, "message"));

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const fetchedMessages: IMessage[] = [];
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          const messageRef = doc.ref;
          const message = doc.data();
          fetchedMessages.push({
            id: doc.id,
            message: message.message,
            time: message.time,
            read: message.read,
            senderId: message.senderId,
            type: message.type,
            replyDocId: message.replyDocId,
            isLast: false,
          });

          if (message.senderId !== user?.id && !message.read) {
            batch.update(messageRef, {
              read: true,
            });
          }
        });
        fetchedMessages.sort((a, b) =>
          dayjs(a.time).isAfter(dayjs(b.time)) ? 1 : -1,
        );
        if (fetchedMessages[querySnapshot.size - 1]) {
          fetchedMessages[querySnapshot.size - 1].isLast = true;
        }
        const groupedMessages = groupMessagesByDate(fetchedMessages);
        setMessages(groupedMessages);
        setIsLoading(false);

        await batch.commit();
      });
      return () => {
        unsubscribe();
      };
    }
    return () => undefined;
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteMessage = useCallback(
    async (message: IMessage) => {
      if (chatId) {
        await deleteDoc(firebaseDoc(db, "chat", chatId, "message", message.id));
        const chatRef = firebaseDoc(db, "chat", chatId);

        const messageBeforeLastMessage = messages?.at(-1)?.messages?.at(-2);
        if (message.isLast) {
          await updateDoc(chatRef, {
            lastMessage: messageBeforeLastMessage
              ? messageBeforeLastMessage.message
              : "",
            time: serverTimestamp(),
          });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatId, messages],
  );

  return (
    <div className={cls.container}>
      <h1 className={cls.title}>{translateTitle ? t(title) : title}</h1>
      {isLoading && <Loading />}
      <ChatMessages
        onEdit={(message) => setEditedMessage(message)}
        onReply={(message) => setRepliedMessage(message)}
        messages={messages}
        onDelete={handleDeleteMessage}
        chatId={chatId}
        ref={scroll}
      />
      <ChatForm
        clearEditMessage={() => setEditedMessage(null)}
        clearReplyMessage={() => setRepliedMessage(null)}
        editedMessage={editedMessage}
        repliedMessage={repliedMessage}
        chatId={chatId}
      />
    </div>
  );
}
