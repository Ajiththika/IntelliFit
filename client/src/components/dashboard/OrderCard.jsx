import { Package, Clock, CheckCircle, XCircle, User, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '../ui/button';
import ReviewDialog from './ReviewDialog';
import API from '../../services/api';


const OrderCard = ({ order, isTailorView }) => {
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [loading, setLoading] = useState(false);

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    const StatusIcon = {
        pending: Clock,
        accepted: Package,
        completed: CheckCircle,
        rejected: XCircle
    }[currentStatus] || Clock;

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        try {
            await API.put(`/orders/${order._id}/status`, { status: newStatus });
            setCurrentStatus(newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-lg bg-card p-4 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-full", statusColors[currentStatus] || 'bg-gray-100')}>
                        <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold">{order.garmentType} Order</h4>
                        <p className="text-sm text-muted-foreground">
                            {isTailorView ? (
                                <span className="flex items-center gap-1"><User className="h-3 w-3" /> Customer: {order.customer?.name}</span>
                            ) : (
                                <span>Tailor: {order.tailor?.businessName}</span>
                            )}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium capitalize", statusColors[currentStatus])}>
                        {currentStatus}
                    </span>
                    <span className="font-bold text-sm">
                        ${order.price}
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? 'Hide Details' : 'View Details'}
                </Button>

                {isTailorView && currentStatus === 'pending' && (
                    <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('accepted')} disabled={loading}>Accept</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate('rejected')} disabled={loading}>Reject</Button>
                    </>
                )}
                {isTailorView && currentStatus === 'accepted' && (
                    <Button size="sm" onClick={() => handleStatusUpdate('completed')} disabled={loading}>Mark Complete</Button>
                )}

                {!isTailorView && currentStatus === 'completed' && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-9"
                        onClick={() => setShowReviewDialog(true)}
                    >
                        Rate Tailor
                    </Button>
                )}
            </div>

            {showDetails && (
                <div className="bg-secondary/10 p-4 rounded-md text-sm space-y-4">
                    <div>
                        <span className="font-semibold block mb-1">Instructions:</span>
                        <p className="text-muted-foreground">{order.instructions || "No special instructions provided."}</p>
                    </div>

                    {order.sizeProfileSnapshot && (
                        <div>
                            <span className="font-semibold flex items-center gap-2 mb-2">
                                <Ruler className="h-4 w-4" /> Measurements Snapshot:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {Object.entries(order.sizeProfileSnapshot).map(([key, val]) => (
                                    <div key={key} className="bg-background p-2 rounded border text-center">
                                        <span className="block text-xs text-muted-foreground capitalize">{key}</span>
                                        <span className="font-medium">{val} cm</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showReviewDialog && (
                <ReviewDialog
                    order={order}
                    onClose={() => setShowReviewDialog(false)}
                    onSuccess={() => {
                        alert('Review submitted!');
                    }}
                />
            )}
        </div>
    );
};

export default OrderCard;
