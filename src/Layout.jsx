import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import IntroAnimation from "@/components/IntroAnimation";
import { createPageUrl } from "./utils";
import {
  Home,
  Search,
  PlusCircle,
  Users,
  MessageSquare,
  Shield,
  Bell,
  Menu,
  X,
  Car
} from "lucide-react";

import IntroAnimation from "@/components/IntroAnimation";
import SOSButton from "@/components/SOSButton";
import { Button } from "@/components/ui/button";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
const [showIntro, setShowIntro] = useState(true);

useEffect(() => {
  const hasSeenIntro = localStorage.getItem("campusride_intro_seen");
  if (!hasSeenIntro) {
    setShowIntro(true);
  } else {
    setShowIntro(false);
  }
}, []);
if (showIntro) {
  return <IntroAnimation onComplete={handleIntroComplete} />;
}

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const location = useLocation();

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("campusride_intro_seen");
    setShowIntro(!hasSeenIntro);
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem("campusride_intro_seen", "true");
    setShowIntro(false);
  };

  // 🔔 REAL-TIME NOTIFICATIONS
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("to_user", "==", auth.currentUser.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotificationCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: "Home", icon: Home, page: "Home" },
    { name: "Find Rides", icon: Search, page: "FindRides" },
    { name: "Request Ride", icon: PlusCircle, page: "RequestRide" },
    { name: "Post Ride", icon: Car, page: "PostRide" },
    { name: "Safety", icon: Shield, page: "SafetyHub" },
    { name: "Squads", icon: Users, page: "Squads" },
    { name: "Community", icon: MessageSquare, page: "Community" },
  ];

  const isActive = (page) => currentPageName === page;

  if (currentPageName === "AdminDashboard") {
    return <>{children}</>;
  }

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-transparent via-cyan-500/5 to-pink-500/5" />

      {/* SOS Button */}
      <SOSButton />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-cyan-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <Car className="w-6 h-6 text-cyan-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              CampusRide
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-3">
            {navItems.map((item) => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                  isActive(item.page)
                    ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* 🔔 Notification Bell */}
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-cyan-400 hover:text-pink-400 transition" />

              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {notificationCount}
                </span>
              )}
            </div>

            {/* Guest Button */}
            <Button className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white hover:scale-105 transition">
              Guest Mode
            </Button>

            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* MOBILE NAV */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-cyan-500/20">
            <nav className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <main className="pt-20 pb-20">
        {children}
      </main>
    </div>
  );
}
