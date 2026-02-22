import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@descope/react-sdk";

import { ThemeProvider } from "./context/ThemeProvider";
import { UserProvider } from "./context/UserProvider";
import Home from "./components/Pages/Home";
import { Prep } from "./components/Pages/Prep";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TeamProvider } from "./context/TeamProvider";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Layout from "./components/Layout";
import Plans from "./components/Pages/Plans";
import Plan from "./components/Pages/Plan";
import RedeemInvite from "./components/Pages/RedeemInvite";
import Team from "./components/Pages/Team";

function App() {
  const queryClient = new QueryClient();
  console.log("Using backend url", import.meta.env.VITE_BACKEND_URL);
  return (
    <>
      <AuthProvider projectId="P35frQ7r7as6OKIhaOvbggFpjyJh">
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <ThemeProvider>
              <TeamProvider>
                <DndProvider backend={HTML5Backend}>
                  <Router>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/plan/*" element={<Plan />} />
                        <Route path="/plans" element={<Plans />} />
                        <Route path="/prep/*" element={<Prep />} />
                        {/* <Route path="/prep/:bossId" element={<Prep />} />
                        <Route
                          path="/prep/:bossId/section/:sectionId"
                          element={<Prep />}
                        />
                        <Route
                          path="/prep/:bossId/section/:sectionId/note/:noteId"
                          element={<Prep />}
                        /> */}
                        <Route path="/invite" element={<RedeemInvite />} />
                        <Route path="/team/*" element={<Team />} />
                      </Routes>
                    </Layout>
                  </Router>
                </DndProvider>
              </TeamProvider>
            </ThemeProvider>
          </UserProvider>
        </QueryClientProvider>
      </AuthProvider>
    </>
  );
}

export default App;
