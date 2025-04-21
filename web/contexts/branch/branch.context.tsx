import { IShop } from "interfaces";
import { createContext, useContext } from "react";
import { ShopWorkingDays } from "interfaces";

type BranchContextType = {
  branch?: IShop;
  updateBranch: (data?: IShop) => void;
  resetBranch: () => void;
  workingSchedule: ShopWorkingDays;
  isShopClosed: boolean;
  isOpen: boolean;
};

export const BranchContext = createContext<BranchContextType>(
  {} as BranchContextType
);

export const useBranch = () => useContext(BranchContext);
