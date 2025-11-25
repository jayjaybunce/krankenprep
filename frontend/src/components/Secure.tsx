import { useNavigate } from "react-router-dom";
import type { FC, PropsWithChildren } from "react";
import { useUser, useSession, useDescope } from "@descope/react-sdk";
import Layout from "./Layout";

type Role = "standard" | "admin";
type AllowedRoles = [Role];

type SecureProps = {
  allowedRoles?: AllowedRoles;
};

const Secure: FC<PropsWithChildren<SecureProps>> = ({
  children,
  allowedRoles = [],
}) => {
  const navigate = useNavigate();
  const user = useUser();
  const { isAuthenticated, isSessionLoading, sessionToken } = useSession();
  const { logout } = useDescope();
  console.log(user);
  if (!isAuthenticated && !isSessionLoading) {
    console.warn("Detected unauthed user.");
    logout(sessionToken);
    navigate("/");
  }

  console.log("TO-DO: Implement Roles", allowedRoles);
  return <Layout>{children}</Layout>;
};

export default Secure;
