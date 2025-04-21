import {
  CreateMessageBody,
  IMessage,
  MessageType,
} from "interfaces/chat.interface";
import cls from "./chatForm.module.scss";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import {
  collection,
  getFirestore,
  serverTimestamp,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import firebaseApp from "utils/firebase";
import { useAuth } from "contexts/auth/auth.context";
import { error } from "components/alert/toast";
import SendPlaneFillIcon from "remixicon-react/SendPlaneFillIcon";
import ImageAddFillIcon from "remixicon-react/ImageAddFillIcon";
import VerticalLine from "components/line/verticalLine";
import React, { useEffect, useRef } from "react";
import { useMutation } from "react-query";
import galleryService from "services/gallery";
import { CircularProgress } from "@mui/material";
import ChatRepliedMessage from "./chatRepliedMessage";
import CloseLineIcon from "remixicon-react/CloseLineIcon";

type Props = {
  chatId?: string;
  editedMessage: IMessage | null;
  repliedMessage: IMessage | null;
  clearEditMessage: () => void;
  clearReplyMessage: () => void;
};

type FormData = {
  message: string;
  type?: string;
};

export default function ChatForm({
  chatId,
  editedMessage,
  repliedMessage,
  clearEditMessage,
  clearReplyMessage,
}: Props) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadImage, isLoading: isUploadingImage } = useMutation({
    mutationFn: (body: any) => galleryService.upload(body),
    onSuccess: async (res) => {
      await handleSendMessage({ message: res.data.title, type: "image" });
    },
    onError: () => {
      error(t("failed.to.upload"));
    },
  });

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { files } = e.target;

    if (files?.length) {
      const imagesForm = new FormData();
      // @ts-ignore
      [...files].forEach((file) => {
        if (file) {
          imagesForm.append("image", file, file.name);
        }
      });
      imagesForm.append("type", "users");
      uploadImage(imagesForm);
      e.target.value = "";
    }
  };

  const handleSendMessage = async (data: FormData) => {
    if (chatId) {
      formik.resetForm();
      const db = getFirestore(firebaseApp);
      const chatRef = doc(db, "chat", chatId);
      if (editedMessage) {
        clearEditMessage();
        await updateDoc(doc(db, "chat", chatId, "message", editedMessage.id), {
          message: data.message,
        });
        if (editedMessage.isLast) {
          await updateDoc(chatRef, {
            lastMessage: data.message,
            time: serverTimestamp(),
          });
        }
      } else {
        await updateDoc(chatRef, {
          lastMessage: data.message,
          time: serverTimestamp(),
        });
        const body: CreateMessageBody = {
          read: false,
          time: new Date().toISOString(),
          message: data.message,
          senderId: user?.id,
        };
        if (data.type) {
          body.type = data.type as MessageType;
        }
        if (repliedMessage) {
          body.replyDocId = repliedMessage.id;
          clearReplyMessage();
        }
        await addDoc(collection(db, "chat", chatId, "message"), body);
      }
    } else {
      error(t("chat.is.not.created"));
    }
  };

  const formik = useFormik({
    initialValues: {
      message: "",
      type: "",
    },
    validate: (values) => {
      const errors: { message?: string } = {};
      if (!values.message) {
        errors.message = "required";
      }
      return errors;
    },
    onSubmit: (values) => {
      handleSendMessage(values);
    },
  });

  const handleClearEditMessage = () => {
    clearEditMessage();
    formik.setFieldValue("message", "");
  };

  useEffect(() => {
    if (editedMessage?.message) {
      formik.setFieldValue("message", editedMessage.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedMessage?.message]);

  return (
    <div className={cls.container}>
      {repliedMessage && (
        <ChatRepliedMessage
          data={repliedMessage}
          inProgress
          onClear={clearReplyMessage}
        />
      )}
      {editedMessage && (
        <div className={cls.editMessage}>
          <div className={cls.body}>
            <span className={cls.label}>{t("editing")}</span>
            <span className={cls.message}>{editedMessage.message}</span>
          </div>
          <button type="button" onClick={handleClearEditMessage}>
            <CloseLineIcon size={20} />
          </button>
        </div>
      )}
      <form id="chatForm" onSubmit={formik.handleSubmit}>
        <div className={cls.form}>
          <input
            ref={fileInputRef}
            onChange={handleUpload}
            type="file"
            accept="image/png, image/jpg, image/jpeg, image/webp"
            hidden
            disabled={isUploadingImage || !isAuthenticated}
          />
          <input
            className={cls.input}
            placeholder={t(isAuthenticated ? "type.here" : "login.to.chat")}
            name="message"
            onChange={formik.handleChange}
            value={formik.values.message}
            autoComplete="off"
            disabled={isUploadingImage || !isAuthenticated}
          />
          <div className={cls.action}>
            <button
              type="button"
              className={cls.actionBtn}
              onClick={() => {
                if (!isUploadingImage) {
                  fileInputRef.current?.click();
                }
              }}
              disabled={isUploadingImage || !isAuthenticated}
            >
              {isUploadingImage ? (
                <CircularProgress size={18} />
              ) : (
                <ImageAddFillIcon size={24} />
              )}
            </button>
            <VerticalLine color="var(--border-color)" height="20px" />
            <button
              type="submit"
              className={cls.actionBtn}
              disabled={isUploadingImage || !isAuthenticated}
            >
              <SendPlaneFillIcon size={24} />
            </button>
          </div>
          {!!formik.errors?.message && (
            <span className={cls.error}>{t(formik.errors?.message)}</span>
          )}
        </div>
      </form>
    </div>
  );
}
