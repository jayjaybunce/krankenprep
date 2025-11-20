import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import { AuthProvider } from "@descope/react-sdk";
import Secure from "./components/Secure";
import { ThemeProvider } from "./context/ThemeProvider";

function App() {
  return (
    <>
      <AuthProvider projectId="P35frQ7r7as6OKIhaOvbggFpjyJh">
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/home"
                element={
                  <Secure>
                    <div className="flex h-full w-full items-center justify-center">
                      <h1 className="text-white text-2xl">In construction</h1>
                    </div>
                  </Secure>
                }
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
