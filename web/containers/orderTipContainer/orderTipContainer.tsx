import React, { useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import ModalContainer from "containers/modal/modal";
import MobileDrawer from "containers/drawer/mobileDrawer";
import Tip from "components/tip/tip";
import { Order, Payment } from "interfaces";
import { useQuery } from "react-query";
import paymentService from "services/payment";
import { useSettings } from "contexts/settings/settings.context";
import Loading from "components/loader/loading";

type Props = {
  open: boolean;
  onClose: () => void;
  data?: Order;
};

export default function OrderTipContainer({ open, onClose, data }: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { settings } = useSettings();

  const { data: payments, isLoading } = useQuery("payments", () =>
    paymentService.getAll(),
  );

  const { paymentType, paymentTypes } = useMemo(() => {
    let paymentTypesList: Payment[] =
      payments?.data?.filter((item) => item?.tag !== "cash") || [];
    let defaultPaymentType: Payment | undefined =
      paymentTypesList?.find((item) => item?.tag === "wallet") ||
      paymentTypesList[0];

    return {
      paymentType: defaultPaymentType,
      paymentTypes: paymentTypesList,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, data, payments]);

  if (isLoading) {
    return <Loading />;
  }

  if (isDesktop) {
    return (
      <ModalContainer open={open} onClose={onClose}>
        <Tip
          data={data}
          handleClose={onClose}
          paymentList={paymentTypes}
          payment={paymentType}
        />
      </ModalContainer>
    );
  } else {
    return (
      <MobileDrawer open={open} onClose={onClose}>
        <Tip
          data={data}
          handleClose={onClose}
          paymentList={paymentTypes}
          payment={paymentType}
        />
      </MobileDrawer>
    );
  }
}
