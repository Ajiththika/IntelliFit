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
    const [roleRequests, setRoleRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Customer hook
    const [customerData, setCustomerData] = useState({
        orders: [],
        sizeProfile: null,
        favorites: []
    });

    // Tailor hook
    const [tailorData, setTailorData] = useState(null);

    useEffect(() => {
        if (['admin', 'superadmin'].includes(user?.role)) {
            const fetchData = async () => {
                try {
                    const [statsRes, usersRes, requestsRes] = await Promise.all([
                        API.get('/admin/stats'),
                        API.get('/admin/users'),
                        API.get('/admin/role-requests')
                    ]);
                    setStats(statsRes.data);
                    setUsers(usersRes.data);
                    setRoleRequests(requestsRes.data);
                } catch (error) {
                    console.error("Failed to fetch admin data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    const handleRoleAction = async (userId, action) => {
        try {
            await API.put(`/admin/role-requests/${userId}`, { status: action });
            setRoleRequests(prev => prev.filter(u => u._id !== userId));
            // Optionally refresh users list if approved
        } catch (error) {
            console.error("Failed to update role", error);
            alert("Failed to update role status");
        }
    };

    if (['admin', 'superadmin'].includes(user?.role)) {
        if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <AdminStatsCard title="Total Users" value={stats?.totalUsers} icon={Users} description="Registered accounts" />
                    <AdminStatsCard title="Active Tailors" value={stats?.totalTailors} icon={Store} description="Verified shops" />
                    <AdminStatsCard title="Total Admins" value={stats?.totalAdmins} icon={Users} description="Platform admins" />
                    <AdminStatsCard title="Total Orders" value={stats?.totalOrders} icon={ShoppingBag} description="All time orders" />
                    <AdminStatsCard title="Total Revenue" value={`$${stats?.totalRevenue}`} icon={TrendingUp} description="Platform logic needed" />
                </div>

                {/* Role Requests */}
                {roleRequests.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Pending Access Requests</h2>
                        <div className="rounded-md border">
                            <div className="p-4">
                                {roleRequests.map((reqUser) => (
                                    <div key={reqUser._id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium">{reqUser.name}</p>
                                            <p className="text-sm text-muted-foreground">{reqUser.email} wants to be <b>{reqUser.roleRequest}</b></p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleRoleAction(reqUser._id, 'approved')}>Approve</Button>
                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRoleAction(reqUser._id, 'rejected')}>Reject</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Registrations</h2>
                    <AdminUserTable users={users} />
                </div>
            </div>
        );
        // Tailor View
        const [tailorData, setTailorData] = useState(null);

        useEffect(() => {
            if (user?.role === 'tailor') {
                const fetchTailorStats = async () => {
                    try {
                        const { data } = await API.get('/tailors/dashboard/stats');
                        setTailorData(data);
                    } catch (error) {
                        console.error("Failed to fetch tailor stats", error);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchTailorStats();
            }
        }, [user]);

        if (user?.role === 'tailor') {
            if (!tailorData) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

            return (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Tailor Dashboard
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Overview of your shop's performance.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline"><Store className="mr-2 h-4 w-4" /> View Public Profile</Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                    <h3 className="text-2xl font-bold">${tailorData.totalRevenue}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                                    <h3 className="text-2xl font-bold">{tailorData.activeCount}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                    <h3 className="text-2xl font-bold">{tailorData.completedCount}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Rating</p>
                                    <h3 className="text-2xl font-bold">{tailorData.avgRating} <span className="text-xs font-normal text-muted-foreground">({tailorData.reviewCount})</span></h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-1">
                        {/* Recent Incomings */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold tracking-tight">Recent Orders</h2>
                                <Link to="/dashboard/orders" className="text-sm text-primary hover:underline">Manage All</Link>
                            </div>

                            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                                {tailorData.recentOrders.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Order ID</th>
                                                <th className="px-6 py-3 font-medium">Garment</th>
                                                <th className="px-6 py-3 font-medium">Price</th>
                                                <th className="px-6 py-3 font-medium">Date</th>
                                                <th className="px-6 py-3 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {tailorData.recentOrders.map((order) => (
                                                <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs">#{order._id.slice(-6)}</td>
                                                    <td className="px-6 py-4">{order.garmentType}</td>
                                                    <td className="px-6 py-4 font-bold text-green-600">${order.price}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                                                        ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {order.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                        <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
                                        <p>No orders yet. They will appear here once customers request them.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
             </div >
         );
    }



useEffect(() => {
    if (user?.role === 'user' || user?.role === 'tailor') {
        const fetchCustomerData = async () => {
            try {
                const [ordersRes, profileRes, favRes] = await Promise.all([
                    API.get('/orders/my-orders'),
                    API.get('/size/profile'),
                    API.get('/users/favorites')
                ]);
                setCustomerData({
                    orders: ordersRes.data,
                    sizeProfile: profileRes.data,
                    favorites: favRes.data
                });
            } catch (error) {
                console.error("Failed to fetch customer dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomerData();
    }
}, [user]);

// Calculate Profile Completeness
const calculateCompleteness = (profile) => {
    if (!profile) return 0;
    let score = 20; // Basic existence
    if (profile.status === 'AI_GENERATED') score += 40;
    if (profile.status === 'VERIFIED') score += 80; // Max out at 100 effectively
    if (profile.measurementMeta && profile.measurementMeta.size > 0) score += 10; // Has meta
    return Math.min(100, score);
};

const completeness = calculateCompleteness(customerData.sizeProfile);
const pendingOrders = customerData.orders.filter(o => ['pending', 'accepted', 'in_progress', 'fitting_review'].includes(o.status)).length;

return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Hello, {user?.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here's what's happening with your fittings today.
                </p>
            </div>
            <div className="flex gap-2">
                <Link to="/studio">
                    <Button variant="outline">Design Custom</Button>
                </Link>
                <Link to="/dashboard/marketplace">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Find a Tailor</Button>
                </Link>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                        <h3 className="text-2xl font-bold">{pendingOrders}</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Measurements</p>
                        <h3 className="text-2xl font-bold">{customerData.sizeProfile ? 'Active' : 'Missing'}</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                        <Store className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Favorite Tailors</p>
                        <h3 className="text-2xl font-bold">{customerData.favorites.length}</h3>
                    </div>
                </div>
            </div>

            {/* Completeness Card */}
            <div className="rounded-xl border bg-gradient-to-br from-card to-secondary/30 p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Profile Status</p>
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{completeness}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${completeness}%` }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {completeness < 100 ? 'Complete your profile for better fits.' : 'All set for perfect fittings!'}
                    </p>
                </div>
            </div>
        </div>

        <div className="grid gap-8 md:grid-cols-7">
            {/* Recent Orders Table */}
            <div className="md:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Recent Orders</h2>
                    <Link to="/dashboard/orders" className="text-sm text-primary hover:underline">View all</Link>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    {customerData.orders.length > 0 ? (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Order ID</th>
                                    <th className="px-6 py-3 font-medium">Tailor</th>
                                    <th className="px-6 py-3 font-medium">Garment</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customerData.orders.slice(0, 5).map((order) => (
                                    <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">#{order._id.slice(-6)}</td>
                                        <td className="px-6 py-4 font-medium">{order.tailor?.businessName || 'Unknown'}</td>
                                        <td className="px-6 py-4">{order.garmentType}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                                                    ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                            <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
                            <p>No orders yet. Visit the marketplace to start.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="md:col-span-2 space-y-6">
                {/* Size Quick View */}
                <div className="rounded-xl border bg-card shadow-sm p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Size Snapshot
                    </h3>
                    {customerData.sizeProfile ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium capitalize">{customerData.sizeProfile.fitPreference} Fit</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Confidence</span>
                                <span className={`font-medium ${customerData.sizeProfile.confidenceScore > 80 ? 'text-green-600' : 'text-amber-600'}`}>
                                    {customerData.sizeProfile.confidenceScore}%
                                </span>
                            </div>
                            <div className="pt-3 mt-3 border-t grid grid-cols-2 gap-2 text-center">
                                <div className="bg-secondary/30 p-2 rounded">
                                    <div className="text-xs text-muted-foreground">Chest</div>
                                    <div className="font-bold">{customerData.sizeProfile.calculatedSizes?.chest || '-'}</div>
                                </div>
                                <div className="bg-secondary/30 p-2 rounded">
                                    <div className="text-xs text-muted-foreground">Waist</div>
                                    <div className="font-bold">{customerData.sizeProfile.calculatedSizes?.waist || '-'}</div>
                                </div>
                            </div>
                            <Link to="/dashboard/measurements">
                                <Button variant="outline" size="sm" className="w-full mt-2">Full Details</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <Link to="/dashboard/measurements">
                                <Button size="sm">Create Profile</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Favorites List */}
                <div className="rounded-xl border bg-card shadow-sm p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        Favorite Shops
                    </h3>
                    <div className="space-y-3">
                        {customerData.favorites.length > 0 ? (
                            customerData.favorites.slice(0, 3).map(fav => (
                                <div key={fav._id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group">
                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                        {fav.coverImage ? <img src={fav.coverImage} className="w-full h-full object-cover" /> : <Store className="h-5 w-5 opacity-50" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{fav.businessName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{fav.specializations?.join(', ')}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-4">
                                No favorites yet.
                            </p>
                        )}
                        {customerData.favorites.length > 0 && (
                            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">View all</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
    };

export default DashboardHome;
