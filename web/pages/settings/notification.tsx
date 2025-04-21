import React from "react";
import SEO from "components/seo";
import SettingsContainer from "containers/settings/settings";
import NotificationSettings from "containers/notificationSettings/notificationSettings";
import { useQuery } from "react-query";
import profileService from "services/profile";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth/auth.context";

type Props = {};

export default function Notification({}: Props) {
  const { i18n } = useTranslation();
  const { isLoading: userIsLoading } = useAuth();
  const locale = i18n.language;

  const { data, isLoading } = useQuery(["notifications", locale], () =>
    profileService.getNotifications(),
  );

  return (
    <>
      <SEO />
      <SettingsContainer loading={isLoading || userIsLoading}>
        <NotificationSettings data={data?.data || []} />
      </SettingsContainer>
    </>
  );
}
