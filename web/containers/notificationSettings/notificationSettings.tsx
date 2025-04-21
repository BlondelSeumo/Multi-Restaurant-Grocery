import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import cls from "./notificationSettings.module.scss";
import SwitchInput from "components/inputs/switchInput";
import { INotification } from "interfaces";
import { useMutation } from "react-query";
import profileService from "services/profile";
import { error } from "components/alert/toast";
import useDidUpdate from "hooks/useDidUpdate";
import { useAuth } from "contexts/auth/auth.context";

type Props = {
  data: INotification[];
};

export default function NotificationSettings({ data }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const userNotifications = user?.notifications?.map((notification) => ({
    id: notification?.notification?.notification_id,
    active: Boolean(notification?.notification?.active),
  }));

  const notificationsData = data.map((dataItem) => {
    const userNotification = userNotifications?.find(
      (item) => item.id === dataItem.id,
    );
    if (userNotification) {
      return { ...dataItem, active: userNotification.active };
    }
    return { ...dataItem, active: false };
  });

  const [values, setValues] = useState<any>(notificationsData);

  const { mutate } = useMutation({
    mutationFn: (data: any) => profileService.updateNotifications(data),
    onError: () => {
      error(t("try_again"));
    },
  });

  useEffect(() => {
    setValues(notificationsData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, user]);

  useDidUpdate(() => {
    const notifications = values.map((item: any) => ({
      notification_id: item.id,
      active: Number(item.active),
    }));
    mutate({ notifications });
  }, [values]);

  const handleChange = (event: any) => {
    const notificationId = Number(event.target.name);

    setValues((prev: any) => {
      return prev.map((item: any) => {
        if (item.id === notificationId) {
          return { ...item, active: !item.active };
        }
        return item;
      });
    });
  };

  return (
    <div className={cls.wrapper}>
      <Grid container>
        <Grid item xs={12} md={8}>
          {values.map((item: { id: number; type: string; active: boolean }) => (
            <div key={item.id} className={cls.flex}>
              <div className={cls.text}>{t(item.type)}</div>
              <div className={cls.switch}>
                <SwitchInput
                  name={String(item.id)}
                  checked={item.active}
                  onChange={handleChange}
                />
                <div className={cls.value}>
                  {item.active ? t("on") : t("off")}
                </div>
              </div>
            </div>
          ))}
        </Grid>
      </Grid>
    </div>
  );
}
