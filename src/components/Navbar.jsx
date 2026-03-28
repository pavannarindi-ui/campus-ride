import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const navItems = [
    { name: "Home", path: "/home" },
    { name: "Find Rides", path: "/findrides" },
    { name: "Post Ride", path: "/postride" },
    { name: "Request Ride", path: "/request" },
    { name: "Squads", path: "/squads" },
    { name: "My Rides", path: "/myrides" },
    { name: "Safety", path: "/safety" }
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (

    <nav className="w-full bg-black border-b border-cyan-500/20 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/home">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            🚗 Campus Ride
          </h1>
        </Link>

        {/* CENTER NAV ITEMS */}
        <div className="flex items-center gap-8">

          {navItems.map((item) => (

            <Link key={item.path} to={item.path}>

              <span
                className={`text-sm font-semibold transition ${
                  location.pathname === item.path
                    ? "text-cyan-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.name}
              </span>

            </Link>

          ))}

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* PROFILE BUTTON (NORMAL STYLE) */}
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
          >
            Profile
          </button>

          {/* LOGIN / LOGOUT */}
          {user ? (

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition text-white"
            >
              Logout
            </button>

          ) : (

            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition text-white"
            >
              Login
            </button>

          )}

        </div>

      </div>

    </nav>

  );

}