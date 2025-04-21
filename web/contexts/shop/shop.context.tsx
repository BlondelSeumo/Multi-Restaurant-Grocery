import { createContext, useContext } from "react";
import { Member } from "./shop.provider";

type ShopContextType = {
  isMember: boolean;
  member?: Member;
  setMemberData: (data: Member) => void;
  clearMember: () => void;
};

export const ShopContext = createContext<ShopContextType>(
  {} as ShopContextType
);

export const useShop = () => useContext(ShopContext);
