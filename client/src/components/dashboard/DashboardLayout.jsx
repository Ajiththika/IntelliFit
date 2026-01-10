import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar hidden on mobile, visible on md+ */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header could go here */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
