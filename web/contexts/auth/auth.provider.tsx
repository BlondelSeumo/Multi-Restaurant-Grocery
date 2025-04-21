//@ts-nocheck
import { Reducer, useReducer } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "services/firebase";
import { AuthContext } from "./auth.context";
import { removeCookie, setCookie } from "utils/session";
import { useSettings } from "contexts/settings/settings.context";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { clearUserCart } from "redux/slices/userCart";
import { clearCart } from "redux/slices/cart";
import { clearLikedProducts } from "redux/slices/favoriteProducts";
import { clearFilter } from "redux/slices/shopFilter";
import { useQuery } from "react-query";
import profileService from "services/profile";
import { IUser } from "interfaces/user.interface";
import { clearSearch } from "redux/slices/search";
import { selectCurrency } from "redux/slices/currency";
import { RecaptchaVerifier } from "firebase/auth";
import { useBranch } from "contexts/branch/branch.context";

enum AuthActionKind {
  SIGN_IN = "SIGN_IN",
  LOGOUT = "LOGOUT",
}

interface AuthAction {
  type: AuthActionKind;
  payload: IUser;
}

function reducer(state: IUser, action: AuthAction): IUser | null {
  const { type, payload } = action;
  switch (type) {
    case AuthActionKind.SIGN_IN:
      setCookie("user", JSON.stringify(payload));
      return payload;
    case AuthActionKind.LOGOUT:
      removeCookie("access_token");
      setCookie("user", null);
      return null;
    default:
      return state;
  }
}

type Props = {
  children: any;
  authState: IUser;
};

export function AuthProvider({ children, authState }: Props) {
  const [user, authDispatch] = useReducer<Reducer<IUser, AuthAction>>(
    reducer,
    authState,
  );
  const { resetSettings } = useSettings();
  const { resetBranch } = useBranch();
  const dispatch = useAppDispatch();
  const currency = useAppSelector(selectCurrency);

  const { refetch, isLoading } = useQuery(
    ["profile", currency?.id],
    () => profileService.get({ currency_id: currency?.id }),
    {
      enabled: Boolean(user?.id),
      onSuccess: (data) =>
        authDispatch({ type: AuthActionKind.SIGN_IN, payload: data.data }),
    },
  );

  function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  }

  function facebookSignIn() {
    const facebookAuthProvider = new FacebookAuthProvider();
    return signInWithPopup(auth, facebookAuthProvider);
  }

  function appleSignIn() {
    const appleAuthProvider = new OAuthProvider("apple.com");
    return signInWithPopup(auth, appleAuthProvider);
  }

  function phoneNumberSignIn(phoneNumber) {
    const appVerifier = new RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: () => {
          console.log("Callback!");
        },
      },
      auth,
    );
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  }

  function setUserData(data: any) {
    authDispatch({ type: AuthActionKind.SIGN_IN, payload: data });
  }

  function logout() {
    authDispatch({ type: AuthActionKind.LOGOUT });
    resetSettings();
    resetBranch();
    dispatch(clearUserCart());
    dispatch(clearCart());
    dispatch(clearLikedProducts());
    dispatch(clearFilter());
    dispatch(clearSearch());
  }

  return (
    <AuthContext.Provider
      value={{
        googleSignIn,
        facebookSignIn,
        appleSignIn,
        user,
        setUserData,
        isAuthenticated: Boolean(user?.id),
        logout,
        refetchUser: refetch,
        phoneNumberSignIn,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
