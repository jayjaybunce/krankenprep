import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@descope/react-sdk";

import { ThemeProvider } from "./context/ThemeProvider";
import { UserProvider } from "./context/UserProvider";
import { Home } from "./components/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TeamProvider } from "./context/TeamProvider";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <AuthProvider projectId="P35frQ7r7as6OKIhaOvbggFpjyJh">
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <ThemeProvider>
              <TeamProvider>
                <DndProvider backend={HTML5Backend}>
                  <Router>
                    <Routes>
                      <Route path="/" element={<Home />} />
                    </Routes>
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
