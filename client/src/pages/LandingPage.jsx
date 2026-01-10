import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ruler, Shirt, Store, CheckCircle } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                            Perfect Fit, <span className="text-primary">Every Time.</span>
                            <br />
                            Powered by AI.
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Stop guessing your size. Ajie IntelliFit uses intelligent algorithms to calculate your perfect measurements and connects you with expert tailors.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register">
                                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                                    Start Your Fit Journey
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
                                    Find a Tailor
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-gradient-to-br from-indigo-50/50 via-white to-pink-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl opacity-30" />
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose IntelliFit?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            We bridge the gap between digital convenience and bespoke craftsmanship.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Link to="/dashboard/measurements">
                            <FeatureCard
                                icon={<Ruler className="w-10 h-10 text-primary" />}
                                title="AI Size Generation"
                                description="Input your basic stats (height, weight, age) and let our algorithm calculate your precise garment measurements."
                            />
                        </Link>
                        <Link to="/dashboard">
                            <FeatureCard
                                icon={<Shirt className="w-10 h-10 text-primary" />}
                                title="Style Recommendations"
                                description="Upload a photo and get AI-driven style advice based on your skin tone, face shape, and body type."
                            />
                        </Link>
                        <Link to="/dashboard/marketplace">
                            <FeatureCard
                                icon={<Store className="w-10 h-10 text-primary" />}
                                title="Tailor Marketplace"
                                description="Connect with rated, professional tailors who can craft garments to your exact IntelliFit measurements."
                            />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4 text-center">
                    <div className="bg-primary/5 rounded-3xl p-10 md:p-20 border border-primary/10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to upgrade your wardrobe?</h2>
                        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Join thousands of users who have found their perfect fit. Tailors are waiting to create your next masterpiece.
                        </p>
                        <Link to="/register">
                            <Button size="lg" className="text-lg">Get Started for Free</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-border/40">
                <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                    <p>&copy; {new Date().getFullYear()} Ajie IntelliFit. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
        className="bg-card p-8 rounded-xl border border-border shadow-sm transition-all duration-300 h-full hover:border-primary/50 cursor-pointer"
    >
        <div className="mb-6 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center transition-colors group-hover:bg-primary/20">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">
            {description}
        </p>
    </motion.div>
);

export default LandingPage;
