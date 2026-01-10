import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import API from '../../services/api';
import { Loader2, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateOrderDialog = ({ tailorId, tailorName, onClose }) => {
    const [garmentType, setGarmentType] = useState('Suit');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Simple pricing map for MVP demo
    const prices = {
        'Suit': 200,
        'Shirt': 50,
        'Trousers': 80,
        'Dress': 150
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/orders', {
                tailorId,
                garmentType,
                instructions,
                price: prices[garmentType]
            });
            // Redirect to orders page on success
            navigate('/dashboard/orders');
        } catch (err) {
            console.error(err);
            alert('Failed to place order. Ensure you have generated measurements.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-background rounded-lg shadow-lg border p-6 space-y-4">
                <h2 className="text-xl font-bold">New Order for {tailorName}</h2>

                <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Garment Type</Label>
                        <Select
                            value={garmentType}
                            onChange={(e) => setGarmentType(e.target.value)}
                        >
                            <option value="Suit">Suit</option>
                            <option value="Shirt">Shirt</option>
                            <option value="Trousers">Trousers</option>
                            <option value="Dress">Dress</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Special Instructions</Label>
                        <Input
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="E.g., Extra slim fit, navy blue fabric..."
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <span className="font-medium">Estimated Price</span>
                        <div className="flex items-center font-bold text-lg">
                            <DollarSign className="h-4 w-4" />
                            {prices[garmentType]}
                        </div>
                    </div>

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
