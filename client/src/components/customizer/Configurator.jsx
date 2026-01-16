import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';

// Mock Config Data
const configOptions = {
    fabrics: [
        { id: 'cotton', name: 'Premium Cotton', color: '#f5f5f5', price: 0 },
        { id: 'linen', name: 'Italian Linen', color: '#e0d6c8', price: 20 },
        { id: 'wool', name: 'Merino Wool', color: '#4a4a4a', price: 45 },
        { id: 'silk', name: 'Raw Silk', color: '#d4af37', price: 60 }
    ],
    colors: [
        { id: 'white', name: 'Classic White', hex: '#ffffff' },
        { id: 'blue', name: 'Navy Blue', hex: '#1a365d' },
        { id: 'black', name: 'Midnight Black', hex: '#000000' },
        { id: 'burgundy', name: 'Rich Burgundy', hex: '#800020' },
        { id: 'pattern', name: 'Subtle Check', hex: '#d3d3d3', pattern: true }
    ],
    fits: [
        { id: 'slim', name: 'Slim Fit', desc: 'Contoured to the body' },
        { id: 'regular', name: 'Regular Fit', desc: 'Classic comfortable cut' },
        { id: 'relaxed', name: 'Relaxed Fit', desc: 'Loose and airy' }
    ]
};

const Configurator = ({ selections }) => {
    const [config, setConfig] = useState({
        fabric: configOptions.fabrics[0],
        color: configOptions.colors[0],
        fit: configOptions.fits[0]
    });

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[70vh]">
            {/* Left: Preview Area */}
            <div className="flex-1 bg-muted/30 rounded-2xl flex items-center justify-center p-8 relative overflow-hidden">
                <div className="text-center">
                    <div className="relative w-64 h-80 bg-white shadow-2xl mx-auto rounded-lg mb-6 flex items-center justify-center border-4"
                        style={{ borderColor: config.color.hex, backgroundColor: config.color.hex === '#ffffff' ? '#f8f8f8' : config.color.hex }}
                    >
                        {/* Placeholder for garment visualization */}
                        <span className="text-muted-foreground/50 font-bold text-2xl rotate-45">
                            {selections.category?.toUpperCase() || "GARMENT"}
                        </span>

                        {/* Fabric Texture Overlay Effect */}
                        {config.color.pattern && (
                            <div className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}
                            />
                        )}
                    </div>

                    <h3 className="text-2xl font-bold mb-2">Your Custom Design</h3>
                    <p className="text-muted-foreground">
                        {config.color.name} {config.fabric.name} - {config.fit.name}
                    </p>
                </div>
            </div>

            {/* Right: Options Panel */}
            <div className="flex-1 space-y-8 p-4">
                {/* Fabric Selection */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Choose Fabric</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {configOptions.fabrics.map(fabric => (
                            <div
                                key={fabric.id}
                                onClick={() => setConfig({ ...config, fabric })}
                                className={`p-3 rounded-lg border-2 cursor-pointer flex justify-between items-center transition-all ${config.fabric.id === fabric.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                            >
                                <span className="font-medium">{fabric.name}</span>
                                {fabric.price > 0 && <span className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">+${fabric.price}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Color Selection */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Select Color</h3>
                    <div className="flex flex-wrap gap-4">
                        {configOptions.colors.map(color => (
                            <div
                                key={color.id}
                                onClick={() => setConfig({ ...config, color })}
                                className={`w-12 h-12 rounded-full cursor-pointer shadow-sm relative flex items-center justify-center transition-transform hover:scale-110 ${config.color.id === color.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                style={{ backgroundColor: color.hex, border: color.hex === '#ffffff' ? '1px solid #e2e8f0' : 'none' }}
                                title={color.name}
                            >
                                {config.color.id === color.id && <Check className={`w-6 h-6 ${color.hex === '#ffffff' || color.hex === '#d3d3d3' ? 'text-black' : 'text-white'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fit Selection */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Select Fit</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {configOptions.fits.map(fit => (
                            <div
                                key={fit.id}
                                onClick={() => setConfig({ ...config, fit })}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${config.fit.id === fit.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                            >
                                <div className="font-bold mb-1">{fit.name}</div>
                                <div className="text-sm text-muted-foreground">{fit.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-muted-foreground">Estimated Total</span>
                        <span className="text-3xl font-bold">${149 + config.fabric.price}</span>
                    </div>
                    <Button size="lg" className="w-full text-lg gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Add to Cart (Demo)
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Configurator;
