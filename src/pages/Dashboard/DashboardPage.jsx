import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Skeleton,
} from "@mui/material";
import {
  Assessment,
  AttachMoney,
  Group,
  TrendingUp,
  MoreVert,
  ArrowUpward,
  CalendarToday,
  CheckCircle,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShoppingCart,
} from "@mui/icons-material";
import { getDashboardOverview } from "../../api/dashboard.api";

// Recharts Components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Simple metric card component
const MetricCard = ({ title, value, change, trend, icon, color, loading }) => (
  <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
    <CardContent>
      {loading ? (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ flex: 1 }}>
            <Skeleton width="50%" height={18} />
            <Skeleton width="60%" height={32} sx={{ mt: 1 }} />
            <Skeleton width="80%" height={18} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="rounded" width={40} height={40} />
        </Stack>
      ) : (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" variant="body2" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
              {value}
            </Typography>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ mt: 1 }}
            >
              {trend === "up" ? (
                <ArrowUpward sx={{ fontSize: 16, color: "#4caf50" }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: "#f44336" }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: trend === "up" ? "#4caf50" : "#f44336",
                  fontWeight: 600,
                }}
              >
                {change}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs last month
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}15`,
              p: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>
      )}
    </CardContent>
  </Card>
);

// Additional cards for Masonry layout
const MasonryCard = ({ title, content, icon, color, height }) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: 2,
      height: height || "auto",
      minWidth: 0,
    }}
  >
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Box sx={{ color: color, display: "flex" }}>{icon}</Box>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </Stack>
      {content}
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("30d");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // keep console clean in production

 useEffect(() => {
  let isMounted = true;

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardRes = await getDashboardOverview(timeRange);

      if (!isMounted) return;

      setDashboardData(dashboardRes);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchAllDashboardData();

  return () => {
    isMounted = false;
  };
}, [timeRange]);


  const activeUsersChart =
    dashboardData?.data?.activeUsersChart?.map((row) => ({
      period: row.period,
      users: Number(row.count || 0),
    })) || [];

  const statsData = dashboardData?.data?.stats || {};
  const totalRevenue = Number(statsData.totalRevenue || 0);
  const recentOrders = dashboardData?.data?.recentOrders || [];

  const salesData = [
    {
      category: "Inward",
      "Value (INR)": dashboardData?.data?.inwardChallanCount ?? 0,
      // Transactions: 48,
    },
    {
      category: "Issued",
      "Value (INR)": dashboardData?.data?.issueMaterialCount ?? 0,
      // Transactions: 36,
    },
    {
      category: "Consumed",
      "Value (INR)": dashboardData?.data?.consumptionCount ?? 0,
      // Transactions: 29,
    },
    {
      category: "Returned",
      "Value (INR)": dashboardData?.data?.returnMaterialCount ?? 0,
      // Transactions: 11,
    },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: "+12%",
      trend: "up",
      icon: <AttachMoney sx={{ color: "#1976d2" }} />,
      color: "#1976d2",
    },
    {
      title: "Customers",
      value: statsData.customers ?? 0,
      change: "+8%",
      trend: "up",
      icon: <Group sx={{ color: "#4caf50" }} />,
      color: "#4caf50",
    },
    {
      title: "Orders",
      value: statsData.orders ?? 0,
      change: "+4%",
      trend: "up",
      icon: <Assessment sx={{ color: "#ff9800" }} />,
      color: "#ff9800",
    },
    {
      title: "Inventory",
      value: statsData.inventory ?? 0,
      change: "+3%",
      trend: "up",
      icon: <TrendingUp sx={{ color: "#9c27b0" }} />,
      color: "#9c27b0",
    },
  ];

  // Other activities
  const activities = [
    {
      icon: <CheckCircle sx={{ color: "#4caf50" }} />,
      title: "New Orders",
      time: "Just now",
      path: "/O2C/OrderBooking",
    },
    {
      icon: <CalendarToday sx={{ color: "#1976d2" }} />,
      title: "Warehouses",
      time: "2 hours ago",
      path: "/Master/Warehouses",
    },
    {
      icon: <Group sx={{ color: "#ff9800" }} />,
      title: "Inventory Count",
      time: "Yesterday",
      path: "/Transition/InventoryCount",
    },
    {
      icon: <Assessment sx={{ color: "#9c27b0" }} />,
      title: "Item Groups",
      time: "2 days ago",
      path: "/Master/ItemsGroups",
    },
  ];

  const masonryItems = [
    {
      title: "Recent Orders",
      icon: <ShoppingCart sx={{ color: "#ff9800" }} />,
      color: "#ff9800",
      height: 400,
      content: loading ? (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} height={24} />
          ))}
        </Stack>
      ) : (
        <List sx={{ py: 0 }}>
          {recentOrders.slice(0, 6).map((order, index) => (
            <ListItem key={order.id || index} sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary={`Order ${order.tranditionId} - ₹${order.finalRate}`}
                primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              />
              <Chip label="Paid" size="small" color="success" />
            </ListItem>
          ))}
          <Button size="medium" onClick={() => navigate("/O2C/OrderBooking")}>
            View All
          </Button>
        </List>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1500, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Dashboard
            </Typography>
            <Typography color="text.secondary">
              Welcome back! Here's what's happening today.
            </Typography>
          </Box>

          <Stack direction="row" spacing={3} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Stats Grid using Box instead of Grid v1 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 1,
            mb: 2,
          }}
        >
          {stats.map((stat, index) => (
            <Box key={index}>
              <MetricCard {...stat} loading={loading} />
            </Box>
          ))}
        </Box>

        {/* Charts Row using Box instead of Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "2fr 1fr",
            },
            gap: 1,
            mb: 2,
          }}
        >
          {/* Revenue Chart */}
          <Box>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                height: "90%",
                width: "100%",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Active Users
                  </Typography>
                  <Chip label="Last 7 months" size="small" />
                </Box>
                <Box sx={{ height: 350, minWidth: 0, minHeight: 320 }}>
                  {loading ? (
                    <Skeleton variant="rectangular" height={320} />
                  ) : activeUsersChart.length === 0 ? (
                    <Typography color="text.secondary">
                      No data available.
                    </Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={activeUsersChart}>
                        <defs>
                          <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1976d2" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#1976d2" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="period" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stackId="1"
                          stroke="#1976d2"
                          strokeWidth={2.5}
                          fill="url(#usersGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Task Progress */}
          <Box>
            <Stack spacing={3}>
              {masonryItems.map((item, index) => (
                <MasonryCard
                  key={index}
                  title={item.title}
                  icon={item.icon}
                  color={item.color}
                  height={item.height}
                  content={item.content}
                />
              ))}
            </Stack>
          </Box>
        </Box>

        {/* MASONRY SECTION */}
        <Box sx={{ mb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h5" fontWeight={500}>
              Overview Cards
            </Typography>
          </Box>
        </Box>
        {dashboardData && (
          <Typography variant="body2" color="text.secondary"></Typography>
        )}

        {/* Second Charts Row using Box */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "2fr 1fr",
            },
            gap: 1,
            mb: 2,
          }}
        >
          {/* Sales Chart */}
          <Box width={"100%"}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Material Movement Summary
                </Typography>
                <Box sx={{ height: 400, minWidth: 0, minHeight: 360 }}>
                  {loading ? (
                    <Skeleton variant="rectangular" height={360} />
                  ) : (
                    <ResponsiveContainer width="100%" height={360}>
                      <BarChart data={salesData} barSize={50}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="category" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="Value (INR)"
                          fill="#1976d2"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Traffic Sources */}
          <Box>
            <Card sx={{ borderRadius: 2, boxShadow: 2, height: "100%" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Other Activity
                  </Typography>
                </Box>
                <List sx={{ py: 0 }}>
                  {activities.map((activity, index) => (
                    <ListItem
                      key={index}
                      sx={{ px: 0, py: 2, cursor: "pointer" }}
                      onClick={() => activity.path && navigate(activity.path)}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {activity.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.time}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <MoreVert sx={{ color: "text.secondary" }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Quick Stats Footer using Box */}
        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          ></Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
