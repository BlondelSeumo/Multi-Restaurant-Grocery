import { useReducer } from "react";
import { BranchContext } from "./branch.context";
import { removeCookie, setCookie } from "utils/session";
import { IShop } from "interfaces";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";

enum BranchActionKind {
  UPDATE = "UPDATE_BRANCH",
  RESET = "RESET_BRANCH",
}

interface BranchAction {
  type: BranchActionKind;
  payload: any;
}

interface BranchState {
  branch?: IShop;
}

function reducer(state: BranchState, action: BranchAction) {
  const { type, payload } = action;
  switch (type) {
    case BranchActionKind.UPDATE:
      setCookie("branch", JSON.stringify(payload));
      return {
        ...state,
        branch: payload,
      };
    case BranchActionKind.RESET:
      removeCookie("branch");
      return {};
    default:
      return state;
  }
}

type Props = {
  children: any;
  branchState?: IShop;
};

export function BranchProvider({ children, branchState }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    branch: branchState,
  });

  const { workingSchedule, isShopClosed, isOpen } = useShopWorkingSchedule(
    state.branch
  );

  function updateBranch(data?: IShop) {
    dispatch({ type: BranchActionKind.UPDATE, payload: data });
  }

  function resetBranch() {
    dispatch({ type: BranchActionKind.RESET, payload: null });
  }

  return (
    <BranchContext.Provider
      value={{
        branch: state?.branch,
        updateBranch,
        resetBranch,
        workingSchedule,
        isShopClosed,
        isOpen,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}
