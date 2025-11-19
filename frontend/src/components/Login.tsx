import { useNavigate } from "react-router-dom";
import { Descope, useUser, useSession } from "@descope/react-sdk";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isSessionLoading } = useSession()
  console.log("IS USER AUTHENTICATED:",isAuthenticated)
  return (
    <div className="root">
      <div>
        {!isAuthenticated && !isSessionLoading ? <div className="btn-container">
          <Descope
            flowId="sign-up-or-in"
            theme="dark"
            onSuccess={(e: any) => {
              console.log(e.detail.user.name);
              console.log(e.detail.user.email);
              navigate("/home");
            }}
            onError={(err: any) => {
              console.log("Error!", err);
              alert("Error: " + err.detail.message);
            }}
          />
        </div> : ''}
      </div>
    </div>
  );
}