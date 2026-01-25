import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Loader2, MapPin, Star, Scissors, ArrowLeft, Image as ImageIcon, DollarSign } from 'lucide-react';
import CreateOrderDialog from '../components/dashboard/CreateOrderDialog';
import PortfolioGalleryDialog from '../components/dashboard/PortfolioGalleryDialog';

const TailorPublicProfile = () => {
    const { id } = useParams();
    const [tailor, setTailor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOrderDialog, setShowOrderDialog] = useState(false);
    const [showPortfolio, setShowPortfolio] = useState(false);

    useEffect(() => {
        const fetchTailor = async () => {
            try {
                const { data } = await API.get(`/tailors/${id}`);
                setTailor(data);
            } catch (error) {
                console.error("Failed to fetch tailor profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTailor();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (!tailor) return <div className="p-8 text-center bg-gray-50 min-h-screen pt-20">
        <h2 className="text-2xl font-bold">Tailor not found</h2>
        <Button variant="link" asChild className="mt-4">
            <Link to="/dashboard/marketplace">Back to Marketplace</Link>
        </Button>
    </div>;

    return (
        <div className="min-h-screen bg-background pt-20 pb-12">

            {/* Hero Section */}
            <div className="bg-secondary/20 border-b">
                <div className="container mx-auto px-4 py-8">
                    <Link to="/dashboard/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Marketplace
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Image / Logo */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-lg overflow-hidden bg-white shrink-0">
                            {tailor.user?.avatar ? (
                                <img src={tailor.user.avatar} alt={tailor.businessName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                    <Scissors className="h-12 w-12" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{tailor.businessName}</h1>
                                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> {tailor.location}
                                    </span>
                                    <span className="flex items-center gap-1 text-yellow-600 font-medium">
                                        <Star className="h-4 w-4 fill-yellow-500" /> {tailor.rating?.toFixed(1) || "New"} ({tailor.reviewsCount} reviews)
                                    </span>
                                    <span>•</span>
                                    <span>{tailor.experienceYears} Years Exp.</span>
                                </div>
                            </div>

                            <p className="text-lg max-w-2xl">{tailor.bio}</p>

                            <div className="flex flex-wrap gap-2">
                                {tailor.specializations?.map((spec, i) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1 text-sm">{spec}</Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <Button size="lg" className="w-full md:w-48 shadow-lg hover:shadow-xl transition-all" onClick={() => setShowOrderDialog(true)}>
                                Book Now
                            </Button>
                            {tailor.portfolioImages?.length > 0 && (
                                <Button variant="outline" className="w-full md:w-48" onClick={() => setShowPortfolio(true)}>
                                    <ImageIcon className="mr-2 h-4 w-4" /> View Portfolio
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Services & Pricing */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <DollarSign className="h-6 w-6 text-primary" /> Services & Pricing
                        </h2>

                        <div className="space-y-4">
                            {tailor.pricing && tailor.pricing.length > 0 ? (
                                tailor.pricing.map((service, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors border border-transparent hover:border-secondary">
                                        <div>
                                            <h3 className="font-semibold text-lg">{service.serviceName}</h3>
                                            <p className="text-muted-foreground text-sm">{service.description || "No description provided."}</p>
                                        </div>
                                        <div className="mt-2 sm:mt-0 font-bold text-xl text-primary">
                                            ${service.startingPrice}+
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic">Pricing available upon request.</p>
                            )}
                        </div>
                    </div>

                    {/* Portfolio Preview Grid */}
                    {tailor.portfolioImages?.length > 0 && (
                        <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <ImageIcon className="h-6 w-6 text-primary" /> Portfolio
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {tailor.portfolioImages.slice(0, 4).map((img, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setShowPortfolio(true)}>
                                        <img src={img} alt="Portfolio" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {tailor.portfolioImages.length > 4 && (
                                    <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center cursor-pointer hover:bg-secondary/80 text-muted-foreground font-medium" onClick={() => setShowPortfolio(true)}>
                                        +{tailor.portfolioImages.length - 4} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar (Reviews Placeholders or Contact Info) */}
                <div className="space-y-8">
                    <div className="bg-card border rounded-xl shadow-sm p-6 sticky top-24">
                        <h3 className="font-bold text-lg mb-4">Why choose {tailor.businessName}?</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2"><CheckMark /> Verified Professional</li>
                            <li className="flex gap-2"><CheckMark /> Based in {tailor.location}</li>
                            {tailor.experienceYears > 5 && <li className="flex gap-2"><CheckMark /> Highly Experienced ({tailor.experienceYears}+ years)</li>}
                            <li className="flex gap-2"><CheckMark /> Secure Payments via IntelliFit</li>
                        </ul>
                    </div>
                </div>

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
    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    </div>
);

export default TailorPublicProfile;
