import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import { AuthProvider } from "@descope/react-sdk";
import Secure from './components/Secure'
import Home from './components/Home'

function App() {
  return (
    <>
      <AuthProvider projectId="P35frQ7r7as6OKIhaOvbggFpjyJh">
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path='/home' element={<Secure><Home/></Secure>} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;