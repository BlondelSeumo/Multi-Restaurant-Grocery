import { useSettings } from "contexts/settings/settings.context";
import dayjs from "dayjs";

export const useDateHourFormat = () => {
  const { settings } = useSettings();

  const dateFormat = "DD-MM-YYYY";
  const hourFormat = settings?.hour_format || "HH:mm";

  const getFormatedHour = (hour?: string) => {
    if (hour) {
      return dayjs(`${dayjs().format("YYYY-MM-DD")} ${hour}`).format(
        hourFormat,
      );
    }
    return hour;
  };

  const getDeliveryTime = (deliveryTime?: string) => {
    if (typeof deliveryTime === "string" && deliveryTime?.includes("-")) {
      const [from, to] = deliveryTime.split("-");
      return `${getFormatedHour(from)} - ${getFormatedHour(to)}`;
    }
    return getFormatedHour(deliveryTime);
  };

  return {
    dateFormat,
    hourFormat,
    dateHourFormat: `${dateFormat} ${hourFormat}`,
    getFormatedHour,
    getDeliveryTime,
  };
};
