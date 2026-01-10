import { useState } from 'react';
import { Star, MapPin, Scissors } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import CreateOrderDialog from './CreateOrderDialog';

const TailorCard = ({ tailor }) => {
    const [showOrderDialog, setShowOrderDialog] = useState(false);

    return (
        <>
            <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                <div
                    className="aspect-[4/3] overflow-hidden bg-muted cursor-pointer"
                    onClick={() => setShowOrderDialog(true)}
                >
                    {tailor.portfolioImages && tailor.portfolioImages[0] ? (
                        <img
                            src={tailor.portfolioImages[0]}
                            alt={tailor.businessName}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground group-hover:bg-secondary/50 transition-colors">
                            <Scissors className="h-12 w-12 opacity-20" />
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold tracking-tight text-lg">{tailor.businessName}</h3>
                            <div className="mt-1 flex items-center text-sm text-muted-foreground gap-1">
                                <MapPin className="h-3 w-3" />
                                {tailor.location}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <Star className="h-3 w-3 fill-current" />
                            {tailor.rating > 0 ? tailor.rating.toFixed(1) : 'New'}
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {tailor.specializations.slice(0, 3).map((spec, i) => (
                                <span key={i} className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                                    {spec}
                                </span>
                            ))}
                            {tailor.specializations.length > 3 && (
                                <span className="text-xs text-muted-foreground self-center">+{tailor.specializations.length - 3} more</span>
                            )}
                        </div>

                        <p className="line-clamp-2 text-sm text-muted-foreground">
                            {tailor.bio}
                        </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{tailor.pricing || 'Contact for price'}</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="default" onClick={() => setShowOrderDialog(true)}>Book Now</Button>
                        </div>
                    </div>
                </div>
            </div>

            {showOrderDialog && (
                <CreateOrderDialog
                    tailorId={tailor._id}
                    tailorName={tailor.businessName}
                    onClose={() => setShowOrderDialog(false)}
                />
            )}
        </>
    );
};

export default TailorCard;
