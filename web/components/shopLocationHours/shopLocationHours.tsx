import React from "react";
import cls from "./shopLocationHours.module.scss";
import useLocale from "hooks/useLocale";
import { IShop } from "interfaces";
import Map from "components/map/map";
import MapPin2LineIcon from "remixicon-react/MapPin2LineIcon";
import PhoneLineIcon from "remixicon-react/PhoneLineIcon";
import { useDateHourFormat } from "utils/useDateHourFormat";

type Props = { data: IShop };

export default function ShopLocationHours({ data }: Props) {
  const { t } = useLocale();
  const { getFormatedHour } = useDateHourFormat();
  const location = {
    lat: Number(data?.location?.latitude) || 0,
    lng: Number(data?.location?.longitude) || 0,
  };

  return (
    <div className={cls.wrapper}>
      <h1 className={cls.title}>{t("location.hours")}</h1>
      <div className={cls.flex}>
        <div className={cls.aside}>
          <div className={cls.map}>
            <Map location={location} readOnly />
          </div>
        </div>
        <div className={cls.main}>
          <ul className={cls.list}>
            {data.shop_working_days?.map((item, idx) => (
              <li key={idx} className={cls.listItem}>
                <p>{t(item.day)}</p>
                <span>
                  {getFormatedHour(item.from?.replace("-", ":"))} -{" "}
                  {getFormatedHour(item.to?.replace("-", ":"))}
                </span>
                {item.disabled && <p>({t("closed")})</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={cls.row}>
        <MapPin2LineIcon />
        <span className={cls.text}>{data.translation?.address}</span>
      </div>
      <div className={cls.row}>
        <PhoneLineIcon />
        <a href={`tel:${data.phone}`} className={cls.text}>
          {data.phone}
        </a>
      </div>
    </div>
  );
}
