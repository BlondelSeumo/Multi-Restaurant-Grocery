import React from "react";
import { CircularProgress } from "@mui/material";

type Props = {
  size?: number;
  clsnm?: any;
};

export default function CartButtonLoader({ size, clsnm }: Props) {
  return (
    <div className={clsnm}>
      <CircularProgress size={size} />
    </div>
  );
}
