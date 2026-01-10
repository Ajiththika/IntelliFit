import { useAuth } from '../../context/authContext';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../../services/api';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import AdminUserTable from '../../components/admin/AdminUserTable';
import { Users, ShoppingBag, Store, TrendingUp, Loader2 } from 'lucide-react';

const DashboardHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'admin') {
            const fetchData = async () => {
                try {
                    const [statsRes, usersRes] = await Promise.all([
                        API.get('/admin/stats'),
                        API.get('/admin/users')
                    ]);
                    setStats(statsRes.data);
                    setUsers(usersRes.data);
                } catch (error) {
                    console.error("Failed to fetch admin data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    if (user?.role === 'admin') {
        if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <AdminStatsCard title="Total Users" value={stats?.totalUsers} icon={Users} description="Registered accounts" />
                    <AdminStatsCard title="Active Tailors" value={stats?.totalTailors} icon={Store} description="Verified shops" />
                    <AdminStatsCard title="Total Orders" value={stats?.totalOrders} icon={ShoppingBag} description="All time orders" />
                    <AdminStatsCard title="Total Revenue" value={`$${stats?.totalRevenue}`} icon={TrendingUp} description="Platform logic needed" />
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Registrations</h2>
                    <AdminUserTable users={users} />
                </div>
            </div>
        );
    }

    // Customer / Tailor View
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                {user?.role === 'user' && (
                    <Link to="/dashboard/measurements">
                        <Button>Generate New Size</Button>
                    </Link>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Welcome Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-2">Welcome back, {user?.name}!</h3>
                    <p className="text-sm text-muted-foreground">
                        {user?.role === 'user'
                            ? "Ready to find your perfect fit today?"
                            : "Manage your shop and orders."}
                    </p>
                </div>

                {/* Stats Placeholder (Can be expanded for User/Tailor later) */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-2">My Activity</h3>
                    <div className="text-2xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">Active Orders</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
