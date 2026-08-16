import { Descope, useSession } from "@descope/react-sdk";
import { useState, type FC } from "react";

type LoginProps = {
  redirectUrl?: string;
};

export const Login: FC<LoginProps> = ({ redirectUrl }) => {
  const { isAuthenticated, isSessionLoading } = useSession();
  // Descope's onError doesn't guarantee err.detail is populated (e.g. a
  // network-level failure has a different shape) — falling back to a fixed
  // message instead of reading err.detail.message directly avoids a second,
  // more confusing crash on top of the original sign-in failure.
  const [authError, setAuthError] = useState<string | null>(null);
  return (
    <div className="w-full flex h-full justify-center align-middle items-center">
      <div className="w-100 h-100">
        {!isAuthenticated && !isSessionLoading ? (
          <>
            <Descope
              flowId="sign-up-or-in"
              theme="dark"
              redirectUrl={redirectUrl ?? import.meta.env.VITE_REDIRECT_URL}
              onError={() => {
                setAuthError("We couldn't sign you in. Please try again.");
              }}
            />
            {authError && (
              <p className="text-sm text-rose-400 font-montserrat text-center mt-2">
                {authError}
              </p>
            )}
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Login;
