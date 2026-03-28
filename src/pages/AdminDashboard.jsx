import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  LayoutDashboard,
  Car,
  Users,
  AlertTriangle,
  Shield,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Leaf,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.role !== "admin") {
        navigate(createPageUrl("Home"));
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: rides = [] } = useQuery({
    queryKey: ["admin-rides"],
    queryFn: () => base44.entities.Ride.list("-created_date", 100),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list("-created_date", 100),
  });

  const { data: sosAlerts = [] } = useQuery({
    queryKey: ["admin-sos"],
    queryFn: () => base44.entities.SOSAlert.filter({ status: "active" }, "-created_date", 50),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => base44.entities.Booking.list("-created_date", 100),
  });

  // Calculate stats
  const totalRides = rides.length;
  const activeRides = rides.filter(r => r.status === "scheduled" || r.status === "in_progress").length;
  const completedRides = rides.filter(r => r.status === "completed").length;
  const totalUsers = users.length;
  const verifiedDrivers = users.filter(u => u.is_driver && u.verification_status?.license_verified).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const carbonSaved = users.reduce((sum, u) => sum + (u.carbon_saved || 0), 0);

  // Mock chart data
  const ridesTrendData = [
    { name: "Mon", rides: 45 },
    { name: "Tue", rides: 52 },
    { name: "Wed", rides: 48 },
    { name: "Thu", rides: 61 },
    { name: "Fri", rides: 55 },
    { name: "Sat", rides: 72 },
    { name: "Sun", rides: 68 },
  ];

  const rideTypeData = [
    { name: "Intercity", value: rides.filter(r => r.ride_type === "intercity").length || 40 },
    { name: "Local", value: rides.filter(r => r.ride_type === "local").length || 35 },
    { name: "Squad", value: rides.filter(r => r.ride_type === "squad").length || 25 },
  ];

  const COLORS = ["#10b981", "#06b6d4", "#8b5cf6"];

  const StatCard = ({ title, value, icon: Icon, trend, color, subtext }) => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-20 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
            <span className="text-emerald-500 font-medium">{trend}</span>
            <span className="text-slate-400 ml-1">vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 p-6 hidden lg:block">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900">CampusRide</h1>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { icon: LayoutDashboard, label: "Overview", value: "overview" },
            { icon: Car, label: "Rides", value: "rides" },
            { icon: Users, label: "Users", value: "users" },
            { icon: AlertTriangle, label: "SOS Alerts", value: "alerts", badge: sosAlerts.length },
            { icon: Shield, label: "Verifications", value: "verifications" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.value
                  ? "bg-emerald-50 text-emerald-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {item.badge > 0 && (
                <Badge className="bg-red-500 text-white">{item.badge}</Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "rides" && "Ride Management"}
                {activeTab === "users" && "User Management"}
                {activeTab === "alerts" && "SOS Alerts"}
                {activeTab === "verifications" && "Verification Requests"}
              </h2>
              <p className="text-sm text-slate-500">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {sosAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {sosAlerts.length}
                  </span>
                )}
              </Button>
              <Avatar>
                <AvatarFallback className="bg-emerald-500 text-white">
                  {user.full_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Rides"
                  value={totalRides}
                  icon={Car}
                  color="bg-emerald-500"
                  trend="+12%"
                  subtext={`${activeRides} active`}
                />
                <StatCard
                  title="Total Users"
                  value={totalUsers}
                  icon={Users}
                  color="bg-cyan-500"
                  trend="+8%"
                  subtext={`${verifiedDrivers} verified drivers`}
                />
                <StatCard
                  title="Revenue"
                  value={`₹${totalRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  color="bg-violet-500"
                  trend="+15%"
                />
                <StatCard
                  title="CO₂ Saved"
                  value={`${carbonSaved}kg`}
                  icon={Leaf}
                  color="bg-green-500"
                  trend="+20%"
                />
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Rides This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={ridesTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="rides"
                          stroke="#10b981"
                          fill="#10b98120"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Ride Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={rideTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {rideTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                      {rideTypeData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                          <span className="text-sm text-slate-600">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active SOS Alerts */}
              {sosAlerts.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      Active SOS Alerts ({sosAlerts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sosAlerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl bg-red-50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{alert.user_name}</p>
                              <p className="text-sm text-slate-500">
                                {alert.alert_type} • {format(new Date(alert.created_date), "h:mm a")}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" className="bg-red-500 hover:bg-red-600">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Rides */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Rides</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("rides")}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Passengers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rides.slice(0, 5).map((ride) => (
                        <TableRow key={ride.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{ride.driver_name?.[0]}</AvatarFallback>
                              </Avatar>
                              {ride.driver_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{ride.origin}</p>
                              <p className="text-slate-400">→ {ride.destination}</p>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(ride.departure_time), "MMM d, h:mm a")}</TableCell>
                          <TableCell>
                            <Badge className={
                              ride.status === "scheduled" ? "bg-emerald-100 text-emerald-700" :
                              ride.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                              ride.status === "completed" ? "bg-slate-100 text-slate-700" :
                              "bg-red-100 text-red-700"
                            }>
                              {ride.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{ride.passengers?.length || 0}/{ride.total_seats}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Rides Tab */}
          {activeTab === "rides" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>All Rides</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Search rides..." className="pl-9 w-64" />
                      </div>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ride ID</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rides.map((ride) => (
                        <TableRow key={ride.id}>
                          <TableCell className="font-mono text-xs">{ride.id?.slice(0, 8)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{ride.driver_name?.[0]}</AvatarFallback>
                              </Avatar>
                              {ride.driver_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-xs truncate">
                              {ride.origin} → {ride.destination}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ride.ride_type}</Badge>
                          </TableCell>
                          <TableCell>{format(new Date(ride.departure_time), "MMM d, h:mm a")}</TableCell>
                          <TableCell>
                            <Badge className={
                              ride.status === "scheduled" ? "bg-emerald-100 text-emerald-700" :
                              ride.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                              ride.status === "completed" ? "bg-slate-100 text-slate-700" :
                              "bg-red-100 text-red-700"
                            }>
                              {ride.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{ride.passengers?.length || 0}/{ride.total_seats}</TableCell>
                          <TableCell>₹{(ride.passengers?.length || 0) * ride.price_per_seat}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Contact Driver</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Cancel Ride</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>All Users</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Search users..." className="pl-9 w-64" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Rides</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={u.profile_photo} />
                                <AvatarFallback>{u.full_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{u.full_name}</p>
                                <p className="text-xs text-slate-400">{u.university}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.phone || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {u.is_driver && <Badge className="bg-emerald-100 text-emerald-700">Driver</Badge>}
                              {u.role === "admin" && <Badge className="bg-violet-100 text-violet-700">Admin</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {u.verification_status?.email_verified && (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              )}
                              {u.verification_status?.phone_verified && (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              )}
                              {u.verification_status?.campus_id_verified && (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              )}
                              {u.verification_status?.license_verified && (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{u.rating || 5.0}</TableCell>
                          <TableCell>{u.total_rides || 0}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Verify Documents</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* SOS Alerts Tab */}
          {activeTab === "alerts" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    SOS Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sosAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {sosAlerts.map((alert) => (
                        <div key={alert.id} className="p-4 rounded-xl bg-red-50 border border-red-100">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">{alert.user_name}</h4>
                                <p className="text-sm text-slate-500 mb-2">
                                  {alert.alert_type?.toUpperCase()} • {format(new Date(alert.created_date), "MMM d, h:mm a")}
                                </p>
                                {alert.location && (
                                  <p className="text-sm text-slate-600">
                                    📍 {alert.location.address || `${alert.location.lat}, ${alert.location.lng}`}
                                  </p>
                                )}
                                {alert.notes && (
                                  <p className="text-sm text-slate-600 mt-2">{alert.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Contact</Button>
                              <Button size="sm" className="bg-red-500 hover:bg-red-600">
                                Resolve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">All Clear!</h3>
                      <p className="text-slate-500">No active SOS alerts at the moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Verifications Tab */}
          {activeTab === "verifications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Pending Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Pending Verifications</h3>
                    <p className="text-slate-500">All verification requests have been processed</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}