import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import {
    LayoutDashboard,
    Ruler,
    ShoppingBag,
    Scissors,
    Settings,
    Users,
    FileText,
    Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = ({ className }) => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    // Define navigation items based on role
    const navItems = {
        user: [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'My Measurements', path: '/dashboard/measurements', icon: Ruler },
            { name: 'My Orders', path: '/dashboard/orders', icon: ShoppingBag },
            { name: 'Find Tailors', path: '/dashboard/marketplace', icon: Scissors },
            { name: 'Settings', path: '/dashboard/settings', icon: Settings },
        ],
        tailor: [
            { name: 'Shop Overview', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
            { name: 'Services', path: '/dashboard/services', icon: Scissors },
            { name: 'Shop Profile', path: '/dashboard/profile', icon: Store },
            { name: 'Settings', path: '/dashboard/settings', icon: Settings },
        ],
        admin: [
            { name: 'Platform Overview', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Users', path: '/dashboard/users', icon: Users },
        ]
    };

    // Fallback if role is undefined or invalid (shouldn't happen with auth check)
    const items = navItems[user?.role] || navItems.user;

    return (
        <div className={cn("pb-12 w-64 border-r min-h-screen bg-card", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Menu
                    </h2>
                    <div className="space-y-1">
                        {items.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                    isActive(item.path) ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
