import React from "react";
import Map from "components/map/map";
import { Order } from "interfaces";
import cls from "./orderMap.module.scss";
import { Skeleton } from "@mui/material";

type Props = {
  data?: Order;
  loading?: boolean;
};

export default function OrderMap({ data, loading = false }: Props) {
  const location = {
    lat: Number(data?.location?.latitude) || 0,
    lng: Number(data?.location?.longitude) || 0,
  };
  const shops = data ? [data.shop] : undefined;

  return (
    <div className={cls.wrapper}>
      {!loading ? (
        <Map
          location={location}
          readOnly
          shops={data?.delivery_type === "pickup" ? undefined : shops}
        />
      ) : (
        <Skeleton variant="rectangular" className={cls.shimmer} />
      )}
    </div>
  );
}
