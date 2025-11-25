import { type FC, type PropsWithChildren } from "react";
import { UserContext } from "./UserContext";
import { useMe } from "../api/queryHooks";

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  // const { isLoading, data } = useApi<User>("GET", "/me", ["me"]);
  const { isLoading, data } = useMe();

  return (
    <UserContext
      value={{
        user: data,
        isLoading,
      }}
    >
      {children}
    </UserContext>
  );
};
