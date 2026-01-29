import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Button } from './ui/button';
import {
    Scissors,
    Menu,
    User,
    LogOut,
    MessageSquare,
    ChevronDown,
    LayoutDashboard,
    ShoppingBag,
    Settings,
    MapPin,
    Sparkles,
    Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Dropdown states
    const [exploreOpen, setExploreOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Handle click outside to close dropdowns
    const navRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setExploreOpen(false);
                setProfileOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setProfileOpen(false);
    };

    const NavLink = ({ to, children, icon: Icon }) => {
        const isActive = location.pathname.startsWith(to) && to !== '/'; // simplistic startswith
        return (
            <Link
                to={to}
                className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-md",
                    isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                )}
            >
                {Icon && <Icon className="w-4 h-4" />}
                {children}
            </Link>
        );
    };

    const DropdownItem = ({ to, onClick, children, icon: Icon, className }) => {
        const content = (
            <>
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                {children}
            </>
        );

        const classes = cn(
            "flex items-center w-full px-4 py-2 text-sm text-left hover:bg-secondary/50 transition-colors cursor-pointer",
            className
        );

        if (to) {
            return (
                <Link to={to} className={classes} onClick={() => {
                    setExploreOpen(false);
                    setProfileOpen(false);
                }}>
                    {content}
                </Link>
            );
        }

        return (
            <button onClick={onClick} className={classes}>
                {content}
            </button>
        );
    };

    return (
        <header
            ref={navRef}
            className={cn(
                "sticky top-0 z-50 w-full border-b transition-all duration-300",
                scrolled ? "bg-background/95 backdrop-blur shadow-sm border-border/40" : "bg-background/50 border-transparent",
                // "supports-[backdrop-filter]:bg-background/60" // Tailwind utility handles blur usually
            )}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Scissors className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        IntelliFit
                    </span>
                </Link>

                {/* Desktop Nav - Main 3 + Explore */}
                <nav className="hidden md:flex items-center gap-1">
                    <NavLink to="/dashboard/marketplace" icon={ShoppingBag}>Marketplace</NavLink>
                    <NavLink to="/studio" icon={Palette}>Studio</NavLink>
                    <NavLink to="/style-advisor" icon={Sparkles}>Style Advisor</NavLink>

                    {/* Explore Dropdown */}
                    <div className="relative ml-2">
                        <button
                            onClick={() => setExploreOpen(!exploreOpen)}
                            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-secondary/50 focus:outline-none"
                        >
                            Explore <ChevronDown className={cn("w-3 h-3 transition-transform", exploreOpen && "rotate-180")} />
                        </button>

                        {exploreOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 origin-top-right">
                                <DropdownItem to="/pricing" icon={ShoppingBag}>Pricing</DropdownItem>
                                <DropdownItem to="/#features" icon={Settings}>Features</DropdownItem>
                                <DropdownItem to="/#how-it-works" icon={MapPin}>How it Works</DropdownItem>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            {/* Messages Icon */}
                            <Link to="/messages" className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary/50">
                                <MessageSquare className="w-5 h-5" />
                            </Link>

                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-border/50 hover:bg-secondary/50 transition-all focus:outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {user.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                                    </div>
                                    <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform mr-2", profileOpen && "rotate-180")} />
                                </button>

                                {profileOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg py-1 divide-y divide-border/50 animate-in fade-in zoom-in-95 origin-top-right">
                                        <div className="px-4 py-3">
                                            <p className="text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            {user.role === 'tailor' && <span className="mt-1 inline-block text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">Tailor</span>}
                                        </div>
                                        <div>
                                            <DropdownItem to="/dashboard" icon={LayoutDashboard}>Dashboard</DropdownItem>
                                            <DropdownItem to="/dashboard/profile" icon={User}>Profile</DropdownItem>
                                            <DropdownItem to="/dashboard/orders" icon={ShoppingBag}>Orders</DropdownItem>
                                        </div>
                                        <div className="py-1">
                                            <DropdownItem onClick={handleLogout} icon={LogOut} className="text-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/10">
                                                Log Out
                                            </DropdownItem>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="hidden sm:block">
                                <Button variant="ghost" size="sm">Log in</Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm" className="shadow-sm">Get Started</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle (Simplified) */}
                    <button
                        className="md:hidden p-2 text-muted-foreground hover:bg-secondary rounded-md"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background/95 backdrop-blur p-4 space-y-4 animate-in slide-in-from-top-5">
                    <nav className="flex flex-col space-y-2">
                        <Link to="/dashboard/marketplace" className="flex items-center py-2 text-sm font-medium border-b border-border/50">Marketplace</Link>
                        <Link to="/studio" className="flex items-center py-2 text-sm font-medium border-b border-border/50">Studio</Link>
                        <Link to="/style-advisor" className="flex items-center py-2 text-sm font-medium border-b border-border/50">Style Advisor</Link>
                        <Link to="/pricing" className="flex items-center py-2 text-sm font-medium">Pricing</Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
