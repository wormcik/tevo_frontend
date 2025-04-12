import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import "./global.css";
import Ban from "./pages/Ban";
import Client from "./pages/Client";
import DemandCreate from "./pages/DemandCreate";
import LogSignIn from "./pages/LogSignIn";
import { checkUserAuth } from "./pages/Main.crud";
import Menu from "./pages/Menu";
import DemandHistory from "./pages/DemandHistory";
import DemandAll from "./pages/DemandAll";
import DemandSatisfy from "./pages/DemandSatisfy";
import Profile from "./pages/Profile";
import Graph from "./pages/Graph";

function App() {
  const [authInfo, setAuthInfo] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [role, setRole] = useState(null);
  useEffect(() => {
    const verifyAuth = async () => {
      if (!user?.userId) return setAuthInfo({ authorized: false });

      const res = await checkUserAuth(user.userId);
      if (res.data.state === false) {
        localStorage.removeItem("user");

        return setAuthInfo({ authorized: false });
      }
      if (res.data.state === true) {
        setAuthInfo({ role: res.data.model, authorized: true });
        setRole(res.data.model);
      }
    };

    verifyAuth();
  }, []);

  const hasAccess = (roles) =>
    authInfo?.authorized && roles.includes(authInfo?.role);

  if (!authInfo)
    return (
      <div className="text-center mt-10 text-blue-600">
        🔐 Yetki kontrol ediliyor...
      </div>
    );

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/giris" element={<LogSignIn />} />
          <Route path="/" element={<Navigate to="/menu" />} />
          <Route
            path="/menu"
            element={
              hasAccess(["Admin", "Seller", "Buyer"]) ? (
                <Menu role={authInfo?.role} />
              ) : (
                <Navigate to="/giris" />
              )
            }
          />
          <Route
            path="/musteri"
            element={
              hasAccess(["Admin", "Seller"]) ? (
                <Client />
              ) : (
                <Navigate to="/menu" />
              )
            }
          />
          <Route
            path="/yasak"
            element={
              hasAccess(["Admin", "Seller"]) ? <Ban /> : <Navigate to="/menu" />
            }
          />
          <Route
            path="/talepOlustur"
            element={
              hasAccess(["Admin", "Buyer"]) ? (
                <DemandCreate />
              ) : (
                <Navigate to="/menu" />
              )
            }
          />
          <Route
            path="/talepGecmisi"
            element={
              hasAccess(["Admin", "Buyer"]) ? (
                <DemandHistory />
              ) : (
                <Navigate to="/menu" />
              )
            }
          />
          <Route
            path="/tumTalepler"
            element={
              hasAccess(["Admin", "Seller"]) ? (
                <DemandAll />
              ) : (
                <Navigate to="/menu" />
              )
            }
          />
          <Route
            path="/talepKarsila"
            element={
              hasAccess(["Admin", "Seller"]) ? (
                <DemandSatisfy />
              ) : (
                <Navigate to="/menu" />
              )
            }
          />
          <Route
            path="/graph"
            element={
              hasAccess(["Admin", "Seller"]) ? (
                <Graph />
              ) : (
                <Navigate to="/menu" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              hasAccess(["Admin", "Seller", "Buyer"]) ? (
                <Profile />
              ) : (
                <Navigate to="/menu" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/menu" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
