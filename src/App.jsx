import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Intro from "./pages/Intro";
import Home from "./pages/Home";
import FindRides from "./pages/FindRides";
import PostRide from "./pages/PostRide";
import RequestRide from "./pages/RequestRide";
import Squads from "./pages/Squads";
import Safety from "./pages/Safety";
import MyRides from "./pages/MyRides";
import Login from "./pages/Login";
import RideDetails from "./pages/RideDetails";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/home" element={<Home />} />
        <Route path="/findrides" element={<FindRides />} />
        <Route path="/postride" element={<PostRide />} />
        <Route path="/request" element={<RequestRide />} />
        <Route path="/squads" element={<Squads />} />
  <Route path="/safety" element={<Safety />} />
        <Route path="/myrides" element={<MyRides />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ride/:id" element={<RideDetails />} />

<Route path="/chat/:id" element={<Chat />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}