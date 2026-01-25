import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import API from '../../services/api';
import { Loader2, DollarSign, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const CreateOrderDialog = ({ tailorId, tailorName, onClose }) => {
    const [garmentType, setGarmentType] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingServices, setFetchingServices] = useState(true);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const navigate = useNavigate();

    // Fetch Tailor Services
    useEffect(() => {
        const fetchTailorServices = async () => {
            try {
                const { data } = await API.get(`/tailors/${tailorId}`);
                if (data && data.pricing) {
                    // Standardize pricing if it's the old string format or new array
                    if (Array.isArray(data.pricing)) {
                        setServices(data.pricing);
                        if (data.pricing.length > 0) {
                            const first = data.pricing[0];
                            setGarmentType(first.serviceName);
                            setSelectedService(first);
                        }
                    } else {
                        // Fallback for legacy string pricing
                        setServices([]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch tailor services", error);
            } finally {
                setFetchingServices(false);
            }
        };

        if (tailorId) fetchTailorServices();
    }, [tailorId]);

    const handleServiceChange = (e) => {
        const name = e.target.value;
        setGarmentType(name);
        const service = services.find(s => s.serviceName === name);
        setSelectedService(service || null);
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setLoading(true);

        let finalPrice = 0;
        if (selectedService) {
            finalPrice = selectedService.startingPrice;
        } else {
            // "Custom/Other" or Legacy fallback
            finalPrice = 0; // Or ask for a quote? For now default to 0 (Request Quote)
        }

        try {
            await API.post('/orders', {
                tailorId,
                garmentType: garmentType || 'Custom Request',
                instructions,
                price: finalPrice
            });
            // Redirect to orders page on success
            navigate('/dashboard/orders');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to place order. Ensure you have generated measurements.');
        } finally {
            setLoading(false);
            onClose(); // Close dialog if navigation happens or stays
        }
    };

    if (fetchingServices) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><Loader2 className="h-8 w-8 text-white animate-spin" /></div>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-background rounded-lg shadow-lg border p-6 space-y-4">
                <h2 className="text-xl font-bold">New Order for {tailorName}</h2>

                <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Service</Label>
                        {services.length > 0 ? (
                            <Select
                                value={garmentType}
                                onChange={handleServiceChange}
                            >
                                {services.map((s, idx) => (
                                    <option key={idx} value={s.serviceName}>
                                        {s.serviceName}
                                    </option>
                                ))}
                                <option value="Other">Other / Custom Request</option>
                            </Select>
                        ) : (
                            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                This tailor has no specific services listed. You can make a custom request.
                            </div>
                        )}
                        {services.length === 0 && (
                            <Input
                                placeholder="E.g. Custom Suit"
                                value={garmentType}
                                onChange={(e) => setGarmentType(e.target.value)}
                            />
                        )}
                    </div>

                    {selectedService && (
                        <div className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded">
                            {selectedService.description}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Special Instructions / Notes</Label>
                        <Input
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="E.g., I have my own fabric, need by Friday..."
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <span className="font-medium">Starting Price</span>
                        <div className="flex items-center font-bold text-lg">
                            <DollarSign className="h-4 w-4" />
                            {selectedService ? selectedService.startingPrice : 'Quote Required'}
                        </div>
                    </div>
                    {!selectedService && <p className="text-xs text-muted-foreground text-right">* Price will be confirmed by tailor.</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Place Order
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrderDialog;
