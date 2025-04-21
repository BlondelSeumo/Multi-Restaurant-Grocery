import { useState } from "react";
import { ShopContext } from "./shop.context";
import { removeCookie, setCookie } from "utils/session";

export type Member = {
  uuid: string;
  cart_id: number;
  shop_id: number;
};

type Props = {
  children: any;
  memberState?: Member;
};

export function ShopProvider({ children, memberState }: Props) {
  const [member, setMember] = useState<Member | undefined>(memberState);

  function setMemberData(data: Member) {
    setCookie("member", JSON.stringify(data));
    setMember(data);
  }

  function clearMember() {
    removeCookie("member");
    setMember(undefined);
  }

  return (
    <ShopContext.Provider
      value={{
        isMember: Boolean(member),
        member,
        setMemberData,
        clearMember,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}
