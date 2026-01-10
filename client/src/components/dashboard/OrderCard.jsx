import { Package, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '../ui/button';
import ReviewDialog from './ReviewDialog';

const OrderCard = ({ order, isTailorView }) => {
    const [showReviewDialog, setShowReviewDialog] = useState(false);
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
    }[order.status] || Clock;

    return (
        <div className="border rounded-lg bg-card p-4 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-full", statusColors[order.status] || 'bg-gray-100')}>
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
                <span className={cn("text-xs px-2 py-1 rounded-full font-medium capitalize", statusColors[order.status])}>
                    {order.status}
                </span>
                <span className="font-bold text-sm">
                    ${order.price}
                </span>

                {!isTailorView && order.status === 'completed' && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs h-8"
                        onClick={() => setShowReviewDialog(true)}
                    >
                        Rate Tailor
                    </Button>
                )}
            </div>

            {showReviewDialog && (
                <ReviewDialog
                    order={order}
                    onClose={() => setShowReviewDialog(false)}
                    onSuccess={() => {
                        // Ideally trigger a refresh or show toast
                        alert('Review submitted!');
                    }}
                />
            )}
        </div>
    );
};

export default OrderCard;
