import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Button } from './ui/button';
import { Scissors, Menu, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <Scissors className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold tracking-tight">Ajie IntelliFit</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                        Features
                    </Link>
                    <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                        Marketplace
                    </Link>
                    <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                        How it Works
                    </Link>
                    <Link to="/pricing" className="text-sm font-medium transition-colors hover:text-primary">
                        Pricing
                    </Link>
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <User className="h-4 w-4" />
                                <span>{user.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">{user.role}</span>
                                {user.isPremium && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 font-bold border border-yellow-200 dark:border-yellow-900">
                                        PREMIUM
                                    </span>
                                )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
