import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

const PortfolioGalleryDialog = ({ images, tailorName, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-4xl h-[80vh] flex flex-col items-center justify-center p-4">

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                    onClick={onClose}
                >
                    <X className="h-6 w-6" />
                </Button>

                <h3 className="absolute top-4 left-4 text-white text-lg font-semibold drop-shadow-md">
                    {tailorName}'s Portfolio
                </h3>

                {/* Main Image */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                    <img
                        src={images[currentIndex]}
                        alt={`Portfolio ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                </div>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                            onClick={prevImage}
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                            onClick={nextImage}
                        >
                            <ChevronRight className="h-8 w-8" />
                        </Button>
                    </>
                )}

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 flex gap-2 overflow-x-auto max-w-full p-2 bg-black/50 rounded-lg backdrop-blur-md">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-primary scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img src={img} alt="thumb" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioGalleryDialog;
