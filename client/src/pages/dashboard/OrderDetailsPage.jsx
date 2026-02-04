import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/authContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Loader2, MessageSquare, ArrowLeft, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const TIMELINE_STEPS = [
    { status: 'pending', label: 'Requested' },
    { status: 'accepted', label: 'Accepted' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'completed', label: 'Completed' }
];

const OrderTimeline = ({ currentStatus, history }) => {
    // Find active step index
    // Note: status flow might skip or be non-linear (e.g. cancelled).
    // This is a simplified visualizer for the happy path.
    const activeIndex = TIMELINE_STEPS.findIndex(s => s.status === currentStatus);

    // Fallback for non-happy path statuses
    const isCancelled = currentStatus === 'cancelled' || currentStatus === 'rejected';
    const isDisputed = currentStatus === 'disputed';

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-secondary -z-10 -translate-y-1/2 rounded-full" />

                {/* Active Line */}
                {!isCancelled && !isDisputed && activeIndex >= 0 && (
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                        style={{ width: `${(activeIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                    />
                )}

                {TIMELINE_STEPS.map((step, index) => {
                    const isCompleted = !isCancelled && !isDisputed && index <= activeIndex;
                    const isCurrent = !isCancelled && !isDisputed && index === activeIndex;

                    return (
                        <div key={step.status} className="flex flex-col items-center gap-2 bg-background px-2">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 
                                ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-background border-secondary text-muted-foreground'}
                                ${isCurrent ? 'ring-4 ring-green-500/20' : ''}
                                transition-all
                            `}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </div>
                            <span className={`text-xs font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Status History Logs */}
            <div className="mt-8 space-y-4 max-w-2xl mx-auto border rounded-xl p-4 bg-secondary/5">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Activity Log
                </h4>
                <div className="space-y-3 pl-2">
                    {history.slice().reverse().map((log, i) => (
                        <div key={i} className="flex gap-3 text-sm relative pb-3 last:pb-0 border-l last:border-0 border-muted-foreground/20 pl-4">
                            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                            <div className="flex-1">
                                <p className="font-medium">{log.note || `Status changed to ${log.status}`}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await API.get(`/orders/my-orders`); // Fallback if general get fails? 
                // Actually we need a specific GET by ID. 
                // Currently orderController doesn't have public GET /:id, only list. 
                // NOTE: User might rely on list data, but for deep link we need fetching.
                // Let's iterate list for now as makeshift, but ideally backend should accept GET /:id

                // Wait, let's use the list endpoint and find it client side for now to avoid backend changes if not needed, 
                // OR implement GET /api/orders/:id properly. 
                // Let's implement specific GET logic via filter if API is missing, 
                // BUT strict checking: `orderController.js` creates `getShopOrders` and `getMyOrders`. It does NOT have `getOrderById`.
                // I should ADD `getOrderById` to backend.

                // Since I cannot change backend in this file creation turn easily without context switch, 
                // let's assume I will add it. Or use the list.
                // Using list for safety in this turn.
                const endpoint = user.role === 'tailor' ? '/orders/shop-orders' : '/orders/my-orders';
                const res = await API.get(endpoint);
                const found = res.data.find(o => o._id === id);
                setOrder(found);
            } catch (error) {
                console.error("Fetch order failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, user.role]);

    const handleStatusUpdate = async (newStatus) => {
        if (!confirm(`Update status to ${newStatus}?`)) return;
        setUpdating(true);
        try {
            const { data } = await API.put(`/orders/${id}/status`, { status: newStatus });
            setOrder(data);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const StatusControls = () => {
        if (!user || !order) return null;
        const isTailor = user.role === 'tailor';
        const isCustomer = user.role === 'user'; // 'customer' in db but often mapped to 'user' in front auth

        // Status: pending
        if (order.status === 'pending') {
            if (isTailor) {
                return (
                    <div className="flex gap-2">
                        <Button onClick={() => handleStatusUpdate('accepted')} className="bg-green-600 hover:bg-green-700">Accept Order</Button>
                        <Button onClick={() => handleStatusUpdate('rejected')} variant="destructive">Reject</Button>
                    </div>
                );
            }
            if (isCustomer) {
                return <Button onClick={() => handleStatusUpdate('cancelled')} variant="outline" className="text-red-500 hover:text-red-600">Cancel Request</Button>;
            }
        }

        // Status: accepted
        if (order.status === 'accepted' && isTailor) {
            return <Button onClick={() => handleStatusUpdate('in_progress')}>Start Work</Button>;
        }

        // Status: in_progress
        if (order.status === 'in_progress' && isTailor) {
            return <Button onClick={() => handleStatusUpdate('completed')} className="bg-green-600 hover:bg-green-700">Mark Completed</Button>;
            // Note: 'fitting_review' skipped for MVP simple flow, but available if needed
        }

        return null;
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin duration-3000" /></div>;
    if (!order) return <div className="p-8 text-center text-muted-foreground">Order not found</div>;

    const otherUser = user.role === 'tailor' ? order.customer : order.tailor;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/orders')} className="h-8 w-8 p-0">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Order #{order._id.slice(-6).toUpperCase()}</h1>
                        <Badge variant="outline" className="uppercase tracking-wider text-[10px]">{order.status}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm ml-10">
                        Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/messages', { state: { startConversation: true, recipientId: otherUser?._id, orderId: order._id } })}
                    >
                        <MessageSquare className="w-4 h-4 mr-2" /> Chat with {user.role === 'tailor' ? 'Customer' : 'Tailor'}
                    </Button>
                    <StatusControls />
                </div>
            </div>

            {/* Timeline */}
            <OrderTimeline currentStatus={order.status} history={order.statusHistory} />

            <div className="grid md:grid-cols-3 gap-6">

                {/* Details Column */}
                <div className="md:col-span-2 space-y-6">
                    {/* Size Profile Snapshot */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            Measurements Snapshot
                            <Badge variant="secondary" className="text-xs font-normal">
                                {order.sizeProfileSnapshot?.source || 'Saved Profile'}
                            </Badge>
                        </h3>

                        {order.sizeProfileSnapshot?.measurements ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {Object.entries(order.sizeProfileSnapshot.measurements || {}).map(([key, val]) => (
                                    <div key={key} className="bg-secondary/20 p-3 rounded-lg border border-transparent hover:border-primary/20 transition-colors">
                                        <div className="text-xs text-muted-foreground capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                        <div className="font-mono font-semibold">{val} <span className="text-[10px] text-muted-foreground font-sans">in</span></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">No measurement data attached.</span>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold mb-2">Instructions</h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {order.instructions || "No special instructions provided."}
                        </p>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Price Card */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">Total Amount</h3>
                        <div className="text-3xl font-bold flex items-baseline">
                            ${order.price}
                            <span className="text-sm font-normal text-muted-foreground ml-1">USD</span>
                        </div>
                        <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Service</span>
                                <span className="font-medium">{order.garmentType}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Payment</span>
                                <span className="font-medium capitalize">{order.paymentStatus}</span>
                            </div>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tailor</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
                                    {/* We might need to populate fields properly, assuming tailor obj or subfields exist */}
                                    {/* In list view tailor is populated as businessName usually? Need to check controller Populate */}
                                    <div className="w-full h-full flex items-center justify-center font-bold text-primary">T</div>
                                </div>
                                <div>
                                    <div className="font-medium">{typeof order.tailor === 'object' ? order.tailor.businessName : 'Tailor'}</div>
                                    <div className="text-xs text-muted-foreground">provider</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-muted">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Customer</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center font-bold text-primary">C</div>
                                </div>
                                <div>
                                    <div className="font-medium">{typeof order.customer === 'object' ? order.customer.name : 'Customer'}</div>
                                    <div className="text-xs text-muted-foreground">client</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailsPage;
