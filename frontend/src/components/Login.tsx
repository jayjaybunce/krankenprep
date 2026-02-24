import { Descope, useSession } from "@descope/react-sdk";
import type { FC } from "react";

type LoginProps = {
  redirectUrl?: string;
};

export const Login: FC<LoginProps> = ({ redirectUrl }) => {
  const { isAuthenticated, isSessionLoading } = useSession();
  return (
    <div className="w-full flex h-full justify-center align-middle items-center">
      <div className="w-100 h-100">
        {!isAuthenticated && !isSessionLoading ? (
          <Descope
            flowId="sign-up-or-in"
            theme="dark"
            redirectUrl={redirectUrl ?? import.meta.env.VITE_REDIRECT_URL}
            // onSuccess={(e: any) => {
            //   console.log(e.detail.user.name);
            //   console.log(e.detail.user.email);
            //   navigate("/home");
            // }}
            onError={(err: any) => {
              console.log("Error!", err);
              alert("Error: " + err.detail.message);
            }}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Login;
