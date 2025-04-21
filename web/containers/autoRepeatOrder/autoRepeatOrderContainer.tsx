import { useMediaQuery } from "@mui/material";
import ModalContainer from "containers/modal/modal";
import MobileDrawer from "containers/drawer/mobileDrawer";
import AutoRepeatOrder from "components/autoRepeatOrder/autoRepeatOrder";
import { useRouter } from "next/router";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AutoRepeatOrderContainer({ open, onClose }: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { query } = useRouter();
  const orderId = Number(query.id);

  if (isDesktop) {
    return (
      <ModalContainer open={open} onClose={onClose}>
        <AutoRepeatOrder orderId={orderId} onClose={onClose} />
      </ModalContainer>
    );
  }
  return (
    <MobileDrawer open={open} onClose={onClose}>
      <AutoRepeatOrder orderId={orderId} onClose={onClose} />
    </MobileDrawer>
  );
}
