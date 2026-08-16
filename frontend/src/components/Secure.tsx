import { useNavigate } from "react-router-dom";
import type { FC, PropsWithChildren } from "react";
import { useSession, useDescope } from "@descope/react-sdk";
import Layout from "./Layout";

type Role = "standard" | "admin";
type AllowedRoles = [Role];

type SecureProps = {
  // Accepted but not yet enforced — no caller currently passes this, and
  // there's no role-gating logic here yet to check it against.
  allowedRoles?: AllowedRoles;
};

const Secure: FC<PropsWithChildren<SecureProps>> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isSessionLoading, sessionToken } = useSession();
  const { logout } = useDescope();
  if (!isAuthenticated && !isSessionLoading) {
    console.warn("Detected unauthed user.");
    logout(sessionToken);
    navigate("/");
  }

  return <Layout>{children}</Layout>;
};

export default Secure;
