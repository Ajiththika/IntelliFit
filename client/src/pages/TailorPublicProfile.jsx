import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/authContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Loader2, MapPin, Star, Scissors, ArrowLeft, Image as ImageIcon, DollarSign, MessageSquare, CheckCircle2 } from 'lucide-react';
import CreateOrderDialog from '../components/dashboard/CreateOrderDialog';
import PortfolioGalleryDialog from '../components/dashboard/PortfolioGalleryDialog';
import { motion } from 'framer-motion';

const TailorPublicProfile = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [tailor, setTailor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOrderDialog, setShowOrderDialog] = useState(false);
    const [showPortfolio, setShowPortfolio] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tailorRes, reviewsRes] = await Promise.all([
                    API.get(`/tailors/${id}`),
                    API.get(`/reviews/${id}`)
                ]);
                setTailor(tailorRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error("Failed to fetch tailor profile or reviews", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleBookNow = () => {
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }
        setShowOrderDialog(true);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 50 }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (!tailor) return (
        <div className="p-8 text-center bg-gray-50 min-h-screen pt-20 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-800">Tailor not found</h2>
            <p className="text-muted-foreground mt-2">The tailor you are looking for does not exist or has been removed.</p>
            <Button variant="link" asChild className="mt-4 text-primary">
                <Link to="/dashboard/marketplace">Back to Marketplace</Link>
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pt-20 pb-12 font-sans">

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-b from-secondary/30 to-background border-b"
            >
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <Link to="/dashboard/marketplace" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Marketplace
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                        {/* Profile Image / Logo */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-background shadow-xl overflow-hidden bg-white shrink-0 relative z-10"
                        >
                            {tailor.user?.avatar ? (
                                <img src={tailor.user.avatar} alt={tailor.businessName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                    <Scissors className="h-16 w-16" />
                                </div>
                            )}
                        </motion.div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{tailor.businessName}</h1>
                                <div className="flex flex-wrap items-center gap-4 mt-3 text-muted-foreground">
                                    <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full text-sm">
                                        <MapPin className="h-4 w-4 text-primary" /> {tailor.location}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/10 px-3 py-1 rounded-full text-sm text-yellow-700 dark:text-yellow-500 font-medium">
                                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                        {tailor.rating?.toFixed(1) || "New"} <span className="text-muted-foreground font-normal">({tailor.reviewsCount} reviews)</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        {tailor.experienceYears} Years Exp.
                                    </span>
                                </div>
                            </div>

                            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{tailor.bio}</p>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {tailor.specializations?.map((spec, i) => (
                                    <Badge key={i} variant="outline" className="px-3 py-1 text-sm bg-background/50 hover:bg-secondary transition-colors border-primary/20 text-primary">
                                        {spec}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto mt-6 md:mt-0">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button size="lg" className="w-full md:w-56 h-12 text-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold" onClick={handleBookNow}>
                                    Book Now
                                </Button>
                            </motion.div>

                            {tailor.portfolioImages?.length > 0 && (
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button variant="outline" size="lg" className="w-full md:w-56 h-12 text-md border-2 hover:bg-secondary/50" onClick={() => setShowPortfolio(true)}>
                                        <ImageIcon className="mr-2 h-4 w-4" /> View Portfolio
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Main Content Column */}
                <motion.div
                    className="lg:col-span-2 space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Services & Pricing */}
                    <motion.div variants={itemVariants} className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 bg-gradient-to-r from-secondary/40 to-transparent border-b">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-primary" />
                                </div>
                                Services & Pricing
                            </h2>
                        </div>

                        <div className="p-6 md:p-8 space-y-4">
                            {tailor.pricing && tailor.pricing.length > 0 ? (
                                tailor.pricing.map((service, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ x: 4 }}
                                        className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl bg-secondary/5 hover:bg-secondary/20 transition-all border border-transparent hover:border-secondary cursor-default group"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{service.serviceName}</h3>
                                            <p className="text-muted-foreground text-sm mt-1">{service.description || "No description provided."}</p>
                                        </div>
                                        <div className="mt-3 sm:mt-0 font-bold text-xl text-primary flex items-baseline">
                                            ${service.startingPrice}<span className="text-sm text-muted-foreground font-normal ml-1">+</span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic p-4 text-center bg-secondary/5 rounded-lg">Pricing available upon request.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Portfolio Preview Grid */}
                    {tailor.portfolioImages?.length > 0 && (
                        <motion.div variants={itemVariants} className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 md:p-8 bg-gradient-to-r from-secondary/40 to-transparent border-b">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <ImageIcon className="h-6 w-6 text-primary" />
                                    </div>
                                    Recent Work
                                </h2>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {tailor.portfolioImages.slice(0, 4).map((img, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.05 }}
                                            className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all relative group"
                                            onClick={() => setShowPortfolio(true)}
                                        >
                                            <img src={img} alt="Portfolio" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </motion.div>
                                    ))}
                                    {tailor.portfolioImages.length > 4 && (
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="aspect-square rounded-xl bg-secondary flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/80 text-muted-foreground font-medium border-2 border-dashed border-muted-foreground/20"
                                            onClick={() => setShowPortfolio(true)}
                                        >
                                            <span className="text-2xl font-bold text-foreground">+{tailor.portfolioImages.length - 4}</span>
                                            <span className="text-xs">more photos</span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Reviews Section */}
                    <motion.div variants={itemVariants} className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 bg-gradient-to-r from-secondary/40 to-transparent border-b flex justify-between items-center">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                </div>
                                Customer Reviews
                            </h2>
                            <div className="text-sm font-medium text-muted-foreground">
                                {tailor.reviewsCount} verified reviews
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="border-b last:border-0 pb-6 last:pb-0">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0 border-2 border-background shadow-sm">
                                                    {review.customer?.avatar ? (
                                                        <img src={review.customer.avatar} alt={review.customer.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-lg text-primary">{review.customer?.name?.charAt(0).toUpperCase() || "U"}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                                        <div>
                                                            <h4 className="font-semibold text-lg">{review.customer?.name || "Anonymous User"}</h4>
                                                            <div className="flex items-center gap-1 text-yellow-500 mt-1">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                                                                ))}
                                                                <span className="text-xs text-muted-foreground ml-2 font-normal">
                                                                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 text-muted-foreground leading-relaxed bg-secondary/5 p-3 rounded-lg">{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center justify-center bg-secondary/5 rounded-xl border border-dashed">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
                                    <p className="text-muted-foreground font-medium">No reviews yet.</p>
                                    <p className="text-sm text-muted-foreground/60 w-full max-w-xs mx-auto mt-1">Be the first to leave a review after your first order!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                >
                    <div className="bg-card border rounded-2xl shadow-sm p-6 sticky top-24 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Scissors className="w-24 h-24 rotate-12" />
                        </div>

                        <h3 className="font-bold text-xl mb-6">Why choose {tailor.businessName}?</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3 items-start">
                                <CheckMark />
                                <span className="text-sm text-muted-foreground">Verified Professional by IntelliFit</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <CheckMark />
                                <span className="text-sm text-muted-foreground">Secure Payments & Order Tracking</span>
                            </li>
                            {tailor.experienceYears > 5 && (
                                <li className="flex gap-3 items-start">
                                    <CheckMark />
                                    <span className="text-sm text-muted-foreground">Highly Experienced ({tailor.experienceYears}+ years)</span>
                                </li>
                            )}
                            <li className="flex gap-3 items-start">
                                <CheckMark />
                                <span className="text-sm text-muted-foreground">Satisfaction Guaranteed</span>
                            </li>
                        </ul>

                        <div className="mt-8 pt-6 border-t">
                            <Button className="w-full" onClick={handleBookNow}>Request Order</Button>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Modals */}
            {showOrderDialog && (
                <CreateOrderDialog
                    tailorId={tailor._id}
                    tailorName={tailor.businessName}
                    onClose={() => setShowOrderDialog(false)}
                />
            )}

            {showPortfolio && (
                <PortfolioGalleryDialog
                    images={tailor.portfolioImages}
                    tailorName={tailor.businessName}
                    onClose={() => setShowPortfolio(false)}
                />
            )}

        </div>
    );
};

const CheckMark = () => (
    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-green-200 dark:border-green-900">
        <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    </div>
);

export default TailorPublicProfile;
