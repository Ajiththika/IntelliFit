import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag, Info, ChevronRight, Layers, Scissors, Palette } from 'lucide-react';
import { Button } from '../ui/button';

// --- DATA: Shirt Configuration Options ---
const shirtOptions = {
    fabrics: [
        { id: 'egyptian_cotton', name: 'Egyptian Cotton', price: 0, image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=100&h=100&fit=crop' },
        { id: 'linen_blend', name: 'Italian Linen', price: 25, image: 'https://images.unsplash.com/photo-1579631526487-73d8f28d8ed2?w=100&h=100&fit=crop' },
        { id: 'oxford', name: 'Royal Oxford', price: 15, image: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=100&h=100&fit=crop' },
        { id: 'poplin', name: 'Stretch Poplin', price: 10, image: 'https://images.unsplash.com/photo-1618354691438-254dc88fea84?w=100&h=100&fit=crop' }
    ],
    collars: [
        { id: 'spread', name: 'Spread Collar', desc: 'Modern, versatile choice' },
        { id: 'classic', name: 'Classic Point', desc: 'Traditional business look' },
        { id: 'button_down', name: 'Button Down', desc: 'Casual & Relaxed' },
        { id: 'cutaway', name: 'Cutaway', desc: 'Bold, European style' },
        { id: 'mandarin', name: 'Mandarin / Band', desc: 'Minimalist choice' }
    ],
    cuffs: [
        { id: 'single_button', name: 'Single Button', desc: 'Standard barrel cuff' },
        { id: 'double_button', name: 'Double Button', desc: 'Adjustable fit' },
        { id: 'french', name: 'French Cuff', desc: 'Formal, requires cufflinks' },
        { id: 'angled', name: 'Angled', desc: 'Modern angular cut' }
    ],
    plackets: [
        { id: 'front', name: 'Front Placket', desc: 'Visible fused interlining' },
        { id: 'french_front', name: 'No Placket', desc: 'Clean, seamless look' },
        { id: 'hidden', name: 'Hidden Buttons', desc: 'Sleek & formal' }
    ],
    pockets: [
        { id: 'none', name: 'No Pocket', desc: 'Cleanest aesthetic' },
        { id: 'one_round', name: 'One Round', desc: 'Classic left chest' },
        { id: 'one_angled', name: 'One Angled', desc: 'Modern utility' }
    ],
    fits: [
        { id: 'slim', name: 'Slim Fit', desc: 'Closer to body' },
        { id: 'tailored', name: 'Tailored Fit', desc: 'Balanced comfort' },
        { id: 'classic', name: 'Classic Fit', desc: 'Generous room' }
    ]
};

// --- DATA: Colors ---
const colors = [
    { id: 'white', name: 'White', hex: '#ffffff' },
    { id: 'sky_blue', name: 'Sky Blue', hex: '#87CEEB' },
    { id: 'navy', name: 'Navy', hex: '#000080' },
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'pink', name: 'Pale Pink', hex: '#FFC0CB' },
    { id: 'grey', name: 'Charcoal', hex: '#36454F' }
];


const Configurator = ({ selections }) => {
    const [activeTab, setActiveTab] = useState('style'); // style, fabric, measurements
    const [config, setConfig] = useState({
        fabric: shirtOptions.fabrics[0],
        color: colors[0],
        collar: shirtOptions.collars[0],
        cuff: shirtOptions.cuffs[0],
        placket: shirtOptions.plackets[0],
        pocket: shirtOptions.pockets[0],
        fit: shirtOptions.fits[0]
    });

    const calculateTotal = () => {
        let base = 89;
        return base + config.fabric.price;
    };

    const tabs = [
        { id: 'style', label: 'Style & Fit', icon: Scissors },
        { id: 'fabric', label: 'Fabric & Color', icon: Palette },
        { id: 'summary', label: 'Summary', icon: Layers },
    ];

    return (
        <div className="flex flex-col xl:flex-row gap-8 min-h-[80vh]">
            {/* LEFT COLUMN: VISUALIZER */}
            <div className="w-full xl:w-5/12 space-y-6">
                <div className="sticky top-24">
                    <div className="relative aspect-[3/4] bg-muted/20 rounded-2xl overflow-hidden border border-border/50 shadow-inner group">
                        {/* Dynamic Background based on color choice (Mock representation) */}
                        <div
                            className="absolute inset-0 transition-colors duration-500 opacity-20"
                            style={{ backgroundColor: config.color.hex }}
                        />

                        {/* Main Garment Image (Placeholder for true 3D) */}
                        <img
                            src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop"
                            alt="Shirt Preview"
                            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
                        />

                        {/* Interactive Markers (Demo) */}
                        <div className="absolute top-[15%] left-[50%] -translate-x-1/2 cursor-pointer group/marker">
                            <div className="w-4 h-4 bg-white rounded-full shadow-lg ring-2 ring-primary animate-pulse relative z-10"></div>
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {config.collar.name}
                            </div>
                        </div>

                        <div className="absolute right-[20%] bottom-[30%] cursor-pointer group/marker">
                            <div className="w-4 h-4 bg-white rounded-full shadow-lg ring-2 ring-primary animate-pulse relative z-10"></div>
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {config.cuff.name}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-card rounded-xl border border-border shadow-sm">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">Configuration Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fabric</span>
                                <span className="font-medium">{config.fabric.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Collar</span>
                                <span className="font-medium">{config.collar.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cuff</span>
                                <span className="font-medium">{config.cuff.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: CONTROLS */}
            <div className="flex-1 w-full bg-background">
                {/* Custom Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-8 border-b">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all relative ${activeTab === tab.id ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {activeTab === tab.id && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'style' && (
                            <motion.div
                                key="style"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <OptionGroup title="Collar Style" options={shirtOptions.collars} selected={config.collar} onSelect={(v) => setConfig({ ...config, collar: v })} />
                                <OptionGroup title="Cuff Style" options={shirtOptions.cuffs} selected={config.cuff} onSelect={(v) => setConfig({ ...config, cuff: v })} />
                                <OptionGroup title="Front Placket" options={shirtOptions.plackets} selected={config.placket} onSelect={(v) => setConfig({ ...config, placket: v })} />
                                <OptionGroup title="Pocket" options={shirtOptions.pockets} selected={config.pocket} onSelect={(v) => setConfig({ ...config, pocket: v })} />
                                <OptionGroup title="Fit Preference" options={shirtOptions.fits} selected={config.fit} onSelect={(v) => setConfig({ ...config, fit: v })} />
                            </motion.div>
                        )}

                        {activeTab === 'fabric' && (
                            <motion.div
                                key="fabric"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Select Color</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {colors.map(color => (
                                            <button
                                                key={color.id}
                                                onClick={() => setConfig({ ...config, color })}
                                                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${config.color.id === color.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                                                style={{ backgroundColor: color.hex }}
                                                title={color.name}
                                            >
                                                {config.color.id === color.id && <Check className={`w-5 h-5 ${['white', 'sky_blue', 'pink'].includes(color.id) ? 'text-black' : 'text-white'}`} />}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">Selected: {config.color.name}</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-4">Fabric Type</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {shirtOptions.fabrics.map(fabric => (
                                            <div
                                                key={fabric.id}
                                                onClick={() => setConfig({ ...config, fabric })}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${config.fabric.id === fabric.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                            >
                                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-muted">
                                                    <img src={fabric.image} alt={fabric.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold">{fabric.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {fabric.price > 0 ? `+$${fabric.price}` : 'Included'}
                                                    </div>
                                                </div>
                                                {config.fabric.id === fabric.id && <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check className="w-3 h-3" /></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'summary' && (
                            <motion.div
                                key="summary"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/20 text-center">
                                    <h2 className="text-3xl font-bold mb-2">${calculateTotal()}</h2>
                                    <p className="text-muted-foreground">Total Estimated Price</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Order Details</h3>
                                    <SummaryItem label="Garment" value="Custom Men's Shirt" />
                                    <SummaryItem label="Fabric" value={config.fabric.name} price={config.fabric.price} />
                                    <SummaryItem label="Color" value={config.color.name} />
                                    <SummaryItem label="Collar" value={config.collar.name} />
                                    <SummaryItem label="Cuff" value={config.cuff.name} />
                                    <SummaryItem label="Fit" value={config.fit.name} />
                                </div>

                                <div className="pt-8">
                                    <Button size="lg" className="w-full text-lg h-12">
                                        Add to Cart & Save Specs
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground mt-4">
                                        Free shipping on orders over $200. Guaranteed fit.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const OptionGroup = ({ title, options, selected, onSelect }) => (
    <div>
        <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-medium">{title}</h3>
            <Info className="w-4 h-4 text-muted-foreground/50 hover:text-primary cursor-help" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {options.map(opt => (
                <div
                    key={opt.id}
                    onClick={() => onSelect(opt)}
                    className={`group relative p-4 rounded-lg border-2 text-left cursor-pointer transition-all hover:shadow-md ${selected.id === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                    <div className="font-semibold mb-1 flex items-center justify-between">
                        {opt.name}
                        {selected.id === opt.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

const SummaryItem = ({ label, value, price }) => (
    <div className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 px-2 rounded transition-colors">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
            <span className="font-medium">{value}</span>
            {price > 0 && <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">+${price}</span>}
        </div>
    </div>
);

export default Configurator;
