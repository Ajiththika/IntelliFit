import { Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useState } from 'react';

const PricingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const { data } = await API.post('/payment/create-checkout-session');
            if (data.id) {
                // Initialize Stripe Redirect (using stripe-js or simple redirect)
                // For MVP without stripe-js package on frontend, we might need a direct URL. 
                // But usually we get session ID and use stripe.redirectToCheckout.
                // Assuming backend returns a URL or we use a library.
                // As per controller, we return { id: session.id }.
                // We need @stripe/stripe-js on frontend to redirect.
                // OR simpler: backend returns session.url and we window.location.href = url.

                // Let's assume we install @stripe/stripe-js or backend returns url.
                // Updating controller in next step to return URL for simplicity? 
                // Or just use the ID with loaded script.

                // For this MVP, let's presume backend wraps it or we add stripe-js. 
                // Let's try to mock the success flow first or use alert.
                alert(`Stripe Session Created: ${data.id}. In a real app, you'd be redirected to Stripe.`);

                // MOCK SUCCESS for verification
                await API.post('/payment/mock-success');
                alert("MOCK Payment Success! You are now Premium.");
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error(error);
            alert('Payment initialization failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-20 animate-in fade-in">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-16">
                    Choose the plan that fits your style journey. Upgrade anytime.
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col">
                        <h3 className="text-2xl font-bold mb-2">Basic</h3>
                        <div className="text-4xl font-bold mb-6">$0</div>
                        <p className="text-muted-foreground mb-8">Essential tools for better fitting clothes.</p>
                        <ul className="space-y-3 mb-8 text-left flex-1">
                            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> AI Size Generation</li>
                            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> Basic Marketplace Access</li>
                            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500" /> Order Tracking</li>
                        </ul>
                        <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                    </div>

                    {/* Premium Plan */}
                    <div className="rounded-2xl border-2 border-primary bg-card text-card-foreground shadow-lg p-8 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                            POPULAR
                        </div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                            Premium <Sparkles className="h-5 w-5 text-yellow-500 filter drop-shadow-sm" />
                        </h3>
                        <div className="text-4xl font-bold mb-6">$19.99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <p className="text-muted-foreground mb-8">Advanced features for the style conscious.</p>
                        <ul className="space-y-3 mb-8 text-left flex-1">
                            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> <b>All Basic Features</b></li>
                            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Advanced Style Recommendations</li>
                            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Priority Tailor Booking</li>
                            <li className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Verified Badge on Profile</li>
                        </ul>
                        <Button className="w-full" size="lg" onClick={handleSubscribe} disabled={loading || user?.isPremium}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {user?.isPremium ? 'Active Plan' : 'Subscribe Now'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
