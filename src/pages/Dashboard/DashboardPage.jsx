import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useEffect } from "react";
import { getDashboardOverview } from "../../api/dashboard.api"
import { getOrders } from "../../api/orderBooking.api"
import { getCustomers } from "../../api/Customer.api"
import { getInventoryCounts } from "../../api/InventoryCount.api"

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
  LineChart,
  Line, 
} from 'recharts';

// Simple metric card component
const MetricCard = ({ title, value, change, trend, icon, color }) => (
  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="text.secondary" variant="body2" fontWeight={500}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
            {value}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
            {trend === 'up' ? (
              <ArrowUpward sx={{ fontSize: 16, color: '#4caf50' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />
            )}
            <Typography
              variant="body2"
              sx={{ color: trend === 'up' ? '#4caf50' : '#f44336', fontWeight: 600 }}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// Additional cards for Masonry layout
const MasonryCard = ({ title, content, icon, color, height }) => (
  <Card sx={{ borderRadius: 2, boxShadow: 2, height: height || 'auto', minWidth: 0 }}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Box sx={{ color: color, display: 'flex' }}>{icon}</Box>
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
  const [timeRange, setTimeRange] = useState('30d');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardOverview(timeRange);
      setDashboardData(data);
    } catch (error) {
      console.error("Dashboard API error", error);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [timeRange]);

useEffect(() => {
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await getOrders();
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Orders API error", error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  fetchOrders();
}, []);

useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error("Customers API error", error);
      setCustomers([]);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await getInventoryCounts();
      setInventory(response.data.data || []);
      if (loading) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <Typography variant="h6">Loading dashboard...</Typography>
    </Box>
  );
}

    } catch (error) {
      console.error("Inventory API error", error);
      setInventory([]);
    }
  };

  fetchCustomers();
  fetchInventory();
}, []);

  // Chart data
  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4800 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 7500 },
    { month: 'Jul', revenue: 8000 },
  ];

  // Calculate stats from API data
  const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.finalRate) || 0), 0);
  const totalCustomers = customers.length;
  const totalInventory = inventory.length;

  // Calculate sales by location (category)
  const salesByLocation = orders.reduce((acc, order) => {
    const location = order.location || 'Unknown';
    if (!acc[location]) {
      acc[location] = 0;
    }
    acc[location] += parseFloat(order.finalRate) || 0;
    return acc;
  }, {});

  const salesData = Object.entries(salesByLocation).map(([category, sales]) => ({
    category,
    sales: Math.round(sales),
  }));

  // Stat cards data
  const stats = [
  {
    title: 'Total Revenue',
    value: ordersLoading ? '—' : `₹${totalRevenue.toLocaleString()}`,
    change: '+12.5%',
    trend: 'up',
    icon: <AttachMoney sx={{ fontSize: 28, color: '#1976d2' }} />,
    color: '#1976d2',
  },
  {
    title: 'Total Customers',
    value: totalCustomers.toLocaleString(),
    change: '+8.2%',
    trend: 'up',
    icon: <Group sx={{ fontSize: 28, color: '#4caf50' }} />,
    color: '#4caf50',
  },
  {
    title: 'Total Orders',
    value: orders.length.toLocaleString(),
    change: '+4.1%',
    trend: 'up',
    icon: <Assessment sx={{ fontSize: 28, color: '#ff9800' }} />,
    color: '#ff9800',
  },
  {
    title: 'Inventory Items',
    value: totalInventory.toLocaleString(),
    change: '+2.9%',
    trend: 'up',
    icon: <TrendingUp sx={{ fontSize: 28, color: '#9c27b0' }} />,
    color: '#9c27b0',
  },
];


  // Recent activities
  const activities = [
    {
      icon: <CheckCircle sx={{ color: '#4caf50' }} />,
      title: 'Project Completed',
      time: 'Just now',
    },
    {
      icon: <CalendarToday sx={{ color: '#1976d2' }} />,
      title: 'Meeting Scheduled',
      time: '2 hours ago',
    },
    {
      icon: <Group sx={{ color: '#ff9800' }} />,
      title: 'New Member Joined',
      time: 'Yesterday',
    },
    {
      icon: <Assessment sx={{ color: '#9c27b0' }} />,
      title: 'Report Generated',
      time: '2 days ago',
    },
  ];


  const masonryItems = [
    {
      title: 'Recent Orders',
      icon: <ShoppingCart sx={{ color: '#ff9800' }} />,
      color: '#ff9800',
      height: 500,
      content: ordersLoading ? (
        <Typography>Loading orders...</Typography>
      ) : (
        <List sx={{ py: 0 }}>
          {orders.slice(0, 9).map((order, index) => (
            <ListItem key={order.id || index} sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary={`Order ${order.tranditionId} - ₹${order.finalRate}`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
              />
              <Chip label="Paid" size="small" color="success" />
            </ListItem>
          ))}
          <Button size="medium" onClick={() => navigate('/O2C/OrderBooking')}>View All</Button>
        </List>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto', }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Dashboard
            </Typography>
            <Typography color="text.secondary">
              Welcome back! Here's what's happening  today.
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
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          {stats.map((stat, index) => (
            <Box key={index}>
              <MetricCard {...stat} />
            </Box>
          ))}
        </Box>

        {/* Charts Row using Box instead of Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '2fr 1fr',
            },
            gap: 3,
            mb: 4,
          }}
        >
          {/* Revenue Chart */}
          <Box>
            <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%', width: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Revenue Overview
                  </Typography>
                  <Chip label="Last 7 months" size="small" />
                </Box>
                <Box sx={{ height: 350, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#1976d2"
                        strokeWidth={3}
                        dot={{ strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Task Progress */}
          <Box>
                <Stack spacing={3} >
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
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              Overview Cards
            </Typography>
          </Box>
        
        </Box>
        {dashboardData && (
  <Typography variant="body2" color="text.secondary">
    Dashboard data loaded successfully
  </Typography>
)}


        {/* Second Charts Row using Box */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          {/* Sales Chart */}
          <Box>
            <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Sales by Location
                </Typography>
                <Box sx={{ height: 400, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="category" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Traffic Sources */}
          <Box>
            <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
              <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Activity
                </Typography>
                <Button size="small">View All</Button>
              </Box>
              <List sx={{ py: 0 }}>
                {activities.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{activity.icon}</ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.time}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                    <MoreVert sx={{ color: 'text.secondary' }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Quick Stats Footer using Box */}
        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;