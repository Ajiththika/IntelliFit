import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Star, Loader2, Ruler, Award, Sparkles } from 'lucide-react';
import API from '../../services/api';

const StarRating = ({ value, onChange, size = "md" }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange && onChange(star)}
                    disabled={!onChange}
                    className={`focus:outline-none transition-transform ${onChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                >
                    <Star
                        className={`
                            ${size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'} 
                            ${value >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}
                        `}
                    />
                </button>
            ))}
        </div>
    );
};

const ReviewDialog = ({ order, onClose, onSuccess }) => {
    const [stats, setStats] = useState({
        rating: 5,
        fitAccuracy: 5,
        quality: 5
    });
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Updated endpoint to match requirements
            await API.post(`/orders/${order._id}/review`, {
                rating: stats.rating,
                fitAccuracy: stats.fitAccuracy,
                quality: stats.quality,
                comment,
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const updateStat = (key, val) => {
        setStats(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-background rounded-lg shadow-lg border p-6 space-y-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Rate Your Experience</h2>
                    <div className="text-sm text-muted-foreground mt-1">Order #{order._id.slice(-6).toUpperCase()}</div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">

                    {/* Overall Rating */}
                    <div className="flex flex-col items-center justify-center bg-secondary/10 py-4 rounded-lg">
                        <Label className="mb-2 text-lg">Overall Rating</Label>
                        <StarRating value={stats.rating} onChange={(v) => updateStat('rating', v)} size="lg" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Fit Accuracy */}
                        <div className="space-y-2 text-center p-3 border rounded-lg">
                            <Label className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide">
                                <Ruler className="w-3.5 h-3.5" /> Fit Accuracy
                            </Label>
                            <div className="flex justify-center">
                                <StarRating value={stats.fitAccuracy} onChange={(v) => updateStat('fitAccuracy', v)} />
                            </div>
                        </div>

                        {/* Quality */}
                        <div className="space-y-2 text-center p-3 border rounded-lg">
                            <Label className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide">
                                <Award className="w-3.5 h-3.5" /> Quality
                            </Label>
                            <div className="flex justify-center">
                                <StarRating value={stats.quality} onChange={(v) => updateStat('quality', v)} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">Your Review</Label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about the fit, fabric, and service..."
                            required
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Submit Review
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewDialog;
