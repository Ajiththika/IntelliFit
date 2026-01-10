import { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/authContext';
import OrderCard from '../../components/dashboard/OrderCard';
import { Loader2 } from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const isTailor = user?.role === 'tailor';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const endpoint = isTailor ? '/orders/shop-orders' : '/orders/my-orders';
                const { data } = await API.get(endpoint);
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isTailor]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
                {isTailor ? 'Shop Orders' : 'My Orders'}
            </h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.length > 0 ? (
                        orders.map(order => (
                            <OrderCard key={order._id} order={order} isTailorView={isTailor} />
                        ))
                    ) : (
                        <div className="text-center py-12 border border-dashed rounded-xl bg-secondary/20">
                            <p className="text-muted-foreground">No orders found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
